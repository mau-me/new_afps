import { Navbar } from '@/components/navbar';

/** Esqueleto de carregamento das páginas internas. */
export function PageSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className='min-h-screen'>
      <Navbar />
      <main
        className='mx-auto max-w-6xl px-4 py-8 md:py-12'
        aria-busy='true'
        aria-label='Carregando'
      >
        <div className='h-8 w-48 animate-pulse rounded-md bg-muted' />
        <div className='mt-2 h-5 w-72 max-w-full animate-pulse rounded-md bg-muted' />
        <div className='mt-8 space-y-px overflow-hidden rounded-lg border bg-border'>
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className='h-16 bg-card'>
              <div className='mx-6 mt-5 h-5 w-2/3 animate-pulse rounded-md bg-muted' />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
