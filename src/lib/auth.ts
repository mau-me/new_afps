import CredentialsProvider from 'next-auth/providers/credentials';
import type { NextAuthOptions } from 'next-auth';
import dbConnect from './mongodb';
import User from './models/User';
import { getClientIp, rateLimit } from './rate-limit';
import { getUserStatus } from './user-status';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password;

        if (!email || !password) {
          return null;
        }

        // Máx. 10 tentativas a cada 15 min por IP+email.
        const ip = getClientIp(req?.headers ?? {});
        const limit = rateLimit(`login:${ip}:${email}`, {
          limit: 10,
          windowMs: 15 * 60 * 1000,
        });
        if (!limit.ok) {
          throw new Error('Muitas tentativas. Tente novamente mais tarde.');
        }

        try {
          await dbConnect();

          const user = await User.findOne({ email, isActive: true }).select(
            '+password'
          );

          if (!user || !(await user.comparePassword(password))) {
            return null;
          }

          return {
            id: String(user._id),
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error('Erro durante autenticação:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 dias
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.disabled = false;
        return token;
      }

      // Revalida a conta: desativação e mudança de papel valem sem esperar
      // o token expirar.
      if (token.sub) {
        try {
          const status = await getUserStatus(token.sub);
          if (!status || !status.isActive) {
            token.disabled = true;
          } else {
            token.disabled = false;
            token.role = status.role;
          }
        } catch (error) {
          // Falha momentânea do banco não derruba quem já está logado.
          console.error('Erro ao revalidar sessão:', error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      session.user.role = token.role ?? 'jogador';
      session.disabled = Boolean(token.disabled);
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};
