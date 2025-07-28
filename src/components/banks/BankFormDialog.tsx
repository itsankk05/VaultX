'use client';

import { useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BankFormValues, BankListItem } from '@/lib/types';
import { addBank, updateBank } from '@/lib/actions';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface BankFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bank: BankListItem | null;
}

const formSchema = z.object({
  bankName: z.string().min(2, 'Bank name must be at least 2 characters'),
  phoneForOtp: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number with country code (e.g., +14155552671)'),
  accountNumber: z.string().min(5, 'Account number is too short').max(20, 'Account number is too long'),
  netBankingUsername: z.string().min(1, 'Username is required'),
  netBankingPassword: z.string().optional(),
  mobileBankingUsername: z.string().min(1, 'Username is required'),
  mobileBankingPassword: z.string().optional(),
  atmPin: z.string().regex(/^\d{4}$/, 'ATM PIN must be 4 digits').optional().or(z.literal('')),
});


export default function BankFormDialog({ open, onOpenChange, bank }: BankFormDialogProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const form = useForm<BankFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bankName: '',
      phoneForOtp: '',
      accountNumber: '',
      netBankingUsername: '',
      netBankingPassword: '',
      mobileBankingUsername: '',
      mobileBankingPassword: '',
      atmPin: '',
    },
  });

  useEffect(() => {
    if (open) {
        if (bank) {
            form.reset({
                ...bank,
                netBankingPassword: '', // Don't pre-fill passwords for editing
                mobileBankingPassword: '',
                atmPin: '',
            });
        } else {
            form.reset({
                bankName: '',
                phoneForOtp: '',
                accountNumber: '',
                netBankingUsername: '',
                netBankingPassword: '',
                mobileBankingUsername: '',
                mobileBankingPassword: '',
                atmPin: '',
            });
        }
    }
  }, [bank, form, open]);

  const onSubmit = (values: BankFormValues) => {
    startTransition(async () => {
      const action = bank ? updateBank(bank.id, values) : addBank(values);
      const result = await action;
      if (result.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Success',
          description: result.success,
          variant: 'default',
          className: 'bg-green-500 text-white',
        });
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{bank ? 'Edit Bank' : 'Add Bank'}</DialogTitle>
          <DialogDescription>
            {bank ? 'Update the details for this bank account.' : 'Add a new bank account to your SafeLock.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="bankName"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Bank Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Global Bank" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneForOtp"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Phone Number (for OTP)</FormLabel>
                    <FormControl>
                      <Input placeholder="+14155552671" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="accountNumber"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Account Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Your account number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="netBankingUsername"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Net Banking User</FormLabel>
                    <FormControl>
                      <Input placeholder="Username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="netBankingPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Net Banking Pass</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder={bank ? "New password" : "Password"} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mobileBankingUsername"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Banking User</FormLabel>
                    <FormControl>
                      <Input placeholder="Username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mobileBankingPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Banking Pass</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder={bank ? "New password" : "Password"} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="atmPin"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>ATM PIN</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="4-digit PIN" maxLength={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {bank ? 'Save Changes' : 'Add Bank'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
