'use client';

import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error') || 'Erro desconhecido';

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100 p-4'>
      <Card className='w-full max-w-sm'>
        <CardHeader>
          <CardTitle className='text-2xl'>Erro de Autenticação</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-red-500 mb-4'>{error}</p>
          <Link href='/auth/cpf'>
            <Button className='w-full'>Tentar Novamente</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
