'use client';

import { useActionState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { createUser, type UserFormState } from '@/lib/actions/auth';
import { FormField } from '@/components/form-field';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PASSWORD_MIN_LENGTH } from '@/lib/validation';

const initialState: UserFormState = {};

export function CreateUserForm() {
  const [state, formAction, isPending] = useActionState(createUser, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const v = state.values ?? {};
  const err = state.errors ?? {};

  // Limpa o formulário depois de criar a conta.
  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className='space-y-6'>
      <div className='grid gap-6 sm:grid-cols-2'>
        <FormField name='name' label='Nome' defaultValue={v.name} error={err.name} required />
        <FormField
          name='email'
          label='Email'
          type='email'
          autoComplete='off'
          defaultValue={v.email}
          error={err.email}
          required
        />
        <FormField
          name='password'
          label='Senha inicial'
          type='password'
          autoComplete='new-password'
          minLength={PASSWORD_MIN_LENGTH}
          error={err.password}
          hint={`Mínimo de ${PASSWORD_MIN_LENGTH} caracteres. Passe para a pessoa em particular.`}
          required
        />
        <div className='space-y-2'>
          <Label htmlFor='role'>Papel</Label>
          <select
            id='role'
            name='role'
            defaultValue={v.role || 'comissao'}
            className='flex h-11 w-full rounded-md border border-input bg-card px-3 text-base text-foreground focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-primary/30'
          >
            <option value='comissao'>Comissão</option>
            <option value='jogador'>Jogador</option>
          </select>
          {err.role && <p className='text-sm font-medium text-error'>{err.role}</p>}
        </div>
      </div>

      {state.message && (
        <Alert variant={state.ok ? 'success' : 'destructive'}>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      <div className='flex justify-end border-t pt-6'>
        <Button type='submit' disabled={isPending}>
          {isPending && <Loader2 className='animate-spin' />}
          Criar conta
        </Button>
      </div>
    </form>
  );
}
