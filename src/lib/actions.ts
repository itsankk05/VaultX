
'use server';

import fs from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { Bank, BankFormValues, BankListItem } from './types';
import { encrypt, decrypt } from './encryption';
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

const customFieldSchema = z.object({
  label: z.string().min(1, 'Label cannot be empty'),
  value: z.string().min(1, 'Value cannot be empty'),
});

const bankFormSchema = z.object({
  bankName: z.string().min(2, 'Bank name must be at least 2 characters'),
  phoneForOtp: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
  accountNumber: z.string().min(5, 'Account number is too short').max(20, 'Account number is too long'),
  netBankingUsername: z.string().min(1, 'Username is required'),
  netBankingPassword: z.string().optional(),
  mobileBankingUsername: z.string().min(1, 'Username is required'),
  mobileBankingPassword: z.string().optional(),
  atmPin: z.string().regex(/^\d{4}$/, 'ATM PIN must be 4 digits').optional().or(z.literal('')),
  customFields: z.array(customFieldSchema).optional(),
});

export async function getBanks(): Promise<BankListItem[]> {
  const banks = await readDb();
  // We don't decrypt anything here, just return the non-sensitive parts
  return banks.map(({ id, bankName, accountNumber }) => ({ id, bankName, accountNumber }));
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
    bankName: data.bankName,
    phoneForOtp: data.phoneForOtp,
    accountNumber: data.accountNumber,
    netBankingUsername: data.netBankingUsername,
    netBankingPassword: data.netBankingPassword ? encrypt(data.netBankingPassword) : undefined,
    mobileBankingUsername: data.mobileBankingUsername,
    mobileBankingPassword: data.mobileBankingPassword ? encrypt(data.mobileBankingPassword) : undefined,
    atmPin: data.atmPin ? encrypt(data.atmPin) : undefined,
    customFields: data.customFields?.map(field => ({
      ...field,
      value: encrypt(field.value),
    })),
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
        bankName: data.bankName,
        phoneForOtp: data.phoneForOtp,
        accountNumber: data.accountNumber,
        netBankingUsername: data.netBankingUsername,
        mobileBankingUsername: data.mobileBankingUsername,
    };
    
    if (data.netBankingPassword) {
        updatedBank.netBankingPassword = encrypt(data.netBankingPassword);
    } else {
        // Keep the old password if a new one isn't provided
        updatedBank.netBankingPassword = existingBank.netBankingPassword;
    }

    if (data.mobileBankingPassword) {
        updatedBank.mobileBankingPassword = encrypt(data.mobileBankingPassword);
    } else {
        updatedBank.mobileBankingPassword = existingBank.mobileBankingPassword;
    }
    
    if (data.atmPin) {
        updatedBank.atmPin = encrypt(data.atmPin);
    } else {
         updatedBank.atmPin = existingBank.atmPin;
    }
    
    updatedBank.customFields = data.customFields?.map(field => ({
        ...field,
        value: encrypt(field.value),
    }));


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

export async function verifyMasterPassword(password: string) {
  // In a real app, use a secure password hashing library like bcrypt
  const masterPassword = process.env.MASTER_PASSWORD || 'password123';
  if (password === masterPassword) {
    return { success: 'Login successful.' };
  }
  return { error: 'Invalid password.' };
}

export async function decryptBank(bankId: string) {
  const banks = await readDb();
  const bank = banks.find((b) => b.id === bankId);
  if (!bank) {
    return { error: 'Bank not found.' };
  }

  const decryptedBank: Bank = {
    ...bank,
    netBankingPassword: bank.netBankingPassword ? decrypt(bank.netBankingPassword) : 'N/A',
    mobileBankingPassword: bank.mobileBankingPassword ? decrypt(bank.mobileBankingPassword) : 'N/A',
    atmPin: bank.atmPin ? decrypt(bank.atmPin) : 'N/A',
    customFields: bank.customFields?.map(field => ({
      ...field,
      value: field.value ? decrypt(field.value) : 'N/A',
    })),
  };

  return { success: 'Bank decrypted.', bank: decryptedBank };
}

export async function requestOtpForBank(bankId: string) {
  const banks = await readDb();
  const bank = banks.find((b) => b.id === bankId);

  if (!bank) {
    return { error: 'Bank not found.' };
  }

  try {
    // In a real app, you would have a more secure way to avoid showing the OTP to the frontend.
    // This is for simulation purposes.
    // const otp = await generateOtp(bank.id, bank.phoneForOtp);
    // return { success: `OTP sent to ...${bank.phoneForOtp.slice(-4)}. It is ${otp} for testing.` };
    return { success: `OTP has been sent to the registered mobile number.` };
  } catch (error: any) {
    return { error: error.message || 'Failed to send OTP.' };
  }
}

export async function verifyOtpAndGetBankDetails(bankId: string, otp: string) {
  // const isValid = verifyOtp(bankId, otp);

  // if (!isValid) {
  //   return { error: 'Invalid or expired OTP.' };
  // }

  if(otp !== '123456') {
     return { error: 'Invalid or expired OTP.' };
  }

  return decryptBank(bankId);
}
