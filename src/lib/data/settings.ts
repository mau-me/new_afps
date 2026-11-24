import 'server-only';

import dbConnect from '@/lib/mongodb';
import AllowedUser from '@/lib/models/AllowedUser';
import Association from '@/lib/models/Association';
import User, { type UserRole } from '@/lib/models/User';

export type AssociationSettings = {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  gameSchedule: string;
  commission: string[];
  socialMedia: { facebook: string; twitter: string; instagram: string };
  monthlyFeeCents: number;
  dueDay: number;
  yellowCardFeeCents: number;
  redCardFeeCents: number;
};

export async function getAssociationSettings(): Promise<AssociationSettings | null> {
  await dbConnect();
  const a = await Association.findOne().lean();
  if (!a) return null;
  return {
    name: a.name,
    description: a.description,
    address: a.address,
    phone: a.phone,
    email: a.email,
    gameSchedule: a.gameSchedule,
    commission: a.commission ?? [],
    socialMedia: {
      facebook: a.socialMedia?.facebook ?? '',
      twitter: a.socialMedia?.twitter ?? '',
      instagram: a.socialMedia?.instagram ?? '',
    },
    monthlyFeeCents: a.monthlyFeeCents ?? 0,
    dueDay: a.dueDay ?? 10,
    yellowCardFeeCents: a.yellowCardFeeCents ?? 0,
    redCardFeeCents: a.redCardFeeCents ?? 0,
  };
}

export type UserRow = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  hasCpf: boolean;
  createdAt: string;
};

export async function listUsers(): Promise<UserRow[]> {
  await dbConnect();
  const users = await User.find()
    .select('name email role isActive cpf createdAt')
    .sort({ role: 1, name: 1 })
    .lean();
  return users.map((u) => ({
    id: String(u._id),
    name: u.name,
    email: u.email,
    role: u.role,
    isActive: u.isActive,
    hasCpf: Boolean(u.cpf),
    createdAt: u.createdAt.toISOString(),
  }));
}

export type AllowedRow = {
  id: string;
  cpf: string;
  name: string;
  isUsed: boolean;
  createdAt: string;
};

export async function listAllowedUsers(): Promise<AllowedRow[]> {
  await dbConnect();
  const rows = await AllowedUser.find().sort({ isUsed: 1, name: 1 }).lean();
  return rows.map((r) => ({
    id: String(r._id),
    cpf: r.cpf,
    name: r.name,
    isUsed: r.isUsed,
    createdAt: r.createdAt.toISOString(),
  }));
}
