import Link from 'next/link';
import { FilterTabs } from '@/components/filter-tabs';
import { MonthNav } from '@/components/month-nav';
import { Navbar } from '@/components/navbar';
import {
  OverdueDetail,
  ScoreCell,
  ScoreStrip,
} from '@/components/score-strip';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  getMonthlySettings,
  getMonthSummary,
  listMonthlies,
  parseMonthlyFilter,
  type MonthlyFilter,
  type MonthlyRow,
} from '@/lib/data/monthly';
import {
  formatLocalDate,
  formatReferenceMonth,
  formatReferenceMonthShort,
  parseMonthParam,
} from '@/lib/months';
import { requireRole } from '@/lib/session';
import { formatCents } from '@/lib/utils';
import { GenerateButton } from './generate-button';
import { PaymentActions } from './payment-actions';
import { SettingsForm } from './settings-form';

function centsToInput(cents: number) {
  return cents > 0 ? (cents / 100).toFixed(2).replace('.', ',') : '';
}

function StatusBadge({ row }: { row: MonthlyRow }) {
  if (row.status === 'pago') {
    return (
      <Badge variant='success'>
        Paga{row.paymentDate && ` em ${formatLocalDate(row.paymentDate)}`}
      </Badge>
    );
  }
  if (row.isOverdue) return <Badge variant='destructive'>Vencida</Badge>;
  return <Badge variant='warning'>Em aberto</Badge>;
}

export default async function MonthlyPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; status?: string }>;
}) {
  await requireRole('comissao');

  const params = await searchParams;
  const month = parseMonthParam(params.month);
  const filter = parseMonthlyFilter(params.status);

  const [settings, summary, rows] = await Promise.all([
    getMonthlySettings(),
    getMonthSummary(month),
    listMonthlies(month, filter),
  ]);

  const isConfigured = settings.monthlyFeeCents > 0;
  const monthLabel = formatReferenceMonth(month);

  const hrefFor = (next: { month?: string; status?: MonthlyFilter }) => {
    const q = new URLSearchParams();
    q.set('month', next.month ?? month);
    const status = next.status ?? filter;
    if (status !== 'todas') q.set('status', status);
    return `/financial/monthly?${q.toString()}`;
  };

  const filters: { value: MonthlyFilter; label: string; count: number }[] = [
    { value: 'todas', label: 'Todas', count: summary.total },
    { value: 'em_aberto', label: 'Em aberto', count: summary.open },
    { value: 'vencido', label: 'Vencidas', count: summary.overdue },
    { value: 'pago', label: 'Pagas', count: summary.paid },
  ];

  return (
    <div className='min-h-screen'>
      <Navbar />
      <main className='mx-auto max-w-6xl px-4 py-8 md:py-12'>
        {/* Cabeçalho com navegação entre meses */}
        <header className='mb-8 flex flex-wrap items-end justify-between gap-4'>
          <div>
            <h1 className='heading text-xl md:text-2xl'>Mensalidades</h1>
            <p className='mt-1 text-muted-foreground first-letter:uppercase'>
              {monthLabel}
            </p>
          </div>
          <MonthNav month={month} hrefFor={(m) => hrefFor({ month: m })} />
        </header>

        {!settings.hasAssociation && (
          <Alert variant='warning' className='mb-8'>
            <AlertDescription>
              Nenhuma associação cadastrada. Rode <code>npm run seed</code> para
              criar os dados iniciais.
            </AlertDescription>
          </Alert>
        )}

        {/* Valor da mensalidade */}
        {settings.hasAssociation && !isConfigured && (
          <section className='mb-8 rounded-lg border border-l-4 border-l-warning bg-card p-6'>
            <h2 className='heading text-lg'>Defina o valor da mensalidade</h2>
            <p className='mt-1 mb-6 max-w-prose text-muted-foreground'>
              O mesmo valor vale para todos os jogadores. Depois de salvar, você
              poderá gerar as mensalidades do mês.
            </p>
            <SettingsForm defaultFee='' defaultDueDay={settings.dueDay} />
          </section>
        )}

        {isConfigured && (
          <details className='group mb-8 rounded-lg border bg-card'>
            <summary className='flex cursor-pointer list-none items-center justify-between gap-4 rounded-lg px-6 py-4 hover:bg-muted [&::-webkit-details-marker]:hidden'>
              <span>
                Mensalidade de{' '}
                <strong className='font-semibold'>
                  {formatCents(settings.monthlyFeeCents)}
                </strong>
                , com vencimento todo dia {settings.dueDay}.
              </span>
              <span className='text-sm font-medium text-primary group-open:hidden'>
                Alterar
              </span>
              <span className='hidden text-sm font-medium text-primary group-open:inline'>
                Fechar
              </span>
            </summary>
            <div className='border-t px-6 py-6'>
              <SettingsForm
                defaultFee={centsToInput(settings.monthlyFeeCents)}
                defaultDueDay={settings.dueDay}
              />
            </div>
          </details>
        )}

        {summary.total > 0 && (
          <ScoreStrip label='Resumo do mês' columns={4} className='mb-8'>
            <ScoreCell
              value={formatCents(summary.receivedCents)}
              label='Recebido'
              detail={`${summary.paid} de ${summary.total} pagas`}
              tone='positive'
            />
            <ScoreCell
              value={formatCents(summary.openCents)}
              label='A receber'
              detail={`${summary.open} em aberto`}
            />
            <ScoreCell
              value={summary.overdue}
              label='Vencidas'
              detail={<OverdueDetail count={summary.overdue} />}
              tone={summary.overdue > 0 ? 'negative' : 'default'}
              href={summary.overdue > 0 ? hrefFor({ status: 'vencido' }) : undefined}
            />
            <ScoreCell
              value={formatCents(summary.expectedCents)}
              label='Previsto'
              detail='Total do mês'
            />
          </ScoreStrip>
        )}

        {/* Mês ainda sem mensalidades */}
        {summary.total === 0 && isConfigured && (
          <section className='rounded-lg border bg-card px-6 py-12'>
            <h2 className='heading text-lg'>
              Nenhuma mensalidade gerada em {monthLabel}
            </h2>
            <p className='mt-1 max-w-prose text-muted-foreground'>
              {summary.missing > 0
                ? `Gera uma mensalidade de ${formatCents(settings.monthlyFeeCents)} para cada um dos ${summary.missing} jogadores ativos.`
                : 'Não há jogadores ativos. Cadastre jogadores antes de gerar as mensalidades.'}
            </p>
            {summary.missing > 0 ? (
              <div className='mt-6'>
                <GenerateButton month={month}>
                  Gerar mensalidades de {formatReferenceMonthShort(month)}
                </GenerateButton>
              </div>
            ) : (
              <Button asChild className='mt-6'>
                <Link href='/players/new'>Cadastrar jogador</Link>
              </Button>
            )}
          </section>
        )}

        {summary.total > 0 && (
          <>
            {summary.missing > 0 && isConfigured && (
              <Alert variant='warning' className='mb-6'>
                <AlertDescription className='flex flex-wrap items-center justify-between gap-4'>
                  <span>
                    {summary.missing} jogador{summary.missing === 1 ? '' : 'es'}{' '}
                    ativo{summary.missing === 1 ? '' : 's'} ainda sem
                    mensalidade neste mês.
                  </span>
                  <GenerateButton month={month} variant='outline'>
                    Gerar para quem falta
                  </GenerateButton>
                </AlertDescription>
              </Alert>
            )}

            <FilterTabs
              label='Filtrar por situação'
              className='mb-4'
              tabs={filters.map((f) => ({
                label: f.label,
                count: f.count,
                href: hrefFor({ status: f.value }),
                active: f.value === filter,
              }))}
            />

            <section className='rounded-lg border bg-card'>
              {rows.length === 0 ? (
                <p className='px-6 py-12 text-muted-foreground'>
                  Nenhuma mensalidade nesta situação.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='w-20 pl-6'>Camisa</TableHead>
                      <TableHead>Jogador</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Situação</TableHead>
                      <TableHead className='pr-6 text-right'>
                        <span className='sr-only'>Ações</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className='pl-6'>
                          <span className='numeral text-3xl text-primary'>
                            {row.player.shirtNumber ?? '–'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className='font-semibold'>
                            {row.player.nickname}
                          </div>
                          <div className='text-sm text-muted-foreground'>
                            {row.player.fullName}
                          </div>
                        </TableCell>
                        <TableCell className='tabular-nums'>
                          {formatCents(row.amountCents)}
                        </TableCell>
                        <TableCell className='tabular-nums'>
                          {formatLocalDate(row.dueDate)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge row={row} />
                        </TableCell>
                        <TableCell className='pr-6'>
                          <div className='flex justify-end'>
                            <PaymentActions
                              monthlyId={row.id}
                              status={row.status}
                              nickname={row.player.nickname}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
