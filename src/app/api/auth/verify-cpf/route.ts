import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/lib/models/User';

export async function POST(request: Request) {
  await connectToDatabase();
  const { cpf } = await request.json();

  const user = await User.findOne({ cpf });
  if (!user) {
    return NextResponse.json({ error: 'CPF não autorizado' }, { status: 401 });
  }

  return NextResponse.json({ success: true });
}
