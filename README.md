# Radar de Lideranças

CRM territorial e político-eleitoral construído com Next.js App Router, React, TypeScript, Tailwind CSS, PostgreSQL, Prisma, NextAuth, Leaflet, OpenStreetMap, Zod e React Hook Form.

O foco do sistema é o estado de São Paulo, com gestão de lideranças, cobertura territorial, metas de votos, custo por voto, score estratégico, ranking, mapa interativo, cadastro público por link de indicação e exportação CSV.

## Stack principal

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

## Visão geral do produto

O sistema entrega:

- autenticação com sessão e rotas protegidas
- perfis `ADMIN` e `OPERATOR`
- suporte adicional a `GLOBAL_ADMIN` para administração global do ambiente
- dashboard com indicadores operacionais e alertas estratégicos
- CRUD completo de lideranças
- upload local de foto de perfil
- cadastro público por link de indicação em `/cadastro-publico`
- alias público em `/cadastro`
- ranking por indicações, potencial, score e menor custo por voto
- mapa de SP com pins por potencial, popups e ação de WhatsApp
- base inicial com 645 municípios de SP
- cobertura territorial e eleitoral por cidade
- metas por cidade e por liderança
- custo por voto calculado automaticamente
- score estratégico calculado automaticamente
- histórico de evolução por liderança
- auditoria de ações críticas
- exportação CSV de lideranças, ranking e cidades

## Principais funcionalidades

### Autenticação e perfis

- login com sessão via NextAuth
- middleware protegendo rotas privadas
- `ADMIN` pode criar, editar, inativar, reativar e excluir lideranças
- `OPERATOR` pode criar, editar e visualizar, mas não excluir definitivamente

### Dashboard

- total de lideranças
- total de lideranças ativas, inativas e pendentes
- total de cidades cobertas e faltantes
- percentual de cobertura territorial
- total de eleitores cobertos
- percentual de eleitores cobertos
- votos captados e votos faltantes
- custo por voto médio
- top 5 lideranças
- distribuição por potencial
- distribuição por status
- cobertura territorial
- cidades prioritárias
- alertas estratégicos

### Lideranças

- foto, telefone, WhatsApp, e-mail, CPF, endereço, cidade base e cidades sob responsabilidade
- potencial de votos estimado
- votos reais opcionais
- meta individual
- custo total
- custo por voto persistido no banco
- score estratégico persistido no banco
- referral code único
- histórico de indicados
- histórico de cadastros públicos recebidos
- snapshots de evolução

### Cidades e cobertura

- tabela `City` com 645 municípios de SP
- `LeadershipCity` para relação N:N
- cálculo de votos captados, faltantes e progresso
- meta customizada por cidade
- percentual de cobertura territorial e eleitoral
- lista de cidades prioritárias
- distribuição de cidades por liderança

### Mapa

- Leaflet + OpenStreetMap
- foco em SP
- pins por faixa de potencial
- popups com foto, votos, indicações, custo por voto, score, status e WhatsApp
- seleção de cidade no próprio mapa

### Exportação

- `/api/export/liderancas`
- `/api/export/ranking`
- `/api/export/cidades`

## Regras de negócio centrais

- `faixaPotencial` é calculada automaticamente
- `custoPorVoto` é calculado automaticamente
- prioridade do custo por voto:
  1. `votosReais`, quando maior que zero
  2. `potencialVotosEstimado`, caso contrário
- se a base de votos for zero ou inexistente, `custoPorVoto` fica `null`
- `scoreLideranca` é calculado automaticamente com base em:
  - base de votos
  - quantidade de indicações
  - custo por voto
  - quantidade de cidades sob responsabilidade
  - status
  - crescimento recente quando há histórico
- `quantidadeIndicacoes` é atualizada em cadastros públicos por link
- geocodificação não bloqueia o cadastro

## Estrutura principal do projeto

```text
.
|-- app
|   |-- (auth)/login
|   |-- (protected)
|   |   |-- dashboard
|   |   |-- liderancas
|   |   |-- ranking
|   |   |-- mapa
|   |   |-- cidades
|   |   |-- usuarios
|   |   |-- configuracoes
|   |   `-- admin-global
|   |-- api
|   |   |-- auth
|   |   |-- cadastro
|   |   |-- dashboard
|   |   |-- export
|   |   |-- liderancas
|   |   |-- mapa
|   |   |-- ranking
|   |   |-- uploads
|   |   `-- usuarios
|   |-- cadastro
|   `-- cadastro-publico
|-- components
|   |-- dashboard
|   |-- layout
|   |-- liderancas
|   |-- mapa
|   |-- public
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

### Camadas

- `app`
  - páginas, layouts e rotas API do App Router
- `components`
  - UI reutilizável, tabelas, filtros, formulários, mapa e cards
- `repositories`
  - acesso a dados via Prisma
- `services`
  - regras de negócio, agregações, escopo por usuário e orquestração
- `lib/domain`
  - funções puras de cálculo e classificação
- `validations`
  - schemas Zod usados no frontend e backend
- `types`
  - tipos derivados do Prisma para consumo nas telas

### Fluxo principal

1. O usuário autentica via NextAuth.
2. As páginas protegidas consultam `services`.
3. Os `services` validam entradas com Zod.
4. Os `repositories` acessam PostgreSQL via Prisma.
5. Auditoria, score, custo por voto e histórico são persistidos automaticamente.

## Modelagem principal

### User

- nome
- e-mail
- senha hash
- perfil

### Leadership

- nome, telefone, WhatsApp, e-mail, CPF
- cidade base
- cidades sob responsabilidade
- foto
- potencial de votos
- votos reais
- custo total
- custo por voto
- meta individual
- score
- referral code
- status

### City

- nome
- estado
- código IBGE opcional
- total de eleitores
- meta opcional por cidade
- latitude e longitude

### Outras entidades

- `LeadershipCity`
- `ReferralSignup`
- `PerformanceHistory`
- `AuditLog`
- `CampaignSettings`

## Como rodar localmente

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar ambiente

Crie um arquivo `.env` com base em `.env.example`.

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/leadmap"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="troque-por-uma-chave-segura-com-32-caracteres-ou-mais"
```

### 3. Subir PostgreSQL

Se quiser usar Docker:

```bash
docker compose up -d postgres
```

### 4. Gerar o client do Prisma

```bash
npx prisma generate
```

### 5. Aplicar as migrations

```bash
npx prisma migrate dev --skip-generate
```

### 6. Popular a base

```bash
npm run db:seed
```

### 7. Rodar a aplicação

```bash
npm run dev
```

Abra:

- `http://localhost:3000/login`
- `http://localhost:3000/cadastro-publico`
- `http://localhost:3000/cadastro`

## Scripts úteis

```bash
npm run dev
npm run build
npm run test
npm run db:generate
npm run db:migrate
npm run db:deploy
npm run db:seed
```

## Credenciais de teste

### Global admin

- e-mail: `global@leadmap.local`
- senha: `Global123!`

### Admin

- e-mail: `admin@leadmap.local`
- senha: `Admin123!`

### Operator

- e-mail: `operador@leadmap.local`
- senha: `Operador123!`

## Seed

O seed cria:

- 3 usuários
- 645 municípios de SP
- 16 lideranças
- 4 cadastros públicos de exemplo
- snapshots de evolução
- auditoria inicial
- cidades estratégicas com meta customizada

Também inclui exemplos de distribuição territorial:

- uma liderança cuidando de 25 cidades
- outra liderança cuidando de 25 cidades
- outra liderança cuidando de 3 cidades

## Testes automatizados

Cobertura atual:

- faixa de potencial
- custo por voto
- score
- validações Zod
- criação de liderança
- cadastro público por link
- ranking
- cálculo de votos faltantes por cidade
- consistência da base de municípios de SP

Rodar:

```bash
npm test
```

## Validação executada

Executado localmente com sucesso:

- `npx prisma generate`
- `npx prisma migrate dev --skip-generate`
- `npm run db:seed`
- `npm test`
- `npm run build`

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
- `/usuarios`
- `/configuracoes`
- `/cadastro-publico`
- `/cadastro`

## Principais decisões técnicas

- `custoPorVoto` e `scoreLideranca` foram persistidos no banco para consultas rápidas e consistência analítica
- o mapa usa liderança como pin principal e cidade como camada de cobertura
- o cadastro público cria liderança pendente e registra `ReferralSignup`
- a base de cidades de SP é sincronizável a partir do dataset local do projeto
- a exportação CSV é feita no backend respeitando o escopo do usuário

## Limitações atuais

- não há integração externa com TSE/TRE no MVP
- o heatmap estratégico completo ainda não foi implementado
- a geocodificação depende do serviço configurado e pode ficar pendente em alguns municípios
- `GLOBAL_ADMIN` continua existindo no projeto como camada administrativa adicional

## Próximos passos recomendados

- adicionar heatmap e camadas estratégicas no mapa
- incluir importação oficial de resultados eleitorais quando necessário
- criar gráficos de evolução temporal no detalhe da liderança
- adicionar presets salvos de filtros e segmentações
- ampliar exportações com XLSX e filtros salvos

## Critérios de aceite atendidos

- roda localmente
- permite login
- permite cadastro de liderança
- permite upload de foto
- gera link de indicação
- processa cadastro público por link
- lista lideranças com filtros
- mostra ranking
- mostra top 5 no dashboard
- mostra mapa com pins por potencial
- mostra popup com WhatsApp
- calcula custo por voto
- calcula score
- mostra cobertura de cidades
- mostra cidades faltantes
- mostra votos captados e faltantes por cidade
- permite ver cidades por liderança
- permite ver lideranças por cidade
- exporta CSV básico
- possui seed funcional
- possui README atualizado
