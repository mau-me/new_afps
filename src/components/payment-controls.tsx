'use client';

import { useState, useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { todayISO } from '@/lib/months';

type Result = { ok: boolean; message: string };

/**
 * Registrar pagamento (com a data em que foi pago) ou desfazer.
 * `pay` e `undo` são server actions já ligadas ao item (via .bind).
 */
export function PaymentControls({
  id,
  isPaid,
  pay,
  undo,
  dateLabel,
  undoConfirm,
}: {
  id: string;
  isPaid: boolean;
  pay: (paymentDate: string) => Promise<Result>;
  undo: () => Promise<Result>;
  /** Rótulo acessível do campo de data, ex.: "Data do pagamento de Carlão". */
  dateLabel: string;
  /** Pergunta de confirmação antes de desfazer. */
  undoConfirm: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [date, setDate] = useState(() => todayISO());

  const run = (action: () => Promise<Result>) =>
    startTransition(async () => {
      const result = await action();
      toast({
        title: result.message,
        variant: result.ok ? 'default' : 'destructive',
      });
    });

  if (isPaid) {
    return (
      <Button
        variant='ghost'
        size='sm'
        disabled={isPending}
        onClick={() => {
          if (window.confirm(undoConfirm)) run(undo);
        }}
      >
        {isPending && <Loader2 className='animate-spin' />}
        Desfazer
      </Button>
    );
  }

  return (
    <form
      className='flex items-center gap-2'
      onSubmit={(e) => {
        e.preventDefault();
        run(() => pay(date));
      }}
    >
      <label className='sr-only' htmlFor={`paid-at-${id}`}>
        {dateLabel}
      </label>
      <input
        id={`paid-at-${id}`}
        type='date'
        value={date}
        max={todayISO()}
        onChange={(e) => setDate(e.target.value)}
        required
        className='h-9 rounded-md border border-input bg-card px-2 text-sm text-foreground focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-primary/30'
      />
      <Button type='submit' size='sm' disabled={isPending}>
        {isPending && <Loader2 className='animate-spin' />}
        Registrar pagamento
      </Button>
    </form>
  );
}
