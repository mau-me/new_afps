import type React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AFPS - Sistema de Gestão',
  description: 'Sistema de gestão para Associação de Futebol',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='pt-BR' suppressHydrationWarning>
      <body
        className={`${inter.className} antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          <ThemeProvider
            attribute='class'
            defaultTheme='light'
            enableSystem={false}
            disableTransitionOnChange
          >
            <div className='min-h-screen bg-background text-foreground'>
              {children}
            </div>
            <Toaster />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
