import type React from 'react';
import Link from 'next/link';
import { UserPlus, Users } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import dbConnect from '@/lib/mongodb';
import Player from '@/lib/models/Player';
import Monthly, { overdueFilter } from '@/lib/models/Monthly';
import Transaction from '@/lib/models/Transaction';
import { requireSession } from '@/lib/session';
import { cn, formatCents } from '@/lib/utils';

async function getPlayerStats() {
  const [totalPlayers, activePlayers] = await Promise.all([
    Player.countDocuments(),
    Player.countDocuments({ isActive: true }),
  ]);
  return { totalPlayers, activePlayers };
}

async function getFinancialStats() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [openPayments, overduePayments, totals] = await Promise.all([
    Monthly.countDocuments({ status: 'em_aberto' }),
    Monthly.countDocuments(overdueFilter(now)),
    Transaction.aggregate<{ _id: 'entrada' | 'saida'; total: number }>([
      { $match: { date: { $gte: monthStart } } },
      { $group: { _id: '$type', total: { $sum: '$amountCents' } } },
    ]),
  ]);

  const revenueCents = totals.find((t) => t._id === 'entrada')?.total ?? 0;
  const expensesCents = totals.find((t) => t._id === 'saida')?.total ?? 0;

  return {
    openPayments,
    overduePayments,
    revenueCents,
    expensesCents,
    balanceCents: revenueCents - expensesCents,
  };
}

/** Uma célula da faixa de placar: número grande + legenda curta. */
function ScoreCell({
  value,
  label,
  detail,
  tone = 'default',
}: {
  value: React.ReactNode;
  label: string;
  detail?: React.ReactNode;
  tone?: 'default' | 'positive' | 'negative';
}) {
  return (
    <div className='flex min-w-0 flex-col gap-1 px-4 py-6 sm:px-6'>
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
    </div>
  );
}

function LedgerRow({
  label,
  value,
  strong,
  className,
}: {
  label: string;
  value: string;
  strong?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-baseline justify-between gap-4 py-2',
        strong && 'border-t-2 border-foreground pt-4',
        className
      )}
    >
      <span className={cn('text-sm', strong && 'font-semibold')}>{label}</span>
      <span
        className={cn(
          'tabular-nums',
          strong ? 'numeral text-xl' : 'text-base font-medium'
        )}
      >
        {value}
      </span>
    </div>
  );
}

export default async function DashboardPage() {
  const session = await requireSession();
  const isCommission = session.user.role === 'comissao';

  await dbConnect();
  const [players, finance] = await Promise.all([
    getPlayerStats(),
    isCommission ? getFinancialStats() : Promise.resolve(null),
  ]);

  const firstName = session.user.name?.split(' ')[0];

  return (
    <div className='min-h-screen'>
      <Navbar />
      <main className='mx-auto max-w-6xl px-4 py-8 md:py-12'>
        <header className='mb-8 flex flex-wrap items-end justify-between gap-4'>
          <div>
            <h1 className='heading text-xl md:text-2xl'>Olá, {firstName}</h1>
            <p className='mt-1 text-muted-foreground'>
              Resumo da associação neste mês.
            </p>
          </div>
          <Badge variant={isCommission ? 'default' : 'outline'}>
            {isCommission ? 'Comissão' : 'Jogador'}
          </Badge>
        </header>

        {/* Faixa de placar */}
        <section
          aria-label='Resumo'
          // gap-px sobre fundo de borda = filetes entre as células
          className={cn(
            'mb-8 grid gap-px overflow-hidden rounded-lg border bg-border [&>*]:bg-card',
            finance ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1'
          )}
        >
          <ScoreCell
            value={players.totalPlayers}
            label='Jogadores'
            detail={
              <>
                <span className='font-medium text-success'>
                  {players.activePlayers}
                </span>{' '}
                ativos
              </>
            }
          />
          {finance && (
            <>
              <ScoreCell
                value={formatCents(finance.revenueCents)}
                label='Receita'
                detail='Entradas do mês'
              />
              <ScoreCell
                value={formatCents(finance.balanceCents)}
                label='Saldo'
                detail='Receitas menos despesas'
                tone={finance.balanceCents >= 0 ? 'positive' : 'negative'}
              />
              <ScoreCell
                value={finance.openPayments}
                label='Mensalidades em aberto'
                detail={
                  finance.overduePayments > 0 ? (
                    <span className='inline-flex items-center gap-1.5'>
                      <span className='ref-card bg-error' aria-hidden />
                      {finance.overduePayments} vencida
                      {finance.overduePayments === 1 ? '' : 's'}
                    </span>
                  ) : (
                    'Nenhuma vencida'
                  )
                }
              />
            </>
          )}
        </section>

        <div className='grid gap-8 lg:grid-cols-3'>
          {finance && (
            <section className='rounded-lg border bg-card p-6 lg:col-span-2'>
              <h2 className='heading text-lg'>Movimentação do mês</h2>
              <p className='mb-4 text-sm text-muted-foreground'>
                Entradas e saídas registradas desde o dia 1º.
              </p>
              <LedgerRow
                label='Receitas'
                value={`+ ${formatCents(finance.revenueCents)}`}
                className='border-b border-dashed'
              />
              <LedgerRow
                label='Despesas'
                value={`− ${formatCents(finance.expensesCents)}`}
              />
              <LedgerRow
                label='Saldo do mês'
                value={formatCents(finance.balanceCents)}
                strong
              />
            </section>
          )}

          <section
            className={cn(
              'rounded-lg border bg-card p-6',
              !finance && 'lg:col-span-3'
            )}
          >
            <h2 className='heading mb-4 text-lg'>Atalhos</h2>
            <div className='flex flex-col gap-2'>
              {isCommission && (
                <Button className='justify-start' asChild>
                  <Link href='/players/new'>
                    <UserPlus />
                    Cadastrar jogador
                  </Link>
                </Button>
              )}
              <Button className='justify-start' variant='outline' asChild>
                <Link href='/players'>
                  <Users />
                  Ver jogadores
                </Link>
              </Button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
