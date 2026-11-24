import { Badge } from '@/components/ui/badge';
import { formatLocalDate } from '@/lib/months';

/** Situação de uma mensalidade com o cartão do árbitro correspondente. */
export function MonthlyStatusBadge({
  status,
  isOverdue,
  paymentDate,
}: {
  status: 'pago' | 'em_aberto';
  isOverdue: boolean;
  paymentDate: string | null;
}) {
  if (status === 'pago') {
    return (
      <Badge variant='success'>
        Paga{paymentDate && ` em ${formatLocalDate(paymentDate)}`}
      </Badge>
    );
  }
  if (isOverdue) return <Badge variant='destructive'>Vencida</Badge>;
  return <Badge variant='warning'>Em aberto</Badge>;
}
