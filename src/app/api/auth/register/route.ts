import { type NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import AllowedUser from '@/lib/models/AllowedUser';
import Player from '@/lib/models/Player';
import { fieldErrors, registerSchema } from '@/lib/validation';
import { getClientIp, rateLimit } from '@/lib/rate-limit';

function isDuplicateKeyError(error: unknown): error is { keyPattern?: object } {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { code?: number }).code === 11000
  );
}

export async function POST(request: NextRequest) {
  // Máx. 5 cadastros por IP a cada 15 minutos.
  const limit = rateLimit(`register:${getClientIp(request.headers)}`, {
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });
  if (!limit.ok) {
    return NextResponse.json(
      { message: 'Muitas tentativas. Tente novamente mais tarde.' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil(limit.retryAfterMs / 1000)) },
      }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Requisição inválida' }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    const errors = fieldErrors(parsed.error);
    return NextResponse.json(
      { message: Object.values(errors)[0], errors },
      { status: 400 }
    );
  }

  const { name, email, password, cpf } = parsed.data;

  try {
    await dbConnect();

    if (await User.exists({ email })) {
      return NextResponse.json(
        { message: 'Email já cadastrado' },
        { status: 409 }
      );
    }

    // Reserva o CPF de forma atômica: duas requisições simultâneas
    // não conseguem usar o mesmo CPF.
    const allowedUser = await AllowedUser.findOneAndUpdate(
      { cpf, isUsed: false },
      { $set: { isUsed: true } },
      { new: true }
    );

    if (!allowedUser) {
      return NextResponse.json(
        {
          message:
            'CPF não autorizado ou já utilizado. Entre em contato com a comissão.',
        },
        { status: 403 }
      );
    }

    let userId;
    try {
      const user = await User.create({
        name,
        email,
        password,
        cpf,
        role: 'jogador',
      });
      userId = user._id;
    } catch (error) {
      // Desfaz a reserva para o CPF poder ser usado novamente.
      await AllowedUser.updateOne(
        { _id: allowedUser._id },
        { $set: { isUsed: false }, $unset: { usedBy: 1 } }
      );

      if (isDuplicateKeyError(error)) {
        return NextResponse.json(
          { message: 'Email ou CPF já cadastrado' },
          { status: 409 }
        );
      }
      throw error;
    }

    await Promise.all([
      AllowedUser.updateOne({ _id: allowedUser._id }, { usedBy: userId }),
      // Vincula a ficha de jogador criada pela comissão, se existir.
      Player.updateOne(
        { cpf, userId: { $exists: false } },
        { $set: { userId } }
      ),
    ]);

    return NextResponse.json(
      { message: 'Usuário criado com sucesso' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
