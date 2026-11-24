'use client';

import type React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { AuthShell } from '@/components/auth-shell';
import { formatCPF } from '@/lib/utils';
import { PASSWORD_MIN_LENGTH, registerSchema } from '@/lib/validation';

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

    const parsed = registerSchema.safeParse(formData);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Dados inválidos');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parsed.data),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao criar conta');
      }

      setSuccess('Conta criada com sucesso! Redirecionando para login...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Erro ao criar conta'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const field = (
    name: keyof typeof formData,
    label: string,
    props: React.ComponentProps<typeof Input> = {},
    hint?: string
  ) => (
    <div className='space-y-2'>
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        aria-describedby={hint ? `${name}-hint` : undefined}
        required
        {...props}
      />
      {hint && (
        <p id={`${name}-hint`} className='text-sm text-muted-foreground'>
          {hint}
        </p>
      )}
    </div>
  );

  return (
    <AuthShell
      title='Criar conta'
      description='Para jogadores já cadastrados pela comissão da AFPS.'
      footer={
        <>
          Já tem conta?{' '}
          <Link
            href='/login'
            className='font-medium text-primary underline underline-offset-4'
          >
            Entrar
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className='space-y-6'>
        {field('name', 'Nome completo', {
          type: 'text',
          autoComplete: 'name',
        })}
        {field(
          'cpf',
          'CPF',
          {
            type: 'text',
            inputMode: 'numeric',
            placeholder: '000.000.000-00',
            maxLength: 14,
          },
          'Use o mesmo CPF que você passou para a comissão.'
        )}
        {field('email', 'Email', {
          type: 'email',
          autoComplete: 'email',
          placeholder: 'seu@email.com',
        })}
        {field(
          'password',
          'Senha',
          {
            type: 'password',
            autoComplete: 'new-password',
            minLength: PASSWORD_MIN_LENGTH,
          },
          `Mínimo de ${PASSWORD_MIN_LENGTH} caracteres.`
        )}
        {field('confirmPassword', 'Confirmar senha', {
          type: 'password',
          autoComplete: 'new-password',
        })}

        {error && (
          <Alert variant='destructive'>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert variant='success'>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Button type='submit' className='w-full' size='lg' disabled={isLoading}>
          {isLoading && <Loader2 className='animate-spin' />}
          Criar conta
        </Button>
      </form>
    </AuthShell>
  );
}
