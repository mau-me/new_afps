'use client';

import { useActionState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { allowCpf, type FormState } from '@/lib/actions/settings';
import { FormField } from '@/components/form-field';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { formatCPF } from '@/lib/utils';

const initialState: FormState = {};

export function AllowCpfForm() {
  const [state, formAction, isPending] = useActionState(allowCpf, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const v = state.values ?? {};
  const err = state.errors ?? {};

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className='space-y-6'>
      <div className='grid gap-6 sm:grid-cols-2'>
        <FormField name='name' label='Nome' defaultValue={v.name} error={err.name} required />
        <FormField
          name='cpf'
          label='CPF'
          placeholder='000.000.000-00'
          inputMode='numeric'
          maxLength={14}
          defaultValue={v.cpf}
          error={err.cpf}
          onChange={(e) => {
            e.currentTarget.value = formatCPF(e.currentTarget.value);
          }}
          required
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
          Liberar CPF
        </Button>
      </div>
    </form>
  );
}
