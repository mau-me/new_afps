import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/navbar';
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
    <div className='min-h-screen bg-neutral-900'>
      <Navbar />
      <div className='container mx-auto max-w-7xl py-xl px-md'>
        {/* Header */}
        <div className='mb-xl'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-2xl font-semibold tracking-tight text-accent'>
                Dashboard
              </h1>
              <p className='text-neutral-400'>
                Bem-vindo,{' '}
                <span className='font-medium text-accent'>
                  {session.user?.name}
                </span>
                ! Aqui está um resumo da associação.
              </p>
            </div>
            <Badge
              variant={
                session.user?.role === 'comissao' ? 'secondary' : 'outline'
              }
              className='text-sm'
            >
              {session.user?.role === 'comissao' ? 'Comissão' : 'Jogador'}
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className='mb-xl grid gap-lg md:grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-sm'>
              <CardTitle className='text-sm font-medium'>
                Total de Jogadores
              </CardTitle>
              <Users className='h-4 w-4 text-neutral-400' />
            </CardHeader>
            <CardContent>
              <div className='text-xl font-semibold text-accent'>
                {data.totalPlayers}
              </div>
              <p className='text-xs text-neutral-400'>
                <span className='text-success'>{data.activePlayers}</span>{' '}
                ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-sm'>
              <CardTitle className='text-sm font-medium'>
                Receita Mensal
              </CardTitle>
              <DollarSign className='h-4 w-4 text-neutral-400' />
            </CardHeader>
            <CardContent>
              <div className='text-xl font-semibold text-accent'>
                R${' '}
                {data.monthlyRevenue.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                })}
              </div>
              <p className='text-xs text-neutral-400'>Este mês</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-sm'>
              <CardTitle className='text-sm font-medium'>Saldo Atual</CardTitle>
              <TrendingUp className='h-4 w-4 text-neutral-400' />
            </CardHeader>
            <CardContent>
              <div
                className={`text-xl font-semibold ${
                  data.balance >= 0 ? 'text-success' : 'text-error'
                }`}
              >
                R${' '}
                {data.balance.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                })}
              </div>
              <p className='text-xs text-neutral-400'>Receitas - Despesas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-sm'>
              <CardTitle className='text-sm font-medium'>
                Pagamentos Pendentes
              </CardTitle>
              <AlertCircle className='h-4 w-4 text-neutral-400' />
            </CardHeader>
            <CardContent>
              <div className='text-xl font-semibold text-warning'>
                {data.pendingPayments}
              </div>
              <p className='text-xs text-neutral-400'>Mensalidades em aberto</p>
            </CardContent>
          </Card>
        </div>

        <div className='grid gap-lg lg:grid-cols-3'>
          {/* Financial Summary */}
          <Card className='lg:col-span-2'>
            <CardHeader>
              <CardTitle className='flex items-center space-x-sm'>
                <BarChart3 className='h-5 w-5 text-primary' />
                <span>Resumo Financeiro</span>
              </CardTitle>
              <CardDescription>
                Movimentação financeira do mês atual
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-md'>
                <div className='flex items-center justify-between rounded border border-neutral-700 p-md'>
                  <div className='space-y-1'>
                    <p className='text-sm font-medium text-accent'>Receitas</p>
                    <p className='text-xs text-neutral-400'>Entradas do mês</p>
                  </div>
                  <div className='text-right'>
                    <p className='text-lg font-semibold text-success'>
                      + R${' '}
                      {data.monthlyRevenue.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>

                <div className='flex items-center justify-between rounded border border-neutral-700 p-md'>
                  <div className='space-y-1'>
                    <p className='text-sm font-medium text-accent'>Despesas</p>
                    <p className='text-xs text-neutral-400'>Saídas do mês</p>
                  </div>
                  <div className='text-right'>
                    <p className='text-lg font-semibold text-error'>
                      - R${' '}
                      {data.monthlyExpenses.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>

                <div className='flex items-center justify-between rounded bg-neutral-700/50 p-md'>
                  <div className='space-y-1'>
                    <p className='text-sm font-semibold text-accent'>
                      Saldo Final
                    </p>
                    <p className='text-xs text-neutral-400'>Resultado do mês</p>
                  </div>
                  <div className='text-right'>
                    <p
                      className={`text-lg font-semibold ${
                        data.balance >= 0 ? 'text-success' : 'text-error'
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
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center space-x-sm'>
                <Plus className='h-5 w-5 text-primary' />
                <span>Ações Rápidas</span>
              </CardTitle>
              <CardDescription>
                Acesso rápido às principais funcionalidades
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-sm'>
              {session.user?.role === 'comissao' && (
                <>
                  <Button
                    className='w-full justify-start'
                    variant='outline'
                    asChild
                  >
                    <Link href='/players/new'>
                      <UserPlus className='mr-sm h-4 w-4' />
                      Cadastrar Jogador
                    </Link>
                  </Button>
                  <Button
                    className='w-full justify-start'
                    variant='outline'
                    asChild
                  >
                    <Link href='/financial/monthly/new'>
                      <DollarSign className='mr-sm h-4 w-4' />
                      Registrar Mensalidade
                    </Link>
                  </Button>
                  <Button
                    className='w-full justify-start'
                    variant='outline'
                    asChild
                  >
                    <Link href='/financial/transactions/new'>
                      <Plus className='mr-sm h-4 w-4' />
                      Nova Transação
                    </Link>
                  </Button>
                </>
              )}
              <Button
                className='w-full justify-start'
                variant='outline'
                asChild
              >
                <Link href='/reports'>
                  <FileText className='mr-sm h-4 w-4' />
                  Ver Relatórios
                </Link>
              </Button>
              <Button
                className='w-full justify-start'
                variant='outline'
                asChild
              >
                <Link href='/players'>
                  <Users className='mr-sm h-4 w-4' />
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
