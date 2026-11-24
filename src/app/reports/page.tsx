import Link from 'next/link';
import { Download } from 'lucide-react';
import { MonthNav } from '@/components/month-nav';
import { Navbar } from '@/components/navbar';
import { ScoreCell, ScoreStrip } from '@/components/score-strip';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getAssociationData } from '@/lib/data/association';
import { getMonthReport, type CategoryTotal } from '@/lib/data/reports';
import {
  formatLocalDate,
  formatReferenceMonth,
  formatReferenceMonthShort,
  parseMonthParam,
} from '@/lib/months';
import { requireRole } from '@/lib/session';
import { cn, formatCents } from '@/lib/utils';
import { PrintButton } from './print-button';

export const metadata = { title: 'Relatórios - AFPS' };

function CategoryTable({
  title,
  rows,
  totalCents,
  tone,
}: {
  title: string;
  rows: CategoryTotal[];
  totalCents: number;
  tone: 'income' | 'expense';
}) {
  return (
    <section className='rounded-lg border bg-card print:break-inside-avoid'>
      <h3 className='heading px-6 pt-6 pb-2 text-lg'>{title}</h3>
      {rows.length === 0 ? (
        <p className='px-6 pb-6 text-muted-foreground'>Nenhum lançamento.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='pl-6'>Categoria</TableHead>
              <TableHead className='text-right'>Lançamentos</TableHead>
              <TableHead className='pr-6 text-right'>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.category}>
                <TableCell className='pl-6'>{r.category}</TableCell>
                <TableCell className='text-right tabular-nums'>{r.count}</TableCell>
                <TableCell className='pr-6 text-right tabular-nums'>
                  {formatCents(r.cents)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell className='pl-6 font-semibold' colSpan={2}>
                Total
              </TableCell>
              <TableCell
                className={cn(
                  'pr-6 text-right font-semibold tabular-nums',
                  tone === 'income' ? 'text-success' : 'text-error'
                )}
              >
                {formatCents(totalCents)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      )}
    </section>
  );
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const session = await requireRole('comissao');
  const month = parseMonthParam((await searchParams).month);

  const [report, association] = await Promise.all([
    getMonthReport(month),
    getAssociationData(),
  ]);
  const monthLabel = formatReferenceMonth(month);
  // No relatório, os lançamentos vão em ordem cronológica.
  const transactions = [...report.transactions].reverse();
  const debtTotal = report.debtors.reduce((s, d) => s + d.totalCents, 0);

  return (
    <div className='min-h-screen print:bg-white'>
      <div className='print:hidden'>
        <Navbar />
      </div>
      <main className='mx-auto max-w-5xl px-4 py-8 md:py-12 print:max-w-none print:p-0'>
        <header className='mb-8 flex flex-wrap items-end justify-between gap-4'>
          <div>
            <p className='text-sm text-muted-foreground'>
              {association?.name ?? 'Associação'}
            </p>
            <h1 className='heading text-xl md:text-2xl'>
              Prestação de contas de {monthLabel}
            </h1>
          </div>
          <div className='flex flex-wrap items-center gap-2 print:hidden'>
            <MonthNav month={month} hrefFor={(m) => `/reports?month=${m}`} />
            <PrintButton />
            <Button variant='outline' asChild>
              <a href={`/reports/export?month=${month}`} download>
                <Download />
                Planilha (CSV)
              </a>
            </Button>
          </div>
        </header>

        <ScoreStrip label='Resumo do caixa' columns={4} className='mb-8'>
          <ScoreCell
            value={formatCents(report.openingCents)}
            label='Saldo anterior'
            detail={`Em caixa no início de ${formatReferenceMonthShort(month)}`}
          />
          <ScoreCell
            value={formatCents(report.incomeCents)}
            label='Entradas'
            tone='positive'
          />
          <ScoreCell
            value={formatCents(report.expenseCents)}
            label='Saídas'
            tone='negative'
          />
          <ScoreCell
            value={formatCents(report.closingCents)}
            label='Saldo final'
            detail='Saldo anterior + entradas − saídas'
            tone={report.closingCents >= 0 ? 'default' : 'negative'}
          />
        </ScoreStrip>

        <div className='mb-8 grid gap-8 md:grid-cols-2'>
          <CategoryTable
            title='Entradas por categoria'
            rows={report.incomeByCategory}
            totalCents={report.incomeCents}
            tone='income'
          />
          <CategoryTable
            title='Saídas por categoria'
            rows={report.expenseByCategory}
            totalCents={report.expenseCents}
            tone='expense'
          />
        </div>

        {/* Mensalidades e inadimplência */}
        <section className='mb-8 rounded-lg border bg-card p-6 print:break-inside-avoid'>
          <h2 className='heading text-lg'>Mensalidades de {monthLabel}</h2>
          {report.monthly.total === 0 ? (
            <p className='mt-2 text-muted-foreground'>
              Nenhuma mensalidade gerada neste mês.
            </p>
          ) : (
            <p className='mt-2 max-w-prose'>
              {report.monthly.paid} de {report.monthly.total} pagas, somando{' '}
              <strong>{formatCents(report.monthly.receivedCents)}</strong>.{' '}
              {report.monthly.open > 0
                ? `${report.monthly.open} em aberto (${formatCents(report.monthly.openCents)})${report.monthly.overdue > 0 ? `, das quais ${report.monthly.overdue} vencida${report.monthly.overdue === 1 ? '' : 's'}` : ''}.`
                : 'Todas quitadas.'}
            </p>
          )}
          {report.cards.pendingCount > 0 && (
            <p className='mt-2 text-muted-foreground'>
              Multas por cartão pendentes (todas as datas):{' '}
              {report.cards.pendingCount}, somando{' '}
              {formatCents(report.cards.pendingCents)}.
            </p>
          )}
        </section>

        <section className='mb-8 rounded-lg border bg-card print:break-inside-avoid'>
          <div className='px-6 pt-6 pb-2'>
            <h2 className='heading text-lg'>Mensalidades vencidas</h2>
            <p className='text-sm text-muted-foreground'>
              Situação de hoje, considerando todos os meses.
            </p>
          </div>
          {report.debtors.length === 0 ? (
            <p className='px-6 pb-6 text-muted-foreground'>
              Nenhuma mensalidade vencida. Todos em dia.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='pl-6'>Jogador</TableHead>
                  <TableHead>Meses em atraso</TableHead>
                  <TableHead className='pr-6 text-right'>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.debtors.map((d) => (
                  <TableRow key={d.playerId}>
                    <TableCell className='pl-6'>
                      <Link
                        href={`/players/${d.playerId}`}
                        className='font-semibold underline decoration-border underline-offset-4 hover:decoration-primary print:no-underline'
                      >
                        {d.nickname}
                      </Link>
                      {d.shirtNumber !== null && (
                        <span className='ml-2 text-sm text-muted-foreground'>
                          camisa {d.shirtNumber}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className='whitespace-normal'>
                      {d.months.map(formatReferenceMonthShort).join(', ')}
                    </TableCell>
                    <TableCell className='pr-6 text-right tabular-nums'>
                      {formatCents(d.totalCents)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell className='pl-6 font-semibold' colSpan={2}>
                    Total em atraso
                  </TableCell>
                  <TableCell className='pr-6 text-right font-semibold tabular-nums text-error'>
                    {formatCents(debtTotal)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          )}
        </section>

        <section className='rounded-lg border bg-card'>
          <h2 className='heading px-6 pt-6 pb-2 text-lg'>Lançamentos do mês</h2>
          {transactions.length === 0 ? (
            <p className='px-6 pb-6 text-muted-foreground'>Nenhum lançamento.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='pl-6'>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className='pr-6 text-right'>Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className='pl-6 tabular-nums'>
                      {formatLocalDate(t.date)}
                    </TableCell>
                    <TableCell className='whitespace-normal'>{t.description}</TableCell>
                    <TableCell className='text-muted-foreground'>{t.category}</TableCell>
                    <TableCell
                      className={cn(
                        'pr-6 text-right font-medium tabular-nums',
                        t.type === 'entrada' ? 'text-success' : 'text-error'
                      )}
                    >
                      {t.type === 'entrada' ? '+ ' : '− '}
                      {formatCents(t.amountCents)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </section>

        <p className='mt-8 text-sm text-muted-foreground'>
          Gerado em {formatLocalDate(new Date())} por {session.user.name}.
        </p>
      </main>
    </div>
  );
}
