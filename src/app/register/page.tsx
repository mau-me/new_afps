'use client';

import type React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Loader2,
  ArrowLeft,
  Trophy,
  User,
  Mail,
  Lock,
  CreditCard,
} from 'lucide-react';
import { validateCPF, formatCPF } from '@/lib/utils';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    cpf: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Formatação automática do CPF
    if (name === 'cpf') {
      const formattedCPF = formatCPF(value);
      setFormData((prev) => ({
        ...prev,
        [name]: formattedCPF,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Validações
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      setIsLoading(false);
      return;
    }

    if (!validateCPF(formData.cpf)) {
      setError('CPF inválido');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao criar conta');
      }

      setSuccess('Conta criada com sucesso! Redirecionando para login...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error: any) {
      setError(error.message);
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
          <h1 className='text-2xl font-semibold text-accent mb-sm'>
            Cadastrar-se
          </h1>
          <p className='text-neutral-400'>
            Crie sua conta para acessar o sistema da AFPS
          </p>
        </div>

        <Card>
          <CardContent className='pt-lg'>
            <form onSubmit={handleSubmit} className='space-y-lg'>
              {/* Nome */}
              <div className='space-y-sm'>
                <Label htmlFor='name' className='text-accent'>
                  Nome Completo
                </Label>
                <div className='relative'>
                  <User className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400' />
                  <Input
                    id='name'
                    name='name'
                    type='text'
                    placeholder='Seu nome completo'
                    value={formData.name}
                    onChange={handleChange}
                    className='pl-10'
                    required
                  />
                </div>
              </div>

              {/* CPF */}
              <div className='space-y-sm'>
                <Label htmlFor='cpf' className='text-accent'>
                  CPF
                </Label>
                <div className='relative'>
                  <CreditCard className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400' />
                  <Input
                    id='cpf'
                    name='cpf'
                    type='text'
                    placeholder='000.000.000-00'
                    value={formData.cpf}
                    onChange={handleChange}
                    className='pl-10'
                    maxLength={14}
                    required
                  />
                </div>
                <p className='text-xs text-neutral-400'>
                  Seu CPF deve estar cadastrado pela comissão para criar uma
                  conta
                </p>
              </div>

              {/* Email */}
              <div className='space-y-sm'>
                <Label htmlFor='email' className='text-accent'>
                  Email
                </Label>
                <div className='relative'>
                  <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400' />
                  <Input
                    id='email'
                    name='email'
                    type='email'
                    placeholder='seu@email.com'
                    value={formData.email}
                    onChange={handleChange}
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
                    name='password'
                    type='password'
                    placeholder='Mínimo 6 caracteres'
                    value={formData.password}
                    onChange={handleChange}
                    className='pl-10'
                    required
                  />
                </div>
              </div>

              {/* Confirmar Senha */}
              <div className='space-y-sm'>
                <Label htmlFor='confirmPassword' className='text-accent'>
                  Confirmar Senha
                </Label>
                <div className='relative'>
                  <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400' />
                  <Input
                    id='confirmPassword'
                    name='confirmPassword'
                    type='password'
                    placeholder='Confirme sua senha'
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className='pl-10'
                    required
                  />
                </div>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <Alert variant='destructive'>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className='border-success bg-success/10'>
                  <AlertDescription className='text-success'>
                    {success}
                  </AlertDescription>
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
                Criar Conta
              </Button>
            </form>

            {/* Login Link */}
            <div className='mt-lg text-center'>
              <p className='text-sm text-neutral-400'>
                Já tem uma conta?{' '}
                <Link
                  href='/login'
                  className='text-primary hover:text-primary/80 transition-colors font-medium'
                >
                  Entre aqui
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
