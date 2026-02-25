# Service Catalog Monorepo

Mini produit fullstack pour gérer un catalogue de services (Vue 3 + NestJS + Prisma + Docker) dans un monorepo npm workspaces.

## Tech stack

- Monorepo: npm workspaces
- Frontend: Vue 3, Vite, TypeScript, Pinia, Vue Router
- Backend: NestJS, TypeScript, Swagger, class-validator
- Base de données: Prisma + SQLite (migrations + seed)
- Qualité: ESLint + Prettier
- Conteneurs: Docker + Docker Compose

## Fonctionnalités

- Auth mock frontend (`/login`) avec guard sur `/app`
- CRUD Services
- CRUD Endpoints liés à un Service
- Filtres, recherche, tri, pagination sur les services
- Dashboard KPI (`servicesByStatus`, `endpointsByAuthType`, totaux)
- Validation backend stricte (DTO + ValidationPipe)
- Swagger auto (`/api/docs`)
- Tests e2e backend pour les cas critiques

## Arborescence

```text
.
├── .dockerignore
├── .env.example
├── .eslintrc.cjs
├── .gitignore
├── .prettierrc
├── docker-compose.yml
├── package.json
├── tsconfig.base.json
├── README.md
└── apps
    ├── api
    │   ├── .env.example
    │   ├── Dockerfile
    │   ├── package.json
    │   ├── tsconfig.build.json
    │   ├── tsconfig.json
    │   ├── prisma
    │   │   ├── schema.prisma
    │   │   ├── seed.ts
    │   │   └── migrations
    │   │       ├── migration_lock.toml
    │   │       └── 202602240001_init/migration.sql
    │   ├── src
    │   │   ├── app.module.ts
    │   │   ├── main.ts
    │   │   ├── common/filters/prisma-exception.filter.ts
    │   │   ├── common/constants/catalog.constants.ts
    │   │   ├── health/health.controller.ts
    │   │   ├── prisma/*
    │   │   ├── services/*
    │   │   ├── endpoints/*
    │   │   └── dashboard/*
    │   └── test
    │       ├── app.e2e-spec.ts
    │       └── jest-e2e.json
    └── web
        ├── .env.example
        ├── Dockerfile
        ├── nginx.conf
        ├── index.html
        ├── package.json
        ├── tsconfig.json
        ├── vite.config.ts
        └── src/*
```

## Prérequis

- Node.js 20+
- npm 10+
- Docker + Docker Compose (optionnel)

## Configuration des variables d'environnement

### 1) Docker Compose (racine)

```bash
cp .env.example .env
```

Variables:

- `PORT=3001`
- `DATABASE_URL=file:./data/dev.db` (Docker)
- `CORS_ORIGIN=http://localhost:5173`
- `VITE_API_URL=http://localhost:3001/api`

### 2) Exécution locale API/Web

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

`apps/api/.env` utilise `DATABASE_URL=file:./dev.db` pour le mode local.

## Lancer en local

```bash
npm install
npm run db:migrate
npm run dev
```

`npm run db:migrate` lance aussi le seed Prisma en mode dev.  
`npm run db:seed` reste disponible si tu veux reseeder manuellement.

URLs:

- Web: `http://localhost:5173`
- API: `http://localhost:3001/api`
- Swagger: `http://localhost:3001/api/docs`

## Commandes qualité et tests

```bash
npm run lint
npm run build
npm run test
npm run format
```

Note: le workspace `web` ne contient pas encore de tests automatisés, donc `npm run test` affiche un placeholder côté frontend.

## Lancer avec Docker

```bash
docker compose up --build
```

Si ta machine utilise l'ancien binaire Compose v1:
```bash
docker-compose up --build
```

Services:

- Web: `http://localhost:5173`
- API: `http://localhost:3001/api`

Notes Docker:

- API: conteneur Node (NestJS)
- Web: build Vite puis service statique Nginx sur le port `5173`
- `VITE_API_URL` est injecté au **build** web via `docker-compose.yml` (`build.args`)
- SQLite est persistée dans le volume `api_data` monté sur `/app/apps/api/data`

## Endpoints API

- `GET /api/health`
- `GET /api/services`
- `POST /api/services`
- `GET /api/services/:id`
- `PUT /api/services/:id`
- `DELETE /api/services/:id`
- `GET /api/services/:serviceId/endpoints`
- `POST /api/services/:serviceId/endpoints`
- `PUT /api/endpoints/:id`
- `DELETE /api/endpoints/:id`
- `GET /api/dashboard`

## Couverture e2e backend

- Health check
- Création d'un service
- Rejet d'un payload invalide
- Listing services avec search/filter/pagination
- Création d'un endpoint lié à un service

## How to demo in 5 minutes

1. Lancer le projet en local:
```bash
npm install
npm run db:migrate
npm run dev
```
2. Ouvrir `http://localhost:5173` puis se connecter.
3. Aller dans `Services`: créer, éditer et supprimer un service.
4. Ouvrir un service: créer, éditer et supprimer des endpoints.
5. Aller dans `Dashboard` et vérifier les KPI.
6. Ouvrir `http://localhost:3001/api/docs` pour tester l'API via Swagger.

## Related Projects

- Service Dashboard Microfrontends (React + Webpack Module Federation + NestJS):
  https://github.com/Therebeu621/service-dashboard-microfrontends


