# 寻宝记 - 部署指南

## 环境要求

- Docker 20.10+
- Docker Compose 2.0+
- 至少 2GB 可用内存
- 443 端口（HTTPS）

## 生产环境部署

### 1. 准备服务器

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. 克隆代码

```bash
git clone https://github.com/your-username/treasure-hunt.git
cd treasure-hunt
```

### 3. 配置环境变量

```bash
# 复制环境变量模板
cp packages/backend/.env.production.example packages/backend/.env

# 编辑配置
nano packages/backend/.env
```

必须配置的变量：

```env
# 数据库
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your-secure-password  # 修改为强密码
DB_DATABASE=treasure_hunt

# JWT
JWT_SECRET=your-production-jwt-secret  # 修改为随机字符串

# Mapbox
MAPBOX_ACCESS_TOKEN=your-mapbox-token  # 从 Mapbox 获取
```

### 4. 配置 SSL (推荐使用 Nginx + Let's Encrypt)

```bash
# 安装 Nginx
sudo apt install nginx

# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取 SSL 证书
sudo certbot --nginx -d your-domain.com
```

Nginx 配置示例：

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 5. 启动服务

```bash
# 构建并启动
docker-compose up -d --build

# 查看日志
docker-compose logs -f

# 检查服务状态
docker-compose ps
```

### 6. 数据库迁移

```bash
# 进入后端容器
docker-compose exec backend sh

# 运行种子数据
yarn seed
```

## 环境变量说明

### 后端环境变量

| 变量名 | 描述 | 默认值 |
|--------|------|--------|
| DB_HOST | 数据库主机 | postgres |
| DB_PORT | 数据库端口 | 5432 |
| DB_USERNAME | 数据库用户名 | postgres |
| DB_PASSWORD | 数据库密码 | - |
| DB_DATABASE | 数据库名 | treasure_hunt |
| JWT_SECRET | JWT 密钥 | - |
| JWT_EXPIRES_IN | JWT 过期时间 | 7d |
| MAPBOX_ACCESS_TOKEN | Mapbox 令牌 | - |
| GOOGLE_CLIENT_ID | Google OAuth 客户端 ID | - |
| APPLE_CLIENT_ID | Apple OAuth 客户端 ID | - |

### Web 环境变量

| 变量名 | 描述 |
|--------|------|
| NEXT_PUBLIC_API_URL | 后端 API 地址 |
| NEXT_PUBLIC_MAPBOX_TOKEN | Mapbox 令牌 |

## 监控和日志

### 查看服务日志

```bash
# 所有服务
docker-compose logs -f

# 特定服务
docker-compose logs -f backend
docker-compose logs -f postgres
```

### 健康检查

```bash
# 后端健康检查
curl http://localhost:3000/api/health

# 数据库连接检查
docker-compose exec postgres pg_isready
```

## 备份和恢复

### 备份数据库

```bash
# 创建备份
docker-compose exec postgres pg_dump -U postgres treasure_hunt > backup_$(date +%Y%m%d).sql

# 恢复备份
cat backup_20240101.sql | docker-compose exec -T postgres psql -U postgres treasure_hunt
```

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查 PostgreSQL 是否运行：`docker-compose ps`
   - 检查环境变量配置
   - 查看日志：`docker-compose logs postgres`

2. **后端无法启动**
   - 检查环境变量
   - 检查端口占用
   - 查看日志：`docker-compose logs backend`

3. **地图不显示**
   - 检查 Mapbox Token 是否正确
   - 检查网络连接

## 更新部署

```bash
# 拉取最新代码
git pull

# 重新构建并启动
docker-compose up -d --build

# 运行数据库迁移（如有）
docker-compose exec backend yarn migration:run
```