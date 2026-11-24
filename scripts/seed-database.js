// Script para popular o banco de dados com dados iniciais.
// Uso: npm run seed   (lê MONGODB_URI e SEED_ADMIN_PASSWORD do .env)
const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ADMIN_EMAIL = (
  process.env.SEED_ADMIN_EMAIL || 'admin@portodossantos.com'
).toLowerCase();

// CPFs FICTÍCIOS (dígitos verificadores válidos), apenas para desenvolvimento.
// Nunca coloque CPFs reais neste arquivo: ele fica no histórico do git.
const ALLOWED_USERS = [
  { cpf: '12345678909', name: 'João Silva (teste)' },
  { cpf: '98765432100', name: 'Pedro Santos (teste)' },
  { cpf: '11122233396', name: 'Maria Oliveira (teste)' },
  { cpf: '55566677720', name: 'Carlos Ferreira (teste)' },
  { cpf: '99988877714', name: 'Ana Costa (teste)' },
];

async function seedDatabase() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI não encontrada nas variáveis de ambiente');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado ao MongoDB');

    const { Schema } = mongoose;

    const User = mongoose.model(
      'User',
      new Schema(
        {
          name: String,
          email: { type: String, lowercase: true, unique: true },
          password: String,
          role: String,
          isActive: Boolean,
        },
        { timestamps: true }
      ),
      'users'
    );

    const Association = mongoose.model(
      'Association',
      new Schema(
        {
          name: String,
          description: String,
          foundedDate: Date,
          address: String,
          phone: String,
          email: String,
          socialMedia: { facebook: String, twitter: String, instagram: String },
          commission: [String],
          gameSchedule: String,
        },
        { timestamps: true }
      ),
      'associations'
    );

    const AllowedUser = mongoose.model(
      'AllowedUser',
      new Schema(
        { cpf: { type: String, unique: true }, name: String, isUsed: Boolean },
        { timestamps: true }
      ),
      'allowedusers'
    );

    // Associação (documento único)
    if (!(await Association.exists({}))) {
      await Association.create({
        name: 'Associação de Porto dos Santos',
        description:
          'Uma associação de futebol dedicada a promover o esporte e a união entre os membros da comunidade de Porto dos Santos, Itaparica, Bahia.',
        foundedDate: new Date('2020-01-15'),
        address: 'Rua Alto do Verão, Porto dos Santos, Itaparica, Bahia',
        phone: '(71) 99999-9999',
        email: 'contato@portodossantos.com.br',
        socialMedia: {
          facebook: 'https://facebook.com/portodossantos',
          twitter: 'https://twitter.com/portodossantos',
          instagram: 'https://instagram.com/portodossantos',
        },
        commission: ['Mauricio Porto', 'Stivie', 'Bugari'],
        gameSchedule: 'Domingos pela manhã',
      });
      console.log('✅ Associação criada!');
    }

    // Administrador (comissão)
    let generatedPassword = null;
    if (!(await User.exists({ email: ADMIN_EMAIL }))) {
      const password =
        process.env.SEED_ADMIN_PASSWORD ||
        (generatedPassword = crypto.randomBytes(12).toString('base64url'));

      if (password.length < 8) {
        throw new Error('SEED_ADMIN_PASSWORD deve ter pelo menos 8 caracteres');
      }

      await User.create({
        name: 'Administrador',
        email: ADMIN_EMAIL,
        password: await bcrypt.hash(password, 12),
        role: 'comissao',
        isActive: true,
      });
      console.log('✅ Usuário administrador criado!');
    }

    // CPFs liberados para cadastro
    for (const { cpf, name } of ALLOWED_USERS) {
      await AllowedUser.updateOne(
        { cpf },
        { $setOnInsert: { cpf, name, isUsed: false } },
        { upsert: true }
      );
    }
    console.log('✅ CPFs de teste liberados!');

    console.log('\n🎉 Seed concluído com sucesso!');
    console.log(`- Admin: ${ADMIN_EMAIL}`);
    if (generatedPassword) {
      console.log(`- Senha gerada (anote, não será exibida de novo): ${generatedPassword}`);
    }
    console.log(`- CPFs de teste: ${ALLOWED_USERS.map((u) => u.cpf).join(', ')}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro no seed:', error);
    process.exit(1);
  }
}

seedDatabase();
