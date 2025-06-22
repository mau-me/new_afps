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
    <div className='min-h-screen bg-background-color flex items-center justify-center py-12 px-6'>
      <div className='w-full max-w-md animate-fade-in'>
        {/* Back Button */}
        <div className='mb-8'>
          <Link
            href='/'
            className='inline-flex items-center text-base text-text-secondary hover:text-primary-color transition-colors'
          >
            <ArrowLeft className='h-4 w-4 mr-2' />
            Voltar para home
          </Link>
        </div>

        {/* Header */}
        <div className='text-center mb-12'>
          <div className='flex justify-center mb-6'>
            <div className='flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-color shadow-xl'>
              <Trophy className='h-8 w-8 text-background-color' />
            </div>
          </div>
          <h1 className='text-3xl font-semibold text-text-primary mb-3'>
            Entrar
          </h1>
          <p className='text-text-secondary text-lg'>
            Entre com suas credenciais para acessar o sistema
          </p>
        </div>

        <Card className='hover:scale-105 transition-transform'>
          <CardContent className='pt-8'>
            <form onSubmit={handleSubmit} className='space-y-6'>
              {/* Email */}
              <div className='space-y-3'>
                <Label
                  htmlFor='email'
                  className='text-text-primary text-base font-medium'
                >
                  Email
                </Label>
                <div className='relative'>
                  <Mail className='absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-secondary' />
                  <Input
                    id='email'
                    type='email'
                    placeholder='seu@email.com'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className='pl-12 h-14 text-base'
                    required
                  />
                </div>
              </div>

              {/* Senha */}
              <div className='space-y-3'>
                <Label
                  htmlFor='password'
                  className='text-text-primary text-base font-medium'
                >
                  Senha
                </Label>
                <div className='relative'>
                  <Lock className='absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-secondary' />
                  <Input
                    id='password'
                    type='password'
                    placeholder='Sua senha'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className='pl-12 h-14 text-base'
                    required
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <Alert variant='destructive' className='rounded-2xl'>
                  <AlertDescription className='text-base'>
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type='submit'
                className='w-full h-14 text-lg'
                disabled={isLoading}
              >
                {isLoading && <Loader2 className='mr-3 h-5 w-5 animate-spin' />}
                Entrar
              </Button>
            </form>

            {/* Register Link */}
            <div className='mt-8 text-center'>
              <p className='text-base text-text-secondary'>
                Não tem uma conta?{' '}
                <Link
                  href='/register'
                  className='text-primary-color hover:text-primary-dark transition-colors font-medium'
                >
                  Cadastre-se aqui
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <div className='mt-8'>
          <Card className='bg-card-background/50 border-border-color'>
            <CardContent className='pt-6'>
              <h3 className='text-base font-medium text-text-primary mb-3'>
                Credenciais de Teste:
              </h3>
              <div className='space-y-2 text-sm text-text-secondary'>
                <p>
                  <strong className='text-text-primary'>Admin:</strong>{' '}
                  admin@portodossantos.com / admin123
                </p>
                <p>
                  <strong className='text-text-primary'>
                    CPFs permitidos:
                  </strong>{' '}
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
