import Link from 'next/link';
import { Plus } from 'lucide-react';
import { FilterTabs } from '@/components/filter-tabs';
import { FinancialTabs } from '@/components/financial-tabs';
import { MonthNav } from '@/components/month-nav';
import { Navbar } from '@/components/navbar';
import { ScoreCell, ScoreStrip } from '@/components/score-strip';
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
  getCashSummary,
  listTransactions,
  parseCashFilter,
  type CashFilter,
} from '@/lib/data/cash';
import {
  formatLocalDate,
  formatReferenceMonth,
  parseMonthParam,
} from '@/lib/months';
import { requireRole } from '@/lib/session';
import { cn, formatCents } from '@/lib/utils';
import { DeleteTransactionButton } from './delete-transaction-button';

export default async function CashPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; type?: string }>;
}) {
  await requireRole('comissao');

  const params = await searchParams;
  const month = parseMonthParam(params.month);
  const filter = parseCashFilter(params.type);

  const [summary, rows] = await Promise.all([
    getCashSummary(month),
    listTransactions(month, filter),
  ]);

  const monthLabel = formatReferenceMonth(month);
  const total = summary.incomeCount + summary.expenseCount;

  const hrefFor = (next: { month?: string; type?: CashFilter }) => {
    const q = new URLSearchParams();
    q.set('month', next.month ?? month);
    const type = next.type ?? filter;
    if (type !== 'todas') q.set('type', type);
    return `/financial?${q.toString()}`;
  };

  const tabs: { value: CashFilter; label: string; count: number }[] = [
    { value: 'todas', label: 'Todos', count: total },
    { value: 'entrada', label: 'Entradas', count: summary.incomeCount },
    { value: 'saida', label: 'Saídas', count: summary.expenseCount },
  ];

  return (
    <div className='min-h-screen'>
      <Navbar />
      <main className='mx-auto max-w-6xl px-4 py-8 md:py-12'>
        <FinancialTabs active='caixa' />

        <header className='mb-8 flex flex-wrap items-end justify-between gap-4'>
          <div>
            <h1 className='heading text-xl md:text-2xl'>Caixa</h1>
            <p className='mt-1 text-muted-foreground first-letter:uppercase'>
              {monthLabel}
            </p>
          </div>
          <div className='flex flex-wrap items-center gap-2'>
            <MonthNav month={month} hrefFor={(m) => hrefFor({ month: m })} />
            <Button asChild>
              <Link href='/financial/transactions/new'>
                <Plus />
                Novo lançamento
              </Link>
            </Button>
          </div>
        </header>

        <ScoreStrip label='Resumo do caixa' columns={4} className='mb-8'>
          <ScoreCell
            value={formatCents(summary.incomeCents)}
            label='Entradas'
            detail={`${summary.incomeCount} lançamento${summary.incomeCount === 1 ? '' : 's'}`}
            href={hrefFor({ type: 'entrada' })}
          />
          <ScoreCell
            value={formatCents(summary.expenseCents)}
            label='Saídas'
            detail={`${summary.expenseCount} lançamento${summary.expenseCount === 1 ? '' : 's'}`}
            href={hrefFor({ type: 'saida' })}
          />
          <ScoreCell
            value={formatCents(summary.balanceCents)}
            label='Saldo do mês'
            detail='Entradas menos saídas'
            tone={summary.balanceCents >= 0 ? 'positive' : 'negative'}
          />
          <ScoreCell
            value={formatCents(summary.accumulatedCents)}
            label='Saldo em caixa'
            detail={`Acumulado até o fim de ${monthLabel.split(' ')[0]}`}
            tone={summary.accumulatedCents >= 0 ? 'default' : 'negative'}
          />
        </ScoreStrip>

        {total === 0 ? (
          <section className='rounded-lg border bg-card px-6 py-12'>
            <h2 className='heading text-lg'>
              Nenhum lançamento em {monthLabel}
            </h2>
            <p className='mt-1 max-w-prose text-muted-foreground'>
              Registre aqui o que entrou e o que saiu do caixa: arbitragem,
              material, campo, doações. Os pagamentos de mensalidades e de
              cartões entram sozinhos.
            </p>
            <Button asChild className='mt-6'>
              <Link href='/financial/transactions/new'>
                <Plus />
                Novo lançamento
              </Link>
            </Button>
          </section>
        ) : (
          <>
            <FilterTabs
              label='Filtrar por tipo'
              className='mb-4'
              tabs={tabs.map((t) => ({
                label: t.label,
                count: t.count,
                href: hrefFor({ type: t.value }),
                active: t.value === filter,
              }))}
            />

            <section className='rounded-lg border bg-card'>
              {rows.length === 0 ? (
                <p className='px-6 py-12 text-muted-foreground'>
                  Nenhum lançamento deste tipo no mês.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='pl-6'>Data</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead className='text-right'>Valor</TableHead>
                      <TableHead className='pr-6 text-right'>
                        <span className='sr-only'>Ações</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className='pl-6 tabular-nums'>
                          {formatLocalDate(row.date)}
                        </TableCell>
                        <TableCell className='max-w-[22rem] whitespace-normal'>
                          {row.description}
                        </TableCell>
                        <TableCell className='text-muted-foreground'>
                          {row.category}
                        </TableCell>
                        <TableCell
                          className={cn(
                            'text-right font-semibold tabular-nums',
                            row.type === 'entrada' ? 'text-success' : 'text-error'
                          )}
                        >
                          {row.type === 'entrada' ? '+ ' : '− '}
                          {formatCents(row.amountCents)}
                        </TableCell>
                        <TableCell className='pr-6'>
                          <div className='flex justify-end'>
                            {row.fromCard ? (
                              <Button variant='ghost' size='sm' asChild>
                                <Link href='/financial/cards?status=pago'>
                                  Ver cartão
                                </Link>
                              </Button>
                            ) : row.isAutomatic ? (
                              <Button variant='ghost' size='sm' asChild>
                                <Link
                                  href={`/financial/monthly?month=${row.monthlyMonth ?? month}&status=pago`}
                                >
                                  Ver mensalidade
                                </Link>
                              </Button>
                            ) : (
                              <DeleteTransactionButton
                                id={row.id}
                                description={row.description}
                              />
                            )}
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
