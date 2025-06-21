'use client';

import { createPlayer } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewPlayerPage() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100'>
      <Card className='w-full max-w-md'>
        <CardHeader>
          <CardTitle>Criar Novo Jogador</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createPlayer}>
            <Input
              name='name'
              type='text'
              placeholder='Nome completo'
              required
              className='mb-4'
            />
            <Input
              name='nickname'
              type='text'
              placeholder='Apelido'
              className='mb-4'
            />
            <Input
              name='position'
              type='text'
              placeholder='Posição'
              className='mb-4'
            />
            <Input
              name='shirtNumber'
              type='number'
              placeholder='Número da camisa'
              className='mb-4'
            />
            <Input
              name='birthDate'
              type='date'
              placeholder='Data de nascimento'
              className='mb-4'
            />
            <Input
              name='email'
              type='email'
              placeholder='E-mail'
              required
              className='mb-4'
            />
            <Input
              name='cpf'
              type='text'
              placeholder='CPF'
              required
              className='mb-4'
            />
            <Input
              name='phone'
              type='text'
              placeholder='Telefone'
              className='mb-4'
            />
            <Input
              name='address'
              type='text'
              placeholder='Endereço'
              className='mb-4'
            />
            <Input
              name='password'
              type='password'
              placeholder='Senha'
              required
              className='mb-4'
            />
            <Button type='submit' className='w-full'>
              Criar Jogador
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
