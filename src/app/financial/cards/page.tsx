import Link from 'next/link';
import { Plus } from 'lucide-react';
import { CardList } from '@/components/card-list';
import { FilterTabs } from '@/components/filter-tabs';
import { FinancialTabs } from '@/components/financial-tabs';
import { Navbar } from '@/components/navbar';
import { ScoreCell, ScoreStrip } from '@/components/score-strip';
import { Button } from '@/components/ui/button';
import {
  getCardSummary,
  listCards,
  parseCardFilter,
  type CardFilter,
} from '@/lib/data/cards';
import { requireRole } from '@/lib/session';
import { formatCents } from '@/lib/utils';

export default async function CardsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireRole('comissao');
  const filter = parseCardFilter((await searchParams).status);

  const [summary, cards] = await Promise.all([getCardSummary(), listCards(filter)]);

  const tabs: { value: CardFilter; label: string; count: number }[] = [
    { value: 'pendente', label: 'Pendentes', count: summary.pendingCount },
    { value: 'pago', label: 'Pagas', count: summary.paidCount },
    { value: 'todos', label: 'Todas', count: summary.pendingCount + summary.paidCount },
  ];

  return (
    <div className='min-h-screen'>
      <Navbar />
      <main className='mx-auto max-w-6xl px-4 py-8 md:py-12'>
        <FinancialTabs active='cartoes' />

        <header className='mb-8 flex flex-wrap items-end justify-between gap-4'>
          <div>
            <h1 className='heading text-xl md:text-2xl'>Cartões</h1>
            <p className='mt-1 text-muted-foreground'>
              Multas por cartão amarelo e vermelho.
            </p>
          </div>
          <Button asChild>
            <Link href='/financial/cards/new'>
              <Plus />
              Registrar cartão
            </Link>
          </Button>
        </header>

        <ScoreStrip label='Resumo das multas' columns={2} className='mb-8'>
          <ScoreCell
            value={formatCents(summary.pendingCents)}
            label='A receber'
            detail={`${summary.pendingCount} multa${summary.pendingCount === 1 ? '' : 's'} pendente${summary.pendingCount === 1 ? '' : 's'}`}
            tone={summary.pendingCents > 0 ? 'negative' : 'default'}
          />
          <ScoreCell
            value={formatCents(summary.paidCents)}
            label='Recebido'
            detail={`${summary.paidCount} multa${summary.paidCount === 1 ? '' : 's'} paga${summary.paidCount === 1 ? '' : 's'}`}
            tone='positive'
          />
        </ScoreStrip>

        <FilterTabs
          label='Filtrar por situação'
          className='mb-4'
          tabs={tabs.map((t) => ({
            label: t.label,
            count: t.count,
            href: t.value === 'pendente' ? '/financial/cards' : `/financial/cards?status=${t.value}`,
            active: t.value === filter,
          }))}
        />

        <section className='rounded-lg border bg-card'>
          <CardList
            cards={cards}
            showPlayer
            manage
            emptyMessage={
              filter === 'pendente'
                ? 'Nenhuma multa pendente.'
                : 'Nenhum cartão nesta situação.'
            }
          />
        </section>
      </main>
    </div>
  );
}
