import { ActionButton } from '@/components/action-button';
import { Navbar } from '@/components/navbar';
import { SettingsTabs } from '@/components/settings-tabs';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { revokeCpf } from '@/lib/actions/settings';
import { listAllowedUsers } from '@/lib/data/settings';
import { requireRole } from '@/lib/session';
import { formatCPF } from '@/lib/utils';
import { AllowCpfForm } from './allow-cpf-form';

export default async function AllowedPage() {
  await requireRole('comissao');
  const rows = await listAllowedUsers();
  const available = rows.filter((r) => !r.isUsed).length;

  return (
    <div className='min-h-screen'>
      <Navbar />
      <main className='mx-auto max-w-6xl px-4 py-8 md:py-12'>
        <SettingsTabs active='cpfs' />
        <h1 className='heading text-xl md:text-2xl'>CPFs liberados</h1>
        <p className='mt-1 mb-8 max-w-prose text-muted-foreground'>
          Só quem tem o CPF nesta lista consegue criar conta. Cadastrar um
          jogador já libera o CPF dele; use o formulário abaixo para outros
          casos. {available} disponíve{available === 1 ? 'l' : 'is'} para
          cadastro.
        </p>

        <section className='mb-8 rounded-lg border bg-card'>
          {rows.length === 0 ? (
            <p className='px-6 py-10 text-muted-foreground'>Nenhum CPF liberado.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='pl-6'>Nome</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead className='pr-6 text-right'>
                    <span className='sr-only'>Ações</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className='pl-6 font-medium'>{r.name}</TableCell>
                    <TableCell className='tabular-nums'>{formatCPF(r.cpf)}</TableCell>
                    <TableCell>
                      <Badge variant={r.isUsed ? 'outline' : 'success'}>
                        {r.isUsed ? 'Conta criada' : 'Disponível'}
                      </Badge>
                    </TableCell>
                    <TableCell className='pr-6'>
                      {!r.isUsed && (
                        <div className='flex justify-end'>
                          <ActionButton
                            action={revokeCpf.bind(null, r.id)}
                            confirm={`Remover a liberação de ${r.name}? A pessoa não conseguirá criar conta com este CPF.`}
                          >
                            Remover
                          </ActionButton>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </section>

        <section className='rounded-lg border bg-card p-6 md:p-8'>
          <h2 className='heading mb-6 text-lg'>Liberar CPF</h2>
          <AllowCpfForm />
        </section>
      </main>
    </div>
  );
}
