import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ClientNavbar } from '@/components/client-navbar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Calendar,
  Trophy,
} from 'lucide-react';
import Link from 'next/link';

export default async function PlayersPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <div className='min-h-screen bg-background-color'>
      <ClientNavbar />
      <div className='container mx-auto max-w-7xl py-12 px-6'>
        {/* Header */}
        <div className='mb-12 animate-fade-in'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-semibold tracking-tight text-text-primary mb-2'>
                Jogadores
              </h1>
              <p className='text-text-secondary text-lg'>
                Gerencie os jogadores da associação
              </p>
            </div>
            {session.user?.role === 'comissao' && (
              <Button size='lg' asChild>
                <Link href='/players/new'>
                  <UserPlus className='mr-3 h-5 w-5' />
                  Novo Jogador
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <Card className='mb-8 hover:scale-105 transition-transform'>
          <CardContent className='pt-6'>
            <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
              <div className='flex-1 max-w-md'>
                <div className='relative'>
                  <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-secondary' />
                  <Input
                    type='text'
                    placeholder='Buscar jogadores...'
                    className='pl-12 h-12 text-base'
                  />
                </div>
              </div>
              <div className='flex gap-3'>
                <Button variant='outline' size='default'>
                  <Filter className='mr-2 h-4 w-4' />
                  Filtros
                </Button>
                <Button variant='outline' size='default'>
                  Exportar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Players Grid */}
        <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12'>
          {/* Example Player Cards */}
          {[1, 2, 3, 4, 5, 6].map((player) => (
            <Card
              key={player}
              className='group hover:scale-105 transition-transform'
            >
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-4'>
                    <div className='h-12 w-12 rounded-2xl bg-primary-color/10 flex items-center justify-center group-hover:bg-primary-color/20 transition-colors'>
                      <Users className='h-6 w-6 text-primary-color' />
                    </div>
                    <div>
                      <CardTitle className='text-lg'>
                        Jogador {player}
                      </CardTitle>
                      <CardDescription className='text-base'>
                        Posição: Atacante
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant='success' className='text-sm'>
                    Ativo
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='flex justify-between text-base'>
                    <span className='text-text-secondary'>Camisa:</span>
                    <span className='text-text-primary font-medium'>
                      #{player}0
                    </span>
                  </div>
                  <div className='flex justify-between text-base'>
                    <span className='text-text-secondary'>Telefone:</span>
                    <span className='text-text-primary'>
                      (71) 99999-999{player}
                    </span>
                  </div>
                  <div className='flex justify-between text-base'>
                    <span className='text-text-secondary'>Mensalidade:</span>
                    <Badge variant='success' className='text-sm'>
                      Em dia
                    </Badge>
                  </div>
                </div>
                <div className='mt-6 flex gap-3'>
                  <Button variant='outline' size='sm' className='flex-1'>
                    Ver Perfil
                  </Button>
                  {session.user?.role === 'comissao' && (
                    <Button variant='outline' size='sm' className='flex-1'>
                      Editar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State (when no players) */}
        <Card className='hidden'>
          <CardContent className='pt-16 pb-16 text-center'>
            <div className='h-16 w-16 rounded-2xl bg-primary-color/10 flex items-center justify-center mx-auto mb-6'>
              <Users className='h-8 w-8 text-primary-color' />
            </div>
            <h3 className='text-2xl font-medium text-text-primary mb-3'>
              Nenhum jogador encontrado
            </h3>
            <p className='text-text-secondary mb-8 text-lg max-w-md mx-auto'>
              Não há jogadores cadastrados ainda. Comece adicionando o primeiro
              jogador.
            </p>
            {session.user?.role === 'comissao' && (
              <Button size='lg' asChild>
                <Link href='/players/new'>
                  <UserPlus className='mr-3 h-5 w-5' />
                  Cadastrar Primeiro Jogador
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Stats Summary */}
        <div className='grid gap-8 md:grid-cols-4'>
          <Card className='text-center group hover:scale-105 transition-transform'>
            <CardContent className='pt-8'>
              <div className='h-12 w-12 rounded-2xl bg-primary-color/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-color/20 transition-colors'>
                <Users className='h-6 w-6 text-primary-color' />
              </div>
              <div className='text-3xl font-semibold text-text-primary mb-2'>
                24
              </div>
              <p className='text-base text-text-secondary'>
                Total de Jogadores
              </p>
            </CardContent>
          </Card>
          <Card className='text-center group hover:scale-105 transition-transform'>
            <CardContent className='pt-8'>
              <div className='h-12 w-12 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-green-500/20 transition-colors'>
                <Trophy className='h-6 w-6 text-green-400' />
              </div>
              <div className='text-3xl font-semibold text-green-400 mb-2'>
                22
              </div>
              <p className='text-base text-text-secondary'>Jogadores Ativos</p>
            </CardContent>
          </Card>
          <Card className='text-center group hover:scale-105 transition-transform'>
            <CardContent className='pt-8'>
              <div className='h-12 w-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-yellow-500/20 transition-colors'>
                <Calendar className='h-6 w-6 text-yellow-400' />
              </div>
              <div className='text-3xl font-semibold text-yellow-400 mb-2'>
                2
              </div>
              <p className='text-base text-text-secondary'>
                Mensalidades Pendentes
              </p>
            </CardContent>
          </Card>
          <Card className='text-center group hover:scale-105 transition-transform'>
            <CardContent className='pt-8'>
              <div className='h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-500/20 transition-colors'>
                <Users className='h-6 w-6 text-blue-400' />
              </div>
              <div className='text-3xl font-semibold text-blue-400 mb-2'>
                18
              </div>
              <p className='text-base text-text-secondary'>Média de Idade</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
