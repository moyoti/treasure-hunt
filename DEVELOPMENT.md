# Treasure Hunt - Development Guide

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn 1.22+
- Docker & Docker Compose
- iOS: Xcode 14+ (for iOS development)
- Android: Android Studio with SDK 33+

### Installation

1. Clone the repository
2. Install dependencies: `yarn install`
3. Start development database: `docker-compose -f docker-compose.dev.yml up -d`
4. Configure environment variables

## Project Structure

```
treasure-hunt/
├── packages/
│   ├── backend/           # NestJS API server
│   │   ├── src/
│   │   │   ├── auth/      # Authentication module
│   │   │   ├── user/      # User management
│   │   │   ├── item/      # Item definitions
│   │   │   ├── spawn/     # Item spawning system
│   │   │   ├── inventory/ # User inventory
│   │   │   ├── poi/       # Points of Interest
│   │   │   └── database/  # Database configuration
│   │   └── test/          # E2E tests
│   │
│   ├── mobile/            # React Native app
│   │   ├── app/           # Expo Router screens
│   │   ├── components/    # Reusable components
│   │   ├── lib/           # Utilities and API
│   │   └── types/         # TypeScript types
│   │
│   ├── web/               # Next.js web app
│   │   ├── app/           # App Router pages
│   │   ├── components/    # React components
│   │   └── lib/           # Utilities
│   │
│   └── shared/            # Shared code
│       └── src/
│           ├── types.ts   # Common types
│           ├── constants.ts
│           └── utils.ts
│
├── docker-compose.yml     # Production Docker config
├── docker-compose.dev.yml # Development Docker config
└── package.json           # Workspace configuration
```

## Development Workflow

### Running the Backend

```bash
# Development mode with hot reload
yarn dev:backend

# Run tests
cd packages/backend && yarn test

# Run e2e tests
cd packages/backend && yarn test:e2e
```

### Running the Mobile App

```bash
# Start Expo development server
yarn dev:mobile

# Run on iOS simulator
cd packages/mobile && npx expo run:ios

# Run on Android emulator
cd packages/mobile && npx expo run:android
```

### Running the Web App

```bash
# Start Next.js development server
yarn dev:web

# Build for production
cd packages/web && yarn build

# Start production server
cd packages/web && yarn start
```

## Key Concepts

### Authentication Flow

1. User registers/logs in via email or OAuth
2. Server generates JWT token
3. Token stored securely (SecureStore on mobile, localStorage on web)
4. Token included in all API requests

### Item Spawning System

1. Scheduled job runs every hour
2. Random POIs are selected
3. Random items are assigned based on spawn weights
4. Spawned items expire after 24 hours

### Collection Mechanics

1. User requests nearby items
2. User selects an item to collect
3. Server calculates distance between user and item
4. If within 50m, item is added to user's inventory

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/oauth` - OAuth login

### Items
- `GET /api/items` - Get all item definitions
- `GET /api/items/:id` - Get item by ID

### Spawned Items
- `GET /api/spawned-items/nearby` - Get items near location
- `POST /api/spawned-items/collect` - Collect an item

### Inventory
- `GET /api/inventory` - Get user's inventory
- `GET /api/inventory/stats` - Get inventory statistics

### POIs
- `GET /api/pois` - Get all POIs
- `GET /api/pois/nearby` - Get POIs near location

## Database Schema

### Users
- id (UUID)
- email (string, unique)
- password (string, hashed)
- username (string)
- avatar (string, optional)
- googleId (string, optional)
- appleId (string, optional)

### Items
- id (UUID)
- name (string)
- description (text)
- rarity (enum: common/rare/epic/legendary)
- type (enum: collectible/consumable/cosmetic)
- spawnWeight (decimal)
- maxStack (integer)

### SpawnedItems
- id (UUID)
- latitude (decimal)
- longitude (decimal)
- location (Point, PostGIS)
- itemId (FK to Items)
- isActive (boolean)
- expiresAt (timestamp)

### InventoryItems
- id (UUID)
- userId (FK to Users)
- itemId (FK to Items)
- quantity (integer)
- collectedLatitude (decimal)
- collectedLongitude (decimal)
- poiName (string, optional)

## Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make changes and commit: `git commit -m "feat: add my feature"`
3. Push to branch: `git push origin feature/my-feature`
4. Create a Pull Request

### Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance