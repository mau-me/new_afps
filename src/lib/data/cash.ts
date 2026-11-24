import 'server-only';

import dbConnect from '@/lib/mongodb';
import Transaction, { activeFilter } from '@/lib/models/Transaction';
import { monthRange } from '@/lib/months';

export const CASH_FILTERS = ['todas', 'entrada', 'saida'] as const;
export type CashFilter = (typeof CASH_FILTERS)[number];

export function parseCashFilter(value: unknown): CashFilter {
  return CASH_FILTERS.includes(value as CashFilter)
    ? (value as CashFilter)
    : 'todas';
}

/** Linha da tabela do caixa, serializável para componentes client. */
export type TransactionRow = {
  id: string;
  type: 'entrada' | 'saida';
  category: string;
  amountCents: number;
  date: string;
  description: string;
  /** Gerado por uma mensalidade (só pode ser desfeito por lá). */
  isAutomatic: boolean;
  /** Mês de referência da mensalidade que gerou o lançamento, se houver. */
  monthlyMonth: string | null;
  /** Gerado pelo pagamento de um cartão (multa). */
  fromCard: boolean;
};

export async function listTransactions(
  month: string,
  filter: CashFilter
): Promise<TransactionRow[]> {
  await dbConnect();
  const { start, end } = monthRange(month);

  const docs = await Transaction.find({
    ...activeFilter,
    date: { $gte: start, $lt: end },
    ...(filter === 'todas' ? {} : { type: filter }),
  })
    .sort({ date: -1, createdAt: -1 })
    .populate<{ monthlyId: { referenceMonth: string } | null }>(
      'monthlyId',
      'referenceMonth'
    )
    .lean();

  return docs.map((t) => ({
    id: String(t._id),
    type: t.type,
    category: t.category,
    amountCents: t.amountCents,
    date: t.date.toISOString(),
    description: t.description,
    isAutomatic: Boolean(t.monthlyId || t.cardId),
    monthlyMonth: t.monthlyId?.referenceMonth ?? null,
    fromCard: Boolean(t.cardId),
  }));
}

export type CashSummary = {
  incomeCents: number;
  expenseCents: number;
  /** Entradas menos saídas do mês. */
  balanceCents: number;
  /** Saldo de todos os lançamentos até o fim do mês. */
  accumulatedCents: number;
  incomeCount: number;
  expenseCount: number;
};

type Totals = { _id: 'entrada' | 'saida'; cents: number; count: number };

function pick(totals: Totals[], type: Totals['_id']) {
  const t = totals.find((x) => x._id === type);
  return { cents: t?.cents ?? 0, count: t?.count ?? 0 };
}

export async function getCashSummary(month: string): Promise<CashSummary> {
  await dbConnect();
  const { start, end } = monthRange(month);

  const groupByType = {
    $group: {
      _id: '$type',
      cents: { $sum: '$amountCents' },
      count: { $sum: 1 },
    },
  };

  const [monthTotals, accumulatedTotals] = await Promise.all([
    Transaction.aggregate<Totals>([
      { $match: { ...activeFilter, date: { $gte: start, $lt: end } } },
      groupByType,
    ]),
    Transaction.aggregate<Totals>([
      { $match: { ...activeFilter, date: { $lt: end } } },
      groupByType,
    ]),
  ]);

  const income = pick(monthTotals, 'entrada');
  const expense = pick(monthTotals, 'saida');
  const accIncome = pick(accumulatedTotals, 'entrada');
  const accExpense = pick(accumulatedTotals, 'saida');

  return {
    incomeCents: income.cents,
    expenseCents: expense.cents,
    balanceCents: income.cents - expense.cents,
    accumulatedCents: accIncome.cents - accExpense.cents,
    incomeCount: income.count,
    expenseCount: expense.count,
  };
}
