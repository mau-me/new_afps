import Link from 'next/link';
import { cn } from '@/lib/utils';

export type FilterTab = {
  label: string;
  href: string;
  count: number;
  active: boolean;
};

/** Abas de filtro como links (o filtro fica na URL e pode ser compartilhado). */
export function FilterTabs({
  label,
  tabs,
  className,
}: {
  label: string;
  tabs: FilterTab[];
  className?: string;
}) {
  return (
    <nav
      aria-label={label}
      className={cn('flex flex-wrap gap-1 border-b', className)}
    >
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          aria-current={tab.active ? 'page' : undefined}
          className={cn(
            '-mb-px flex items-center gap-2 border-b-[3px] border-transparent px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
            tab.active && 'border-primary text-foreground'
          )}
        >
          {tab.label}
          <span className='rounded-sm bg-muted px-1.5 text-xs tabular-nums'>
            {tab.count}
          </span>
        </Link>
      ))}
    </nav>
  );
}
