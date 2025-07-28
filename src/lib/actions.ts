'use server';

import fs from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { Bank, BankFormValues, BankListItem } from './types';
import { encrypt, decrypt } from './encryption';
import { generateOtp, verifyOtp } from './otp';
import { randomUUID } from 'crypto';

const dbPath = path.join(process.cwd(), 'src', 'data', 'banks.json');

async function readDb(): Promise<Bank[]> {
  try {
    const data = await fs.readFile(dbPath, 'utf-8');
    return JSON.parse(data);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return []; // Return empty array if file doesn't exist
    }
    throw error;
  }
}

async function writeDb(data: Bank[]): Promise<void> {
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf-8');
}

const bankFormSchema = z.object({
  bankName: z.string().min(2, 'Bank name must be at least 2 characters'),
  phoneForOtp: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
  accountNumber: z.string().min(5, 'Account number is too short').max(20, 'Account number is too long'),
  netBankingUsername: z.string().min(1, 'Username is required'),
  netBankingPassword: z.string().optional(),
  mobileBankingUsername: z.string().min(1, 'Username is required'),
  mobileBankingPassword: z.string().optional(),
  atmPin: z.string().regex(/^\d{4}$/, 'ATM PIN must be 4 digits').optional().or(z.literal('')),
});

export async function getBanks(): Promise<BankListItem[]> {
  const banks = await readDb();
  return banks.map(({ netBankingPassword, mobileBankingPassword, atmPin, ...bank }) => bank);
}

export async function addBank(values: BankFormValues) {
  const validatedFields = bankFormSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Invalid data provided.' };
  }
  const data = validatedFields.data;

  const banks = await readDb();
  const newBank: Bank = {
    id: randomUUID(),
    ...data,
    netBankingPassword: data.netBankingPassword ? encrypt(data.netBankingPassword) : undefined,
    mobileBankingPassword: data.mobileBankingPassword ? encrypt(data.mobileBankingPassword) : undefined,
    atmPin: data.atmPin ? encrypt(data.atmPin) : undefined,
  };
  banks.push(newBank);
  await writeDb(banks);
  revalidatePath('/');
  return { success: 'Bank added successfully.' };
}

export async function updateBank(id: string, values: BankFormValues) {
  const validatedFields = bankFormSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: 'Invalid data provided.' };
  }
  const data = validatedFields.data;

  const banks = await readDb();
  const bankIndex = banks.findIndex((b) => b.id === id);

  if (bankIndex === -1) {
    return { error: 'Bank not found.' };
  }

  const existingBank = banks[bankIndex];
  const updatedBank: Bank = {
    ...existingBank,
    ...data,
    netBankingPassword: data.netBankingPassword ? encrypt(data.netBankingPassword) : existingBank.netBankingPassword,
    mobileBankingPassword: data.mobileBankingPassword ? encrypt(data.mobileBankingPassword) : existingBank.mobileBankingPassword,
    atmPin: data.atmPin ? encrypt(data.atmPin) : existingBank.atmPin,
  };
  
  banks[bankIndex] = updatedBank;
  await writeDb(banks);
  revalidatePath('/');
  return { success: 'Bank updated successfully.' };
}

export async function deleteBank(id: string) {
  const banks = await readDb();
  const updatedBanks = banks.filter((b) => b.id !== id);
  if (banks.length === updatedBanks.length) {
    return { error: 'Bank not found.' };
  }
  await writeDb(updatedBanks);
  revalidatePath('/');
  return { success: 'Bank deleted successfully.' };
}

export async function requestOtpForBank(bankId: string) {
  const banks = await readDb();
  const bank = banks.find((b) => b.id === bankId);
  if (!bank) {
    return { error: 'Bank not found.' };
  }
  try {
    await generateOtp(bankId, bank.phoneForOtp);
    // In a real app, you would send the OTP via SMS here.
    // The success message is generic for security reasons
    return { success: `An OTP has been sent to the registered phone number.` };
  } catch (error) {
    console.error('OTP Error:', error);
    return { error: 'Failed to send OTP. Please check server configuration.'}
  }
}

export async function verifyOtpAndGetBankDetails(bankId: string, otp: string) {
  if (!verifyOtp(bankId, otp)) {
    return { error: 'Invalid or expired OTP.' };
  }
  const banks = await readDb();
  const bank = banks.find((b) => b.id === bankId);
  if (!bank) {
    return { error: 'Bank not found.' };
  }

  const decryptedBank: Bank = {
    ...bank,
    netBankingPassword: bank.netBankingPassword ? decrypt(bank.netBankingPassword) : 'Not Set',
    mobileBankingPassword: bank.mobileBankingPassword ? decrypt(bank.mobileBankingPassword) : 'Not Set',
    atmPin: bank.atmPin ? decrypt(bank.atmPin) : 'Not Set',
  };

  return { success: 'OTP verified.', bank: decryptedBank };
}
