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
  Star,
  Shield,
  Heart,
} from 'lucide-react';
import { getAssociationData } from '@/lib/actions/association';

export default async function HomePage() {
  const association = await getAssociationData();

  if (!association) {
    notFound();
  }

  return (
    <div className='min-h-screen bg-background-color'>
      {/* Header */}
      <header className='sticky top-0 z-50 w-full border-b border-border-color bg-background-color/95 backdrop-blur-xl'>
        <div className='container mx-auto flex h-20 max-w-7xl items-center justify-between px-6'>
          <div className='flex items-center space-x-4'>
            <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-color shadow-xl'>
              <Trophy className='h-6 w-6 text-background-color' />
            </div>
            <div>
              <h1 className='text-xl font-semibold text-text-primary'>
                {association.name}
              </h1>
              <p className='text-sm text-text-secondary'>
                Associação de Futebol
              </p>
            </div>
          </div>
          <div className='flex items-center space-x-3'>
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
      <section className='relative overflow-hidden py-20 lg:py-32'>
        <div className='container mx-auto max-w-7xl px-6'>
          <div className='mx-auto max-w-4xl text-center animate-fade-in'>
            <Badge variant='secondary' className='mb-6 text-base px-4 py-2'>
              ⚽ Fundada em {new Date(association.foundedDate).getFullYear()}
            </Badge>
            <h1 className='mb-8 text-4xl font-semibold tracking-tight text-text-primary sm:text-6xl lg:text-7xl'>
              Bem-vindo à{' '}
              <span className='text-primary-color'>{association.name}</span>
            </h1>
            <p className='mb-12 text-xl text-text-secondary sm:text-2xl max-w-3xl mx-auto leading-relaxed'>
              {association.description}
            </p>
            <div className='flex flex-col gap-4 sm:flex-row sm:justify-center'>
              <Button size='lg' asChild className='text-lg px-8 py-4'>
                <Link href='/register'>
                  <Users className='mr-3 h-5 w-5' />
                  Junte-se a Nós
                </Link>
              </Button>
              <Button
                variant='outline'
                size='lg'
                asChild
                className='text-lg px-8 py-4'
              >
                <Link href='#informacoes'>
                  <Target className='mr-3 h-5 w-5' />
                  Saiba Mais
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className='py-20'>
        <div className='container mx-auto max-w-7xl px-6'>
          <div className='grid gap-8 sm:grid-cols-2 lg:grid-cols-4'>
            <Card className='text-center group hover:scale-105 transition-transform'>
              <CardHeader className='pb-4'>
                <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-color/10 group-hover:bg-primary-color/20 transition-colors'>
                  <MapPin className='h-8 w-8 text-primary-color' />
                </div>
                <CardTitle className='text-lg'>Localização</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-base text-text-secondary leading-relaxed'>
                  {association.address}
                </p>
              </CardContent>
            </Card>

            <Card className='text-center group hover:scale-105 transition-transform'>
              <CardHeader className='pb-4'>
                <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-color/10 group-hover:bg-primary-color/20 transition-colors'>
                  <Users className='h-8 w-8 text-primary-color' />
                </div>
                <CardTitle className='text-lg'>Jogadores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-3xl font-semibold text-primary-color mb-2'>
                  {association.totalPlayers}
                </div>
                <p className='text-base text-text-secondary'>
                  Jogadores ativos
                </p>
              </CardContent>
            </Card>

            <Card className='text-center group hover:scale-105 transition-transform'>
              <CardHeader className='pb-4'>
                <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-color/10 group-hover:bg-primary-color/20 transition-colors'>
                  <Calendar className='h-8 w-8 text-primary-color' />
                </div>
                <CardTitle className='text-lg'>Jogos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-base text-text-secondary leading-relaxed'>
                  {association.gameSchedule}
                </p>
              </CardContent>
            </Card>

            <Card className='text-center group hover:scale-105 transition-transform'>
              <CardHeader className='pb-4'>
                <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-color/10 group-hover:bg-primary-color/20 transition-colors'>
                  <Crown className='h-8 w-8 text-primary-color' />
                </div>
                <CardTitle className='text-lg'>Comissão</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  {association.commission?.map(
                    (member: string, index: number) => (
                      <Badge key={index} variant='outline' className='text-sm'>
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

      {/* Features Section */}
      <section className='py-20 bg-card-background/50'>
        <div className='container mx-auto max-w-7xl px-6'>
          <div className='mx-auto max-w-3xl text-center mb-16'>
            <h2 className='text-3xl font-semibold tracking-tight text-text-primary mb-4'>
              Por que escolher nossa associação?
            </h2>
            <p className='text-xl text-text-secondary leading-relaxed'>
              Oferecemos uma experiência completa para todos os amantes do
              futebol
            </p>
          </div>

          <div className='grid gap-8 md:grid-cols-3'>
            <Card className='group hover:scale-105 transition-transform'>
              <CardHeader>
                <div className='flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-color/10 group-hover:bg-primary-color/20 transition-colors mb-4'>
                  <Star className='h-8 w-8 text-primary-color' />
                </div>
                <CardTitle>Excelência Esportiva</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-text-secondary leading-relaxed'>
                  Promovemos o desenvolvimento técnico e tático de todos os
                  jogadores, independente do nível.
                </p>
              </CardContent>
            </Card>

            <Card className='group hover:scale-105 transition-transform'>
              <CardHeader>
                <div className='flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-color/10 group-hover:bg-primary-color/20 transition-colors mb-4'>
                  <Heart className='h-8 w-8 text-primary-color' />
                </div>
                <CardTitle>Comunidade Unida</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-text-secondary leading-relaxed'>
                  Mais que um time, somos uma família que se apoia dentro e fora
                  de campo.
                </p>
              </CardContent>
            </Card>

            <Card className='group hover:scale-105 transition-transform'>
              <CardHeader>
                <div className='flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-color/10 group-hover:bg-primary-color/20 transition-colors mb-4'>
                  <Shield className='h-8 w-8 text-primary-color' />
                </div>
                <CardTitle>Gestão Transparente</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-text-secondary leading-relaxed'>
                  Mantemos total transparência em nossa gestão financeira e
                  administrativa.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section id='informacoes' className='py-20'>
        <div className='container mx-auto max-w-7xl px-6'>
          <div className='mx-auto max-w-3xl text-center mb-16'>
            <h2 className='text-3xl font-semibold tracking-tight text-text-primary mb-4'>
              Principais Informações
            </h2>
            <p className='text-xl text-text-secondary leading-relaxed'>
              Conheça mais sobre nossa associação e como fazer parte desta
              família
            </p>
          </div>

          <div className='grid gap-12 lg:grid-cols-2'>
            <Card className='hover:scale-105 transition-transform'>
              <CardHeader>
                <CardTitle className='flex items-center space-x-3 text-2xl'>
                  <Trophy className='h-6 w-6 text-primary-color' />
                  <span>Sobre Nossa Associação</span>
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div>
                  <h4 className='font-medium mb-3 text-text-primary text-lg'>
                    Nossa História
                  </h4>
                  <p className='text-text-secondary leading-relaxed'>
                    Fundada em {new Date(association.foundedDate).getFullYear()}
                    , nossa associação tem como objetivo promover o esporte e a
                    união entre os membros da comunidade.
                  </p>
                </div>
                <div>
                  <h4 className='font-medium mb-3 text-text-primary text-lg'>
                    Nossos Valores
                  </h4>
                  <p className='text-text-secondary leading-relaxed'>
                    Acreditamos no fair play, respeito mútuo e na importância do
                    esporte como ferramenta de integração social.
                  </p>
                </div>
                <div>
                  <h4 className='font-medium mb-3 text-text-primary text-lg'>
                    Atividades
                  </h4>
                  <div className='flex flex-wrap gap-3'>
                    <Badge variant='secondary'>Jogos Regulares</Badge>
                    <Badge variant='secondary'>Torneios</Badge>
                    <Badge variant='secondary'>Confraternizações</Badge>
                    <Badge variant='secondary'>Treinos</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className='hover:scale-105 transition-transform'>
              <CardHeader>
                <CardTitle className='flex items-center space-x-3 text-2xl'>
                  <Target className='h-6 w-6 text-primary-color' />
                  <span>Como Participar</span>
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-8'>
                <div className='space-y-3'>
                  <h4 className='font-medium text-text-primary text-lg'>
                    1. Inscreva-se Agora
                  </h4>
                  <p className='text-text-secondary leading-relaxed'>
                    Se você adora futebol e deseja se juntar a nós, cadastre-se
                    em nossa plataforma.
                  </p>
                  <Button className='w-full' size='lg' asChild>
                    <Link href='/register'>
                      <Users className='mr-3 h-5 w-5' />
                      Cadastrar-se
                    </Link>
                  </Button>
                </div>

                <div className='space-y-3'>
                  <h4 className='font-medium text-text-primary text-lg'>
                    2. Participe dos Eventos
                  </h4>
                  <p className='text-text-secondary leading-relaxed'>
                    Além dos jogos regulares, organizamos torneios e
                    confraternizações.
                  </p>
                </div>

                <div className='space-y-3'>
                  <h4 className='font-medium text-text-primary text-lg'>
                    3. Faça Parte da Família
                  </h4>
                  <p className='text-text-secondary leading-relaxed'>
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
      <section className='py-20 bg-card-background/50'>
        <div className='container mx-auto max-w-7xl px-6'>
          <div className='mx-auto max-w-3xl text-center mb-16'>
            <h2 className='text-3xl font-semibold tracking-tight text-text-primary mb-4'>
              Entre em Contato
            </h2>
            <p className='text-xl text-text-secondary leading-relaxed'>
              Tem alguma pergunta ou sugestão? Estamos aqui para ajudar!
            </p>
          </div>

          <div className='grid gap-12 lg:grid-cols-2'>
            <Card className='hover:scale-105 transition-transform'>
              <CardHeader>
                <CardTitle className='flex items-center space-x-3 text-2xl'>
                  <Phone className='h-6 w-6 text-primary-color' />
                  <span>Informações de Contato</span>
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center space-x-4 p-4 rounded-2xl bg-card-background/50'>
                  <Phone className='h-5 w-5 text-primary-color' />
                  <span className='font-medium text-text-primary text-lg'>
                    {association.phone}
                  </span>
                </div>
                <div className='flex items-center space-x-4 p-4 rounded-2xl bg-card-background/50'>
                  <Mail className='h-5 w-5 text-primary-color' />
                  <span className='font-medium text-text-primary text-lg'>
                    {association.email}
                  </span>
                </div>
                <div className='flex items-start space-x-4 p-4 rounded-2xl bg-card-background/50'>
                  <MapPin className='h-5 w-5 text-primary-color mt-1' />
                  <span className='font-medium text-text-primary text-lg leading-relaxed'>
                    {association.address}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className='hover:scale-105 transition-transform'>
              <CardHeader>
                <CardTitle className='flex items-center space-x-3 text-2xl'>
                  <Instagram className='h-6 w-6 text-primary-color' />
                  <span>Redes Sociais</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-3 gap-4'>
                  {association.socialMedia?.facebook && (
                    <Button
                      variant='outline'
                      size='lg'
                      asChild
                      className='h-16'
                    >
                      <a
                        href={association.socialMedia.facebook}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        <Facebook className='h-6 w-6' />
                      </a>
                    </Button>
                  )}
                  {association.socialMedia?.twitter && (
                    <Button
                      variant='outline'
                      size='lg'
                      asChild
                      className='h-16'
                    >
                      <a
                        href={association.socialMedia.twitter}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        <Twitter className='h-6 w-6' />
                      </a>
                    </Button>
                  )}
                  {association.socialMedia?.instagram && (
                    <Button
                      variant='outline'
                      size='lg'
                      asChild
                      className='h-16'
                    >
                      <a
                        href={association.socialMedia.instagram}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        <Instagram className='h-6 w-6' />
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
      <footer className='border-t border-border-color bg-card-background/30'>
        <div className='container mx-auto max-w-7xl px-6 py-12'>
          <div className='flex flex-col items-center justify-between gap-6 md:flex-row'>
            <div className='flex items-center space-x-4'>
              <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-color shadow-xl'>
                <Trophy className='h-5 w-5 text-background-color' />
              </div>
              <span className='font-medium text-text-primary text-lg'>
                {association.name}
              </span>
            </div>
            <p className='text-base text-text-secondary'>
              © {new Date().getFullYear()} {association.name}. Todos os direitos
              reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
