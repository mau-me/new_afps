import Link from 'next/link';
import {
  Calendar,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Twitter,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAssociationData } from '@/lib/data/association';
import { formatPhone } from '@/lib/utils';

// Sempre busca dados atuais (contagem de jogadores etc.), sem prerender no build.
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const association = await getAssociationData();

  if (!association) {
    return (
      <main className='mx-auto flex min-h-screen max-w-xl flex-col justify-center px-4'>
        <h1 className='heading text-2xl'>Associação não configurada</h1>
        <p className='mt-2 text-muted-foreground'>
          Nenhum dado da associação foi encontrado. Rode{' '}
          <code className='rounded-sm bg-muted px-1 py-0.5 text-foreground'>
            npm run seed
          </code>{' '}
          para criar os dados iniciais.
        </p>
      </main>
    );
  }

  // Só renderiza links de redes sociais com URL http(s) (evita javascript: etc.)
  const safeUrl = (url?: string | null) =>
    url && /^https?:\/\//i.test(url) ? url : undefined;
  const social = {
    facebook: safeUrl(association.socialMedia.facebook),
    twitter: safeUrl(association.socialMedia.twitter),
    instagram: safeUrl(association.socialMedia.instagram),
  };
  const hasSocial = social.facebook || social.twitter || social.instagram;

  const foundedYear = new Date(association.foundedDate).getUTCFullYear();

  const steps = [
    {
      title: 'Fale com a comissão',
      text: 'A comissão faz sua ficha de jogador e libera o seu CPF no sistema.',
    },
    {
      title: 'Crie sua conta',
      text: 'Use o mesmo CPF em "Cadastrar-se" para acessar o sistema.',
    },
    {
      title: 'Venha jogar',
      text: `${association.gameSchedule}. Além dos jogos, tem torneios e confraternizações.`,
    },
  ];

  return (
    <div className='min-h-screen'>
      {/* Abertura em petróleo: nome da associação como peça principal */}
      <header className='bg-primary text-primary-foreground'>
        <div className='mx-auto flex h-14 max-w-6xl items-center justify-between px-4'>
          <span className='heading text-xl'>AFPS</span>
          <nav className='flex items-center gap-2'>
            <Link
              href='/login'
              className='rounded-sm px-2 py-1 text-sm font-medium text-primary-foreground/85 hover:text-primary-foreground focus-visible:outline-primary-foreground'
            >
              Entrar
            </Link>
          </nav>
        </div>

        <div className='mx-auto max-w-6xl px-4 pt-8 pb-12 md:pt-12 md:pb-16'>
          <p className='text-sm text-primary-foreground/75'>
            Associação de futebol desde {foundedYear}
          </p>
          <h1 className='heading mt-2 max-w-4xl text-3xl leading-[0.95] sm:text-4xl md:text-[5.5rem]'>
            {association.name}
          </h1>
          <p className='mt-6 max-w-2xl text-lg leading-relaxed text-primary-foreground/85'>
            {association.description}
          </p>

          <div className='mt-8 flex flex-col gap-2 sm:flex-row'>
            <Button
              size='lg'
              asChild
              className='bg-warning text-foreground hover:bg-warning/90 focus-visible:outline-primary-foreground'
            >
              <Link href='/register'>Quero jogar</Link>
            </Button>
            <Button
              size='lg'
              variant='ghost'
              asChild
              className='text-primary-foreground ring-1 ring-primary-foreground/40 hover:bg-primary-foreground/10 focus-visible:outline-primary-foreground'
            >
              <Link href='/login'>Já tenho conta</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Fatos do dia a dia, em uma linha */}
      <section aria-label='Informações rápidas' className='border-b bg-card'>
        <dl className='mx-auto grid max-w-6xl gap-px bg-border sm:grid-cols-3 [&>div]:bg-card'>
          <div className='flex items-start gap-2 px-4 py-6'>
            <Calendar className='mt-0.5 h-5 w-5 shrink-0 text-primary' />
            <div>
              <dt className='text-sm text-muted-foreground'>Jogos</dt>
              <dd className='font-semibold'>{association.gameSchedule}</dd>
            </div>
          </div>
          <div className='flex items-start gap-2 px-4 py-6'>
            <Users className='mt-0.5 h-5 w-5 shrink-0 text-primary' />
            <div>
              <dt className='text-sm text-muted-foreground'>Elenco</dt>
              <dd className='font-semibold'>
                <span className='numeral text-lg'>
                  {association.totalPlayers}
                </span>{' '}
                jogadores ativos
              </dd>
            </div>
          </div>
          <div className='flex items-start gap-2 px-4 py-6'>
            <MapPin className='mt-0.5 h-5 w-5 shrink-0 text-primary' />
            <div>
              <dt className='text-sm text-muted-foreground'>Onde</dt>
              <dd className='font-semibold'>{association.address}</dd>
            </div>
          </div>
        </dl>
      </section>

      <main className='mx-auto max-w-6xl px-4 py-12 md:py-16'>
        <div className='grid gap-12 md:grid-cols-2 md:gap-16'>
          {/* Sobre */}
          <section>
            <h2 className='heading text-xl'>Sobre a associação</h2>
            <div className='mt-4 max-w-prose space-y-4 leading-relaxed text-foreground/85'>
              <p>
                Fundada em {foundedYear}, a associação existe para promover o
                esporte e a união entre os moradores da comunidade.
              </p>
              <p>
                Jogamos com fair play e respeito, e usamos o futebol como ponto
                de encontro: jogos regulares, torneios, treinos e
                confraternizações.
              </p>
            </div>

            {association.commission.length > 0 && (
              <div className='mt-8'>
                <h3 className='font-semibold'>Comissão</h3>
                <ul className='mt-2 flex flex-wrap gap-x-6 gap-y-1 text-foreground/85'>
                  {association.commission.map((member) => (
                    <li key={member}>{member}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* Como participar — é uma sequência real, por isso numerada */}
          <section>
            <h2 className='heading text-xl'>Como participar</h2>
            <ol className='mt-4 space-y-6'>
              {steps.map((step, i) => (
                <li key={step.title} className='flex gap-4'>
                  <span
                    aria-hidden
                    className='numeral w-8 shrink-0 text-3xl text-primary'
                  >
                    {i + 1}
                  </span>
                  <div className='pt-1'>
                    <p className='font-semibold'>{step.title}</p>
                    <p className='mt-1 text-foreground/80'>{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Button asChild className='mt-8'>
              <Link href='/register'>Criar minha conta</Link>
            </Button>
          </section>
        </div>

        {/* Contato */}
        <section className='mt-12 border-t pt-12 md:mt-16'>
          <h2 className='heading text-xl'>Contato</h2>
          <div className='mt-4 flex flex-col gap-6 md:flex-row md:items-start md:justify-between'>
            <ul className='min-w-0 space-y-2'>
              <li className='flex items-center gap-2'>
                <Phone className='h-4 w-4 text-primary' />
                <a
                  href={`tel:${association.phone.replace(/\D/g, '')}`}
                  className='font-medium break-all underline decoration-border underline-offset-4 hover:decoration-primary'
                >
                  {formatPhone(association.phone)}
                </a>
              </li>
              <li className='flex items-center gap-2'>
                <Mail className='h-4 w-4 text-primary' />
                <a
                  href={`mailto:${association.email}`}
                  className='font-medium break-all underline decoration-border underline-offset-4 hover:decoration-primary'
                >
                  {association.email}
                </a>
              </li>
              <li className='flex items-start gap-2'>
                <MapPin className='mt-1 h-4 w-4 text-primary' />
                <span className='font-medium break-words'>{association.address}</span>
              </li>
            </ul>

            {hasSocial && (
              <div className='flex gap-2'>
                {social.facebook && (
                  <Button variant='outline' size='icon' asChild>
                    <a
                      href={social.facebook}
                      target='_blank'
                      rel='noopener noreferrer'
                      aria-label='Facebook'
                    >
                      <Facebook />
                    </a>
                  </Button>
                )}
                {social.twitter && (
                  <Button variant='outline' size='icon' asChild>
                    <a
                      href={social.twitter}
                      target='_blank'
                      rel='noopener noreferrer'
                      aria-label='Twitter'
                    >
                      <Twitter />
                    </a>
                  </Button>
                )}
                {social.instagram && (
                  <Button variant='outline' size='icon' asChild>
                    <a
                      href={social.instagram}
                      target='_blank'
                      rel='noopener noreferrer'
                      aria-label='Instagram'
                    >
                      <Instagram />
                    </a>
                  </Button>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className='border-t'>
        <div className='mx-auto max-w-6xl px-4 py-6 text-sm text-muted-foreground'>
          © {new Date().getFullYear()} {association.name}
        </div>
      </footer>
    </div>
  );
}
