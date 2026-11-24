'use client';

import { useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { deleteCard } from '@/lib/actions/cards';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

export function DeleteCardButton({ id, label }: { id: string; label: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant='ghost'
      size='sm'
      disabled={isPending}
      onClick={() => {
        if (!window.confirm(`Excluir ${label}? Use só para registros feitos por engano.`)) {
          return;
        }
        startTransition(async () => {
          const result = await deleteCard(id);
          toast({
            title: result.message,
            variant: result.ok ? 'default' : 'destructive',
          });
        });
      }}
    >
      {isPending && <Loader2 className='animate-spin' />}
      Excluir
    </Button>
  );
}
