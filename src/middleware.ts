import { withAuth } from 'next-auth/middleware';

/** Rotas exclusivas da comissão. */
const COMMISSION_ONLY = ['/players/new', '/settings', '/admin'];

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      if (!token) return false;

      const { pathname } = req.nextUrl;
      if (COMMISSION_ONLY.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
        return token.role === 'comissao';
      }
      return true;
    },
  },
  pages: {
    signIn: '/login',
  },
});

// Protege tudo que exige login. As páginas também verificam a sessão
// (defesa em profundidade) — o middleware não substitui essas checagens.
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/players/:path*',
    '/settings/:path*',
    '/admin/:path*',
  ],
};
