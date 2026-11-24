'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className='mx-auto flex min-h-screen max-w-xl flex-col justify-center px-4'>
      <h1 className='heading text-2xl'>Não foi possível carregar esta página</h1>
      <p className='mt-2 text-muted-foreground'>
        Pode ser uma falha momentânea de conexão com o servidor. Tente de novo;
        se continuar, avise a comissão.
      </p>
      {error.digest && (
        <p className='mt-2 text-sm text-muted-foreground'>
          Código do erro: {error.digest}
        </p>
      )}
      <div className='mt-8 flex flex-col gap-2 sm:flex-row'>
        <Button onClick={reset}>Tentar de novo</Button>
        <Button variant='outline' asChild>
          <Link href='/'>Página inicial</Link>
        </Button>
      </div>
    </main>
  );
}
