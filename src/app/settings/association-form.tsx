'use client';

import { useActionState } from 'react';
import { Loader2 } from 'lucide-react';
import { updateAssociation, type FormState } from '@/lib/actions/settings';
import { FormField } from '@/components/form-field';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const initialState: FormState = {};

export function AssociationForm({ initial }: { initial: Record<string, string> }) {
  const [state, formAction, isPending] = useActionState(updateAssociation, initialState);
  const v = state.values ?? initial;
  const err = state.errors ?? {};

  return (
    <form action={formAction} className='space-y-6'>
      <div className='grid gap-6 sm:grid-cols-2'>
        <FormField
          name='name'
          label='Nome da associação'
          defaultValue={v.name}
          error={err.name}
          required
          className='sm:col-span-2'
        />

        <div className='space-y-2 sm:col-span-2'>
          <Label htmlFor='description'>Descrição</Label>
          <textarea
            id='description'
            name='description'
            rows={4}
            defaultValue={v.description}
            required
            aria-invalid={Boolean(err.description)}
            aria-describedby={err.description ? 'description-error' : 'description-hint'}
            className='flex w-full rounded-md border border-input bg-card px-3 py-2 text-base text-foreground focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-primary/30 aria-[invalid=true]:border-error'
          />
          {err.description ? (
            <p id='description-error' className='text-sm font-medium text-error'>
              {err.description}
            </p>
          ) : (
            <p id='description-hint' className='text-sm text-muted-foreground'>
              Aparece na abertura da página inicial.
            </p>
          )}
        </div>

        <FormField
          name='gameSchedule'
          label='Quando são os jogos'
          placeholder='Domingos pela manhã'
          defaultValue={v.gameSchedule}
          error={err.gameSchedule}
          required
        />
        <FormField
          name='phone'
          label='Telefone'
          type='tel'
          defaultValue={v.phone}
          error={err.phone}
          required
        />
        <FormField
          name='email'
          label='Email de contato'
          type='email'
          defaultValue={v.email}
          error={err.email}
          required
        />
        <FormField
          name='address'
          label='Endereço'
          defaultValue={v.address}
          error={err.address}
          required
        />

        <div className='space-y-2 sm:col-span-2'>
          <Label htmlFor='commission'>Membros da comissão</Label>
          <textarea
            id='commission'
            name='commission'
            rows={4}
            defaultValue={v.commission}
            aria-invalid={Boolean(err.commission)}
            aria-describedby={err.commission ? 'commission-error' : 'commission-hint'}
            className='flex w-full rounded-md border border-input bg-card px-3 py-2 text-base text-foreground focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-primary/30 aria-[invalid=true]:border-error'
          />
          {err.commission ? (
            <p id='commission-error' className='text-sm font-medium text-error'>
              {err.commission}
            </p>
          ) : (
            <p id='commission-hint' className='text-sm text-muted-foreground'>
              Um nome por linha. Aparece na página inicial.
            </p>
          )}
        </div>

        <FormField
          name='instagram'
          label='Instagram (opcional)'
          placeholder='https://instagram.com/...'
          defaultValue={v.instagram}
          error={err.instagram}
        />
        <FormField
          name='facebook'
          label='Facebook (opcional)'
          placeholder='https://facebook.com/...'
          defaultValue={v.facebook}
          error={err.facebook}
        />
        <FormField
          name='twitter'
          label='X / Twitter (opcional)'
          placeholder='https://x.com/...'
          defaultValue={v.twitter}
          error={err.twitter}
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
          Salvar dados
        </Button>
      </div>
    </form>
  );
}
