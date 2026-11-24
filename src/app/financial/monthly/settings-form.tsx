'use client';

import { useActionState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  updateMonthlySettings,
  type SettingsState,
} from '@/lib/actions/monthly';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

const initialState: SettingsState = {};

export function SettingsForm({
  defaultFee,
  defaultDueDay,
}: {
  /** Valor atual já formatado para edição ("30,00"), ou vazio. */
  defaultFee: string;
  defaultDueDay: number;
}) {
  const [state, formAction, isPending] = useActionState(
    updateMonthlySettings,
    initialState
  );
  const err = state.errors ?? {};

  return (
    <form action={formAction} className='space-y-4'>
      <div className='grid gap-4 sm:grid-cols-2'>
        <div className='space-y-2'>
          <Label htmlFor='fee'>Valor da mensalidade</Label>
          <div className='relative'>
            <span className='pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground'>
              R$
            </span>
            <Input
              id='fee'
              name='fee'
              inputMode='decimal'
              placeholder='30,00'
              defaultValue={state.values?.fee ?? defaultFee}
              aria-invalid={Boolean(err.fee)}
              aria-describedby={err.fee ? 'fee-error' : undefined}
              className='pl-10'
              required
            />
          </div>
          {err.fee && (
            <p id='fee-error' className='text-sm font-medium text-error'>
              {err.fee}
            </p>
          )}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='dueDay'>Vence todo dia</Label>
          <Input
            id='dueDay'
            name='dueDay'
            type='number'
            min={1}
            max={28}
            defaultValue={state.values?.dueDay ?? defaultDueDay}
            aria-invalid={Boolean(err.dueDay)}
            aria-describedby={err.dueDay ? 'dueDay-error' : 'dueDay-hint'}
            required
          />
          {err.dueDay ? (
            <p id='dueDay-error' className='text-sm font-medium text-error'>
              {err.dueDay}
            </p>
          ) : (
            <p id='dueDay-hint' className='text-sm text-muted-foreground'>
              De 1 a 28, para valer em todos os meses.
            </p>
          )}
        </div>
      </div>

      {state.message && (
        <Alert variant={state.ok ? 'success' : 'destructive'}>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      <Button type='submit' disabled={isPending}>
        {isPending && <Loader2 className='animate-spin' />}
        Salvar valor
      </Button>
    </form>
  );
}
