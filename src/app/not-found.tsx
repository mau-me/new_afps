import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className='mx-auto flex min-h-screen max-w-xl flex-col justify-center px-4'>
      <p className='numeral text-4xl text-primary'>404</p>
      <h1 className='heading mt-4 text-2xl'>Página não encontrada</h1>
      <p className='mt-2 text-muted-foreground'>
        O endereço pode ter mudado ou a página ainda não existe.
      </p>
      <div className='mt-8 flex flex-col gap-2 sm:flex-row'>
        <Button asChild>
          <Link href='/dashboard'>Ir para o dashboard</Link>
        </Button>
        <Button variant='outline' asChild>
          <Link href='/'>Página inicial</Link>
        </Button>
      </div>
    </main>
  );
}
