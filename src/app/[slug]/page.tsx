import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  MapPin,
  Users,
  Calendar,
  Crown,
  Facebook,
  Twitter,
  Instagram,
  Phone,
  Mail,
} from 'lucide-react';
import { getAssociationBySlug } from '@/lib/actions/association';

export default async function HomePage({
  params,
}: {
  params: { slug: string };
}) {
  const association = await getAssociationBySlug(params.slug);

  if (!association) {
    notFound();
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-green-50 to-blue-50'>
      {/* Header */}
      <header className='bg-white shadow-sm border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
          <div className='flex justify-between items-center'>
            <div className='flex items-center space-x-4'>
              {association.logo && (
                <img
                  src={association.logo || '/placeholder.svg'}
                  alt='Logo'
                  className='h-12 w-12 rounded-full'
                />
              )}
              <div>
                <h1 className='text-2xl font-bold text-gray-900'>
                  {association.name}
                </h1>
                <p className='text-sm text-gray-600'>Associação de Futebol</p>
              </div>
            </div>
            <div className='flex space-x-2'>
              <Link href={`/${params.slug}/login`}>
                <Button variant='outline'>Entrar</Button>
              </Link>
              <Link href={`/${params.slug}/register`}>
                <Button>Cadastrar-se</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className='py-16 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-7xl mx-auto text-center'>
          <h1 className='text-4xl md:text-6xl font-bold text-gray-900 mb-6'>
            Bem-vindo à {association.name}!
          </h1>
          <p className='text-xl text-gray-600 mb-8 max-w-3xl mx-auto'>
            {association.description}
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Link href={`/${params.slug}/register`}>
              <Button size='lg' className='w-full sm:w-auto'>
                Junte-se a Nós
              </Button>
            </Link>
            <Link href='#informacoes'>
              <Button variant='outline' size='lg' className='w-full sm:w-auto'>
                Saiba Mais
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Information */}
      <section id='informacoes' className='py-16 px-4 sm:px-6 lg:px-8 bg-white'>
        <div className='max-w-7xl mx-auto'>
          <h2 className='text-3xl font-bold text-gray-900 mb-12 text-center'>
            Principais Informações
          </h2>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16'>
            <Card>
              <CardHeader className='text-center'>
                <MapPin className='h-8 w-8 text-primary mx-auto mb-2' />
                <CardTitle>Localização</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-gray-600 text-center'>
                  {association.address}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='text-center'>
                <Users className='h-8 w-8 text-primary mx-auto mb-2' />
                <CardTitle>Jogadores</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-2xl font-bold text-center text-primary'>
                  {association.totalPlayers}
                </p>
                <p className='text-sm text-gray-600 text-center'>
                  Jogadores ativos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='text-center'>
                <Calendar className='h-8 w-8 text-primary mx-auto mb-2' />
                <CardTitle>Jogos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-gray-600 text-center'>
                  {association.gameSchedule}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='text-center'>
                <Crown className='h-8 w-8 text-primary mx-auto mb-2' />
                <CardTitle>Comissão</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-sm text-gray-600 text-center'>
                  {association.commission?.map(
                    (member: string, index: number) => (
                      <p key={index}>{member}</p>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Information */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            <Card>
              <CardHeader>
                <CardTitle>Sobre Nossa Associação</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <h4 className='font-semibold text-gray-900 mb-2'>
                    Nossa História
                  </h4>
                  <p className='text-gray-600'>
                    Fundada em {new Date(association.foundedDate).getFullYear()}
                    , nossa associação tem como objetivo promover o esporte e a
                    união entre os membros da comunidade.
                  </p>
                </div>
                <div>
                  <h4 className='font-semibold text-gray-900 mb-2'>
                    Nossos Valores
                  </h4>
                  <p className='text-gray-600'>
                    Acreditamos no fair play, respeito mútuo e na importância do
                    esporte como ferramenta de integração social.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Como Participar</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <h4 className='font-semibold text-gray-900 mb-2'>
                    Inscreva-se Agora
                  </h4>
                  <p className='text-gray-600 mb-3'>
                    Se você adora futebol e deseja se juntar a nós, cadastre-se
                    em nossa plataforma e faça parte dessa emocionante jornada
                    esportiva.
                  </p>
                  <Link href={`/${params.slug}/register`}>
                    <Button className='w-full'>Cadastrar-se</Button>
                  </Link>
                </div>
                <div>
                  <h4 className='font-semibold text-gray-900 mb-2'>
                    Participe dos Eventos
                  </h4>
                  <p className='text-gray-600'>
                    Além dos jogos regulares, organizamos torneios e
                    confraternizações. Fique de olho em nosso calendário!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className='py-16 px-4 sm:px-6 lg:px-8 bg-gray-50'>
        <div className='max-w-7xl mx-auto'>
          <h2 className='text-3xl font-bold text-gray-900 mb-12 text-center'>
            Entre em Contato
          </h2>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            <Card>
              <CardHeader>
                <CardTitle>Informações de Contato</CardTitle>
                <CardDescription>
                  Tem alguma pergunta ou sugestão? Estamos aqui para ajudar!
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center space-x-3'>
                  <Phone className='h-5 w-5 text-primary' />
                  <span>{association.phone}</span>
                </div>
                <div className='flex items-center space-x-3'>
                  <Mail className='h-5 w-5 text-primary' />
                  <span>{association.email}</span>
                </div>
                <div className='flex items-center space-x-3'>
                  <MapPin className='h-5 w-5 text-primary' />
                  <span>{association.address}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Redes Sociais</CardTitle>
                <CardDescription>
                  Siga-nos nas redes sociais para ficar por dentro das
                  novidades!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='flex space-x-4'>
                  {association.socialMedia?.facebook && (
                    <a
                      href={association.socialMedia.facebook}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors'
                    >
                      <Facebook className='h-6 w-6' />
                    </a>
                  )}
                  {association.socialMedia?.twitter && (
                    <a
                      href={association.socialMedia.twitter}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex items-center justify-center w-12 h-12 bg-blue-400 text-white rounded-full hover:bg-blue-500 transition-colors'
                    >
                      <Twitter className='h-6 w-6' />
                    </a>
                  )}
                  {association.socialMedia?.instagram && (
                    <a
                      href={association.socialMedia.instagram}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex items-center justify-center w-12 h-12 bg-pink-600 text-white rounded-full hover:bg-pink-700 transition-colors'
                    >
                      <Instagram className='h-6 w-6' />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='bg-gray-900 text-white py-8 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-7xl mx-auto text-center'>
          <p className='text-gray-400'>
            © {new Date().getFullYear()} {association.name}. Todos os direitos
            reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
