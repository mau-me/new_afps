'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { createCard, type CardFormState } from '@/lib/actions/cards';
import { CardGlyph } from '@/components/card-glyph';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { todayISO } from '@/lib/months';
import { cn } from '@/lib/utils';

const initialState: CardFormState = {};

type Color = 'amarelo' | 'vermelho';

function centsToInput(cents: number) {
  return cents > 0 ? (cents / 100).toFixed(2).replace('.', ',') : '';
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className='text-sm font-medium text-error'>
      {message}
    </p>
  );
}

export function CardForm({
  players,
  fees,
  defaultPlayerId,
  returnTo,
}: {
  players: { id: string; label: string }[];
  fees: Record<Color, number>;
  defaultPlayerId?: string;
  returnTo: string;
}) {
  const [state, formAction, isPending] = useActionState(createCard, initialState);
  const v = state.values ?? {};
  const err = state.errors ?? {};

  const [color, setColor] = useState<Color>(
    v.color === 'vermelho' ? 'vermelho' : 'amarelo'
  );
  // O valor sugerido acompanha a cor, até a pessoa editar o campo.
  const [amount, setAmount] = useState(v.amount ?? centsToInput(fees.amarelo));
  const [amountTouched, setAmountTouched] = useState(Boolean(v.amount));

  const chooseColor = (next: Color) => {
    setColor(next);
    if (!amountTouched) setAmount(centsToInput(fees[next]));
  };

  return (
    <form action={formAction} className='space-y-6'>
      <input type='hidden' name='returnTo' value={returnTo} />

      <fieldset>
        <legend className='mb-2 text-sm font-medium'>Cartão</legend>
        <div className='grid grid-cols-2 gap-2'>
          {(['amarelo', 'vermelho'] as const).map((c) => (
            <label
              key={c}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-md border border-input bg-card px-4 py-3 transition-colors hover:bg-muted has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring',
                color === c &&
                  (c === 'amarelo'
                    ? 'border-warning bg-warning/10 ring-1 ring-warning'
                    : 'border-error bg-error/5 ring-1 ring-error')
              )}
            >
              <input
                type='radio'
                name='color'
                value={c}
                checked={color === c}
                onChange={() => chooseColor(c)}
                className='sr-only'
              />
              <CardGlyph color={c} size='lg' />
              <span className='font-semibold'>
                {c === 'amarelo' ? 'Amarelo' : 'Vermelho'}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className='grid gap-6 sm:grid-cols-2'>
        <div className='space-y-2 sm:col-span-2'>
          <Label htmlFor='playerId'>Jogador</Label>
          <select
            id='playerId'
            name='playerId'
            defaultValue={v.playerId ?? defaultPlayerId ?? ''}
            required
            aria-invalid={Boolean(err.playerId)}
            aria-describedby={err.playerId ? 'playerId-error' : undefined}
            className='flex h-11 w-full rounded-md border border-input bg-card px-3 text-base text-foreground focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-primary/30 aria-[invalid=true]:border-error'
          >
            <option value='' disabled>
              Selecione
            </option>
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
          <FieldError id='playerId-error' message={err.playerId} />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='amount'>Valor da multa</Label>
          <div className='relative'>
            <span className='pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground'>
              R$
            </span>
            <Input
              id='amount'
              name='amount'
              inputMode='decimal'
              placeholder='0,00'
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setAmountTouched(true);
              }}
              aria-invalid={Boolean(err.amount)}
              aria-describedby={err.amount ? 'amount-error' : undefined}
              className='pl-10'
              required
            />
          </div>
          <FieldError id='amount-error' message={err.amount} />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='date'>Data do jogo</Label>
          <Input
            id='date'
            name='date'
            type='date'
            max={todayISO()}
            defaultValue={v.date ?? todayISO()}
            aria-invalid={Boolean(err.date)}
            aria-describedby={err.date ? 'date-error' : undefined}
            required
          />
          <FieldError id='date-error' message={err.date} />
        </div>

        <div className='space-y-2 sm:col-span-2'>
          <Label htmlFor='description'>Observação (opcional)</Label>
          <Input
            id='description'
            name='description'
            placeholder='Ex.: Jogo contra o Mar Grande'
            maxLength={140}
            defaultValue={v.description}
            aria-invalid={Boolean(err.description)}
            aria-describedby={err.description ? 'description-error' : undefined}
          />
          <FieldError id='description-error' message={err.description} />
        </div>
      </div>

      {state.message && !Object.keys(err).length && (
        <Alert variant='destructive'>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      <div className='flex flex-col-reverse gap-2 border-t pt-6 sm:flex-row sm:justify-end'>
        <Button variant='outline' asChild>
          <Link href={returnTo}>Cancelar</Link>
        </Button>
        <Button type='submit' disabled={isPending}>
          {isPending && <Loader2 className='animate-spin' />}
          Registrar cartão
        </Button>
      </div>
    </form>
  );
}
