# LeadMap CRM

CRM de liderancas politicas ou comunitarias com autenticação, dashboard, CRUD completo, ranking, mapa interativo com Leaflet/OpenStreetMap, auditoria básica e interface administrativa responsiva.

## Stack

- Next.js 15 com App Router
- React 19
- TypeScript estrito
- Tailwind CSS
- PostgreSQL
- Prisma ORM
- NextAuth
- Leaflet + OpenStreetMap
- Zod
- React Hook Form
- TanStack Table
- Recharts
- Vitest

## Funcionalidades

- Login com sessão e perfis `ADMIN` e `OPERATOR`
- Dashboard com cards, gráficos e ranking resumido
- CRUD de lideranças com validação no frontend e backend
- Filtros por texto, cidade, estado, faixa, status, período e responsável
- Ranking ordenado por quantidade de indicações
- Mapa com pins coloridos por potencial e cluster automático
- Geocodificação desacoplada via Nominatim/OpenStreetMap
- Auditoria básica para criação, edição, exclusão, inativação e reativação
- Página de usuários e página de configurações
- Seed com dados realistas
- Testes unitários e de serviços

## Arquitetura

O projeto foi organizado em camadas coesas:

- `app`: páginas, layouts e rotas API do App Router
- `components`: UI reutilizável e componentes por domínio
- `lib`: autenticação, Prisma, utilitários, permissões e constantes
- `services`: regras de negócio e orquestração
- `repositories`: acesso ao Prisma e consultas
- `prisma`: schema, migrations e seed
- `types`: tipos compartilhados e declarações
- `validations`: schemas Zod para entradas e filtros
- `tests`: testes de regra de negócio e validação

## Estrutura principal

```text
.
|-- app
|   |-- (auth)/login
|   |-- (protected)/dashboard
|   |-- (protected)/liderancas
|   |-- (protected)/ranking
|   |-- (protected)/mapa
|   |-- (protected)/usuarios
|   |-- (protected)/configuracoes
|   `-- api
|-- components
|   |-- auth
|   |-- dashboard
|   |-- layout
|   |-- liderancas
|   |-- mapa
|   |-- ranking
|   |-- shared
|   |-- ui
|   `-- users
|-- lib
|-- prisma
|   |-- migrations
|   |-- schema.prisma
|   `-- seed.ts
|-- repositories
|-- services
|-- tests
|-- types
|-- validations
|-- docker-compose.yml
`-- README.md
```

## Como rodar

### 1. Instale dependências

```bash
npm install
```

### 2. Configure o ambiente

Crie um arquivo `.env` a partir de `.env.example`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/leadmap"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="troque-por-uma-chave-segura-com-32-caracteres-ou-mais"
```

### 3. Suba o PostgreSQL

Se você já tiver PostgreSQL local, apenas crie o banco `leadmap`.

Se quiser usar Docker:

```bash
docker compose up -d postgres
```

### 4. Rode as migrations

```bash
npm run db:migrate
```

### 5. Rode o seed

```bash
npm run db:seed
```

### 6. Inicie o projeto

```bash
npm run dev
```

Abra `http://localhost:3000`.

## Deploy com Railway + Netlify

### Railway

1. Crie um projeto no Railway.
2. Adicione um banco PostgreSQL.
3. Copie a string de conexão publica do banco para usar fora do Railway.
4. Rode as migrations contra esse banco:

```bash
DATABASE_URL="SUA_URL_DO_RAILWAY" npm run db:deploy
DATABASE_URL="SUA_URL_DO_RAILWAY" npm run db:seed
```

### Netlify

1. Importe este repositório no Netlify.
2. O projeto já possui [netlify.toml](./netlify.toml) com `npm run build` e publish em `.next`.
3. Cadastre as variáveis de ambiente no painel do Netlify.

Variáveis recomendadas:

- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `NETLIFY_NEXT_SKEW_PROTECTION=true`

Sugestão prática:

- `NEXTAUTH_URL`: use a URL final do site no Netlify, por exemplo `https://seu-site.netlify.app`
- `NEXTAUTH_SECRET`: gere uma chave longa e aleatória
- em produção, configure as variáveis com escopo de build e functions

Se você usar domínio customizado, atualize `NEXTAUTH_URL` para esse domínio e faça novo deploy.

## Scripts úteis

```bash
npm run dev
npm run build
npm run start
npm test
npm run db:generate
npm run db:migrate
npm run db:deploy
npm run db:seed
```

## Credenciais de teste

- Admin
  - Email: `admin@leadmap.local`
  - Senha: `Admin123!`
- Operador
  - Email: `operador@leadmap.local`
  - Senha: `Operador123!`

## Rotas principais

- `/login`
- `/dashboard`
- `/liderancas`
- `/liderancas/nova`
- `/liderancas/[id]`
- `/liderancas/[id]/editar`
- `/ranking`
- `/mapa`
- `/usuarios`
- `/configuracoes`

## Decisões técnicas

- `locationStatus` foi separado de `status` para manter o status operacional da liderança independente da qualidade da geocodificação.
- A classificação de potencial fica centralizada em `lib/constants/potential.ts`.
- A geocodificação foi encapsulada em `services/geocoding-service.ts` para facilitar troca futura do provedor.
- O acesso ao banco fica nos repositórios e as regras de negócio ficam nos serviços.
- O CRUD usa validação compartilhada com Zod tanto no frontend quanto no backend.
- Operadores não conseguem excluir definitivamente nem pela interface nem pela API.
- O mapa usa cluster automático e pins customizados por faixa de potencial.

## Testes

Cobertura inicial entregue:

- regra de faixa de potencial
- validação Zod do cadastro
- criação de liderança via service
- ranking via service

Rode com:

```bash
npm test
```

## Observações

- A geocodificação depende de acesso à internet para consultar o Nominatim.
- Se a geocodificação falhar, o cadastro continua e a liderança fica com localização pendente.
- O build de produção já foi validado localmente.

## Próximos passos recomendados

1. Adicionar paginação totalmente server-side com cache e revalidação por rota.
2. Incluir gestão completa de usuários com criação/edição pela interface.
3. Expandir a auditoria para login/logout e alterações de permissões.
4. Adicionar E2E com Playwright para fluxos críticos.
