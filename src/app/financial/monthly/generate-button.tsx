'use client';

import { useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { generateMonthlies } from '@/lib/actions/monthly';
import { Button, type ButtonProps } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

export function GenerateButton({
  month,
  children,
  variant,
}: {
  month: string;
  children: React.ReactNode;
  variant?: ButtonProps['variant'];
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant={variant}
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const result = await generateMonthlies(month);
          toast({
            title: result.message,
            variant: result.ok ? 'default' : 'destructive',
          });
        })
      }
    >
      {isPending && <Loader2 className='animate-spin' />}
      {children}
    </Button>
  );
}
