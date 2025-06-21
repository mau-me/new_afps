export function TailwindTest() {
  return (
    <div className='p-4 bg-red-500 text-white rounded-lg shadow-lg'>
      <h1 className='text-2xl font-bold'>Teste Tailwind CSS</h1>
      <p className='mt-2'>
        Se você vê este texto em branco com fundo vermelho, o Tailwind está
        funcionando!
      </p>
      <button className='mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors'>
        Botão de Teste
      </button>
    </div>
  );
}
