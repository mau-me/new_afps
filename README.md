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
| `npm test`           | Testes unitários                            |
| `npm run seed`       | Popula o banco com dados iniciais           |

## Papéis e fluxo de cadastro

- **Comissão** (`comissao`): administra jogadores e finanças.
- **Jogador** (`jogador`): vê o dashboard e a lista de jogadores.

Ninguém se cadastra sem autorização:

1. A comissão cadastra o jogador em **Jogadores → Cadastrar jogador**. Isso
   libera o CPF dele.
2. O jogador cria sua conta em **Cadastrar-se** usando o mesmo CPF; a conta é
   vinculada automaticamente à ficha.

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
    models/             schemas do Mongoose
    auth.ts             configuração do NextAuth
    session.ts          helpers requireSession / requireRole / assertRole
    validation.ts       schemas Zod compartilhados
  middleware.ts         proteção de rotas
scripts/seed-database.js
```

## Convenções

- **Valores em dinheiro** são guardados em **centavos** (`amountCents`,
  inteiro). Use `formatCents` e `parseCurrencyToCents` de `lib/utils`.
- **CPF** é guardado só com dígitos; normalize com `onlyDigits` ou `cpfSchema`.
- **Server actions** são endpoints públicos: comece toda action com
  `assertRole(...)`.
- Mensalidade "vencida" não é um status salvo: é `em_aberto` com `dueDate` no
  passado (`overdueFilter`).
- O limite de tentativas (`lib/rate-limit.ts`) guarda o estado em memória. Em
  produção com várias instâncias, troque por Redis/Upstash.
