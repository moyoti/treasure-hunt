# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

寻宝记 (Treasure Hunt) is a location-based item collection game similar to Pokémon GO. Players explore the real world and collect virtual treasures at landmark locations.

## Monorepo Structure

```
treasure-hunt/
├── packages/
│   ├── backend/     # NestJS API (port 3000)
│   ├── mobile/      # React Native + Expo
│   ├── web/         # Next.js 14 App Router (port 3001)
│   └── shared/      # Shared types, constants, utilities
```

## Commands

```bash
# Install dependencies
yarn install

# Development servers
yarn dev:backend    # NestJS with hot reload
yarn dev:web        # Next.js dev server
yarn dev:mobile     # Expo development server

# Build
yarn build:backend
yarn build:web

# Docker (production)
yarn docker:up
yarn docker:down

# Lint and test
yarn lint
yarn test

# Backend-specific
yarn workspace @treasure-hunt/backend test:watch      # Run tests in watch mode
yarn workspace @treasure-hunt/backend test:e2e        # Run e2e tests
yarn workspace @treasure-hunt/backend migration:run   # Run database migrations
yarn workspace @treasure-hunt/backend seed            # Seed database with items

# Mobile-specific
yarn workspace @treasure-hunt/mobile ios              # Run on iOS simulator
yarn workspace @treasure-hunt/mobile android          # Run on Android emulator
```

## Backend Architecture (NestJS)

Modules in `packages/backend/src/`:
- **auth** - JWT authentication, Passport strategies (local/jwt), OAuth (Google/Apple)
- **user** - User entity and management
- **item** - Item definitions with rarity/type enums
- **spawn** - SpawnedItem entity, scheduled spawning service (`@nestjs/schedule`), collection logic
- **inventory** - User inventory and collection history
- **poi** - Points of Interest (landmarks where items spawn)
- **leaderboard** - User rankings by collection count
- **achievement** - Achievement tracking and progress

Database: PostgreSQL with PostGIS for geospatial queries in production. SQLite (`better-sqlite3`) for local development without Docker.

Configuration: `src/config/` exports `appConfig`, `databaseConfig`, `jwtConfig` loaded via `ConfigModule.forRoot()`.

## Frontend Architecture (Next.js 14)

App Router pages in `packages/web/app/`:
- `/login` - Email/password login
- `/register` - User registration
- `/map` - Core game: Leaflet map showing nearby items
- `/inventory` - User's collected items
- `/profile` - User profile management
- `/leaderboard` - User rankings
- `/achievements` - Achievement tracking

State management: Zustand stores in `packages/web/stores/`. Authentication via `AuthProvider.tsx` component which wraps the app in `layout.tsx`.

Maps: Leaflet with react-leaflet. Mapbox GL is also available but Leaflet is actively used.

## Key Game Mechanics

- **Collection radius**: 50 meters (defined in `shared/src/constants.ts`)
- **Spawn interval**: Every 1 hour
- **Item expiration**: 24 hours
- **Rarity system**: common > rare > epic > legendary (with spawn weights in `RARITY_WEIGHTS`)

## Shared Package

`packages/shared/src/` exports:
- `types.ts` - ItemRarity, ItemType, User, Item, SpawnedItem, InventoryItem, LeaderboardEntry, Achievement interfaces
- `constants.ts` - Game constants (COLLECTION_RADIUS_METERS, RARITY_COLORS, RARITY_WEIGHTS, etc.)
- `utils.ts` - Distance calculation (Haversine formula), format helpers

## Database Configuration

Local development uses SQLite via `better-sqlite3`. The `TypeOrmModule.forRootAsync()` in `app.module.ts` handles this automatically.

For PostgreSQL with PostGIS (production):
- Use `docker-compose up -d` to start postgres container
- Entity location fields use `geometry` type with PostGIS
- For SQLite, location fields fall back to `decimal` for lat/lng

## API Endpoints

- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login, returns JWT
- `GET /api/spawned-items/nearby?lat=&lng=` - Items near location
- `POST /api/spawned-items/collect` - Collect item (validates distance)
- `GET /api/inventory` - User's inventory
- `GET /api/items` - All item definitions
- `GET /api/leaderboard` - User rankings
- `GET /api/achievements` - User achievements

## Environment Setup

Required environment variables (see `.env.example` files):
- Backend: `JWT_SECRET`, `MAPBOX_ACCESS_TOKEN`, OAuth credentials (optional)
- Web: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_MAPBOX_TOKEN`