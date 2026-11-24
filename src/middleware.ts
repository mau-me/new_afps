import { NextResponse } from 'next/server';
import { withAuth } from 'next-auth/middleware';

/** Rotas exclusivas da comissão. */
const COMMISSION_ONLY = ['/players/new', '/financial', '/settings', '/admin'];

/** Edição de ficha: /players/<id>/edit */
const PLAYER_EDIT = /^\/players\/[^/]+\/edit\/?$/;

function isCommissionOnly(pathname: string) {
  return (
    PLAYER_EDIT.test(pathname) ||
    COMMISSION_ONLY.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  );
}

export default withAuth(
  // Logado, mas sem permissão: vai para o dashboard (e não para o login).
  function middleware(req) {
    if (
      isCommissionOnly(req.nextUrl.pathname) &&
      req.nextauth.token?.role !== 'comissao'
    ) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      // Sem login: o NextAuth redireciona para /login com callbackUrl.
      authorized: ({ token }) => Boolean(token),
    },
    pages: {
      signIn: '/login',
    },
  }
);

// Protege tudo que exige login. As páginas também verificam a sessão
// (defesa em profundidade) — o middleware não substitui essas checagens.
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/players/:path*',
    '/financial/:path*',
    '/me/:path*',
    '/settings/:path*',
    '/admin/:path*',
  ],
};
