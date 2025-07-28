'use client';

import { Bank } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { KeyRound, Smartphone, User, Landmark, CreditCard, Hash } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';

interface ViewBankDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bank: Bank | null;
}

const DetailRow = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value?: string }) => {
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
    <div className="flex items-center justify-between p-3 rounded-md transition-colors hover:bg-muted/50">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-primary" />
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="font-mono text-base font-medium">{value || 'N/A'}</p>
        </div>
      </div>
      {value && <Button variant="ghost" size="sm" onClick={handleCopy}>Copy</Button>}
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
        <div className="space-y-2 py-4">
          <DetailRow icon={Hash} label="Account Number" value={bank.accountNumber} />
          <DetailRow icon={User} label="Net Banking Username" value={bank.netBankingUsername} />
          <DetailRow icon={KeyRound} label="Net Banking Password" value={bank.netBankingPassword} />
          <DetailRow icon={Smartphone} label="Mobile Banking Username" value={bank.mobileBankingUsername} />
          <DetailRow icon={KeyRound} label="Mobile Banking Password" value={bank.mobileBankingPassword} />
          <DetailRow icon={CreditCard} label="ATM PIN" value={bank.atmPin} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
