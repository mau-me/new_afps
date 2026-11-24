import { Navbar } from '@/components/navbar';
import { SettingsTabs } from '@/components/settings-tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getAssociationSettings } from '@/lib/data/settings';
import { requireRole } from '@/lib/session';
import { formatPhone } from '@/lib/utils';
import { AssociationForm } from './association-form';
import { FeesForm } from './fees-form';

function centsToInput(cents: number) {
  return cents > 0 ? (cents / 100).toFixed(2).replace('.', ',') : '';
}

export default async function SettingsPage() {
  await requireRole('comissao');
  const settings = await getAssociationSettings();

  return (
    <div className='min-h-screen'>
      <Navbar />
      <main className='mx-auto max-w-4xl px-4 py-8 md:py-12'>
        <SettingsTabs active='associacao' />
        <h1 className='heading text-xl md:text-2xl'>Associação</h1>
        <p className='mt-1 mb-8 text-muted-foreground'>
          Dados públicos e valores cobrados dos jogadores.
        </p>

        {!settings ? (
          <Alert variant='warning'>
            <AlertDescription>
              Nenhuma associação cadastrada. Rode <code>npm run seed</code> para
              criar os dados iniciais.
            </AlertDescription>
          </Alert>
        ) : (
          <div className='space-y-8'>
            <section className='rounded-lg border bg-card p-6 md:p-8'>
              <h2 className='heading text-lg'>Valores</h2>
              <p className='mt-1 mb-6 text-sm text-muted-foreground'>
                Mudanças valem para as próximas mensalidades e multas; as já
                registradas não mudam.
              </p>
              <FeesForm
                initial={{
                  monthlyFee: centsToInput(settings.monthlyFeeCents),
                  dueDay: String(settings.dueDay),
                  yellowCardFee: centsToInput(settings.yellowCardFeeCents),
                  redCardFee: centsToInput(settings.redCardFeeCents),
                }}
              />
            </section>

            <section className='rounded-lg border bg-card p-6 md:p-8'>
              <h2 className='heading mb-6 text-lg'>Dados públicos</h2>
              <AssociationForm
                initial={{
                  name: settings.name,
                  description: settings.description,
                  address: settings.address,
                  phone: formatPhone(settings.phone),
                  email: settings.email,
                  gameSchedule: settings.gameSchedule,
                  commission: settings.commission.join('\n'),
                  facebook: settings.socialMedia.facebook,
                  twitter: settings.socialMedia.twitter,
                  instagram: settings.socialMedia.instagram,
                }}
              />
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
