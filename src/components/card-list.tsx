import Link from 'next/link';
import { CardGlyph } from '@/components/card-glyph';
import { DeleteCardButton } from '@/components/delete-card-button';
import { PaymentControls } from '@/components/payment-controls';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { payCard, undoCardPayment } from '@/lib/actions/cards';
import type { CardRow } from '@/lib/data/cards';
import { formatLocalDate } from '@/lib/months';
import { cn, formatCents } from '@/lib/utils';

export { CardGlyph };

const COLOR_LABEL = { amarelo: 'Amarelo', vermelho: 'Vermelho' } as const;

/** Lista de cartões; com `manage`, mostra pagar/desfazer/excluir. */
export function CardList({
  cards,
  showPlayer,
  manage,
  emptyMessage,
}: {
  cards: CardRow[];
  showPlayer: boolean;
  manage: boolean;
  emptyMessage: string;
}) {
  if (cards.length === 0) {
    return <p className='px-6 py-8 text-muted-foreground'>{emptyMessage}</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className='pl-6'>Cartão</TableHead>
          {showPlayer && <TableHead>Jogador</TableHead>}
          <TableHead>Data</TableHead>
          <TableHead>Valor</TableHead>
          <TableHead className={cn(!manage && 'pr-6')}>Situação</TableHead>
          {manage && (
            <TableHead className='pr-6 text-right'>
              <span className='sr-only'>Ações</span>
            </TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {cards.map((c) => {
          const label = `o cartão ${COLOR_LABEL[c.color].toLowerCase()} de ${c.player.nickname} (${formatLocalDate(c.date)})`;
          return (
            <TableRow key={c.id}>
              <TableCell className='pl-6'>
                <div className='flex items-center gap-3'>
                  <CardGlyph color={c.color} />
                  <div>
                    <div className='font-medium'>{COLOR_LABEL[c.color]}</div>
                    {c.description && (
                      <div className='max-w-[16rem] whitespace-normal text-sm text-muted-foreground'>
                        {c.description}
                      </div>
                    )}
                  </div>
                </div>
              </TableCell>
              {showPlayer && (
                <TableCell>
                  {c.player.id ? (
                    <Link
                      href={`/players/${c.player.id}`}
                      className='font-semibold underline decoration-border underline-offset-4 hover:decoration-primary'
                    >
                      {c.player.nickname}
                    </Link>
                  ) : (
                    c.player.nickname
                  )}
                </TableCell>
              )}
              <TableCell className='tabular-nums'>
                {formatLocalDate(c.date)}
              </TableCell>
              <TableCell className='tabular-nums'>
                {formatCents(c.amountCents)}
              </TableCell>
              <TableCell className={cn(!manage && 'pr-6')}>
                {c.status === 'pago' ? (
                  <Badge variant='success'>
                    Paga
                    {c.paymentDate && ` em ${formatLocalDate(c.paymentDate)}`}
                  </Badge>
                ) : (
                  <Badge variant='warning'>Pendente</Badge>
                )}
              </TableCell>
              {manage && (
                <TableCell className='pr-6'>
                  <div className='flex items-center justify-end gap-1'>
                    <PaymentControls
                      id={c.id}
                      isPaid={c.status === 'pago'}
                      pay={payCard.bind(null, c.id)}
                      undo={undoCardPayment.bind(null, c.id)}
                      dateLabel={`Data do pagamento da multa de ${c.player.nickname}`}
                      undoConfirm={`Desfazer o pagamento da multa de ${c.player.nickname}? A entrada no caixa também será removida.`}
                    />
                    {c.status === 'pendente' && (
                      <DeleteCardButton id={c.id} label={label} />
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
