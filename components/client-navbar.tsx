'use client';

import { useState, useEffect } from 'react';
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Menu,
  Users,
  DollarSign,
  FileText,
  Settings,
  LogOut,
  Home,
  Trophy,
} from 'lucide-react';

export function ClientNavbar() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <nav className='sticky top-0 z-50 w-full border-b border-border-color bg-background-color/95 backdrop-blur-xl'>
        <div className='container mx-auto flex h-20 max-w-7xl items-center justify-between px-6'>
          <div className='flex items-center space-x-4'>
            <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-color'>
              <Trophy className='h-6 w-6 text-background-color' />
            </div>
            <span className='text-2xl font-semibold text-text-primary'>
              AFPS
            </span>
          </div>
          <div className='flex items-center space-x-4'>
            <div className='h-10 w-10 animate-pulse rounded-full bg-card-background' />
          </div>
        </div>
      </nav>
    );
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Jogadores', href: '/players', icon: Users },
    { name: 'Financeiro', href: '/financial', icon: DollarSign },
    { name: 'Relatórios', href: '/reports', icon: FileText },
  ];

  const adminNavigation = [
    ...navigation,
    { name: 'Configurações', href: '/settings', icon: Settings },
  ];

  const userNavigation =
    session?.user?.role === 'comissao' ? adminNavigation : navigation;

  return (
    <nav className='sticky top-0 z-50 w-full border-b border-border-color bg-background-color/95 backdrop-blur-xl'>
      <div className='container mx-auto flex h-20 max-w-7xl items-center justify-between px-6'>
        <div className='flex items-center space-x-8'>
          <Link
            href='/dashboard'
            className='flex items-center space-x-4 hover:scale-105 transition-transform'
          >
            <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-color shadow-xl'>
              <Trophy className='h-6 w-6 text-background-color' />
            </div>
            <span className='text-2xl font-semibold text-text-primary'>
              AFPS
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className='hidden lg:flex lg:space-x-2'>
            {userNavigation.map((item) => (
              <Button key={item.name} variant='ghost' size='sm' asChild>
                <Link href={item.href} className='flex items-center space-x-2'>
                  <item.icon className='h-4 w-4' />
                  <span>{item.name}</span>
                </Link>
              </Button>
            ))}
          </div>
        </div>

        <div className='flex items-center space-x-4'>
          {session ? (
            <>
              {/* Mobile menu button */}
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant='ghost' size='icon' className='lg:hidden'>
                    <Menu className='h-5 w-5' />
                    <span className='sr-only'>Abrir menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side='left'
                  className='w-80 bg-card-background border-border-color'
                >
                  <SheetHeader>
                    <SheetTitle className='text-text-primary text-xl'>
                      Menu de Navegação
                    </SheetTitle>
                  </SheetHeader>
                  <div className='mt-8 flex flex-col space-y-2'>
                    {userNavigation.map((item) => (
                      <Button
                        key={item.name}
                        variant='ghost'
                        className='justify-start h-12'
                        asChild
                        onClick={() => setIsOpen(false)}
                      >
                        <Link
                          href={item.href}
                          className='flex items-center space-x-3'
                        >
                          <item.icon className='h-5 w-5' />
                          <span className='text-base'>{item.name}</span>
                        </Link>
                      </Button>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='ghost'
                    className='relative h-10 w-10 rounded-full'
                  >
                    <Avatar className='h-10 w-10'>
                      <AvatarImage
                        src='/placeholder-user.jpg'
                        alt={session.user?.name || ''}
                      />
                      <AvatarFallback className='bg-primary-color text-background-color font-semibold'>
                        {session.user?.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className='w-64 bg-card-background border-border-color'
                  align='end'
                  forceMount
                >
                  <DropdownMenuLabel className='font-normal'>
                    <div className='flex flex-col space-y-1'>
                      <p className='text-base font-medium leading-none text-text-primary'>
                        {session.user?.name}
                      </p>
                      <p className='text-sm leading-none text-text-secondary'>
                        {session.user?.email}
                      </p>
                      <p className='text-sm leading-none text-primary-color capitalize font-medium'>
                        {session.user?.role}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className='bg-border-color' />
                  <DropdownMenuItem
                    onClick={() => signOut()}
                    className='text-text-primary hover:bg-card-background cursor-pointer'
                  >
                    <LogOut className='mr-2 h-4 w-4' />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button asChild>
              <Link href='/login'>Entrar</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
