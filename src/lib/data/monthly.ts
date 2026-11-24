import 'server-only';

import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import Association from '@/lib/models/Association';
import Monthly, { overdueFilter } from '@/lib/models/Monthly';
import Player from '@/lib/models/Player';

export const MONTHLY_FILTERS = ['todas', 'em_aberto', 'vencido', 'pago'] as const;
export type MonthlyFilter = (typeof MONTHLY_FILTERS)[number];

export function parseMonthlyFilter(value: unknown): MonthlyFilter {
  return MONTHLY_FILTERS.includes(value as MonthlyFilter)
    ? (value as MonthlyFilter)
    : 'todas';
}

export type MonthlySettings = {
  /** false enquanto não houver associação cadastrada (rode o seed). */
  hasAssociation: boolean;
  monthlyFeeCents: number;
  dueDay: number;
};

export async function getMonthlySettings(): Promise<MonthlySettings> {
  await dbConnect();
  const association = await Association.findOne()
    .select('monthlyFeeCents dueDay')
    .lean();

  return {
    hasAssociation: Boolean(association),
    monthlyFeeCents: association?.monthlyFeeCents ?? 0,
    dueDay: association?.dueDay ?? 10,
  };
}

/** Linha da tabela de mensalidades, já serializável para componentes client. */
export type MonthlyRow = {
  id: string;
  amountCents: number;
  status: 'pago' | 'em_aberto';
  isOverdue: boolean;
  dueDate: string;
  paymentDate: string | null;
  player: {
    nickname: string;
    fullName: string;
    shirtNumber: number | null;
  };
};

type PopulatedPlayer = {
  nickname: string;
  fullName: string;
  shirtNumber: number;
} | null;

function statusQuery(filter: MonthlyFilter, now: Date) {
  switch (filter) {
    case 'pago':
      return { status: 'pago' as const };
    case 'em_aberto':
      return { status: 'em_aberto' as const };
    case 'vencido':
      return overdueFilter(now);
    default:
      return {};
  }
}

export async function listMonthlies(
  month: string,
  filter: MonthlyFilter,
  now = new Date()
): Promise<MonthlyRow[]> {
  await dbConnect();

  const docs = await Monthly.find({
    referenceMonth: month,
    ...statusQuery(filter, now),
  })
    .populate<{ playerId: PopulatedPlayer }>(
      'playerId',
      'nickname fullName shirtNumber'
    )
    .lean();

  return docs
    .map((m) => ({
      id: String(m._id),
      amountCents: m.amountCents,
      status: m.status,
      isOverdue: m.status === 'em_aberto' && m.dueDate < now,
      dueDate: m.dueDate.toISOString(),
      paymentDate: m.paymentDate ? m.paymentDate.toISOString() : null,
      player: {
        nickname: m.playerId?.nickname ?? 'Jogador removido',
        fullName: m.playerId?.fullName ?? '',
        shirtNumber: m.playerId?.shirtNumber ?? null,
      },
    }))
    .sort(
      (a, b) =>
        (a.player.shirtNumber ?? 999) - (b.player.shirtNumber ?? 999) ||
        a.player.nickname.localeCompare(b.player.nickname, 'pt-BR')
    );
}

export type MonthSummary = {
  total: number;
  paid: number;
  open: number;
  overdue: number;
  expectedCents: number;
  receivedCents: number;
  openCents: number;
  /** Jogadores ativos que ainda não têm mensalidade neste mês. */
  missing: number;
};

export async function getMonthSummary(
  month: string,
  now = new Date()
): Promise<MonthSummary> {
  await dbConnect();

  const [groups, overdue, playerIds] = await Promise.all([
    Monthly.aggregate<{ _id: 'pago' | 'em_aberto'; count: number; cents: number }>([
      { $match: { referenceMonth: month } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          cents: { $sum: '$amountCents' },
        },
      },
    ]),
    Monthly.countDocuments({ referenceMonth: month, ...overdueFilter(now) }),
    Monthly.distinct('playerId', { referenceMonth: month }),
  ]);

  const missing = await Player.countDocuments({
    isActive: true,
    _id: { $nin: playerIds as mongoose.Types.ObjectId[] },
  });

  const paid = groups.find((g) => g._id === 'pago');
  const open = groups.find((g) => g._id === 'em_aberto');

  return {
    total: (paid?.count ?? 0) + (open?.count ?? 0),
    paid: paid?.count ?? 0,
    open: open?.count ?? 0,
    overdue,
    expectedCents: (paid?.cents ?? 0) + (open?.cents ?? 0),
    receivedCents: paid?.cents ?? 0,
    openCents: open?.cents ?? 0,
    missing,
  };
}
