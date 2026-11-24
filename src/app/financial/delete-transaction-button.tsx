'use client';

import { useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { deleteTransaction } from '@/lib/actions/cash';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

export function DeleteTransactionButton({
  id,
  description,
}: {
  id: string;
  description: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant='ghost'
      size='sm'
      disabled={isPending}
      onClick={() => {
        if (!window.confirm(`Excluir o lançamento "${description}"?`)) return;
        startTransition(async () => {
          const result = await deleteTransaction(id);
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
