// Script para popular o banco de dados com dados iniciais
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Conectar ao MongoDB
async function seedDatabase() {
  try {
    // Verificar se a variável de ambiente existe
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI não encontrada nas variáveis de ambiente');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado ao MongoDB');

    // Criar modelos
    const User = mongoose.model(
      'User',
      {
        name: String,
        email: String,
        password: String,
        role: String,
        isActive: Boolean,
      },
      'users'
    );

    const Association = mongoose.model(
      'Association',
      {
        name: String,
        description: String,
        foundedDate: Date,
        address: String,
        phone: String,
        email: String,
        logo: String,
        socialMedia: {
          facebook: String,
          twitter: String,
          instagram: String,
        },
        commission: [String],
        totalPlayers: Number,
        gameSchedule: String,
      },
      'associations'
    );

    const Slug = mongoose.model(
      'Slug',
      {
        slug: String,
        associationId: mongoose.Schema.Types.ObjectId,
        isActive: Boolean,
      },
      'slugs'
    );

    const AllowedUser = mongoose.model(
      'AllowedUser',
      {
        cpf: String,
        name: String,
        isUsed: Boolean,
      },
      'allowedusers'
    );

    // Criar associação
    let association = await Association.findOne({
      name: 'Associação de Porto dos Santos',
    });
    if (!association) {
      association = new Association({
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
        totalPlayers: 0,
        gameSchedule: 'Domingos pela manhã',
      });
      await association.save();
      console.log('✅ Associação criada!');
    }

    // Criar slug
    const slugExists = await Slug.findOne({ slug: 'porto-dos-santos' });
    if (!slugExists) {
      const slug = new Slug({
        slug: 'porto-dos-santos',
        associationId: association._id,
        isActive: true,
      });
      await slug.save();
      console.log('✅ Slug criado: porto-dos-santos');
    }

    // Criar usuário administrador
    const adminExists = await User.findOne({
      email: 'admin@portodossantos.com',
    });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 12);

      const admin = new User({
        name: 'Administrador',
        email: 'admin@portodossantos.com',
        password: hashedPassword,
        role: 'comissao',
        isActive: true,
      });

      await admin.save();
      console.log('✅ Usuário administrador criado!');
    }

    // Criar usuários permitidos (CPFs que podem se cadastrar)
    const allowedUsers = [
      { cpf: '12345678901', name: 'João Silva' },
      { cpf: '98765432100', name: 'Pedro Santos' },
      { cpf: '11122233344', name: 'Maria Oliveira' },
      { cpf: '55566677788', name: 'Carlos Ferreira' },
      { cpf: '99988877766', name: 'Ana Costa' },
    ];

    for (const userData of allowedUsers) {
      const exists = await AllowedUser.findOne({ cpf: userData.cpf });
      if (!exists) {
        const allowedUser = new AllowedUser({
          cpf: userData.cpf,
          name: userData.name,
          isUsed: false,
        });
        await allowedUser.save();
      }
    }
    console.log('✅ Usuários permitidos criados!');

    console.log('\n🎉 Seed concluído com sucesso!');
    console.log('\n📋 Resumo:');
    console.log('- Associação: Associação de Porto dos Santos');
    console.log('- Slug: porto-dos-santos');
    console.log('- URL: http://localhost:3000/porto-dos-santos');
    console.log('- Admin: admin@portodossantos.com / admin123');
    console.log(
      '- CPFs permitidos: 12345678901, 98765432100, 11122233344, 55566677788, 99988877766'
    );

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro no seed:', error);
    process.exit(1);
  }
}

seedDatabase();
