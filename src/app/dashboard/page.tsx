import type React from 'react';
import Link from 'next/link';
import { Plus, UserPlus, UserRound, Users, Wallet } from 'lucide-react';
import { OverdueDetail, ScoreCell, ScoreStrip } from '@/components/score-strip';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import dbConnect from '@/lib/mongodb';
import Player from '@/lib/models/Player';
import Monthly, { overdueFilter } from '@/lib/models/Monthly';
import Transaction, { activeFilter } from '@/lib/models/Transaction';
import { currentReferenceMonth, monthRange } from '@/lib/months';
import { requireSession } from '@/lib/session';
import { getPlayerByUserId, getPlayerFinancials } from '@/lib/data/players';
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
  // Mês corrente no fuso da associação (não no fuso do servidor).
  const { start, end } = monthRange(currentReferenceMonth(now));

  const [openPayments, overduePayments, totals] = await Promise.all([
    Monthly.countDocuments({ status: 'em_aberto' }),
    Monthly.countDocuments(overdueFilter(now)),
    Transaction.aggregate<{ _id: 'entrada' | 'saida'; total: number }>([
      { $match: { ...activeFilter, date: { $gte: start, $lt: end } } },
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
  const [players, finance, myPlayer] = await Promise.all([
    getPlayerStats(),
    isCommission ? getFinancialStats() : Promise.resolve(null),
    isCommission ? Promise.resolve(null) : getPlayerByUserId(session.user.id),
  ]);
  // Jogador: a própria situação aparece no placar.
  const mine = myPlayer ? await getPlayerFinancials(myPlayer.id) : null;

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

        <ScoreStrip
          label='Resumo'
          columns={finance ? 4 : mine ? 2 : 1}
          className='mb-8'
        >
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
          {mine && (
            <ScoreCell
              value={formatCents(mine.openCents)}
              label='Minhas mensalidades'
              href='/me'
              tone={mine.overdueCount > 0 ? 'negative' : 'default'}
              detail={
                mine.openCount === 0 ? (
                  'Tudo em dia'
                ) : (
                  <>
                    {mine.openCount} em aberto
                    {mine.overdueCount > 0 && (
                      <>
                        , <OverdueDetail count={mine.overdueCount} />
                      </>
                    )}
                  </>
                )
              }
            />
          )}
          {finance && (
            <>
              <ScoreCell
                value={formatCents(finance.revenueCents)}
                label='Receita'
                detail='Entradas do mês'
                href='/financial?type=entrada'
              />
              <ScoreCell
                value={formatCents(finance.balanceCents)}
                label='Saldo'
                detail='Receitas menos despesas'
                href='/financial'
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
              <Button variant='link' className='mt-2 h-auto px-0' asChild>
                <Link href='/financial'>Ver lançamentos no caixa</Link>
              </Button>
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
                    <Link href='/financial/transactions/new'>
                      <Plus />
                      Novo lançamento
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
              {!isCommission && (
                <Button className='justify-start' asChild>
                  <Link href='/me'>
                    <UserRound />
                    Minha área
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
