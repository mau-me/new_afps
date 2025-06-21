'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Menu,
  Users,
  DollarSign,
  FileText,
  Settings,
  LogOut,
  Home,
} from 'lucide-react';

export function Navbar() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Jogadores', href: '/players', icon: Users },
    { name: 'Financeiro', href: '/financial', icon: DollarSign },
    { name: 'Prestação de Contas', href: '/reports', icon: FileText },
  ];

  const adminNavigation = [
    ...navigation,
    { name: 'Configurações', href: '/settings', icon: Settings },
  ];

  const userNavigation =
    session?.user?.role === 'comissao' ? adminNavigation : navigation;

  return (
    <nav className='bg-white shadow-sm border-b'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between h-16'>
          <div className='flex items-center'>
            <Link href='/dashboard' className='flex-shrink-0 flex items-center'>
              <span className='text-2xl font-bold text-primary'>AFPS</span>
            </Link>

            {/* Desktop Navigation */}
            <div className='hidden md:ml-6 md:flex md:space-x-8'>
              {userNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className='text-gray-900 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors'
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className='flex items-center space-x-4'>
            {session ? (
              <>
                {/* Mobile menu button */}
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                  <SheetTrigger asChild>
                    <Button variant='ghost' size='icon' className='md:hidden'>
                      <Menu className='h-6 w-6' />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side='left' className='w-64'>
                    <div className='flex flex-col space-y-4 mt-4'>
                      {userNavigation.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className='flex items-center space-x-2 text-gray-900 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors'
                          onClick={() => setIsOpen(false)}
                        >
                          <item.icon className='h-4 w-4' />
                          <span>{item.name}</span>
                        </Link>
                      ))}
                    </div>
                  </SheetContent>
                </Sheet>

                {/* User menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant='ghost'
                      className='relative h-8 w-8 rounded-full'
                    >
                      <Avatar className='h-8 w-8'>
                        <AvatarImage
                          src='/placeholder-user.jpg'
                          alt={session.user?.name || ''}
                        />
                        <AvatarFallback>
                          {session.user?.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className='w-56' align='end' forceMount>
                    <DropdownMenuLabel className='font-normal'>
                      <div className='flex flex-col space-y-1'>
                        <p className='text-sm font-medium leading-none'>
                          {session.user?.name}
                        </p>
                        <p className='text-xs leading-none text-muted-foreground'>
                          {session.user?.email}
                        </p>
                        <p className='text-xs leading-none text-muted-foreground capitalize'>
                          {session.user?.role}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()}>
                      <LogOut className='mr-2 h-4 w-4' />
                      <span>Sair</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link href='/login'>
                <Button>Entrar</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
