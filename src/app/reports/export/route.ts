import { NextResponse, type NextRequest } from 'next/server';
import { centsToCsv, toCsv } from '@/lib/csv';
import { listTransactions } from '@/lib/data/cash';
import { formatLocalDate, parseMonthParam } from '@/lib/months';
import { getSession } from '@/lib/session';

/** Planilha (CSV) com os lançamentos do mês. Somente comissão. */
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session || session.disabled || session.user.role !== 'comissao') {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 403 });
  }

  const month = parseMonthParam(request.nextUrl.searchParams.get('month'));
  const rows = (await listTransactions(month, 'todas')).reverse();

  const csv = toCsv(
    ['Data', 'Tipo', 'Categoria', 'Descrição', 'Valor (R$)'],
    rows.map((t) => [
      formatLocalDate(t.date),
      t.type === 'entrada' ? 'Entrada' : 'Saída',
      t.category,
      t.description,
      centsToCsv(t.type === 'entrada' ? t.amountCents : -t.amountCents),
    ])
  );

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="caixa-${month}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
