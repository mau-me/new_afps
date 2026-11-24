'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { createPlayer, type CreatePlayerState } from '@/lib/actions/players';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PLAYER_POSITIONS } from '@/lib/validation';
import { formatCPF } from '@/lib/utils';

const initialState: CreatePlayerState = {};

export function NewPlayerForm() {
  const [state, formAction, isPending] = useActionState(
    createPlayer,
    initialState
  );
  const v = state.values ?? {};
  const err = state.errors ?? {};

  const field = (
    name: string,
    label: string,
    props: React.ComponentProps<typeof Input> = {}
  ) => (
    <div className='space-y-2'>
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        defaultValue={v[name]}
        aria-invalid={Boolean(err[name])}
        aria-describedby={err[name] ? `${name}-error` : undefined}
        required
        {...props}
      />
      {err[name] && (
        <p id={`${name}-error`} className='text-sm font-medium text-error'>
          {err[name]}
        </p>
      )}
    </div>
  );

  return (
    <form action={formAction} className='space-y-6'>
      <div className='grid gap-6 sm:grid-cols-2'>
        {field('fullName', 'Nome completo')}
        {field('nickname', 'Apelido')}
        {field('cpf', 'CPF', {
          placeholder: '000.000.000-00',
          inputMode: 'numeric',
          maxLength: 14,
          onChange: (e) => {
            e.currentTarget.value = formatCPF(e.currentTarget.value);
          },
        })}
        {field('birthDate', 'Data de nascimento', { type: 'date' })}

        <div className='space-y-2'>
          <Label htmlFor='position'>Posição</Label>
          <select
            id='position'
            name='position'
            defaultValue={v.position ?? ''}
            required
            aria-invalid={Boolean(err.position)}
            className='flex h-11 w-full rounded-md border border-input bg-card px-3 text-base text-foreground focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-primary/30 aria-[invalid=true]:border-error'
          >
            <option value='' disabled>
              Selecione
            </option>
            {PLAYER_POSITIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          {err.position && (
            <p className='text-sm font-medium text-error'>{err.position}</p>
          )}
        </div>

        {field('shirtNumber', 'Número da camisa', {
          type: 'number',
          min: 1,
          max: 99,
        })}
        {field('phone', 'Telefone', {
          type: 'tel',
          placeholder: '(71) 99999-9999',
        })}
        {field('address', 'Endereço')}
      </div>

      {state.message && (
        <Alert variant='destructive'>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      <p className='max-w-prose text-sm text-muted-foreground'>
        Ao cadastrar, o CPF fica liberado para o jogador criar sua própria
        conta em &quot;Cadastrar-se&quot;.
      </p>

      <div className='flex flex-col-reverse gap-2 border-t pt-6 sm:flex-row sm:justify-end'>
        <Button variant='outline' asChild>
          <Link href='/players'>Cancelar</Link>
        </Button>
        <Button type='submit' disabled={isPending}>
          {isPending && <Loader2 className='animate-spin' />}
          Cadastrar jogador
        </Button>
      </div>
    </form>
  );
}
