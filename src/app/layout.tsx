import type React from 'react';
import type { Metadata, Viewport } from 'next';
import { Archivo } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

// Fonte variável com eixo de largura: texto normal, títulos condensados
// (classe `heading`) e numerais extra-condensados (classe `numeral`).
const archivo = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--font-archivo',
});

export const metadata: Metadata = {
  title: 'AFPS - Sistema de Gestão',
  description:
    'Sistema de gestão para Associação de Futebol de Porto dos Santos',
};

export const viewport: Viewport = {
  themeColor: '#024957',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='pt-BR' className={archivo.variable}>
      <body className='font-sans'>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
