import { MonthlyStatusBadge } from '@/components/monthly-status-badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { PlayerMonthly } from '@/lib/data/players';
import { formatLocalDate, formatReferenceMonth } from '@/lib/months';
import { formatCents } from '@/lib/utils';

/** Histórico de mensalidades de um jogador. */
export function MonthlyHistory({
  monthlies,
  emptyMessage,
}: {
  monthlies: PlayerMonthly[];
  emptyMessage: string;
}) {
  if (monthlies.length === 0) {
    return <p className='px-6 py-8 text-muted-foreground'>{emptyMessage}</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className='pl-6'>Mês</TableHead>
          <TableHead>Valor</TableHead>
          <TableHead>Vencimento</TableHead>
          <TableHead className='pr-6'>Situação</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {monthlies.map((m) => (
          <TableRow key={m.id}>
            <TableCell className='pl-6 font-medium first-letter:uppercase'>
              {formatReferenceMonth(m.referenceMonth)}
            </TableCell>
            <TableCell className='tabular-nums'>
              {formatCents(m.amountCents)}
            </TableCell>
            <TableCell className='tabular-nums'>
              {formatLocalDate(m.dueDate)}
            </TableCell>
            <TableCell className='pr-6'>
              <MonthlyStatusBadge
                status={m.status}
                isOverdue={m.isOverdue}
                paymentDate={m.paymentDate}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
