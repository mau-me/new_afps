import { Navbar } from '@/components/navbar';
import { requireRole } from '@/lib/session';
import { TransactionForm } from './transaction-form';

export default async function NewTransactionPage() {
  await requireRole('comissao');

  return (
    <div className='min-h-screen'>
      <Navbar />
      <main className='mx-auto max-w-3xl px-4 py-8 md:py-12'>
        <header className='mb-8'>
          <h1 className='heading text-xl md:text-2xl'>Novo lançamento</h1>
          <p className='mt-1 text-muted-foreground'>
            Registre uma entrada ou saída do caixa. Pagamentos de mensalidade
            são lançados automaticamente.
          </p>
        </header>
        <section className='rounded-lg border bg-card p-6 md:p-8'>
          <TransactionForm />
        </section>
      </main>
    </div>
  );
}
