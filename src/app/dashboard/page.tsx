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
import { Users, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import dbConnect from '@/lib/mongodb';
import Player from '@/lib/models/Player';
import Monthly from '@/lib/models/Monthly';
import Transaction from '@/lib/models/Transaction';

async function getDashboardData() {
  await dbConnect();

  const [totalPlayers, activePlayers, pendingPayments, transactions] =
    await Promise.all([
      Player.countDocuments(),
      Player.countDocuments({ isActive: true }),
      Monthly.countDocuments({ status: { $in: ['em_aberto', 'vencido'] } }),
      Transaction.find({
        date: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      }),
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
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const data = await getDashboardData();

  return (
    <div className='min-h-screen bg-gray-50'>
      <Navbar />
      <div className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'>
        <div className='px-4 py-6 sm:px-0'>
          <div className='mb-8'>
            <h1 className='text-3xl font-bold text-gray-900'>Dashboard</h1>
            <p className='mt-2 text-gray-600'>
              Bem-vindo, {session.user?.name}! Aqui está um resumo da
              associação.
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
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
                  {data.activePlayers} ativos
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
                <CardTitle className='text-sm font-medium'>
                  Saldo Atual
                </CardTitle>
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

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <Card>
              <CardHeader>
                <CardTitle>Resumo Financeiro</CardTitle>
                <CardDescription>
                  Movimentação financeira do mês atual
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm font-medium'>Receitas</span>
                    <span className='text-sm text-green-600'>
                      + R${' '}
                      {data.monthlyRevenue.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm font-medium'>Despesas</span>
                    <span className='text-sm text-red-600'>
                      - R${' '}
                      {data.monthlyExpenses.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className='border-t pt-4'>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm font-bold'>Saldo</span>
                      <span
                        className={`text-sm font-bold ${
                          data.balance >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        R${' '}
                        {data.balance.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
                <CardDescription>
                  Acesso rápido às principais funcionalidades
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  {session.user?.role === 'comissao' && (
                    <>
                      <a
                        href='/players/new'
                        className='block w-full text-left p-2 rounded hover:bg-gray-100 transition-colors'
                      >
                        + Cadastrar Jogador
                      </a>
                      <a
                        href='/financial/monthly/new'
                        className='block w-full text-left p-2 rounded hover:bg-gray-100 transition-colors'
                      >
                        + Registrar Mensalidade
                      </a>
                      <a
                        href='/financial/transactions/new'
                        className='block w-full text-left p-2 rounded hover:bg-gray-100 transition-colors'
                      >
                        + Nova Transação
                      </a>
                    </>
                  )}
                  <a
                    href='/reports'
                    className='block w-full text-left p-2 rounded hover:bg-gray-100 transition-colors'
                  >
                    📊 Ver Relatórios
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
