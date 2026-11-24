import type React from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, Pencil, Plus } from 'lucide-react';
import { CardList } from '@/components/card-list';
import { listPlayerCards } from '@/lib/data/cards';
import { MonthlyHistory } from '@/components/monthly-history';
import { Navbar } from '@/components/navbar';
import {
  OverdueDetail,
  ScoreCell,
  ScoreStrip,
} from '@/components/score-strip';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  getPlayerById,
  getPlayerByUserId,
  getPlayerFinancials,
} from '@/lib/data/players';
import { requireSession } from '@/lib/session';
import { formatCents, formatCPF, formatDate, formatPhone } from '@/lib/utils';
import { ActiveToggle } from './active-toggle';

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className='text-sm text-muted-foreground'>{label}</dt>
      <dd className='font-medium'>{value}</dd>
    </div>
  );
}

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireSession();
  const isCommission = session.user.role === 'comissao';

  // O próprio jogador vê a ficha completa na área dele.
  if (!isCommission) {
    const mine = await getPlayerByUserId(session.user.id);
    if (mine?.id === id) redirect('/me');
  }

  const player = await getPlayerById(id, { includePersonal: isCommission });
  if (!player || (!isCommission && !player.isActive)) notFound();

  const [finance, cards] = isCommission
    ? await Promise.all([
        getPlayerFinancials(player.id),
        listPlayerCards(player.id),
      ])
    : [null, []];
  const pendingCards = cards.filter((c) => c.status === 'pendente');
  const pendingCardsCents = pendingCards.reduce((s, c) => s + c.amountCents, 0);

  return (
    <div className='min-h-screen'>
      <Navbar />
      <main className='mx-auto max-w-6xl px-4 py-8 md:py-12'>
        <Link
          href='/players'
          className='mb-6 inline-flex items-center gap-1 rounded-sm text-sm text-muted-foreground hover:text-foreground'
        >
          <ArrowLeft className='h-4 w-4' />
          Jogadores
        </Link>

        <header className='mb-8 flex flex-wrap items-center justify-between gap-6'>
          <div className='flex items-center gap-6'>
            <span
              aria-hidden
              className='numeral text-[4.5rem] text-primary sm:text-[6rem]'
            >
              {player.shirtNumber}
            </span>
            <div className='min-w-0'>
              <h1 className='heading text-xl md:text-2xl'>{player.nickname}</h1>
              <p className='text-muted-foreground'>
                {player.position}, camisa {player.shirtNumber}
              </p>
              {isCommission && (
                <div className='mt-2 flex flex-wrap gap-1'>
                  <Badge variant={player.isActive ? 'success' : 'outline'}>
                    {player.isActive ? 'Ativo' : 'Inativo'}
                  </Badge>
                  <Badge variant='outline'>
                    {player.hasAccount ? 'Com conta' : 'Sem conta'}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {isCommission && (
            <div className='flex flex-wrap gap-2'>
              <Button variant='outline' asChild>
                <Link href={`/players/${player.id}/edit`}>
                  <Pencil />
                  Editar ficha
                </Link>
              </Button>
              <ActiveToggle
                playerId={player.id}
                isActive={player.isActive}
                nickname={player.nickname}
              />
            </div>
          )}
        </header>

        {finance && (
          <>
            <ScoreStrip label='Situação financeira' columns={4} className='mb-8'>
              <ScoreCell
                value={formatCents(finance.openCents)}
                label='Em aberto'
                detail={`${finance.openCount} mensalidade${finance.openCount === 1 ? '' : 's'}`}
                tone={finance.openCents > 0 ? 'negative' : 'positive'}
              />
              <ScoreCell
                value={finance.overdueCount}
                label='Vencidas'
                detail={<OverdueDetail count={finance.overdueCount} />}
                tone={finance.overdueCount > 0 ? 'negative' : 'default'}
              />
              <ScoreCell
                value={finance.paidCount}
                label='Pagas'
                detail='Mensalidades quitadas'
              />
              <ScoreCell
                value={formatCents(pendingCardsCents)}
                label='Multas pendentes'
                detail={`${pendingCards.length} ${pendingCards.length === 1 ? 'cartão' : 'cartões'} a pagar`}
                tone={pendingCardsCents > 0 ? 'negative' : 'default'}
              />
            </ScoreStrip>

            <div className='grid gap-8 lg:grid-cols-3'>
              <section className='rounded-lg border bg-card lg:col-span-2'>
                <h2 className='heading px-6 pt-6 pb-2 text-lg'>Mensalidades</h2>
                <MonthlyHistory
                  monthlies={finance.monthlies}
                  emptyMessage='Nenhuma mensalidade gerada para este jogador.'
                />
              </section>

              <section className='rounded-lg border bg-card p-6'>
                <h2 className='heading mb-4 text-lg'>Ficha</h2>
                <dl className='space-y-4'>
                  <Field label='Nome completo' value={player.fullName} />
                  {player.cpf && (
                    <Field label='CPF' value={formatCPF(player.cpf)} />
                  )}
                  {player.birthDate && (
                    <Field
                      label='Nascimento'
                      value={formatDate(player.birthDate)}
                    />
                  )}
                  {player.phone && (
                    <Field label='Telefone' value={formatPhone(player.phone)} />
                  )}
                  {player.address && (
                    <Field label='Endereço' value={player.address} />
                  )}
                </dl>
              </section>
            </div>

            <section className='mt-8 rounded-lg border bg-card'>
              <div className='flex flex-wrap items-center justify-between gap-4 px-6 pt-6 pb-2'>
                <h2 className='heading text-lg'>Cartões</h2>
                <Button variant='outline' size='sm' asChild>
                  <Link href={`/financial/cards/new?player=${player.id}`}>
                    <Plus />
                    Registrar cartão
                  </Link>
                </Button>
              </div>
              <CardList
                cards={cards}
                showPlayer={false}
                manage
                emptyMessage='Nenhum cartão registrado.'
              />
            </section>
          </>
        )}
      </main>
    </div>
  );
}
