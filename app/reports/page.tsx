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
  FileText,
  Download,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import Link from 'next/link';

export default async function ReportsPage() {
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
          <h1 className='text-3xl font-semibold tracking-tight text-text-primary mb-2'>
            Relatórios
          </h1>
          <p className='text-text-secondary text-lg'>
            Visualize e exporte relatórios financeiros e de gestão da associação
          </p>
        </div>

        {/* Reports Grid */}
        <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12'>
          {/* Financial Reports */}
          <Card className='group hover:scale-105 transition-transform'>
            <CardHeader>
              <CardTitle className='flex items-center space-x-3 text-xl'>
                <div className='h-12 w-12 rounded-2xl bg-primary-color/10 flex items-center justify-center group-hover:bg-primary-color/20 transition-colors'>
                  <DollarSign className='h-6 w-6 text-primary-color' />
                </div>
                <span>Relatório Financeiro</span>
              </CardTitle>
              <CardDescription className='text-base'>
                Resumo completo das receitas, despesas e saldo da associação
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='space-y-3'>
                <Badge variant='secondary' className='text-sm'>
                  Mensal
                </Badge>
                <p className='text-base text-text-secondary leading-relaxed'>
                  Relatório detalhado das movimentações financeiras do mês atual
                </p>
              </div>
              <Button className='w-full' variant='outline' size='lg'>
                <Download className='mr-3 h-5 w-5' />
                Gerar Relatório
              </Button>
            </CardContent>
          </Card>

          {/* Players Report */}
          <Card className='group hover:scale-105 transition-transform'>
            <CardHeader>
              <CardTitle className='flex items-center space-x-3 text-xl'>
                <div className='h-12 w-12 rounded-2xl bg-primary-color/10 flex items-center justify-center group-hover:bg-primary-color/20 transition-colors'>
                  <Users className='h-6 w-6 text-primary-color' />
                </div>
                <span>Relatório de Jogadores</span>
              </CardTitle>
              <CardDescription className='text-base'>
                Lista completa de jogadores ativos e inativos
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='space-y-3'>
                <Badge variant='outline' className='text-sm'>
                  Atual
                </Badge>
                <p className='text-base text-text-secondary leading-relaxed'>
                  Informações detalhadas de todos os jogadores cadastrados
                </p>
              </div>
              <Button className='w-full' variant='outline' size='lg'>
                <Download className='mr-3 h-5 w-5' />
                Gerar Relatório
              </Button>
            </CardContent>
          </Card>

          {/* Monthly Payments */}
          <Card className='group hover:scale-105 transition-transform'>
            <CardHeader>
              <CardTitle className='flex items-center space-x-3 text-xl'>
                <div className='h-12 w-12 rounded-2xl bg-primary-color/10 flex items-center justify-center group-hover:bg-primary-color/20 transition-colors'>
                  <Calendar className='h-6 w-6 text-primary-color' />
                </div>
                <span>Mensalidades</span>
              </CardTitle>
              <CardDescription className='text-base'>
                Status dos pagamentos mensais dos jogadores
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='space-y-3'>
                <Badge variant='warning' className='text-sm'>
                  Pendentes
                </Badge>
                <p className='text-base text-text-secondary leading-relaxed'>
                  Relatório de mensalidades pagas e em aberto
                </p>
              </div>
              <Button className='w-full' variant='outline' size='lg'>
                <Download className='mr-3 h-5 w-5' />
                Gerar Relatório
              </Button>
            </CardContent>
          </Card>

          {/* Annual Summary */}
          <Card className='group hover:scale-105 transition-transform'>
            <CardHeader>
              <CardTitle className='flex items-center space-x-3 text-xl'>
                <div className='h-12 w-12 rounded-2xl bg-primary-color/10 flex items-center justify-center group-hover:bg-primary-color/20 transition-colors'>
                  <TrendingUp className='h-6 w-6 text-primary-color' />
                </div>
                <span>Resumo Anual</span>
              </CardTitle>
              <CardDescription className='text-base'>
                Balanço geral das atividades do ano
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='space-y-3'>
                <Badge variant='info' className='text-sm'>
                  {new Date().getFullYear()}
                </Badge>
                <p className='text-base text-text-secondary leading-relaxed'>
                  Relatório completo das atividades e finanças anuais
                </p>
              </div>
              <Button className='w-full' variant='outline' size='lg'>
                <Download className='mr-3 h-5 w-5' />
                Gerar Relatório
              </Button>
            </CardContent>
          </Card>

          {/* Custom Report */}
          <Card className='group hover:scale-105 transition-transform'>
            <CardHeader>
              <CardTitle className='flex items-center space-x-3 text-xl'>
                <div className='h-12 w-12 rounded-2xl bg-primary-color/10 flex items-center justify-center group-hover:bg-primary-color/20 transition-colors'>
                  <FileText className='h-6 w-6 text-primary-color' />
                </div>
                <span>Relatório Personalizado</span>
              </CardTitle>
              <CardDescription className='text-base'>
                Crie relatórios com filtros específicos
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='space-y-3'>
                <Badge variant='outline' className='text-sm'>
                  Customizável
                </Badge>
                <p className='text-base text-text-secondary leading-relaxed'>
                  Defina período, categorias e formato do relatório
                </p>
              </div>
              <Button className='w-full' variant='outline' size='lg'>
                <FileText className='mr-3 h-5 w-5' />
                Criar Relatório
              </Button>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className='group hover:scale-105 transition-transform'>
            <CardHeader>
              <CardTitle className='flex items-center space-x-3 text-xl'>
                <div className='h-12 w-12 rounded-2xl bg-primary-color/10 flex items-center justify-center group-hover:bg-primary-color/20 transition-colors'>
                  <BarChart3 className='h-6 w-6 text-primary-color' />
                </div>
                <span>Estatísticas Rápidas</span>
              </CardTitle>
              <CardDescription className='text-base'>
                Visualização rápida dos principais números
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='space-y-3'>
                <Badge variant='success' className='text-sm'>
                  Em tempo real
                </Badge>
                <p className='text-base text-text-secondary leading-relaxed'>
                  Dashboard com métricas atualizadas automaticamente
                </p>
              </div>
              <Button className='w-full' variant='outline' size='lg' asChild>
                <Link href='/dashboard'>
                  <TrendingUp className='mr-3 h-5 w-5' />
                  Ver Dashboard
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className='hover:scale-105 transition-transform'>
          <CardHeader>
            <CardTitle className='text-2xl'>Como usar os relatórios</CardTitle>
            <CardDescription className='text-base'>
              Instruções para gerar e interpretar os relatórios da associação
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-8'>
            <div className='grid gap-8 md:grid-cols-2'>
              <div className='space-y-3'>
                <div className='flex items-center space-x-3'>
                  <div className='h-8 w-8 rounded-xl bg-primary-color/10 flex items-center justify-center'>
                    <span className='text-primary-color font-semibold'>1</span>
                  </div>
                  <h4 className='font-medium text-text-primary text-lg'>
                    Selecione o tipo de relatório
                  </h4>
                </div>
                <p className='text-base text-text-secondary leading-relaxed ml-11'>
                  Escolha entre relatórios financeiros, de jogadores ou
                  personalizados conforme sua necessidade.
                </p>
              </div>
              <div className='space-y-3'>
                <div className='flex items-center space-x-3'>
                  <div className='h-8 w-8 rounded-xl bg-primary-color/10 flex items-center justify-center'>
                    <span className='text-primary-color font-semibold'>2</span>
                  </div>
                  <h4 className='font-medium text-text-primary text-lg'>
                    Configure os filtros
                  </h4>
                </div>
                <p className='text-base text-text-secondary leading-relaxed ml-11'>
                  Defina o período, categorias e outros filtros para obter dados
                  mais específicos.
                </p>
              </div>
              <div className='space-y-3'>
                <div className='flex items-center space-x-3'>
                  <div className='h-8 w-8 rounded-xl bg-primary-color/10 flex items-center justify-center'>
                    <span className='text-primary-color font-semibold'>3</span>
                  </div>
                  <h4 className='font-medium text-text-primary text-lg'>
                    Gere e baixe
                  </h4>
                </div>
                <p className='text-base text-text-secondary leading-relaxed ml-11'>
                  Clique em &quot;Gerar Relatório&quot; e faça o download do
                  arquivo em formato PDF ou Excel.
                </p>
              </div>
              <div className='space-y-3'>
                <div className='flex items-center space-x-3'>
                  <div className='h-8 w-8 rounded-xl bg-primary-color/10 flex items-center justify-center'>
                    <span className='text-primary-color font-semibold'>4</span>
                  </div>
                  <h4 className='font-medium text-text-primary text-lg'>
                    Analise os dados
                  </h4>
                </div>
                <p className='text-base text-text-secondary leading-relaxed ml-11'>
                  Use os relatórios para tomar decisões informadas sobre a
                  gestão da associação.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
