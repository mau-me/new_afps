import Link from 'next/link';
import { cn } from '@/lib/utils';

const TABS = [
  { key: 'caixa', label: 'Caixa', href: '/financial' },
  { key: 'mensalidades', label: 'Mensalidades', href: '/financial/monthly' },
  { key: 'cartoes', label: 'Cartões', href: '/financial/cards' },
] as const;

export type FinancialTab = (typeof TABS)[number]['key'];

/** Navegação entre as áreas do Financeiro. */
export function FinancialTabs({ active }: { active: FinancialTab }) {
  return (
    <nav aria-label='Financeiro' className='mb-8 flex gap-1 overflow-x-auto'>
      {TABS.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          aria-current={tab.key === active ? 'page' : undefined}
          className={cn(
            'rounded-md px-4 py-2 text-sm font-semibold whitespace-nowrap text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
            tab.key === active && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
