import type React from 'react';
import { CardList } from '@/components/card-list';
import { MonthlyHistory } from '@/components/monthly-history';
import { listPlayerCards } from '@/lib/data/cards';
import { Navbar } from '@/components/navbar';
import {
  OverdueDetail,
  ScoreCell,
  ScoreStrip,
} from '@/components/score-strip';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  getPlayerByUserId,
  getPlayerFinancials,
} from '@/lib/data/players';
import { formatDate, formatPhone, formatCents, formatCPF } from '@/lib/utils';
import { requireSession } from '@/lib/session';

export const metadata = { title: 'Minha área - AFPS' };

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className='text-sm text-muted-foreground'>{label}</dt>
      <dd className='font-medium'>{value}</dd>
    </div>
  );
}

export default async function MePage() {
  const session = await requireSession();
  const player = await getPlayerByUserId(session.user.id);

  if (!player) {
    return (
      <div className='min-h-screen'>
        <Navbar />
        <main className='mx-auto max-w-3xl px-4 py-8 md:py-12'>
          <h1 className='heading text-xl md:text-2xl'>Minha área</h1>
          <section className='mt-8 rounded-lg border bg-card px-6 py-10'>
            <h2 className='heading text-lg'>
              Sua conta não está ligada a uma ficha de jogador
            </h2>
            <p className='mt-1 max-w-prose text-muted-foreground'>
              {session.user.role === 'comissao'
                ? 'Contas da comissão sem ficha de jogador não têm mensalidades. Se você também joga, cadastre sua ficha em Jogadores com o mesmo CPF da sua conta.'
                : 'Peça à comissão para conferir se a sua ficha foi cadastrada com o mesmo CPF que você usou para criar a conta.'}
            </p>
          </section>
        </main>
      </div>
    );
  }

  const [finance, cards] = await Promise.all([
    getPlayerFinancials(player.id),
    listPlayerCards(player.id),
  ]);
  const pendingCards = cards.filter((c) => c.status === 'pendente');
  const pendingCardsCents = pendingCards.reduce((s, c) => s + c.amountCents, 0);

  return (
    <div className='min-h-screen'>
      <Navbar />
      <main className='mx-auto max-w-6xl px-4 py-8 md:py-12'>
        {/* Cabeçalho com o número da camisa como peça principal */}
        <header className='mb-8 flex items-center gap-6'>
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
            {!player.isActive && (
              <Badge variant='outline' className='mt-2'>
                Inativo
              </Badge>
            )}
          </div>
        </header>

        {finance.overdueCount > 0 && (
          <Alert variant='destructive' className='mb-6'>
            <AlertDescription>
              Você tem {finance.overdueCount} mensalidade
              {finance.overdueCount === 1 ? '' : 's'} vencida
              {finance.overdueCount === 1 ? '' : 's'}. Acerte com a comissão para
              ficar em dia.
            </AlertDescription>
          </Alert>
        )}

        <ScoreStrip label='Minha situação' columns={4} className='mb-8'>
          <ScoreCell
            value={formatCents(finance.openCents)}
            label='A pagar'
            detail={`${finance.openCount} mensalidade${finance.openCount === 1 ? '' : 's'} em aberto`}
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
            label='Multas'
            detail={`${pendingCards.length} ${pendingCards.length === 1 ? 'cartão' : 'cartões'} a pagar`}
            tone={pendingCardsCents > 0 ? 'negative' : 'default'}
          />
        </ScoreStrip>

        <div className='grid gap-8 lg:grid-cols-3'>
          <section className='rounded-lg border bg-card lg:col-span-2'>
            <h2 className='heading px-6 pt-6 pb-2 text-lg'>Minhas mensalidades</h2>
            <MonthlyHistory
              monthlies={finance.monthlies}
              emptyMessage='Nenhuma mensalidade gerada para você ainda.'
            />
            <h2 className='heading border-t px-6 pt-6 pb-2 text-lg'>
              Meus cartões
            </h2>
            <CardList
              cards={cards}
              showPlayer={false}
              manage={false}
              emptyMessage='Nenhum cartão. Siga assim!'
            />
          </section>

          <section className='rounded-lg border bg-card p-6'>
            <h2 className='heading mb-4 text-lg'>Minha ficha</h2>
            <dl className='space-y-4'>
              <Field label='Nome completo' value={player.fullName} />
              {player.cpf && <Field label='CPF' value={formatCPF(player.cpf)} />}
              {player.birthDate && (
                <Field label='Nascimento' value={formatDate(player.birthDate)} />
              )}
              {player.phone && (
                <Field label='Telefone' value={formatPhone(player.phone)} />
              )}
              {player.address && <Field label='Endereço' value={player.address} />}
            </dl>
            <p className='mt-6 text-sm text-muted-foreground'>
              Algum dado errado? Peça à comissão para corrigir.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
