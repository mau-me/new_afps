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
import {
  Users,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Plus,
  BarChart3,
  FileText,
  UserPlus,
} from 'lucide-react';
import dbConnect from '@/lib/mongodb';
import Player from '@/lib/models/Player';
import Monthly from '@/lib/models/Monthly';
import Transaction from '@/lib/models/Transaction';
import Link from 'next/link';

async function getDashboardData() {
  await dbConnect();

  try {
    const [totalPlayers, activePlayers, pendingPayments, transactions] =
      await Promise.all([
        Player.countDocuments(),
        Player.countDocuments({ isActive: true }),
        Monthly.countDocuments({ status: { $in: ['em_aberto', 'vencido'] } }),
        Transaction.find({
          date: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        }).lean(),
      ]);

    const monthlyRevenue = transactions
      .filter((t) => t.type === 'entrada')
      .reduce((sum, t) => sum + t.amount, 0);
    const monthlyExpenses = transactions
      .filter((t) => t.type === 'saida')
      .reduce((sum, t) => sum + t.amount, 0);
    const balance = monthlyRevenue - monthlyExpenses;

    return {
      totalPlayers,
      activePlayers,
      pendingPayments,
      monthlyRevenue,
      monthlyExpenses,
      balance,
    };
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    return {
      totalPlayers: 0,
      activePlayers: 0,
      pendingPayments: 0,
      monthlyRevenue: 0,
      monthlyExpenses: 0,
      balance: 0,
    };
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const data = await getDashboardData();

  return (
    <div className='min-h-screen bg-background-color'>
      <ClientNavbar />
      <div className='container mx-auto max-w-7xl py-12 px-6'>
        {/* Header */}
        <div className='mb-12 animate-fade-in'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-semibold tracking-tight text-text-primary mb-2'>
                Dashboard
              </h1>
              <p className='text-text-secondary text-lg'>
                Bem-vindo,{' '}
                <span className='font-medium text-primary-color'>
                  {session.user?.name}
                </span>
                ! Aqui está um resumo da associação.
              </p>
            </div>
            <Badge
              variant={
                session.user?.role === 'comissao' ? 'default' : 'outline'
              }
              className='text-base px-4 py-2'
            >
              {session.user?.role === 'comissao' ? 'Comissão' : 'Jogador'}
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className='mb-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4'>
          <Card className='group hover:scale-105 transition-transform'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-3'>
              <CardTitle className='text-base font-medium'>
                Total de Jogadores
              </CardTitle>
              <div className='h-12 w-12 rounded-2xl bg-primary-color/10 flex items-center justify-center group-hover:bg-primary-color/20 transition-colors'>
                <Users className='h-6 w-6 text-primary-color' />
              </div>
            </CardHeader>
            <CardContent>
              <div className='text-3xl font-semibold text-text-primary mb-1'>
                {data.totalPlayers}
              </div>
              <p className='text-sm text-text-secondary'>
                <span className='text-green-400 font-medium'>
                  {data.activePlayers}
                </span>{' '}
                ativos
              </p>
            </CardContent>
          </Card>

          <Card className='group hover:scale-105 transition-transform'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-3'>
              <CardTitle className='text-base font-medium'>
                Receita Mensal
              </CardTitle>
              <div className='h-12 w-12 rounded-2xl bg-primary-color/10 flex items-center justify-center group-hover:bg-primary-color/20 transition-colors'>
                <DollarSign className='h-6 w-6 text-primary-color' />
              </div>
            </CardHeader>
            <CardContent>
              <div className='text-3xl font-semibold text-text-primary mb-1'>
                R${' '}
                {data.monthlyRevenue.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                })}
              </div>
              <p className='text-sm text-text-secondary'>Este mês</p>
            </CardContent>
          </Card>

          <Card className='group hover:scale-105 transition-transform'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-3'>
              <CardTitle className='text-base font-medium'>
                Saldo Atual
              </CardTitle>
              <div className='h-12 w-12 rounded-2xl bg-primary-color/10 flex items-center justify-center group-hover:bg-primary-color/20 transition-colors'>
                <TrendingUp className='h-6 w-6 text-primary-color' />
              </div>
            </CardHeader>
            <CardContent>
              <div
                className={`text-3xl font-semibold mb-1 ${
                  data.balance >= 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                R${' '}
                {data.balance.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                })}
              </div>
              <p className='text-sm text-text-secondary'>Receitas - Despesas</p>
            </CardContent>
          </Card>

          <Card className='group hover:scale-105 transition-transform'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-3'>
              <CardTitle className='text-base font-medium'>
                Pagamentos Pendentes
              </CardTitle>
              <div className='h-12 w-12 rounded-2xl bg-primary-color/10 flex items-center justify-center group-hover:bg-primary-color/20 transition-colors'>
                <AlertCircle className='h-6 w-6 text-primary-color' />
              </div>
            </CardHeader>
            <CardContent>
              <div className='text-3xl font-semibold text-yellow-400 mb-1'>
                {data.pendingPayments}
              </div>
              <p className='text-sm text-text-secondary'>
                Mensalidades em aberto
              </p>
            </CardContent>
          </Card>
        </div>

        <div className='grid gap-8 lg:grid-cols-3'>
          {/* Financial Summary */}
          <Card className='lg:col-span-2 hover:scale-105 transition-transform'>
            <CardHeader>
              <CardTitle className='flex items-center space-x-3 text-2xl'>
                <div className='h-10 w-10 rounded-2xl bg-primary-color/10 flex items-center justify-center'>
                  <BarChart3 className='h-6 w-6 text-primary-color' />
                </div>
                <span>Resumo Financeiro</span>
              </CardTitle>
              <CardDescription className='text-base'>
                Movimentação financeira do mês atual
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-6'>
                <div className='flex items-center justify-between rounded-2xl border border-border-color p-6 hover:bg-card-background/50 transition-colors'>
                  <div className='space-y-2'>
                    <p className='text-lg font-medium text-text-primary'>
                      Receitas
                    </p>
                    <p className='text-sm text-text-secondary'>
                      Entradas do mês
                    </p>
                  </div>
                  <div className='text-right'>
                    <p className='text-2xl font-semibold text-green-400'>
                      + R${' '}
                      {data.monthlyRevenue.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>

                <div className='flex items-center justify-between rounded-2xl border border-border-color p-6 hover:bg-card-background/50 transition-colors'>
                  <div className='space-y-2'>
                    <p className='text-lg font-medium text-text-primary'>
                      Despesas
                    </p>
                    <p className='text-sm text-text-secondary'>Saídas do mês</p>
                  </div>
                  <div className='text-right'>
                    <p className='text-2xl font-semibold text-red-400'>
                      - R${' '}
                      {data.monthlyExpenses.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>

                <div className='flex items-center justify-between rounded-2xl bg-card-background/50 p-6'>
                  <div className='space-y-2'>
                    <p className='text-lg font-semibold text-text-primary'>
                      Saldo Final
                    </p>
                    <p className='text-sm text-text-secondary'>
                      Resultado do mês
                    </p>
                  </div>
                  <div className='text-right'>
                    <p
                      className={`text-2xl font-semibold ${
                        data.balance >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      R${' '}
                      {data.balance.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className='hover:scale-105 transition-transform'>
            <CardHeader>
              <CardTitle className='flex items-center space-x-3 text-2xl'>
                <div className='h-10 w-10 rounded-2xl bg-primary-color/10 flex items-center justify-center'>
                  <Plus className='h-6 w-6 text-primary-color' />
                </div>
                <span>Ações Rápidas</span>
              </CardTitle>
              <CardDescription className='text-base'>
                Acesso rápido às principais funcionalidades
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-3'>
              {session.user?.role === 'comissao' && (
                <>
                  <Button
                    className='w-full justify-start h-12 text-base'
                    variant='outline'
                    asChild
                  >
                    <Link href='/players/new'>
                      <UserPlus className='mr-3 h-5 w-5' />
                      Cadastrar Jogador
                    </Link>
                  </Button>
                  <Button
                    className='w-full justify-start h-12 text-base'
                    variant='outline'
                    asChild
                  >
                    <Link href='/financial/monthly/new'>
                      <DollarSign className='mr-3 h-5 w-5' />
                      Registrar Mensalidade
                    </Link>
                  </Button>
                  <Button
                    className='w-full justify-start h-12 text-base'
                    variant='outline'
                    asChild
                  >
                    <Link href='/financial/transactions/new'>
                      <Plus className='mr-3 h-5 w-5' />
                      Nova Transação
                    </Link>
                  </Button>
                </>
              )}
              <Button
                className='w-full justify-start h-12 text-base'
                variant='outline'
                asChild
              >
                <Link href='/reports'>
                  <FileText className='mr-3 h-5 w-5' />
                  Ver Relatórios
                </Link>
              </Button>
              <Button
                className='w-full justify-start h-12 text-base'
                variant='outline'
                asChild
              >
                <Link href='/players'>
                  <Users className='mr-3 h-5 w-5' />
                  Lista de Jogadores
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
