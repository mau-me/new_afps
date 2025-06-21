import { type NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import AllowedUser from '@/lib/models/AllowedUser';
import Slug from '@/lib/models/Slug';
import { validateCPF } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, cpf, slug } = await request.json();

    // Validações básicas
    if (!name || !email || !password || !cpf || !slug) {
      return NextResponse.json(
        { message: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    if (!validateCPF(cpf)) {
      return NextResponse.json({ message: 'CPF inválido' }, { status: 400 });
    }

    await dbConnect();

    // Verificar se o slug existe e está ativo
    const slugDoc = await Slug.findOne({ slug, isActive: true });
    if (!slugDoc) {
      return NextResponse.json(
        { message: 'Associação não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se o CPF está na lista de permitidos
    const allowedUser = await AllowedUser.findOne({ cpf, isUsed: false });
    if (!allowedUser) {
      return NextResponse.json(
        {
          message:
            'CPF não autorizado ou já utilizado. Entre em contato com a comissão.',
        },
        { status: 403 }
      );
    }

    // Verificar se o email já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'Email já cadastrado' },
        { status: 409 }
      );
    }

    // Criar o usuário
    const user = new User({
      name,
      email,
      password,
      role: 'jogador',
    });

    await user.save();

    // Marcar o CPF como usado
    allowedUser.isUsed = true;
    await allowedUser.save();

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
