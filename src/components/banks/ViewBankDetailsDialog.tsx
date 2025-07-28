'use client';

import { Bank } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { KeyRound, Smartphone, User, Landmark, CreditCard, Hash } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface ViewBankDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bank: Bank | null;
}

const DetailRow = ({ label, value }: { label: string, value?: string }) => {
  const { toast } = useToast();

  const handleCopy = () => {
    if(value) {
      navigator.clipboard.writeText(value);
      toast({
        title: "Copied!",
        description: `${label} has been copied to your clipboard.`,
        className: 'bg-green-500 text-white',
      })
    }
  }

  return (
    <div className="space-y-2">
       <Label>{label}</Label>
      <div className="flex items-center space-x-2">
        <Input value={value || 'N/A'} readOnly className="font-mono" />
        {value && <Button variant="outline" size="sm" onClick={handleCopy}>Copy</Button>}
      </div>
    </div>
  );
};


export default function ViewBankDetailsDialog({ open, onOpenChange, bank }: ViewBankDetailsDialogProps) {
  if (!bank) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Landmark className="h-6 w-6" />
            {bank.bankName}
          </DialogTitle>
          <DialogDescription>
            Full credential details. This information is only visible temporarily.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <DetailRow label="Account Number" value={bank.accountNumber} />
          <DetailRow label="Net Banking Username" value={bank.netBankingUsername} />
          <DetailRow label="Net Banking Password" value={bank.netBankingPassword} />
          <DetailRow label="Mobile Banking Username" value={bank.mobileBankingUsername} />
          <DetailRow label="Mobile Banking Password" value={bank.mobileBankingPassword} />
          <DetailRow label="ATM PIN" value={bank.atmPin} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
