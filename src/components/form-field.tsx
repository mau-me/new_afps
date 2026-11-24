import type React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

/** Campo de formulário com rótulo, erro e dica ligados para leitores de tela. */
export function FormField({
  name,
  label,
  error,
  hint,
  className,
  prefix,
  ...inputProps
}: {
  name: string;
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  /** Texto fixo à esquerda dentro do campo, ex.: "R$". */
  prefix?: string;
} & Omit<React.ComponentProps<typeof Input>, 'name' | 'prefix'>) {
  const describedBy = error ? `${name}-error` : hint ? `${name}-hint` : undefined;

  const input = (
    <Input
      id={name}
      name={name}
      aria-invalid={Boolean(error)}
      aria-describedby={describedBy}
      className={cn(prefix && 'pl-10')}
      {...inputProps}
    />
  );

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={name}>{label}</Label>
      {prefix ? (
        <div className='relative'>
          <span className='pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground'>
            {prefix}
          </span>
          {input}
        </div>
      ) : (
        input
      )}
      {error ? (
        <p id={`${name}-error`} className='text-sm font-medium text-error'>
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${name}-hint`} className='text-sm text-muted-foreground'>
            {hint}
          </p>
        )
      )}
    </div>
  );
}
