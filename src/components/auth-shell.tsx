import type React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

/** Moldura das telas de entrada e cadastro. */
export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className='min-h-screen'>
      <div className='bg-primary text-primary-foreground'>
        <div className='mx-auto flex h-14 max-w-md items-center justify-between px-4'>
          <Link
            href='/'
            className='heading rounded-sm text-xl focus-visible:outline-primary-foreground'
          >
            AFPS
          </Link>
          <Link
            href='/'
            className='inline-flex items-center gap-1 rounded-sm text-sm text-primary-foreground/80 hover:text-primary-foreground focus-visible:outline-primary-foreground'
          >
            <ArrowLeft className='h-4 w-4' />
            Página inicial
          </Link>
        </div>
      </div>

      <main className='mx-auto max-w-md px-4 py-8 md:py-12'>
        <h1 className='heading text-2xl'>{title}</h1>
        <p className='mt-1 mb-8 text-muted-foreground'>{description}</p>
        <div className='rounded-lg border bg-card p-6'>{children}</div>
        {footer && (
          <p className='mt-6 text-sm text-muted-foreground'>{footer}</p>
        )}
      </main>
    </div>
  );
}
