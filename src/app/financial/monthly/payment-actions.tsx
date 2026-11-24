'use client';

import { useState, useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { registerPayment, undoPayment } from '@/lib/actions/monthly';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { todayISO } from '@/lib/months';

/** Registrar pagamento (com a data em que foi pago) ou desfazer. */
export function PaymentActions({
  monthlyId,
  status,
  nickname,
}: {
  monthlyId: string;
  status: 'pago' | 'em_aberto';
  nickname: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [date, setDate] = useState(() => todayISO());

  const run = (action: () => Promise<{ ok: boolean; message: string }>) =>
    startTransition(async () => {
      const result = await action();
      toast({
        title: result.message,
        variant: result.ok ? 'default' : 'destructive',
      });
    });

  if (status === 'pago') {
    return (
      <Button
        variant='ghost'
        size='sm'
        disabled={isPending}
        onClick={() => {
          if (
            window.confirm(
              `Desfazer o pagamento de ${nickname}? A entrada no caixa também será removida.`
            )
          ) {
            run(() => undoPayment(monthlyId));
          }
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
        run(() => registerPayment(monthlyId, date));
      }}
    >
      <label className='sr-only' htmlFor={`paid-at-${monthlyId}`}>
        Data do pagamento de {nickname}
      </label>
      <input
        id={`paid-at-${monthlyId}`}
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
