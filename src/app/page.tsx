import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, Calendar, Crown, Trophy, Target } from 'lucide-react';
import { getAssociationData } from '@/lib/actions/association';
import { TailwindTest } from '@/components/tailwind-test';

export default async function HomePage() {
  const association = await getAssociationData();

  if (!association) {
    notFound();
  }

  return (
    <div className='min-h-screen bg-background'>
      {/* Teste do Tailwind */}
      <div className='p-4'>
        <TailwindTest />
      </div>

      {/* Header */}
      <header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
        <div className='container mx-auto flex h-16 max-w-7xl items-center justify-between px-4'>
          <div className='flex items-center space-x-4'>
            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground'>
              <Trophy className='h-6 w-6' />
            </div>
            <div>
              <h1 className='text-xl font-bold'>{association.name}</h1>
              <p className='text-sm text-muted-foreground'>
                Associação de Futebol
              </p>
            </div>
          </div>
          <div className='flex items-center space-x-2'>
            <Button variant='outline' asChild>
              <Link href='/login'>Entrar</Link>
            </Button>
            <Button asChild>
              <Link href='/register'>Cadastrar-se</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className='relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-24'>
        <div className='container mx-auto max-w-7xl px-4'>
          <div className='mx-auto max-w-4xl text-center'>
            <Badge variant='secondary' className='mb-4'>
              ⚽ Fundada em {new Date(association.foundedDate).getFullYear()}
            </Badge>
            <h1 className='mb-6 text-4xl font-bold tracking-tight sm:text-6xl'>
              Bem-vindo à{' '}
              <span className='text-primary'>{association.name}</span>!
            </h1>
            <p className='mb-8 text-xl text-muted-foreground'>
              {association.description}
            </p>
            <div className='flex flex-col gap-4 sm:flex-row sm:justify-center'>
              <Button size='lg' asChild>
                <Link href='/register'>
                  <Users className='mr-2 h-4 w-4' />
                  Junte-se a Nós
                </Link>
              </Button>
              <Button variant='outline' size='lg' asChild>
                <Link href='#informacoes'>
                  <Target className='mr-2 h-4 w-4' />
                  Saiba Mais
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className='py-16'>
        <div className='container mx-auto max-w-7xl px-4'>
          <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
            <Card className='text-center'>
              <CardHeader className='pb-2'>
                <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10'>
                  <MapPin className='h-6 w-6 text-primary' />
                </div>
                <CardTitle className='text-lg'>Localização</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-muted-foreground'>
                  {association.address}
                </p>
              </CardContent>
            </Card>

            <Card className='text-center'>
              <CardHeader className='pb-2'>
                <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10'>
                  <Users className='h-6 w-6 text-primary' />
                </div>
                <CardTitle className='text-lg'>Jogadores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-3xl font-bold text-primary'>
                  {association.totalPlayers}
                </div>
                <p className='text-sm text-muted-foreground'>
                  Jogadores ativos
                </p>
              </CardContent>
            </Card>

            <Card className='text-center'>
              <CardHeader className='pb-2'>
                <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10'>
                  <Calendar className='h-6 w-6 text-primary' />
                </div>
                <CardTitle className='text-lg'>Jogos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-muted-foreground'>
                  {association.gameSchedule}
                </p>
              </CardContent>
            </Card>

            <Card className='text-center'>
              <CardHeader className='pb-2'>
                <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10'>
                  <Crown className='h-6 w-6 text-primary' />
                </div>
                <CardTitle className='text-lg'>Comissão</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-1'>
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

      {/* Footer */}
      <footer className='border-t bg-muted/50'>
        <div className='container mx-auto max-w-7xl px-4 py-8'>
          <div className='flex flex-col items-center justify-between gap-4 md:flex-row'>
            <div className='flex items-center space-x-2'>
              <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground'>
                <Trophy className='h-4 w-4' />
              </div>
              <span className='font-semibold'>{association.name}</span>
            </div>
            <p className='text-sm text-muted-foreground'>
              © {new Date().getFullYear()} {association.name}. Todos os direitos
              reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
