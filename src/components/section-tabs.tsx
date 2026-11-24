import Link from 'next/link';
import { cn } from '@/lib/utils';

export type SectionTab = { key: string; label: string; href: string };

/** Abas de navegação entre as páginas de uma seção (Financeiro, Configurações). */
export function SectionTabs({
  label,
  tabs,
  active,
}: {
  label: string;
  tabs: readonly SectionTab[];
  active: string;
}) {
  return (
    <nav aria-label={label} className='mb-8 flex gap-1 overflow-x-auto'>
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          aria-current={tab.key === active ? 'page' : undefined}
          className={cn(
            'rounded-md px-4 py-2 text-sm font-semibold whitespace-nowrap text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
            tab.key === active &&
              'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
