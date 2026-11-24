import { Navbar } from '@/components/navbar';
import { requireRole } from '@/lib/session';
import { PlayerForm } from '@/components/player-form';
import { createPlayer } from '@/lib/actions/players';

export default async function NewPlayerPage() {
  await requireRole('comissao');

  return (
    <div className='min-h-screen'>
      <Navbar />
      <main className='mx-auto max-w-3xl px-4 py-8 md:py-12'>
        <header className='mb-8'>
          <h1 className='heading text-xl md:text-2xl'>Cadastrar jogador</h1>
          <p className='mt-1 text-muted-foreground'>
            Preencha a ficha do novo jogador da associação.
          </p>
        </header>
        <section className='rounded-lg border bg-card p-6 md:p-8'>
          <PlayerForm
            action={createPlayer}
            submitLabel='Cadastrar jogador'
            cancelHref='/players'
            note='Ao cadastrar, o CPF fica liberado para o jogador criar a própria conta em "Cadastrar-se".'
          />
        </section>
      </main>
    </div>
  );
}
