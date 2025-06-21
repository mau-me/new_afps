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
    <div className='min-h-screen bg-background'>
      <Navbar />
      <div className='container py-8'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold tracking-tight'>Dashboard</h1>
              <p className='text-muted-foreground'>
                Bem-vindo,{' '}
                <span className='font-medium'>{session.user?.name}</span>! Aqui
                está um resumo da associação.
              </p>
            </div>
            <Badge variant='secondary' className='text-sm'>
              {session.user?.role === 'comissao' ? 'Comissão' : 'Jogador'}
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className='mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total de Jogadores
              </CardTitle>
              <Users className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{data.totalPlayers}</div>
              <p className='text-xs text-muted-foreground'>
                <span className='text-green-600'>{data.activePlayers}</span>{' '}
                ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Receita Mensal
              </CardTitle>
              <DollarSign className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                R${' '}
                {data.monthlyRevenue.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                })}
              </div>
              <p className='text-xs text-muted-foreground'>Este mês</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Saldo Atual</CardTitle>
              <TrendingUp className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  data.balance >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                R${' '}
                {data.balance.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                })}
              </div>
              <p className='text-xs text-muted-foreground'>
                Receitas - Despesas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Pagamentos Pendentes
              </CardTitle>
              <AlertCircle className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-orange-600'>
                {data.pendingPayments}
              </div>
              <p className='text-xs text-muted-foreground'>
                Mensalidades em aberto
              </p>
            </CardContent>
          </Card>
        </div>

        <div className='grid gap-6 lg:grid-cols-3'>
          {/* Financial Summary */}
          <Card className='lg:col-span-2'>
            <CardHeader>
              <CardTitle className='flex items-center space-x-2'>
                <BarChart3 className='h-5 w-5' />
                <span>Resumo Financeiro</span>
              </CardTitle>
              <CardDescription>
                Movimentação financeira do mês atual
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='flex items-center justify-between rounded-lg border p-4'>
                  <div className='space-y-1'>
                    <p className='text-sm font-medium'>Receitas</p>
                    <p className='text-xs text-muted-foreground'>
                      Entradas do mês
                    </p>
                  </div>
                  <div className='text-right'>
                    <p className='text-lg font-bold text-green-600'>
                      + R${' '}
                      {data.monthlyRevenue.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>

                <div className='flex items-center justify-between rounded-lg border p-4'>
                  <div className='space-y-1'>
                    <p className='text-sm font-medium'>Despesas</p>
                    <p className='text-xs text-muted-foreground'>
                      Saídas do mês
                    </p>
                  </div>
                  <div className='text-right'>
                    <p className='text-lg font-bold text-red-600'>
                      - R${' '}
                      {data.monthlyExpenses.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>

                <div className='flex items-center justify-between rounded-lg bg-muted/50 p-4'>
                  <div className='space-y-1'>
                    <p className='text-sm font-bold'>Saldo Final</p>
                    <p className='text-xs text-muted-foreground'>
                      Resultado do mês
                    </p>
                  </div>
                  <div className='text-right'>
                    <p
                      className={`text-lg font-bold ${
                        data.balance >= 0 ? 'text-green-600' : 'text-red-600'
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
              <CardTitle className='flex items-center space-x-2'>
                <Plus className='h-5 w-5' />
                <span>Ações Rápidas</span>
              </CardTitle>
              <CardDescription>
                Acesso rápido às principais funcionalidades
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-3'>
              {session.user?.role === 'comissao' && (
                <>
                  <Button
                    className='w-full justify-start'
                    variant='outline'
                    asChild
                  >
                    <Link href='/players/new'>
                      <UserPlus className='mr-2 h-4 w-4' />
                      Cadastrar Jogador
                    </Link>
                  </Button>
                  <Button
                    className='w-full justify-start'
                    variant='outline'
                    asChild
                  >
                    <Link href='/financial/monthly/new'>
                      <DollarSign className='mr-2 h-4 w-4' />
                      Registrar Mensalidade
                    </Link>
                  </Button>
                  <Button
                    className='w-full justify-start'
                    variant='outline'
                    asChild
                  >
                    <Link href='/financial/transactions/new'>
                      <Plus className='mr-2 h-4 w-4' />
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
                  <FileText className='mr-2 h-4 w-4' />
                  Ver Relatórios
                </Link>
              </Button>
              <Button
                className='w-full justify-start'
                variant='outline'
                asChild
              >
                <Link href='/players'>
                  <Users className='mr-2 h-4 w-4' />
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
