import { notFound } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { PlayerForm } from '@/components/player-form';
import { updatePlayer } from '@/lib/actions/players';
import { getPlayerById } from '@/lib/data/players';
import { requireRole } from '@/lib/session';
import { formatCPF, formatPhone } from '@/lib/utils';

export default async function EditPlayerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole('comissao');
  const { id } = await params;

  const player = await getPlayerById(id, { includePersonal: true });
  if (!player) notFound();

  const initialValues = {
    fullName: player.fullName,
    nickname: player.nickname,
    cpf: formatCPF(player.cpf ?? ''),
    // Data de nascimento é guardada como meia-noite UTC do dia.
    birthDate: player.birthDate?.slice(0, 10) ?? '',
    position: player.position,
    shirtNumber: String(player.shirtNumber),
    phone: formatPhone(player.phone ?? ''),
    address: player.address ?? '',
  };

  return (
    <div className='min-h-screen'>
      <Navbar />
      <main className='mx-auto max-w-3xl px-4 py-8 md:py-12'>
        <header className='mb-8'>
          <h1 className='heading text-xl md:text-2xl'>
            Editar ficha de {player.nickname}
          </h1>
          <p className='mt-1 text-muted-foreground'>
            As alterações valem para todo o sistema.
          </p>
        </header>
        <section className='rounded-lg border bg-card p-6 md:p-8'>
          <PlayerForm
            action={updatePlayer.bind(null, player.id)}
            initialValues={initialValues}
            cpfLocked={player.hasAccount}
            submitLabel='Salvar alterações'
            cancelHref={`/players/${player.id}`}
          />
        </section>
      </main>
    </div>
  );
}
