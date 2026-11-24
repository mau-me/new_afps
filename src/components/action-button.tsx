'use client';

import type React from 'react';
import { useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

type Result = { ok: boolean; message: string };

/**
 * Botão que executa uma server action (já ligada via .bind), com confirmação
 * opcional e o resultado num aviso.
 */
export function ActionButton({
  action,
  confirm,
  children,
  variant = 'ghost',
  size = 'sm',
}: {
  action: () => Promise<Result>;
  confirm?: string;
  children: React.ReactNode;
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant={variant}
      size={size}
      disabled={isPending}
      onClick={() => {
        if (confirm && !window.confirm(confirm)) return;
        startTransition(async () => {
          const result = await action();
          toast({
            title: result.message,
            variant: result.ok ? 'default' : 'destructive',
          });
        });
      }}
    >
      {isPending && <Loader2 className='animate-spin' />}
      {children}
    </Button>
  );
}
