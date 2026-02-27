# 寻宝记 (Treasure Hunt) 🗺️💎

<div align="center">
  <img src="docs/banner.png" alt="Treasure Hunt Banner" width="100%">
  
  **探索世界，收集宝藏**
  
  一个基于地理位置的物品收集游戏
  
  [English](#english) | [中文](#中文)
</div>

---

## 中文

### 📱 项目简介

寻宝记是一个跨平台的地理位置收集游戏，类似于 Pokémon GO。玩家可以在真实世界中探索，在各个地标位置收集虚拟宝藏物品。

### ✨ 核心功能

- 🗺️ **实时地图** - 查看你的位置和附近的宝藏
- 💎 **收集系统** - 在真实世界地点收集稀有物品
- 🎯 **POI 刷新** - 宝藏会定期在真实地标刷新
- 📦 **物品收藏** - 管理你的收藏品，查看收集记录
- 🏆 **稀有度系统** - 普通、稀有、史诗、传说四种稀有度
- 🔐 **多端登录** - 支持 OAuth (Google/Apple) 和邮箱密码登录

### 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| **移动端** | React Native + Expo |
| **Web端** | Next.js 14 + React |
| **后端** | NestJS + TypeScript |
| **数据库** | PostgreSQL + PostGIS |
| **地图** | Mapbox GL |
| **认证** | JWT + OAuth |
| **部署** | Docker + Docker Compose |

### 📁 项目结构

```
treasure-hunt/
├── packages/
│   ├── backend/          # NestJS 后端 API
│   ├── mobile/           # React Native 移动端 (iOS/Android)
│   ├── web/              # Next.js Web 应用
│   └── shared/           # 共享类型和工具
├── docker-compose.yml    # Docker 编排配置
└── package.json          # Monorepo 根配置
```

### 🚀 快速开始

#### 前置要求

- Node.js 18+
- Docker & Docker Compose
- Yarn 或 npm
- Mapbox Access Token

#### 1. 克隆项目

```bash
git clone https://github.com/your-username/treasure-hunt.git
cd treasure-hunt
```

#### 2. 安装依赖

```bash
yarn install
```

#### 3. 配置环境变量

```bash
# 后端配置
cp packages/backend/.env.example packages/backend/.env

# Web 配置
cp packages/web/.env.example packages/web/.env.local

# 编辑 .env 文件，填入你的配置
```

#### 4. 启动数据库

```bash
docker-compose -f docker-compose.dev.yml up -d
```

#### 5. 启动后端

```bash
yarn dev:backend
```

#### 6. 启动前端

```bash
# 移动端
yarn dev:mobile

# Web 端
yarn dev:web
```

### 🐳 Docker 部署

完整的生产环境部署：

```bash
# 构建并启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 📱 移动端开发

#### iOS

```bash
cd packages/mobile
npx expo run:ios
```

#### Android

```bash
cd packages/mobile
npx expo run:android
```

### 🎮 游戏机制

#### 物品稀有度

| 稀有度 | 颜色 | 出现概率 |
|--------|------|----------|
| 普通 | 灰色 | 高 |
| 稀有 | 蓝色 | 中 |
| 史诗 | 紫色 | 低 |
| 传说 | 金色 | 极低 |

#### 收集规则

- 玩家需要距离宝藏 **50米** 以内才能收集
- 宝藏每 **1小时** 刷新一次
- 宝藏 **24小时** 后过期消失

### 📊 API 文档

后端 API 运行在 `http://localhost:3000/api`

主要端点：

| 方法 | 端点 | 描述 |
|------|------|------|
| POST | /auth/register | 用户注册 |
| POST | /auth/login | 用户登录 |
| GET | /spawned-items/nearby | 获取附近宝藏 |
| POST | /spawned-items/collect | 收集宝藏 |
| GET | /inventory | 获取用户收藏 |
| GET | /inventory/stats | 获取收藏统计 |

### 🔧 开发指南

#### 代码规范

- 使用 ESLint + Prettier
- 遵循 TypeScript 严格模式
- 使用 Conventional Commits

#### 分支策略

- `main` - 生产分支
- `develop` - 开发分支
- `feature/*` - 功能分支

### 📄 License

MIT License

---

## English

### 📱 Overview

Treasure Hunt is a cross-platform location-based item collection game, similar to Pokémon GO. Players explore the real world and collect virtual treasures at various landmark locations.

### ✨ Key Features

- 🗺️ **Real-time Map** - View your location and nearby treasures
- 💎 **Collection System** - Collect rare items at real-world locations
- 🎯 **POI Spawning** - Treasures spawn periodically at real landmarks
- 📦 **Inventory** - Manage your collection and view collection history
- 🏆 **Rarity System** - Four rarity levels: Common, Rare, Epic, Legendary
- 🔐 **Multi-platform Auth** - Support OAuth (Google/Apple) and email/password

### 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Mobile** | React Native + Expo |
| **Web** | Next.js 14 + React |
| **Backend** | NestJS + TypeScript |
| **Database** | PostgreSQL + PostGIS |
| **Maps** | Mapbox GL |
| **Auth** | JWT + OAuth |
| **Deployment** | Docker + Docker Compose |

### 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/your-username/treasure-hunt.git
cd treasure-hunt

# Install dependencies
yarn install

# Start database
docker-compose -f docker-compose.dev.yml up -d

# Start backend
yarn dev:backend

# Start frontend (in another terminal)
yarn dev:mobile  # for mobile
yarn dev:web     # for web
```

### 📄 License

MIT License

---

<div align="center">
  Made with ❤️ by Treasure Hunt Team
</div>