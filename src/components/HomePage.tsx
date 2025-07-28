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

  const handleAdd = () => {
    setSelectedBank(null);
    setDialog('add');
  };

  const handleEdit = (bank: BankListItem) => {
    setSelectedBank(bank);
    setDialog('edit');
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
      setDialog('viewOtp');
    }
  };

  const handleOtpSuccess = (decryptedBank: Bank) => {
    setUnlockedBanks(prev => ({...prev, [decryptedBank.id]: decryptedBank}));
    setSelectedBank(decryptedBank);
    setDialog('viewDetails');
  };
  
  const closeDialogs = () => {
    setDialog(null);
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
