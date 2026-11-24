import 'server-only';

import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import Monthly from '@/lib/models/Monthly';
import Player from '@/lib/models/Player';
import Transaction, { activeFilter } from '@/lib/models/Transaction';
import { getCardSummary, type CardSummary } from '@/lib/data/cards';
import { listTransactions, type TransactionRow } from '@/lib/data/cash';
import { getMonthSummary, type MonthSummary } from '@/lib/data/monthly';
import { monthRange } from '@/lib/months';

export type CategoryTotal = { category: string; cents: number; count: number };

export type Debtor = {
  playerId: string;
  nickname: string;
  fullName: string;
  shirtNumber: number | null;
  months: string[];
  totalCents: number;
};

export type MonthReport = {
  month: string;
  /** Saldo acumulado antes do dia 1º do mês. */
  openingCents: number;
  incomeCents: number;
  expenseCents: number;
  closingCents: number;
  incomeByCategory: CategoryTotal[];
  expenseByCategory: CategoryTotal[];
  transactions: TransactionRow[];
  monthly: MonthSummary;
  cards: CardSummary;
  /** Mensalidades vencidas e não pagas, de qualquer mês até agora. */
  debtors: Debtor[];
};

async function sumUntil(date: Date) {
  const totals = await Transaction.aggregate<{ _id: 'entrada' | 'saida'; cents: number }>([
    { $match: { ...activeFilter, date: { $lt: date } } },
    { $group: { _id: '$type', cents: { $sum: '$amountCents' } } },
  ]);
  const income = totals.find((t) => t._id === 'entrada')?.cents ?? 0;
  const expense = totals.find((t) => t._id === 'saida')?.cents ?? 0;
  return income - expense;
}

async function totalsByCategory(start: Date, end: Date) {
  const rows = await Transaction.aggregate<{
    _id: { type: 'entrada' | 'saida'; category: string };
    cents: number;
    count: number;
  }>([
    { $match: { ...activeFilter, date: { $gte: start, $lt: end } } },
    {
      $group: {
        _id: { type: '$type', category: '$category' },
        cents: { $sum: '$amountCents' },
        count: { $sum: 1 },
      },
    },
    { $sort: { cents: -1 } },
  ]);
  const pick = (type: 'entrada' | 'saida') =>
    rows
      .filter((r) => r._id.type === type)
      .map((r) => ({ category: r._id.category, cents: r.cents, count: r.count }));
  return { income: pick('entrada'), expense: pick('saida') };
}

export async function listDebtors(now = new Date()): Promise<Debtor[]> {
  await dbConnect();
  const groups = await Monthly.aggregate<{
    _id: mongoose.Types.ObjectId;
    months: string[];
    totalCents: number;
  }>([
    { $match: { status: 'em_aberto', dueDate: { $lt: now } } },
    { $sort: { referenceMonth: 1 } },
    {
      $group: {
        _id: '$playerId',
        months: { $push: '$referenceMonth' },
        totalCents: { $sum: '$amountCents' },
      },
    },
    { $sort: { totalCents: -1 } },
  ]);

  const players = await Player.find({ _id: { $in: groups.map((g) => g._id) } })
    .select('nickname fullName shirtNumber')
    .lean();
  const byId = new Map(players.map((p) => [String(p._id), p]));

  return groups.map((g) => {
    const p = byId.get(String(g._id));
    return {
      playerId: String(g._id),
      nickname: p?.nickname ?? 'Jogador removido',
      fullName: p?.fullName ?? '',
      shirtNumber: p?.shirtNumber ?? null,
      months: g.months,
      totalCents: g.totalCents,
    };
  });
}

export async function getMonthReport(month: string): Promise<MonthReport> {
  await dbConnect();
  const { start, end } = monthRange(month);

  const [openingCents, closingCents, categories, transactions, monthly, cards, debtors] =
    await Promise.all([
      sumUntil(start),
      sumUntil(end),
      totalsByCategory(start, end),
      listTransactions(month, 'todas'),
      getMonthSummary(month),
      getCardSummary(),
      listDebtors(),
    ]);

  const sum = (list: CategoryTotal[]) => list.reduce((s, c) => s + c.cents, 0);

  return {
    month,
    openingCents,
    incomeCents: sum(categories.income),
    expenseCents: sum(categories.expense),
    closingCents,
    incomeByCategory: categories.income,
    expenseByCategory: categories.expense,
    transactions,
    monthly,
    cards,
    debtors,
  };
}
