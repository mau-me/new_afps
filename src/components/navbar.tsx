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

export function Navbar() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <nav className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
        <div className='container flex h-16 items-center justify-between'>
          <div className='flex items-center space-x-4'>
            <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground'>
              <Trophy className='h-4 w-4' />
            </div>
            <span className='text-xl font-bold'>AFPS</span>
          </div>
          <div className='flex items-center space-x-4'>
            <div className='h-8 w-8 animate-pulse rounded-full bg-muted' />
          </div>
        </div>
      </nav>
    );
  }

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
    <nav className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='container flex h-16 items-center justify-between'>
        <div className='flex items-center space-x-4'>
          <Link href='/dashboard' className='flex items-center space-x-2'>
            <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground'>
              <Trophy className='h-4 w-4' />
            </div>
            <span className='text-xl font-bold'>AFPS</span>
          </Link>

          {/* Desktop Navigation */}
          <div className='hidden md:ml-6 md:flex md:space-x-1'>
            {userNavigation.map((item) => (
              <Button key={item.name} variant='ghost' asChild>
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
                  <Button variant='ghost' size='icon' className='md:hidden'>
                    <Menu className='h-6 w-6' />
                    <span className='sr-only'>Abrir menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side='left' className='w-64'>
                  <SheetHeader>
                    <SheetTitle>Menu de Navegação</SheetTitle>
                  </SheetHeader>
                  <div className='mt-6 flex flex-col space-y-2'>
                    {userNavigation.map((item) => (
                      <Button
                        key={item.name}
                        variant='ghost'
                        className='justify-start'
                        asChild
                        onClick={() => setIsOpen(false)}
                      >
                        <Link
                          href={item.href}
                          className='flex items-center space-x-2'
                        >
                          <item.icon className='h-4 w-4' />
                          <span>{item.name}</span>
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
                    className='relative h-8 w-8 rounded-full'
                  >
                    <Avatar className='h-8 w-8'>
                      <AvatarImage
                        src='/placeholder-user.jpg'
                        alt={session.user?.name || ''}
                      />
                      <AvatarFallback className='bg-primary text-primary-foreground'>
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
            <Button asChild>
              <Link href='/login'>Entrar</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
