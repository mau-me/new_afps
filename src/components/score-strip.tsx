import type React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * Faixa de placar: uma linha de números grandes separados por filetes.
 * `columns` é o número de células no desktop (no celular são 2 por linha).
 */
export function ScoreStrip({
  label,
  columns,
  children,
  className,
}: {
  label: string;
  columns: 1 | 2 | 3 | 4;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      aria-label={label}
      // gap-px sobre fundo de borda = filetes entre as células
      className={cn(
        'grid gap-px overflow-hidden rounded-lg border bg-border [&>*]:bg-card',
        columns === 1 && 'grid-cols-1',
        columns === 2 && 'grid-cols-2',
        columns === 3 && 'grid-cols-2 lg:grid-cols-3',
        columns === 4 && 'grid-cols-2 lg:grid-cols-4',
        className
      )}
    >
      {children}
    </section>
  );
}

/** Uma célula da faixa: número grande + legenda curta (+ link opcional). */
export function ScoreCell({
  value,
  label,
  detail,
  tone = 'default',
  href,
}: {
  value: React.ReactNode;
  label: string;
  detail?: React.ReactNode;
  tone?: 'default' | 'positive' | 'negative';
  href?: string;
}) {
  const content = (
    <>
      <span
        className={cn(
          'numeral text-2xl sm:text-3xl',
          tone === 'positive' && 'text-success',
          tone === 'negative' && 'text-error'
        )}
      >
        {value}
      </span>
      <span className='text-sm font-medium'>{label}</span>
      {detail && (
        <span className='text-xs text-muted-foreground'>{detail}</span>
      )}
    </>
  );

  const base = 'flex min-w-0 flex-col gap-1 px-4 py-6 sm:px-6';

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          base,
          'transition-colors hover:bg-muted focus-visible:outline-offset-[-2px]'
        )}
      >
        {content}
      </Link>
    );
  }

  return <div className={base}>{content}</div>;
}

/** Contagem de vencidas com o marcador de cartão vermelho. */
export function OverdueDetail({ count }: { count: number }) {
  if (count === 0) return <>Nenhuma vencida</>;
  return (
    <span className='inline-flex items-center gap-1.5'>
      <span className='ref-card bg-error' aria-hidden />
      {count} vencida{count === 1 ? '' : 's'}
    </span>
  );
}
