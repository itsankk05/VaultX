'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import BankList from '@/components/banks/BankList';
import BankFormDialog from '@/components/banks/BankFormDialog';
import ViewBankDetailsDialog from '@/components/banks/ViewBankDetailsDialog';
import { Bank, BankListItem } from '@/lib/types';
import LoginScreen from './LoginScreen';
import { decryptBank } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import DeleteConfirmationDialog from './banks/DeleteConfirmationDialog';

interface HomePageProps {
  initialBanks: BankListItem[];
}

export default function HomePage({ initialBanks }: HomePageProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dialog, setDialog] = useState<'add' | 'edit' | 'delete' | 'viewDetails' | null>(null);
  const [selectedBank, setSelectedBank] = useState<BankListItem | Bank | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleAdd = () => {
    setSelectedBank(null);
    setDialog('add');
  };

  const fetchDecryptedBank = async (bankId: string): Promise<Bank | null> => {
    setIsLoading(true);
    try {
      const result = await decryptBank(bankId);
      if (result.error || !result.bank) {
        toast({ title: 'Error', description: result.error || 'Could not retrieve bank details.', variant: 'destructive' });
        return null;
      }
      return result.bank;
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (bank: BankListItem) => {
    const decryptedBank = await fetchDecryptedBank(bank.id);
    if (decryptedBank) {
      setSelectedBank(decryptedBank);
      setDialog('edit');
    }
  };

  const handleDelete = (bank: BankListItem) => {
    setSelectedBank(bank);
    setDialog('delete');
  };

  const handleView = async (bank: BankListItem) => {
    const decryptedBank = await fetchDecryptedBank(bank.id);
    if (decryptedBank) {
      setSelectedBank(decryptedBank);
      setDialog('viewDetails');
    }
  };
  
  const closeDialogs = () => {
    setDialog(null);
  };

  if (!isAuthenticated) {
    return <LoginScreen onSuccess={handleLoginSuccess} />;
  }

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      )}
      <Header onAddBank={handleAdd} />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BankList
          banks={initialBanks}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
        />
      </main>

      <BankFormDialog
        open={dialog === 'add' || dialog === 'edit'}
        onOpenChange={(isOpen) => !isOpen && closeDialogs()}
        bank={dialog === 'edit' ? (selectedBank as Bank) : null}
      />

      <DeleteConfirmationDialog
        open={dialog === 'delete'}
        onOpenChange={(isOpen) => !isOpen && closeDialogs()}
        bank={selectedBank as BankListItem}
      />

      <ViewBankDetailsDialog
        open={dialog === 'viewDetails'}
        onOpenChange={(isOpen) => !isOpen && closeDialogs()}
        bank={selectedBank as Bank}
      />
    </>
  );
}
