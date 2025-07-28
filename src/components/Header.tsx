'use client';
import { Button } from '@/components/ui/button';
import { PlusCircle, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onAddBank: () => void;
}

export default function Header({ onAddBank }: HeaderProps) {
  return (
    <header className="bg-card shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">SafeLock</h1>
          </div>
          <Button onClick={onAddBank}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Bank
          </Button>
        </div>
      </div>
    </header>
  );
}
