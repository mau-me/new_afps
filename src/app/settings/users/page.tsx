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
import { setUserRole, updateUserStatus } from '@/lib/actions/auth';
import { listUsers } from '@/lib/data/settings';
import { requireRole } from '@/lib/session';
import { CreateUserForm } from './create-user-form';

export default async function UsersPage() {
  const session = await requireRole('comissao');
  const users = await listUsers();

  return (
    <div className='min-h-screen'>
      <Navbar />
      <main className='mx-auto max-w-6xl px-4 py-8 md:py-12'>
        <SettingsTabs active='usuarios' />
        <h1 className='heading text-xl md:text-2xl'>Usuários</h1>
        <p className='mt-1 mb-8 max-w-prose text-muted-foreground'>
          Contas com acesso ao sistema. Jogadores criam a própria conta com o
          CPF liberado; aqui você cria contas da comissão, muda papéis e
          desativa acessos.
        </p>

        <section className='mb-8 rounded-lg border bg-card'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='pl-6'>Nome</TableHead>
                <TableHead>Papel</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead className='pr-6 text-right'>
                  <span className='sr-only'>Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => {
                const isSelf = u.id === session.user.id;
                return (
                  <TableRow key={u.id}>
                    <TableCell className='pl-6'>
                      <div className='font-semibold'>
                        {u.name}
                        {isSelf && (
                          <span className='ml-2 text-sm font-normal text-muted-foreground'>
                            (você)
                          </span>
                        )}
                      </div>
                      <div className='text-sm text-muted-foreground'>{u.email}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.role === 'comissao' ? 'default' : 'outline'}>
                        {u.role === 'comissao' ? 'Comissão' : 'Jogador'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.isActive ? 'success' : 'destructive'}>
                        {u.isActive ? 'Ativa' : 'Desativada'}
                      </Badge>
                    </TableCell>
                    <TableCell className='pr-6'>
                      {!isSelf && (
                        <div className='flex flex-wrap justify-end gap-1'>
                          <ActionButton
                            action={setUserRole.bind(
                              null,
                              u.id,
                              u.role === 'comissao' ? 'jogador' : 'comissao'
                            )}
                            confirm={
                              u.role === 'comissao'
                                ? `Tirar ${u.name} da comissão? A pessoa perde acesso ao financeiro e às configurações.`
                                : `Colocar ${u.name} na comissão? A pessoa passa a ver e alterar o financeiro.`
                            }
                          >
                            {u.role === 'comissao' ? 'Tornar jogador' : 'Tornar comissão'}
                          </ActionButton>
                          <ActionButton
                            action={updateUserStatus.bind(null, u.id, !u.isActive)}
                            confirm={
                              u.isActive
                                ? `Desativar a conta de ${u.name}? O acesso é bloqueado em instantes.`
                                : undefined
                            }
                          >
                            {u.isActive ? 'Desativar' : 'Reativar'}
                          </ActionButton>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </section>

        <section className='rounded-lg border bg-card p-6 md:p-8'>
          <h2 className='heading text-lg'>Criar conta</h2>
          <p className='mt-1 mb-6 text-sm text-muted-foreground'>
            Para novos membros da comissão ou quem não tem CPF liberado.
          </p>
          <CreateUserForm />
        </section>
      </main>
    </div>
  );
}
