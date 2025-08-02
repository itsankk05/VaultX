
'use client';
import { Button } from '@/components/ui/button';
import { LogOut, PlusCircle, ShieldCheck, User as UserIcon, Lock } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User } from '@/lib/types';
import { Avatar, AvatarFallback } from './ui/avatar';


interface HeaderProps {
  user: User;
  onAddBank: () => void;
  onChangePassword: () => void;
  onLogout: () => void;
}

export default function Header({ user, onAddBank, onChangePassword, onLogout }: HeaderProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('');
  }
  
  return (
    <header className="bg-card shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">VaultX</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={onAddBank}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Bank
            </Button>
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(user.username)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Signed in as</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.username}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                 <DropdownMenuItem onClick={onChangePassword}>
                  <Lock className="mr-2 h-4 w-4" />
                  <span>Change Password</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
