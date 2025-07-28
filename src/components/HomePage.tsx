'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import BankList from '@/components/banks/BankList';
import BankFormDialog from '@/components/banks/BankFormDialog';
import DeleteBankDialog from '@/components/banks/DeleteBankDialog';
import OtpDialog from '@/components/banks/OtpDialog';
import ViewBankDetailsDialog from '@/components/banks/ViewBankDetailsDialog';
import { Bank, BankListItem } from '@/lib/types';

interface HomePageProps {
  initialBanks: BankListItem[];
}

export default function HomePage({ initialBanks }: HomePageProps) {
  const [dialog, setDialog] = useState<'add' | 'edit' | 'delete' | 'viewOtp' | 'viewDetails' | null>(null);
  const [selectedBank, setSelectedBank] = useState<BankListItem | Bank | null>(null);
  const [unlockedBanks, setUnlockedBanks] = useState<Record<string, Bank>>({});
  const [nextAction, setNextAction] = useState<'view' | 'edit' | null>(null);

  const handleAdd = () => {
    setSelectedBank(null);
    setDialog('add');
  };

  const handleEdit = (bank: BankListItem) => {
    if (unlockedBanks[bank.id]) {
      // The form dialog expects a BankListItem, so we can use the initial item
      setSelectedBank(bank);
      setDialog('edit');
    } else {
      setSelectedBank(bank);
      setNextAction('edit');
      setDialog('viewOtp');
    }
  };

  const handleDelete = (bank: BankListItem) => {
    setSelectedBank(bank);
    setDialog('delete');
  };

  const handleView = (bank: BankListItem) => {
    if (unlockedBanks[bank.id]) {
      setSelectedBank(unlockedBanks[bank.id]);
      setDialog('viewDetails');
    } else {
      setSelectedBank(bank);
      setNextAction('view');
      setDialog('viewOtp');
    }
  };

  const handleOtpSuccess = (decryptedBank: Bank) => {
    setUnlockedBanks(prev => ({...prev, [decryptedBank.id]: decryptedBank}));
    
    if (nextAction === 'edit') {
      // The form dialog expects a BankListItem, let's find it from the initial list
      const bankListItem = initialBanks.find(b => b.id === decryptedBank.id);
      setSelectedBank(bankListItem || decryptedBank);
      setDialog('edit');
    } else {
      setSelectedBank(decryptedBank);
      setDialog('viewDetails');
    }
    setNextAction(null);
  };
  
  const closeDialogs = () => {
    setDialog(null);
    setNextAction(null);
    // Do not clear selectedBank immediately to avoid flicker
  };

  return (
    <>
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
        bank={dialog === 'edit' ? (selectedBank as BankListItem) : null}
      />

      <DeleteBankDialog
        open={dialog === 'delete'}
        onOpenChange={(isOpen) => !isOpen && closeDialogs()}
        bank={selectedBank as BankListItem}
      />
      
      <OtpDialog
        open={dialog === 'viewOtp'}
        onOpenChange={(isOpen) => {
          if (!isOpen && dialog === 'viewOtp') {
            closeDialogs();
          }
        }}
        bank={selectedBank as BankListItem}
        onSuccess={handleOtpSuccess}
      />

      <ViewBankDetailsDialog
        open={dialog === 'viewDetails'}
        onOpenChange={(isOpen) => !isOpen && closeDialogs()}
        bank={selectedBank as Bank}
      />
    </>
  );
}
