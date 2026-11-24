'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import {
  createTransaction,
  type TransactionFormState,
} from '@/lib/actions/cash';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { todayISO } from '@/lib/months';
import { cn } from '@/lib/utils';
import { manualCategories } from '@/lib/validation';

const initialState: TransactionFormState = {};

type TxType = 'entrada' | 'saida';

const TYPE_OPTIONS: { value: TxType; label: string; hint: string }[] = [
  { value: 'saida', label: 'Saída', hint: 'Dinheiro que saiu do caixa' },
  { value: 'entrada', label: 'Entrada', hint: 'Dinheiro que entrou no caixa' },
];

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className='text-sm font-medium text-error'>
      {message}
    </p>
  );
}

export function TransactionForm() {
  const [state, formAction, isPending] = useActionState(
    createTransaction,
    initialState
  );
  const v = state.values ?? {};
  const err = state.errors ?? {};

  const [type, setType] = useState<TxType>(
    v.type === 'entrada' ? 'entrada' : 'saida'
  );
  const categories = manualCategories(type);

  return (
    <form action={formAction} className='space-y-6'>
      {/* Tipo: dois botões de rádio grandes */}
      <fieldset>
        <legend className='mb-2 text-sm font-medium'>Tipo</legend>
        <div className='grid grid-cols-2 gap-2'>
          {TYPE_OPTIONS.map((opt) => {
            const checked = type === opt.value;
            return (
              <label
                key={opt.value}
                className={cn(
                  'flex cursor-pointer flex-col gap-1 rounded-md border border-input bg-card px-4 py-3 transition-colors hover:bg-muted has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring',
                  checked &&
                    (opt.value === 'entrada'
                      ? 'border-success bg-success/5 ring-1 ring-success'
                      : 'border-error bg-error/5 ring-1 ring-error')
                )}
              >
                <input
                  type='radio'
                  name='type'
                  value={opt.value}
                  checked={checked}
                  onChange={() => setType(opt.value)}
                  className='sr-only'
                />
                <span className='font-semibold'>{opt.label}</span>
                <span className='text-sm text-muted-foreground'>
                  {opt.hint}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className='grid gap-6 sm:grid-cols-2'>
        <div className='space-y-2'>
          <Label htmlFor='category'>Categoria</Label>
          <select
            // Recria o select ao trocar o tipo, para limpar a categoria.
            key={type}
            id='category'
            name='category'
            defaultValue={
              v.type === type && categories.includes(v.category ?? '')
                ? v.category
                : ''
            }
            required
            aria-invalid={Boolean(err.category)}
            aria-describedby={err.category ? 'category-error' : undefined}
            className='flex h-11 w-full rounded-md border border-input bg-card px-3 text-base text-foreground focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-primary/30 aria-[invalid=true]:border-error'
          >
            <option value='' disabled>
              Selecione
            </option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <FieldError id='category-error' message={err.category} />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='amount'>Valor</Label>
          <div className='relative'>
            <span className='pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground'>
              R$
            </span>
            <Input
              id='amount'
              name='amount'
              inputMode='decimal'
              placeholder='0,00'
              defaultValue={v.amount}
              aria-invalid={Boolean(err.amount)}
              aria-describedby={err.amount ? 'amount-error' : undefined}
              className='pl-10'
              required
            />
          </div>
          <FieldError id='amount-error' message={err.amount} />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='date'>Data</Label>
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
          <Label htmlFor='description'>Descrição</Label>
          <Input
            id='description'
            name='description'
            placeholder={
              type === 'saida'
                ? 'Ex.: Arbitragem do jogo contra o Mar Grande'
                : 'Ex.: Doação para os uniformes'
            }
            maxLength={140}
            defaultValue={v.description}
            aria-invalid={Boolean(err.description)}
            aria-describedby={err.description ? 'description-error' : undefined}
            required
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
          <Link href='/financial'>Cancelar</Link>
        </Button>
        <Button type='submit' disabled={isPending}>
          {isPending && <Loader2 className='animate-spin' />}
          Salvar lançamento
        </Button>
      </div>
    </form>
  );
}
