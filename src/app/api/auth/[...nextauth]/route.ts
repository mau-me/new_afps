import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import connectToDatabase from '@/lib/db';
import User from '@/lib/models/User';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        cpf: { label: 'CPF', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        await connectToDatabase();
        const user = await User.findOne({ cpf: credentials.cpf });
        if (!user) {
          throw new Error('CPF não encontrado');
        }
        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isValid) {
          throw new Error('Senha incorreta');
        }
        return {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
          playerId: user.playerId,
          cpf: user.cpf,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.playerId = token.playerId;
      session.user.cpf = token.cpf;
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.playerId = user.playerId;
        token.cpf = user.cpf;
      }
      return token;
    },
  },
  pages: {
    signIn: '/auth/cpf',
    error: '/auth/error',
  },
};

// Exporta os handlers para GET e POST
export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
