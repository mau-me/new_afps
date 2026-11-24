# AFPS — Sistema de Gestão

Sistema de gestão da **Associação de Futebol de Porto dos Santos**: página
pública da associação, cadastro de jogadores e controle financeiro
(mensalidades, multas por cartão e transações).

## Stack

- [Next.js 15](https://nextjs.org) (App Router) + React 19 + TypeScript
- MongoDB com [Mongoose](https://mongoosejs.com)
- [NextAuth v4](https://next-auth.js.org) (login por email e senha, sessão JWT)
- Tailwind CSS v4 + componentes [shadcn/ui](https://ui.shadcn.com)
- [Zod](https://zod.dev) para validação (compartilhada entre cliente e servidor)
- [Vitest](https://vitest.dev) para testes

## Primeiros passos

Requisitos: Node.js 22.9+ e um MongoDB acessível.

```bash
npm install
cp .env.example .env.local   # preencha MONGODB_URI e NEXTAUTH_SECRET
npm run seed                 # cria associação, admin e CPFs de teste
npm run dev
```

Acesse http://localhost:3000.

O seed cria o administrador (papel `comissao`) com o email `SEED_ADMIN_EMAIL`.
Se `SEED_ADMIN_PASSWORD` não for definido, uma senha aleatória é gerada e
exibida **uma única vez** no terminal.

## Scripts

| Comando              | Descrição                                   |
| -------------------- | ------------------------------------------- |
| `npm run dev`        | Servidor de desenvolvimento                 |
| `npm run build`      | Build de produção (inclui lint e tipos)     |
| `npm run start`      | Servidor de produção                        |
| `npm run lint`       | ESLint                                      |
| `npm run type-check` | Checagem de tipos                           |
| `npm test`           | Testes unitários e de integração            |
| `npm run seed`       | Popula o banco com dados iniciais           |

## Papéis e fluxo de cadastro

- **Comissão** (`comissao`): administra jogadores e finanças.
- **Jogador** (`jogador`): vê o dashboard e a lista de jogadores.

Ninguém se cadastra sem autorização:

1. A comissão cadastra o jogador em **Jogadores → Cadastrar jogador**. Isso
   libera o CPF dele.
2. O jogador cria sua conta em **Cadastrar-se** usando o mesmo CPF; a conta é
   vinculada automaticamente à ficha.

## Financeiro

O menu **Financeiro** (só a comissão) tem três abas: Caixa, Mensalidades e
Cartões.

### Mensalidades

Em **Mensalidades**:

1. Defina o valor único da mensalidade e o dia de vencimento (1 a 28).
2. Gere as mensalidades do mês: uma para cada jogador ativo. Gerar de novo é
   seguro, porque só cria para quem ainda não tem (por exemplo, jogadores
   cadastrados depois).
3. Registre cada pagamento com a data em que foi pago. Isso lança a entrada no
   caixa na mesma transação do banco. "Desfazer" remove as duas coisas.

Uma mensalidade fica **vencida** a partir do dia seguinte ao vencimento, no
horário da Bahia. Mudar o valor só afeta as mensalidades geradas depois.

### Caixa

Em **Caixa** ficam todas as entradas e saídas do mês, com o
saldo do mês e o **saldo em caixa** acumulado até o fim do mês escolhido.

- **Novo lançamento:** entrada ou saída, categoria, valor, data e descrição.
- Pagamentos de mensalidade entram sozinhos (categoria "Mensalidade") e só
  podem ser desfeitos na página de Mensalidades.
- **Excluir** um lançamento manual o tira do caixa, mas ele fica guardado no
  banco com quem excluiu e quando (trilha de auditoria).

### Cartões

Em **Cartões** ficam as multas por cartão amarelo e vermelho.

- **Registrar cartão:** jogador, cor, valor, data do jogo e uma observação
  opcional. Também dá para registrar a partir da ficha do jogador.
- A multa fica **pendente** até ser paga. Ao registrar o pagamento, a entrada
  (categoria "Multa") vai para o caixa na mesma transação. "Desfazer" reverte.
- Só multas pendentes podem ser excluídas (para registros feitos por engano).
- O jogador vê os próprios cartões em **Minha área**.

## Configurações

Em **Configurações** (só a comissão):

- **Associação:** dados públicos (aparecem na página inicial) e valores:
  mensalidade, dia de vencimento e multas padrão dos cartões.
- **Usuários:** criar contas (ex.: novo membro da comissão), mudar o papel e
  desativar acessos. A comissão nunca fica sem pelo menos um membro ativo, e
  ninguém altera a própria conta.
- **CPFs liberados:** quem pode criar conta. Cadastrar um jogador já libera o
  CPF dele.

Desativar uma conta ou mudar o papel vale em até um minuto, sem esperar o
login expirar: a sessão é revalidada no servidor (`lib/user-status.ts`).

## Estrutura

```
src/
  app/                  rotas (App Router)
    api/auth/           NextAuth e cadastro
    dashboard/          painel
    players/            lista e cadastro de jogadores
  components/           navbar e componentes de UI (shadcn)
  lib/
    actions/            server actions (sempre com checagem de papel)
    data/               consultas de servidor (não expostas como endpoint)
    months.ts           mês de referência e datas no fuso da Bahia
    models/             schemas do Mongoose
    auth.ts             configuração do NextAuth
    session.ts          helpers requireSession / requireRole / assertRole
    validation.ts       schemas Zod compartilhados
  middleware.ts         proteção de rotas
scripts/seed-database.js
```

## Testes

`npm test` roda os testes unitários e os de integração das server actions. Os
de integração sobem um MongoDB em memória (`mongodb-memory-server`, com replica
set para as transações). Na primeira execução ele baixa o binário do MongoDB, o
que leva cerca de 1 a 2 minutos. Depois, a suíte inteira roda em segundos.

## Convenções

- **Valores em dinheiro** são guardados em **centavos** (`amountCents`,
  inteiro). Use `formatCents` e `parseCurrencyToCents` de `lib/utils`.
- **CPF** é guardado só com dígitos; normalize com `onlyDigits` ou `cpfSchema`.
- **Server actions** são endpoints públicos: comece toda action com
  `assertRole(...)`.
- **Lançamentos nunca são apagados:** use exclusão lógica (`deletedAt`/
  `deletedBy`) e filtre com `activeFilter` de `models/Transaction` em toda
  consulta ao caixa.
- Intervalos de mês usam `monthRange` (`lib/months.ts`), no fuso da Bahia.
- Mensalidade "vencida" não é um status salvo: é `em_aberto` com `dueDate` no
  passado (`overdueFilter`).
- O limite de tentativas (`lib/rate-limit.ts`) guarda o estado em memória. Em
  produção com várias instâncias, troque por Redis/Upstash.
