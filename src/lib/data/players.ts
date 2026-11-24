import 'server-only';

import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import Monthly from '@/lib/models/Monthly';
import Player from '@/lib/models/Player';

/** Ficha do jogador, serializável. Dados pessoais só vão para quem pode ver. */
export type PlayerProfile = {
  id: string;
  fullName: string;
  nickname: string;
  position: string;
  shirtNumber: number;
  isActive: boolean;
  hasAccount: boolean;
  /** Presentes só quando `includePersonal` (comissão ou o próprio jogador). */
  cpf?: string;
  phone?: string;
  address?: string;
  birthDate?: string;
};

type PlayerDoc = {
  _id: mongoose.Types.ObjectId;
  fullName: string;
  nickname: string;
  position: string;
  shirtNumber: number;
  isActive: boolean;
  userId?: mongoose.Types.ObjectId;
  cpf: string;
  phone: string;
  address: string;
  birthDate: Date;
};

function toProfile(p: PlayerDoc, includePersonal: boolean): PlayerProfile {
  return {
    id: String(p._id),
    fullName: p.fullName,
    nickname: p.nickname,
    position: p.position,
    shirtNumber: p.shirtNumber,
    isActive: p.isActive,
    hasAccount: Boolean(p.userId),
    ...(includePersonal && {
      cpf: p.cpf,
      phone: p.phone,
      address: p.address,
      birthDate: p.birthDate.toISOString(),
    }),
  };
}

export async function getPlayerById(
  id: string,
  { includePersonal }: { includePersonal: boolean }
): Promise<PlayerProfile | null> {
  if (!mongoose.isValidObjectId(id)) return null;
  await dbConnect();
  const player = await Player.findById(id).lean<PlayerDoc>();
  return player ? toProfile(player, includePersonal) : null;
}

/** Ficha vinculada a uma conta (área do jogador). */
export async function getPlayerByUserId(
  userId: string
): Promise<PlayerProfile | null> {
  if (!mongoose.isValidObjectId(userId)) return null;
  await dbConnect();
  const player = await Player.findOne({ userId }).lean<PlayerDoc>();
  return player ? toProfile(player, true) : null;
}

export type PlayerMonthly = {
  id: string;
  referenceMonth: string;
  amountCents: number;
  status: 'pago' | 'em_aberto';
  isOverdue: boolean;
  dueDate: string;
  paymentDate: string | null;
};

export type PlayerFinancials = {
  monthlies: PlayerMonthly[];
  openCents: number;
  openCount: number;
  overdueCount: number;
  paidCount: number;
};

/** Mensalidades de um jogador, da mais recente para a mais antiga. */
export async function getPlayerFinancials(
  playerId: string,
  now = new Date()
): Promise<PlayerFinancials> {
  await dbConnect();
  const docs = await Monthly.find({ playerId })
    .sort({ referenceMonth: -1 })
    .limit(36)
    .lean();

  const monthlies: PlayerMonthly[] = docs.map((m) => ({
    id: String(m._id),
    referenceMonth: m.referenceMonth,
    amountCents: m.amountCents,
    status: m.status,
    isOverdue: m.status === 'em_aberto' && m.dueDate < now,
    dueDate: m.dueDate.toISOString(),
    paymentDate: m.paymentDate ? m.paymentDate.toISOString() : null,
  }));

  const open = monthlies.filter((m) => m.status === 'em_aberto');
  return {
    monthlies,
    openCents: open.reduce((sum, m) => sum + m.amountCents, 0),
    openCount: open.length,
    overdueCount: open.filter((m) => m.isOverdue).length,
    paidCount: monthlies.length - open.length,
  };
}
