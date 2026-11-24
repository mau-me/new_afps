import type React from 'react';
import Link from 'next/link';
import { UserPlus, Users, Wallet } from 'lucide-react';
import { OverdueDetail, ScoreCell, ScoreStrip } from '@/components/score-strip';
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

        <ScoreStrip label='Resumo' columns={finance ? 4 : 1} className='mb-8'>
          <ScoreCell
            value={players.totalPlayers}
            label='Jogadores'
            href='/players'
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
                href='/financial/monthly?status=em_aberto'
                detail={<OverdueDetail count={finance.overduePayments} />}
              />
            </>
          )}
        </ScoreStrip>

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
                <>
                  <Button className='justify-start' asChild>
                    <Link href='/financial/monthly'>
                      <Wallet />
                      Mensalidades do mês
                    </Link>
                  </Button>
                  <Button className='justify-start' variant='outline' asChild>
                    <Link href='/players/new'>
                      <UserPlus />
                      Cadastrar jogador
                    </Link>
                  </Button>
                </>
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
