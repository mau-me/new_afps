'use client';

import type React from 'react';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowLeft } from 'lucide-react';
import { validateCPF } from '@/lib/utils';

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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='w-full max-w-md'>
        <div className='mb-6'>
          <Link
            href='/'
            className='inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors'
          >
            <ArrowLeft className='h-4 w-4 mr-2' />
            Voltar para home
          </Link>
        </div>

        <Card>
          <CardHeader className='space-y-1'>
            <CardTitle className='text-2xl text-center'>Cadastrar-se</CardTitle>
            <CardDescription className='text-center'>
              Crie sua conta para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='name'>Nome Completo</Label>
                <Input
                  id='name'
                  name='name'
                  type='text'
                  placeholder='Seu nome completo'
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='cpf'>CPF</Label>
                <Input
                  id='cpf'
                  name='cpf'
                  type='text'
                  placeholder='000.000.000-00'
                  value={formData.cpf}
                  onChange={handleChange}
                  required
                />
                <p className='text-xs text-gray-500'>
                  Seu CPF deve estar cadastrado pela comissão para criar uma
                  conta
                </p>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='email'>Email</Label>
                <Input
                  id='email'
                  name='email'
                  type='email'
                  placeholder='seu@email.com'
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='password'>Senha</Label>
                <Input
                  id='password'
                  name='password'
                  type='password'
                  placeholder='Mínimo 6 caracteres'
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='confirmPassword'>Confirmar Senha</Label>
                <Input
                  id='confirmPassword'
                  name='confirmPassword'
                  type='password'
                  placeholder='Confirme sua senha'
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              {error && (
                <Alert variant='destructive'>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <Button type='submit' className='w-full' disabled={isLoading}>
                {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                Criar Conta
              </Button>
            </form>

            <div className='mt-6 text-center'>
              <p className='text-sm text-gray-600'>
                Já tem uma conta?{' '}
                <Link href='/login' className='text-primary hover:underline'>
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
