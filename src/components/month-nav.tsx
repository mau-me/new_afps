import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  currentReferenceMonth,
  formatReferenceMonthShort,
  shiftMonth,
} from '@/lib/months';

/** ‹ mês anterior · [Mês atual] · próximo mês › */
export function MonthNav({
  month,
  hrefFor,
}: {
  month: string;
  /** Monta o link para outro mês, preservando os demais filtros. */
  hrefFor: (month: string) => string;
}) {
  const previous = shiftMonth(month, -1);
  const next = shiftMonth(month, 1);
  const current = currentReferenceMonth();

  return (
    <nav aria-label='Mês' className='flex items-center gap-2'>
      <Button variant='outline' size='sm' asChild>
        <Link href={hrefFor(previous)}>
          <ChevronLeft />
          {formatReferenceMonthShort(previous)}
        </Link>
      </Button>
      {month !== current && (
        <Button variant='ghost' size='sm' asChild>
          <Link href={hrefFor(current)}>Mês atual</Link>
        </Button>
      )}
      <Button variant='outline' size='sm' asChild>
        <Link href={hrefFor(next)}>
          {formatReferenceMonthShort(next)}
          <ChevronRight />
        </Link>
      </Button>
    </nav>
  );
}
