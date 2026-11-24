import 'server-only';

import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import Association from '@/lib/models/Association';
import Card, { type CardColor } from '@/lib/models/Card';
import Player from '@/lib/models/Player';

export const CARD_FILTERS = ['pendente', 'pago', 'todos'] as const;
export type CardFilter = (typeof CARD_FILTERS)[number];

export function parseCardFilter(value: unknown): CardFilter {
  return CARD_FILTERS.includes(value as CardFilter)
    ? (value as CardFilter)
    : 'pendente';
}

export type CardRow = {
  id: string;
  color: CardColor;
  description: string;
  amountCents: number;
  date: string;
  status: 'pendente' | 'pago';
  paymentDate: string | null;
  player: { id: string; nickname: string; shirtNumber: number | null };
};

type PopulatedPlayer = {
  _id: mongoose.Types.ObjectId;
  nickname: string;
  shirtNumber: number;
} | null;

async function findCards(query: Record<string, unknown>): Promise<CardRow[]> {
  await dbConnect();
  const docs = await Card.find(query)
    .sort({ date: -1, createdAt: -1 })
    .limit(200)
    .populate<{ playerId: PopulatedPlayer }>('playerId', 'nickname shirtNumber')
    .lean();

  return docs.map((c) => ({
    id: String(c._id),
    color: c.color,
    description: c.description ?? '',
    amountCents: c.amountCents,
    date: c.date.toISOString(),
    status: c.status,
    paymentDate: c.paymentDate ? c.paymentDate.toISOString() : null,
    player: {
      id: c.playerId ? String(c.playerId._id) : '',
      nickname: c.playerId?.nickname ?? 'Jogador removido',
      shirtNumber: c.playerId?.shirtNumber ?? null,
    },
  }));
}

export function listCards(filter: CardFilter) {
  return findCards(filter === 'todos' ? {} : { status: filter });
}

export function listPlayerCards(playerId: string) {
  if (!mongoose.isValidObjectId(playerId)) return Promise.resolve([]);
  return findCards({ playerId });
}

export type CardSummary = {
  pendingCount: number;
  pendingCents: number;
  paidCount: number;
  paidCents: number;
};

export async function getCardSummary(): Promise<CardSummary> {
  await dbConnect();
  const groups = await Card.aggregate<{
    _id: 'pendente' | 'pago';
    count: number;
    cents: number;
  }>([
    { $group: { _id: '$status', count: { $sum: 1 }, cents: { $sum: '$amountCents' } } },
  ]);
  const pending = groups.find((g) => g._id === 'pendente');
  const paid = groups.find((g) => g._id === 'pago');
  return {
    pendingCount: pending?.count ?? 0,
    pendingCents: pending?.cents ?? 0,
    paidCount: paid?.count ?? 0,
    paidCents: paid?.cents ?? 0,
  };
}

/** Valores padrão das multas (centavos; 0 = sem padrão). */
export async function getCardFees() {
  await dbConnect();
  const a = await Association.findOne()
    .select('yellowCardFeeCents redCardFeeCents')
    .lean();
  return {
    amarelo: a?.yellowCardFeeCents ?? 0,
    vermelho: a?.redCardFeeCents ?? 0,
  };
}

/** Jogadores para o seletor do formulário de cartão. */
export async function listPlayerOptions() {
  await dbConnect();
  const players = await Player.find({ isActive: true })
    .select('nickname shirtNumber')
    .sort({ shirtNumber: 1 })
    .lean();
  return players.map((p) => ({
    id: String(p._id),
    label: `${p.nickname} (camisa ${p.shirtNumber})`,
  }));
}
