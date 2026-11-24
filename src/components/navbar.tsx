'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  LogOut,
  Home,
  Wallet,
  UserRound,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Adicione aqui novos módulos (Financeiro, Relatórios, Configurações...)
// conforme as páginas forem criadas, para não haver links quebrados.
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Jogadores', href: '/players', icon: Users },
  { name: 'Minha área', href: '/me', icon: UserRound },
  {
    // Caixa, Mensalidades e Cartões ficam em abas dentro do Financeiro.
    name: 'Financeiro',
    href: '/financial',
    icon: Wallet,
    commissionOnly: true,
  },
];

export function Navbar() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const items = navigation.filter(
    (item) => !item.commissionOnly || session?.user.role === 'comissao'
  );

  // Só o item de caminho mais específico fica ativo
  // (em /financial/monthly, "Mensalidades" — e não também "Caixa").
  const matches = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);
  const activeHref = items
    .map((item) => item.href)
    .filter(matches)
    .sort((a, b) => b.length - a.length)[0];
  const isActive = (href: string) => href === activeHref;

  const wordmark = (
    <span className='heading text-xl tracking-tight text-primary-foreground'>
      AFPS
    </span>
  );

  if (status === 'loading') {
    return (
      <nav className='sticky top-0 z-50 w-full bg-primary'>
        <div className='mx-auto flex h-14 max-w-6xl items-center justify-between px-4'>
          {wordmark}
          <div className='h-9 w-9 animate-pulse rounded-full bg-primary-foreground/20' />
        </div>
      </nav>
    );
  }

  return (
    <nav className='sticky top-0 z-50 w-full bg-primary text-primary-foreground'>
      <div className='mx-auto flex h-14 max-w-6xl items-center justify-between px-4'>
        <div className='flex items-center gap-8'>
          <Link
            href='/dashboard'
            className='rounded-sm focus-visible:outline-primary-foreground'
          >
            {wordmark}
          </Link>

          {/* Navegação desktop: o item ativo ganha um sublinhado amarelo */}
          <div className='hidden h-14 items-stretch gap-6 md:flex'>
            {items.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                aria-current={isActive(item.href) ? 'page' : undefined}
                className={cn(
                  'flex items-center border-b-[3px] border-transparent pt-[3px] text-sm font-medium text-primary-foreground/75 transition-colors hover:text-primary-foreground focus-visible:outline-primary-foreground',
                  isActive(item.href) &&
                    'border-warning text-primary-foreground'
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        <div className='flex items-center gap-2'>
          {session ? (
            <>
              {/* Menu mobile */}
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='text-primary-foreground hover:bg-primary-foreground/10 focus-visible:outline-primary-foreground md:hidden'
                  >
                    <Menu className='!size-5' />
                    <span className='sr-only'>Abrir menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side='left' className='w-72 p-6'>
                  <SheetHeader>
                    <SheetTitle>AFPS</SheetTitle>
                  </SheetHeader>
                  <div className='mt-6 flex flex-col gap-1'>
                    {items.map((item) => (
                      <Button
                        key={item.name}
                        variant='ghost'
                        className={cn(
                          'justify-start text-base font-medium',
                          isActive(item.href) && 'bg-accent'
                        )}
                        asChild
                        onClick={() => setIsOpen(false)}
                      >
                        <Link
                          href={item.href}
                          aria-current={isActive(item.href) ? 'page' : undefined}
                        >
                          <item.icon />
                          {item.name}
                        </Link>
                      </Button>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>

              {/* Menu do usuário */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='ghost'
                    className='relative h-9 w-9 rounded-full p-0 hover:bg-transparent focus-visible:outline-primary-foreground'
                  >
                    <Avatar className='h-9 w-9 ring-2 ring-primary-foreground/30'>
                      <AvatarFallback className='bg-warning font-semibold text-foreground'>
                        {session.user?.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className='sr-only'>Abrir menu da conta</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className='w-60' align='end' forceMount>
                  <DropdownMenuLabel className='font-normal'>
                    <div className='flex flex-col gap-1'>
                      <p className='text-sm font-semibold leading-tight'>
                        {session.user?.name}
                      </p>
                      <p className='text-xs leading-tight text-muted-foreground'>
                        {session.user?.email}
                      </p>
                      <p className='text-xs leading-tight text-muted-foreground'>
                        {session.user.role === 'comissao' ? 'Comissão' : 'Jogador'}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className='py-2'
                  >
                    <LogOut className='mr-2 h-4 w-4' />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button
              asChild
              variant='secondary'
              size='sm'
            >
              <Link href='/login'>Entrar</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
