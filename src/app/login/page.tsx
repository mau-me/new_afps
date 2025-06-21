'use client';

import type React from 'react';
import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowLeft, Trophy, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

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

      if (result?.error) {
        setError('Email ou senha inválidos');
      } else {
        const session = await getSession();
        if (session) {
          router.push('/dashboard');
        }
      }
    } catch (error) {
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-neutral-900 flex items-center justify-center py-xl px-md'>
      <div className='w-full max-w-md'>
        {/* Back Button */}
        <div className='mb-lg'>
          <Link
            href='/'
            className='inline-flex items-center text-sm text-neutral-400 hover:text-accent transition-colors'
          >
            <ArrowLeft className='h-4 w-4 mr-sm' />
            Voltar para home
          </Link>
        </div>

        {/* Header */}
        <div className='text-center mb-xl'>
          <div className='flex justify-center mb-md'>
            <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-accent'>
              <Trophy className='h-6 w-6' />
            </div>
          </div>
          <h1 className='text-2xl font-semibold text-accent mb-sm'>Entrar</h1>
          <p className='text-neutral-400'>
            Entre com suas credenciais para acessar o sistema
          </p>
        </div>

        <Card>
          <CardContent className='pt-lg'>
            <form onSubmit={handleSubmit} className='space-y-lg'>
              {/* Email */}
              <div className='space-y-sm'>
                <Label htmlFor='email' className='text-accent'>
                  Email
                </Label>
                <div className='relative'>
                  <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400' />
                  <Input
                    id='email'
                    type='email'
                    placeholder='seu@email.com'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className='pl-10'
                    required
                  />
                </div>
              </div>

              {/* Senha */}
              <div className='space-y-sm'>
                <Label htmlFor='password' className='text-accent'>
                  Senha
                </Label>
                <div className='relative'>
                  <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400' />
                  <Input
                    id='password'
                    type='password'
                    placeholder='Sua senha'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className='pl-10'
                    required
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <Alert variant='destructive'>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type='submit'
                className='w-full'
                size='lg'
                disabled={isLoading}
              >
                {isLoading && (
                  <Loader2 className='mr-sm h-4 w-4 animate-spin' />
                )}
                Entrar
              </Button>
            </form>

            {/* Register Link */}
            <div className='mt-lg text-center'>
              <p className='text-sm text-neutral-400'>
                Não tem uma conta?{' '}
                <Link
                  href='/register'
                  className='text-primary hover:text-primary/80 transition-colors font-medium'
                >
                  Cadastre-se aqui
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <div className='mt-lg'>
          <Card className='bg-neutral-800/50 border-neutral-700'>
            <CardContent className='pt-md'>
              <h3 className='text-sm font-medium text-accent mb-sm'>
                Credenciais de Teste:
              </h3>
              <div className='space-y-xs text-xs text-neutral-400'>
                <p>
                  <strong className='text-accent'>Admin:</strong>{' '}
                  admin@portodossantos.com / admin123
                </p>
                <p>
                  <strong className='text-accent'>CPFs permitidos:</strong>{' '}
                  12345678901, 98765432100
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
