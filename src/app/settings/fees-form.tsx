'use client';

import { useActionState } from 'react';
import { Loader2 } from 'lucide-react';
import { updateFees, type FormState } from '@/lib/actions/settings';
import { FormField } from '@/components/form-field';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

const initialState: FormState = {};

export function FeesForm({ initial }: { initial: Record<string, string> }) {
  const [state, formAction, isPending] = useActionState(updateFees, initialState);
  const v = state.values ?? initial;
  const err = state.errors ?? {};

  return (
    <form action={formAction} className='space-y-6'>
      <div className='grid gap-6 sm:grid-cols-2'>
        <FormField
          name='monthlyFee'
          label='Mensalidade'
          prefix='R$'
          inputMode='decimal'
          placeholder='0,00'
          defaultValue={v.monthlyFee}
          error={err.monthlyFee}
          hint='Vazio = ainda não definida.'
        />
        <FormField
          name='dueDay'
          label='Vence todo dia'
          type='number'
          min={1}
          max={28}
          defaultValue={v.dueDay}
          error={err.dueDay}
          hint='De 1 a 28.'
          required
        />
        <FormField
          name='yellowCardFee'
          label='Multa do cartão amarelo'
          prefix='R$'
          inputMode='decimal'
          placeholder='0,00'
          defaultValue={v.yellowCardFee}
          error={err.yellowCardFee}
          hint='Valor sugerido ao registrar o cartão.'
        />
        <FormField
          name='redCardFee'
          label='Multa do cartão vermelho'
          prefix='R$'
          inputMode='decimal'
          placeholder='0,00'
          defaultValue={v.redCardFee}
          error={err.redCardFee}
          hint='Valor sugerido ao registrar o cartão.'
        />
      </div>

      {state.message && (
        <Alert variant={state.ok ? 'success' : 'destructive'}>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      <div className='flex justify-end border-t pt-6'>
        <Button type='submit' disabled={isPending}>
          {isPending && <Loader2 className='animate-spin' />}
          Salvar valores
        </Button>
      </div>
    </form>
  );
}
