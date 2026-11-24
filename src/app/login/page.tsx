'use client';

import type React from 'react';
import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { AuthShell } from '@/components/auth-shell';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  // Só aceita caminhos internos, para evitar open redirect.
  const requested = searchParams.get('callbackUrl') ?? '';
  const callbackUrl =
    requested.startsWith('/') && !requested.startsWith('//')
      ? requested
      : '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (!result || result.error) {
        // 'CredentialsSignin' = email/senha incorretos; outros = mensagem do servidor
        setError(
          !result || result.error === 'CredentialsSignin'
            ? 'Email ou senha inválidos'
            : result.error!,
        );
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      <div className='space-y-2'>
        <Label htmlFor='email'>Email</Label>
        <Input
          id='email'
          type='email'
          autoComplete='email'
          placeholder='seu@email.com'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className='space-y-2'>
        <Label htmlFor='password'>Senha</Label>
        <Input
          id='password'
          type='password'
          autoComplete='current-password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {error && (
        <Alert variant='destructive'>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button type='submit' className='w-full' size='lg' disabled={isLoading}>
        {isLoading && <Loader2 className='animate-spin' />}
        Entrar
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <AuthShell
      title='Entrar'
      description='Use o email e a senha da sua conta na AFPS.'
      footer={
        <>
          Ainda não tem conta?{' '}
          <Link
            href='/register'
            className='font-medium text-primary underline underline-offset-4'
          >
            Cadastre-se
          </Link>
        </>
      }
    >
      {/* useSearchParams exige Suspense; só o formulário fica no cliente */}
      <Suspense fallback={<div className='h-64' />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
