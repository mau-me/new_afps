import connectToDatabase from '@/lib/db';

export default async function TestDBPage() {
  try {
    await connectToDatabase();
    return <div>Conexão com MongoDB bem-sucedida!</div>;
  } catch (error) {
    return <div>Erro na conexão: {error.message}</div>;
  }
}
