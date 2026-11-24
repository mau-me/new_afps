'use client';

import { useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { setPlayerActive } from '@/lib/actions/players';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

export function ActiveToggle({
  playerId,
  isActive,
  nickname,
}: {
  playerId: string;
  isActive: boolean;
  nickname: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant={isActive ? 'outline' : 'default'}
      disabled={isPending}
      onClick={() => {
        if (
          isActive &&
          !window.confirm(
            `Desativar ${nickname}? Ele deixa de receber novas mensalidades. As já geradas continuam valendo.`
          )
        ) {
          return;
        }
        startTransition(async () => {
          const result = await setPlayerActive(playerId, !isActive);
          toast({
            title: result.message,
            variant: result.ok ? 'default' : 'destructive',
          });
        });
      }}
    >
      {isPending && <Loader2 className='animate-spin' />}
      {isActive ? 'Desativar' : 'Reativar'}
    </Button>
  );
}
