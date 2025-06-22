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
            Cadastrar-se
          </h1>
          <p className='text-text-secondary text-lg'>
            Crie sua conta para acessar o sistema da AFPS
          </p>
        </div>

        <Card className='hover:scale-105 transition-transform'>
          <CardContent className='pt-8'>
            <form onSubmit={handleSubmit} className='space-y-6'>
              {/* Nome */}
              <div className='space-y-3'>
                <Label
                  htmlFor='name'
                  className='text-text-primary text-base font-medium'
                >
                  Nome Completo
                </Label>
                <div className='relative'>
                  <User className='absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-secondary' />
                  <Input
                    id='name'
                    name='name'
                    type='text'
                    placeholder='Seu nome completo'
                    value={formData.name}
                    onChange={handleChange}
                    className='pl-12 h-14 text-base'
                    required
                  />
                </div>
              </div>

              {/* CPF */}
              <div className='space-y-3'>
                <Label
                  htmlFor='cpf'
                  className='text-text-primary text-base font-medium'
                >
                  CPF
                </Label>
                <div className='relative'>
                  <CreditCard className='absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-secondary' />
                  <Input
                    id='cpf'
                    name='cpf'
                    type='text'
                    placeholder='000.000.000-00'
                    value={formData.cpf}
                    onChange={handleChange}
                    className='pl-12 h-14 text-base'
                    maxLength={14}
                    required
                  />
                </div>
                <p className='text-sm text-text-secondary'>
                  Seu CPF deve estar cadastrado pela comissão para criar uma
                  conta
                </p>
              </div>

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
                    name='email'
                    type='email'
                    placeholder='seu@email.com'
                    value={formData.email}
                    onChange={handleChange}
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
                    name='password'
                    type='password'
                    placeholder='Mínimo 6 caracteres'
                    value={formData.password}
                    onChange={handleChange}
                    className='pl-12 h-14 text-base'
                    required
                  />
                </div>
              </div>

              {/* Confirmar Senha */}
              <div className='space-y-3'>
                <Label
                  htmlFor='confirmPassword'
                  className='text-text-primary text-base font-medium'
                >
                  Confirmar Senha
                </Label>
                <div className='relative'>
                  <Lock className='absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-secondary' />
                  <Input
                    id='confirmPassword'
                    name='confirmPassword'
                    type='password'
                    placeholder='Confirme sua senha'
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className='pl-12 h-14 text-base'
                    required
                  />
                </div>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <Alert variant='destructive' className='rounded-2xl'>
                  <AlertDescription className='text-base'>
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className='border-green-500 bg-green-500/10 rounded-2xl'>
                  <AlertDescription className='text-green-400 text-base'>
                    {success}
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
                Criar Conta
              </Button>
            </form>

            {/* Login Link */}
            <div className='mt-8 text-center'>
              <p className='text-base text-text-secondary'>
                Já tem uma conta?{' '}
                <Link
                  href='/login'
                  className='text-primary-color hover:text-primary-dark transition-colors font-medium'
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
