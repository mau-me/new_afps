import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Users,
  Calendar,
  Crown,
  Trophy,
  Target,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram,
} from 'lucide-react';
import { getAssociationData } from '@/lib/actions/association';

export default async function HomePage() {
  const association = await getAssociationData();

  if (!association) {
    notFound();
  }

  return (
    <div className='min-h-screen bg-neutral-900'>
      {/* Header */}
      <header className='sticky top-0 z-50 w-full border-b border-neutral-700 bg-neutral-900/95 backdrop-blur'>
        <div className='container mx-auto flex h-16 max-w-7xl items-center justify-between px-md'>
          <div className='flex items-center space-x-md'>
            <div className='flex h-10 w-10 items-center justify-center rounded bg-primary text-accent'>
              <Trophy className='h-6 w-6' />
            </div>
            <div>
              <h1 className='text-lg font-semibold text-accent'>
                {association.name}
              </h1>
              <p className='text-sm text-neutral-400'>Associação de Futebol</p>
            </div>
          </div>
          <div className='flex items-center space-x-sm'>
            <Button variant='outline' size='sm' asChild>
              <Link href='/login'>Entrar</Link>
            </Button>
            <Button size='sm' asChild>
              <Link href='/register'>Cadastrar-se</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className='relative overflow-hidden py-xl lg:py-24'>
        <div className='container mx-auto max-w-7xl px-md'>
          <div className='mx-auto max-w-4xl text-center'>
            <Badge variant='secondary' className='mb-md'>
              ⚽ Fundada em {new Date(association.foundedDate).getFullYear()}
            </Badge>
            <h1 className='mb-lg text-4xl font-semibold tracking-tight text-accent sm:text-6xl'>
              Bem-vindo à{' '}
              <span className='text-primary'>{association.name}</span>
            </h1>
            <p className='mb-xl text-lg text-neutral-300 sm:text-xl'>
              {association.description}
            </p>
            <div className='flex flex-col gap-md sm:flex-row sm:justify-center'>
              <Button size='lg' asChild>
                <Link href='/register'>
                  <Users className='mr-sm h-4 w-4' />
                  Junte-se a Nós
                </Link>
              </Button>
              <Button variant='outline' size='lg' asChild>
                <Link href='#informacoes'>
                  <Target className='mr-sm h-4 w-4' />
                  Saiba Mais
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className='py-xl'>
        <div className='container mx-auto max-w-7xl px-md'>
          <div className='grid gap-lg sm:grid-cols-2 lg:grid-cols-4'>
            <Card className='text-center'>
              <CardHeader className='pb-sm'>
                <div className='mx-auto flex h-12 w-12 items-center justify-center rounded bg-primary/10'>
                  <MapPin className='h-6 w-6 text-primary' />
                </div>
                <CardTitle className='text-base'>Localização</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-neutral-400'>
                  {association.address}
                </p>
              </CardContent>
            </Card>

            <Card className='text-center'>
              <CardHeader className='pb-sm'>
                <div className='mx-auto flex h-12 w-12 items-center justify-center rounded bg-primary/10'>
                  <Users className='h-6 w-6 text-primary' />
                </div>
                <CardTitle className='text-base'>Jogadores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-semibold text-primary'>
                  {association.totalPlayers}
                </div>
                <p className='text-sm text-neutral-400'>Jogadores ativos</p>
              </CardContent>
            </Card>

            <Card className='text-center'>
              <CardHeader className='pb-sm'>
                <div className='mx-auto flex h-12 w-12 items-center justify-center rounded bg-primary/10'>
                  <Calendar className='h-6 w-6 text-primary' />
                </div>
                <CardTitle className='text-base'>Jogos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-neutral-400'>
                  {association.gameSchedule}
                </p>
              </CardContent>
            </Card>

            <Card className='text-center'>
              <CardHeader className='pb-sm'>
                <div className='mx-auto flex h-12 w-12 items-center justify-center rounded bg-primary/10'>
                  <Crown className='h-6 w-6 text-primary' />
                </div>
                <CardTitle className='text-base'>Comissão</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-xs'>
                  {association.commission?.map(
                    (member: string, index: number) => (
                      <Badge key={index} variant='outline' className='text-xs'>
                        {member}
                      </Badge>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section id='informacoes' className='py-xl bg-neutral-800/50'>
        <div className='container mx-auto max-w-7xl px-md'>
          <div className='mx-auto max-w-2xl text-center mb-xl'>
            <h2 className='text-2xl font-semibold tracking-tight text-accent'>
              Principais Informações
            </h2>
            <p className='mt-md text-lg text-neutral-300'>
              Conheça mais sobre nossa associação e como fazer parte desta
              família
            </p>
          </div>

          <div className='grid gap-xl lg:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center space-x-sm'>
                  <Trophy className='h-5 w-5 text-primary' />
                  <span>Sobre Nossa Associação</span>
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-md'>
                <div>
                  <h4 className='font-medium mb-sm text-accent'>
                    Nossa História
                  </h4>
                  <p className='text-neutral-400'>
                    Fundada em {new Date(association.foundedDate).getFullYear()}
                    , nossa associação tem como objetivo promover o esporte e a
                    união entre os membros da comunidade.
                  </p>
                </div>
                <div>
                  <h4 className='font-medium mb-sm text-accent'>
                    Nossos Valores
                  </h4>
                  <p className='text-neutral-400'>
                    Acreditamos no fair play, respeito mútuo e na importância do
                    esporte como ferramenta de integração social.
                  </p>
                </div>
                <div>
                  <h4 className='font-medium mb-sm text-accent'>Atividades</h4>
                  <div className='flex flex-wrap gap-sm'>
                    <Badge variant='secondary'>Jogos Regulares</Badge>
                    <Badge variant='secondary'>Torneios</Badge>
                    <Badge variant='secondary'>Confraternizações</Badge>
                    <Badge variant='secondary'>Treinos</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center space-x-sm'>
                  <Target className='h-5 w-5 text-primary' />
                  <span>Como Participar</span>
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-lg'>
                <div className='space-y-sm'>
                  <h4 className='font-medium text-accent'>
                    1. Inscreva-se Agora
                  </h4>
                  <p className='text-sm text-neutral-400'>
                    Se você adora futebol e deseja se juntar a nós, cadastre-se
                    em nossa plataforma.
                  </p>
                  <Button className='w-full' asChild>
                    <Link href='/register'>
                      <Users className='mr-sm h-4 w-4' />
                      Cadastrar-se
                    </Link>
                  </Button>
                </div>

                <div className='space-y-sm'>
                  <h4 className='font-medium text-accent'>
                    2. Participe dos Eventos
                  </h4>
                  <p className='text-sm text-neutral-400'>
                    Além dos jogos regulares, organizamos torneios e
                    confraternizações.
                  </p>
                </div>

                <div className='space-y-sm'>
                  <h4 className='font-medium text-accent'>
                    3. Faça Parte da Família
                  </h4>
                  <p className='text-sm text-neutral-400'>
                    Conecte-se com outros jogadores e viva experiências únicas
                    no futebol.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className='py-xl'>
        <div className='container mx-auto max-w-7xl px-md'>
          <div className='mx-auto max-w-2xl text-center mb-xl'>
            <h2 className='text-2xl font-semibold tracking-tight text-accent'>
              Entre em Contato
            </h2>
            <p className='mt-md text-lg text-neutral-300'>
              Tem alguma pergunta ou sugestão? Estamos aqui para ajudar!
            </p>
          </div>

          <div className='grid gap-xl lg:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center space-x-sm'>
                  <Phone className='h-5 w-5 text-primary' />
                  <span>Informações de Contato</span>
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-md'>
                <div className='flex items-center space-x-sm p-sm rounded bg-neutral-700/50'>
                  <Phone className='h-4 w-4 text-primary' />
                  <span className='font-medium text-accent'>
                    {association.phone}
                  </span>
                </div>
                <div className='flex items-center space-x-sm p-sm rounded bg-neutral-700/50'>
                  <Mail className='h-4 w-4 text-primary' />
                  <span className='font-medium text-accent'>
                    {association.email}
                  </span>
                </div>
                <div className='flex items-start space-x-sm p-sm rounded bg-neutral-700/50'>
                  <MapPin className='h-4 w-4 text-primary mt-0.5' />
                  <span className='font-medium text-accent'>
                    {association.address}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center space-x-sm'>
                  <Instagram className='h-5 w-5 text-primary' />
                  <span>Redes Sociais</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-3 gap-md'>
                  {association.socialMedia?.facebook && (
                    <Button variant='outline' size='lg' asChild>
                      <a
                        href={association.socialMedia.facebook}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        <Facebook className='h-5 w-5' />
                      </a>
                    </Button>
                  )}
                  {association.socialMedia?.twitter && (
                    <Button variant='outline' size='lg' asChild>
                      <a
                        href={association.socialMedia.twitter}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        <Twitter className='h-5 w-5' />
                      </a>
                    </Button>
                  )}
                  {association.socialMedia?.instagram && (
                    <Button variant='outline' size='lg' asChild>
                      <a
                        href={association.socialMedia.instagram}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        <Instagram className='h-5 w-5' />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='border-t border-neutral-700 bg-neutral-800/50'>
        <div className='container mx-auto max-w-7xl px-md py-xl'>
          <div className='flex flex-col items-center justify-between gap-md md:flex-row'>
            <div className='flex items-center space-x-sm'>
              <div className='flex h-8 w-8 items-center justify-center rounded bg-primary text-accent'>
                <Trophy className='h-4 w-4' />
              </div>
              <span className='font-medium text-accent'>
                {association.name}
              </span>
            </div>
            <p className='text-sm text-neutral-400'>
              © {new Date().getFullYear()} {association.name}. Todos os direitos
              reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
