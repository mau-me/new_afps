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
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Calendar,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import Link from 'next/link';

export default async function FinancialPage() {
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
                Financeiro
              </h1>
              <p className='text-text-secondary text-lg'>
                Controle financeiro da associação
              </p>
            </div>
            {session.user?.role === 'comissao' && (
              <div className='flex gap-3'>
                <Button variant='outline' size='lg' asChild>
                  <Link href='/financial/transactions/new'>
                    <Plus className='mr-3 h-5 w-5' />
                    Nova Transação
                  </Link>
                </Button>
                <Button size='lg' asChild>
                  <Link href='/financial/monthly/new'>
                    <DollarSign className='mr-3 h-5 w-5' />
                    Registrar Mensalidade
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Financial Summary */}
        <div className='mb-12 grid gap-8 md:grid-cols-3'>
          <Card className='group hover:scale-105 transition-transform'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-3'>
              <CardTitle className='text-base font-medium'>
                Receitas do Mês
              </CardTitle>
              <div className='h-12 w-12 rounded-2xl bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors'>
                <TrendingUp className='h-6 w-6 text-green-400' />
              </div>
            </CardHeader>
            <CardContent>
              <div className='text-3xl font-semibold text-green-400 mb-1'>
                R$ 2.450,00
              </div>
              <p className='text-sm text-text-secondary'>
                +12% em relação ao mês anterior
              </p>
            </CardContent>
          </Card>

          <Card className='group hover:scale-105 transition-transform'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-3'>
              <CardTitle className='text-base font-medium'>
                Despesas do Mês
              </CardTitle>
              <div className='h-12 w-12 rounded-2xl bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors'>
                <TrendingDown className='h-6 w-6 text-red-400' />
              </div>
            </CardHeader>
            <CardContent>
              <div className='text-3xl font-semibold text-red-400 mb-1'>
                R$ 1.200,00
              </div>
              <p className='text-sm text-text-secondary'>
                -5% em relação ao mês anterior
              </p>
            </CardContent>
          </Card>

          <Card className='group hover:scale-105 transition-transform'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-3'>
              <CardTitle className='text-base font-medium'>
                Saldo Atual
              </CardTitle>
              <div className='h-12 w-12 rounded-2xl bg-primary-color/10 flex items-center justify-center group-hover:bg-primary-color/20 transition-colors'>
                <DollarSign className='h-6 w-6 text-primary-color' />
              </div>
            </CardHeader>
            <CardContent>
              <div className='text-3xl font-semibold text-text-primary mb-1'>
                R$ 1.250,00
              </div>
              <p className='text-sm text-text-secondary'>
                Saldo positivo este mês
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className='mb-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4'>
          <Card className='group hover:scale-105 transition-transform'>
            <CardHeader>
              <CardTitle className='flex items-center space-x-3 text-xl'>
                <div className='h-10 w-10 rounded-2xl bg-primary-color/10 flex items-center justify-center group-hover:bg-primary-color/20 transition-colors'>
                  <Calendar className='h-6 w-6 text-primary-color' />
                </div>
                <span>Mensalidades</span>
              </CardTitle>
              <CardDescription className='text-base'>
                Controle de pagamentos mensais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                <div className='flex justify-between'>
                  <span className='text-base text-text-secondary'>Pagas:</span>
                  <Badge variant='success' className='text-sm'>
                    18
                  </Badge>
                </div>
                <div className='flex justify-between'>
                  <span className='text-base text-text-secondary'>
                    Pendentes:
                  </span>
                  <Badge variant='warning' className='text-sm'>
                    4
                  </Badge>
                </div>
                <div className='flex justify-between'>
                  <span className='text-base text-text-secondary'>
                    Vencidas:
                  </span>
                  <Badge variant='destructive' className='text-sm'>
                    2
                  </Badge>
                </div>
              </div>
              <Button className='w-full mt-6' variant='outline' size='default'>
                Ver Detalhes
              </Button>
            </CardContent>
          </Card>

          <Card className='group hover:scale-105 transition-transform'>
            <CardHeader>
              <CardTitle className='flex items-center space-x-3 text-xl'>
                <div className='h-10 w-10 rounded-2xl bg-primary-color/10 flex items-center justify-center group-hover:bg-primary-color/20 transition-colors'>
                  <CreditCard className='h-6 w-6 text-primary-color' />
                </div>
                <span>Cartões</span>
              </CardTitle>
              <CardDescription className='text-base'>
                Multas e taxas extras
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                <div className='flex justify-between'>
                  <span className='text-base text-text-secondary'>
                    Pendentes:
                  </span>
                  <Badge variant='warning' className='text-sm'>
                    3
                  </Badge>
                </div>
                <div className='flex justify-between'>
                  <span className='text-base text-text-secondary'>Pagas:</span>
                  <Badge variant='success' className='text-sm'>
                    12
                  </Badge>
                </div>
                <div className='flex justify-between'>
                  <span className='text-base text-text-secondary'>Total:</span>
                  <span className='text-base font-medium text-text-primary'>
                    R$ 450,00
                  </span>
                </div>
              </div>
              <Button className='w-full mt-6' variant='outline' size='default'>
                Ver Detalhes
              </Button>
            </CardContent>
          </Card>

          <Card className='group hover:scale-105 transition-transform'>
            <CardHeader>
              <CardTitle className='flex items-center space-x-3 text-xl'>
                <div className='h-10 w-10 rounded-2xl bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors'>
                  <TrendingUp className='h-6 w-6 text-green-400' />
                </div>
                <span>Receitas</span>
              </CardTitle>
              <CardDescription className='text-base'>
                Entradas de dinheiro
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                <div className='text-2xl font-semibold text-green-400'>
                  R$ 2.450,00
                </div>
                <p className='text-sm text-text-secondary'>Este mês</p>
                <div className='space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span className='text-text-secondary'>Mensalidades:</span>
                    <span className='text-text-primary'>R$ 1.800,00</span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span className='text-text-secondary'>Cartões:</span>
                    <span className='text-text-primary'>R$ 450,00</span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span className='text-text-secondary'>Outros:</span>
                    <span className='text-text-primary'>R$ 200,00</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='group hover:scale-105 transition-transform'>
            <CardHeader>
              <CardTitle className='flex items-center space-x-3 text-xl'>
                <div className='h-10 w-10 rounded-2xl bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors'>
                  <TrendingDown className='h-6 w-6 text-red-400' />
                </div>
                <span>Despesas</span>
              </CardTitle>
              <CardDescription className='text-base'>
                Saídas de dinheiro
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                <div className='text-2xl font-semibold text-red-400'>
                  R$ 1.200,00
                </div>
                <p className='text-sm text-text-secondary'>Este mês</p>
                <div className='space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span className='text-text-secondary'>Equipamentos:</span>
                    <span className='text-text-primary'>R$ 800,00</span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span className='text-text-secondary'>Manutenção:</span>
                    <span className='text-text-primary'>R$ 250,00</span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span className='text-text-secondary'>Outros:</span>
                    <span className='text-text-primary'>R$ 150,00</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className='hover:scale-105 transition-transform'>
          <CardHeader>
            <CardTitle className='text-2xl'>Transações Recentes</CardTitle>
            <CardDescription className='text-base'>
              Últimas movimentações financeiras
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {[1, 2, 3, 4, 5].map((transaction) => (
                <div
                  key={transaction}
                  className='flex items-center justify-between p-4 rounded-2xl border border-border-color hover:bg-card-background/50 transition-colors'
                >
                  <div className='flex items-center space-x-4'>
                    <div
                      className={`h-12 w-12 rounded-2xl flex items-center justify-center ${
                        transaction % 2 === 0
                          ? 'bg-green-500/10'
                          : 'bg-red-500/10'
                      }`}
                    >
                      {transaction % 2 === 0 ? (
                        <ArrowUpRight className='h-6 w-6 text-green-400' />
                      ) : (
                        <ArrowDownRight className='h-6 w-6 text-red-400' />
                      )}
                    </div>
                    <div>
                      <p className='text-base font-medium text-text-primary'>
                        {transaction % 2 === 0
                          ? 'Mensalidade - João Silva'
                          : 'Compra de Equipamentos'}
                      </p>
                      <p className='text-sm text-text-secondary'>
                        {new Date().toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p
                      className={`text-lg font-medium ${
                        transaction % 2 === 0
                          ? 'text-green-400'
                          : 'text-red-400'
                      }`}
                    >
                      {transaction % 2 === 0 ? '+' : '-'} R${' '}
                      {(Math.random() * 500 + 50).toFixed(2)}
                    </p>
                    <Badge
                      variant={
                        transaction % 2 === 0 ? 'success' : 'destructive'
                      }
                      className='text-sm'
                    >
                      {transaction % 2 === 0 ? 'Entrada' : 'Saída'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <Button className='w-full mt-6' variant='outline' size='lg'>
              Ver Todas as Transações
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
