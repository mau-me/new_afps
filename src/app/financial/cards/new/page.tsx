import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { getCardFees, listPlayerOptions } from '@/lib/data/cards';
import { requireRole } from '@/lib/session';
import { CardForm } from './card-form';

export default async function NewCardPage({
  searchParams,
}: {
  searchParams: Promise<{ player?: string }>;
}) {
  await requireRole('comissao');
  const { player } = await searchParams;

  const [players, fees] = await Promise.all([listPlayerOptions(), getCardFees()]);
  const defaultPlayerId = players.some((p) => p.id === player) ? player : undefined;
  const returnTo = defaultPlayerId ? `/players/${defaultPlayerId}` : '/financial/cards';

  return (
    <div className='min-h-screen'>
      <Navbar />
      <main className='mx-auto max-w-3xl px-4 py-8 md:py-12'>
        <header className='mb-8'>
          <h1 className='heading text-xl md:text-2xl'>Registrar cartão</h1>
          <p className='mt-1 text-muted-foreground'>
            A multa fica pendente até o jogador pagar. O pagamento entra no
            caixa automaticamente.
          </p>
        </header>
        <section className='rounded-lg border bg-card p-6 md:p-8'>
          {players.length === 0 ? (
            <div>
              <p className='text-muted-foreground'>
                Não há jogadores ativos para receber cartão.
              </p>
              <Button asChild className='mt-4'>
                <Link href='/players/new'>Cadastrar jogador</Link>
              </Button>
            </div>
          ) : (
            <CardForm
              players={players}
              fees={fees}
              defaultPlayerId={defaultPlayerId}
              returnTo={returnTo}
            />
          )}
        </section>
      </main>
    </div>
  );
}
