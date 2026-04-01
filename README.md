# LeadMap CRM

CRM web de liderancas com Next.js App Router, TypeScript, Tailwind, PostgreSQL, Prisma, NextAuth, Leaflet/OpenStreetMap, Zod e React Hook Form.

O sistema foi implementado para rodar localmente com:

- autenticacao com sessao
- perfis `ADMIN` e `OPERATOR` (mais `GLOBAL_ADMIN` para administracao global)
- dashboard com graficos e metas
- CRUD completo de liderancas
- upload local de foto de perfil
- link de indicacao publico em `/cadastro?ref=ID`
- ranking por indicacoes
- mapa interativo focado em SP
- cobertura de cidades e detalhe por cidade
- custo por voto, meta de votos e WhatsApp
- auditoria de criacao, edicao, exclusao e status

## Stack obrigatoria

- Next.js 15 com App Router
- React 19
- TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma ORM
- NextAuth
- Leaflet
- OpenStreetMap
- Zod
- React Hook Form

## Funcionalidades entregues

- Login com sessao e middleware de protecao
- Dashboard com total de liderancas, cobertura de cidades, votos captados vs meta, top 5 por indicacoes e distribuicao por potencial
- Cadastro de liderancas com foto, custo total, cidade base, cidades sob responsabilidade e geocodificacao
- Calculo centralizado de faixa de potencial e custo por voto
- Link unico de indicacao por lideranca
- Cadastro publico vinculado por referencia
- Ranking com posicao, cidade, indicacoes, votos estimados e custo por voto
- Mapa de SP com pins coloridos por potencial, popup com foto e botao de WhatsApp
- Visualizacao e detalhe de cidades com progresso de meta
- Seed com 49 cidades de SP e 16 liderancas distribuidas
- Testes unitarios para potencial, custo por voto, validacao e criacao de lideranca

## Estrutura do projeto

```text
.
|-- app
|   |-- (auth)/login
|   |-- (protected)/dashboard
|   |-- (protected)/liderancas
|   |-- (protected)/ranking
|   |-- (protected)/mapa
|   |-- (protected)/cidades
|   |-- cadastro
|   `-- api
|-- components
|   |-- auth
|   |-- dashboard
|   |-- layout
|   |-- liderancas
|   |-- mapa
|   |-- ranking
|   |-- shared
|   `-- ui
|-- lib
|   |-- constants
|   |-- data
|   `-- domain
|-- prisma
|   |-- migrations
|   |-- schema.prisma
|   `-- seed.ts
|-- repositories
|-- services
|-- tests
|-- types
`-- validations
```

## Arquitetura

O projeto segue uma separacao simples e coesa:

- `app`: paginas, layouts e rotas API do App Router
- `components`: interface e componentes reutilizaveis
- `repositories`: consultas Prisma e acesso a dados
- `services`: regras de negocio, agregacoes e orquestracao
- `lib/domain`: regras centrais de calculo como custo por voto, progresso e WhatsApp
- `validations`: schemas Zod compartilhados entre front e back
- `types`: tipos derivados do Prisma para consumo nas telas
- `prisma`: schema, migrations e seed

Fluxos principais:

1. O usuario autentica via NextAuth.
2. As paginas protegidas consomem os `services`.
3. Os services validam entradas com Zod, consultam repositories e registram auditoria.
4. O mapa usa Leaflet com base OpenStreetMap e dados vindos do banco.
5. O cadastro publico cria liderancas pendentes e incrementa a contagem de indicacoes do referente.

## Modelagem principal

Modelos do Prisma:

- `User`
- `Leadership`
- `City`
- `LeadershipCity`
- `AuditLog`
- `CampaignSettings`

Campos de destaque:

- `Leadership.fotoPerfilUrl`
- `Leadership.custoTotal`
- `Leadership.quantidadeIndicacoes`
- `Leadership.indicadoPorId`
- `Leadership.cidadeId`
- `City.totalEleitores`
- `City.latitude` e `City.longitude`

## Como rodar localmente

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar ambiente

Copie `.env.example` para `.env`.

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/leadmap"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="troque-por-uma-chave-segura-com-32-caracteres-ou-mais"
```

### 3. Garantir um PostgreSQL local

Crie um banco chamado `leadmap` na porta `5432`.

Se voce tiver Docker instalado, pode usar o `docker-compose.yml` do projeto:

```bash
docker compose up -d postgres
```

### 4. Gerar client e aplicar migrations

```bash
npm run db:generate
npm run db:migrate
```

### 5. Popular a base

```bash
npm run db:seed
```

### 6. Iniciar a aplicacao

```bash
npm run dev
```

Abra:

- `http://localhost:3000/login`
- `http://localhost:3000/cadastro`

## Credenciais de teste

- Admin
  - email: `admin@leadmap.local`
  - senha: `Admin123!`

- Operator
  - email: `operador@leadmap.local`
  - senha: `Operador123!`

- Global admin
  - email: `global@leadmap.local`
  - senha: `Global123!`

## Rotas principais

- `/login`
- `/dashboard`
- `/liderancas`
- `/liderancas/nova`
- `/liderancas/[id]`
- `/liderancas/[id]/editar`
- `/ranking`
- `/mapa`
- `/cidades`
- `/cidades/[id]`
- `/cadastro`

## Upload de foto

- Upload local em `public/uploads/profiles`
- Formatos aceitos: JPG, PNG, WEBP
- Tamanho maximo: 5 MB

## Seed

O seed cria:

- 3 usuarios
- 49 cidades de SP
- 16 liderancas com diferentes potenciais e status
- responsabilidades N:N por cidade
- relacoes de indicacao
- logs de auditoria iniciais

## Testes

Executar:

```bash
npm test
```

Cobertura entregue:

- classificacao de potencial
- custo por voto
- validacao de cadastro
- criacao de lideranca no service

## Validacoes feitas localmente

Executado com sucesso:

- `npm run db:generate`
- `npm run db:migrate`
- `npm run db:seed`
- `npm test`
- `npm run build`

## Criterios de aceite validados

- Login funcional com sessao
- Cadastro de lideranca com foto, custo e cidades
- Link de indicacao em `/cadastro?ref=ID`
- Ranking por indicacoes
- Mapa com pins coloridos por potencial
- Cidades cobertas e faltantes
- Votos captados e faltantes por cidade
- Custo por voto
- Link direto para WhatsApp
- Grafico top 5 no dashboard

## Observacoes

- A geocodificacao usa Nominatim/OpenStreetMap e pode depender de internet para novas cidades sem coordenadas locais.
- O projeto esta focado em SP e o seed usa apenas cidades paulistas.
- O cadastro publico cria liderancas com status `PENDING`.
