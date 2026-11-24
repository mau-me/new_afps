import Link from 'next/link';
import { UserPlus } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import dbConnect from '@/lib/mongodb';
import Player from '@/lib/models/Player';
import { requireSession } from '@/lib/session';
import { formatPhone } from '@/lib/utils';

export default async function PlayersPage() {
  const session = await requireSession();
  const isCommission = session.user.role === 'comissao';

  await dbConnect();
  // Dados pessoais (telefone, CPF, endereço) só são carregados para a comissão.
  const players = await Player.find(isCommission ? {} : { isActive: true })
    .select(
      isCommission
        ? 'fullName nickname position shirtNumber phone isActive userId'
        : 'nickname position shirtNumber'
    )
    .sort({ shirtNumber: 1 })
    .lean();

  return (
    <div className='min-h-screen'>
      <Navbar />
      <main className='mx-auto max-w-6xl px-4 py-8 md:py-12'>
        <header className='mb-8 flex flex-wrap items-end justify-between gap-4'>
          <div>
            <h1 className='heading text-xl md:text-2xl'>Jogadores</h1>
            <p className='mt-1 text-muted-foreground'>
              {players.length} jogador{players.length === 1 ? '' : 'es'}
              {isCommission ? ' cadastrados' : ' ativos'}
            </p>
          </div>
          {isCommission && (
            <Button asChild>
              <Link href='/players/new'>
                <UserPlus />
                Cadastrar jogador
              </Link>
            </Button>
          )}
        </header>

        <section className='rounded-lg border bg-card'>
          {players.length === 0 ? (
            <div className='px-6 py-12'>
              <p className='heading text-lg'>Nenhum jogador ainda</p>
              <p className='mt-1 max-w-prose text-muted-foreground'>
                {isCommission
                  ? 'Cadastre o primeiro jogador para liberar o CPF dele e montar o elenco.'
                  : 'Assim que a comissão cadastrar o elenco, ele aparece aqui.'}
              </p>
              {isCommission && (
                <Button asChild className='mt-6'>
                  <Link href='/players/new'>
                    <UserPlus />
                    Cadastrar jogador
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-20 pl-6'>Camisa</TableHead>
                  <TableHead>Jogador</TableHead>
                  <TableHead>Posição</TableHead>
                  {isCommission && <TableHead>Telefone</TableHead>}
                  {isCommission && (
                    <TableHead className='pr-6'>Situação</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {players.map((p) => (
                  <TableRow key={String(p._id)}>
                    <TableCell className='pl-6'>
                      <span className='numeral text-3xl text-primary'>
                        {p.shirtNumber}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className='font-semibold'>{p.nickname}</div>
                      {isCommission && (
                        <div className='text-sm text-muted-foreground'>
                          {p.fullName}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{p.position}</TableCell>
                    {isCommission && (
                      <TableCell className='tabular-nums'>
                        {formatPhone(p.phone ?? '')}
                      </TableCell>
                    )}
                    {isCommission && (
                      <TableCell className='pr-6'>
                        <div className='flex gap-1'>
                          <Badge variant={p.isActive ? 'success' : 'outline'}>
                            {p.isActive ? 'Ativo' : 'Inativo'}
                          </Badge>
                          {!p.userId && (
                            <Badge variant='outline'>Sem conta</Badge>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </section>
      </main>
    </div>
  );
}
