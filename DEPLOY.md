# Hướng dẫn Deploy Dự án

## 📋 Tổng quan

Dự án này sử dụng:
- **Backend**: Spring Boot 3.2.5 với Java 17
- **Frontend**: React + Vite + TypeScript
- **Database**: MySQL 8.0
- **Container**: Docker & Docker Compose
- **CI/CD**: GitHub Actions

## 🚀 Cách Deploy

### 1. Chuẩn bị môi trường

#### Yêu cầu:
- Docker và Docker Compose đã cài đặt
- Git
- Tài khoản GitHub (cho CI/CD)

#### Cài đặt Docker (nếu chưa có):
```bash
# Windows
# Tải Docker Desktop từ: https://www.docker.com/products/docker-desktop

# Linux
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

### 2. Cấu hình Environment Variables

1. Copy file `.env.example` thành `.env`:
```bash
cp .env.example .env
```

2. Chỉnh sửa file `.env` với các giá trị phù hợp:
```env
DB_ROOT_PASSWORD=your_secure_password
DB_NAME=authdb
DB_USERNAME=appuser
DB_PASSWORD=your_app_password
JWT_BASE64_SECRET=your_base64_secret_key
```

**Tạo JWT Secret:**
```bash
# Linux/Mac
openssl rand -base64 64

# Windows (PowerShell)
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }))
```

### 3. Deploy với Docker Compose

#### Development:
```bash
# Build và chạy tất cả services
docker-compose up -d

# Xem logs
docker-compose logs -f

# Dừng services
docker-compose down

# Dừng và xóa volumes (xóa database)
docker-compose down -v
```

#### Production:
```bash
# Sử dụng production override
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Xem logs
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f
```

### 4. Kiểm tra Deployment

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Backend Health**: http://localhost:8080/actuator/health
- **API Docs**: http://localhost:8080/swagger-ui.html

### 5. CI/CD với GitHub Actions

#### Setup GitHub Secrets:

Vào **Settings > Secrets and variables > Actions** và thêm:

1. `VITE_BACKEND_URL`: URL backend cho frontend (ví dụ: `https://api.yourdomain.com`)
2. Các secrets khác nếu cần (database credentials, etc.)

#### Workflow tự động:

- **Push vào branch `main`/`master`**: Tự động build, test, và deploy
- **Pull Request**: Chỉ build và test, không deploy

#### Manual Deploy:

```bash
# Pull images mới nhất
docker-compose pull

# Restart services
docker-compose up -d
```

## 🔧 Troubleshooting

### Backend không kết nối được database:
```bash
# Kiểm tra MySQL container
docker-compose ps mysql
docker-compose logs mysql

# Kiểm tra network
docker network ls
docker network inspect fullstask_auth_hung_app-network
```

### Frontend không kết nối được backend:
- Kiểm tra `VITE_BACKEND_URL` trong `.env`
- Kiểm tra CORS configuration trong backend
- Kiểm tra firewall/port forwarding

### Xóa và rebuild:
```bash
# Xóa tất cả containers, networks, volumes
docker-compose down -v

# Rebuild images
docker-compose build --no-cache

# Chạy lại
docker-compose up -d
```

## 📦 Build Images Locally

### Backend:
```bash
cd backend/demo
docker build -t auth-backend:latest .
```

### Frontend:
```bash
cd front_end/01-react-vite-starter
docker build -t auth-frontend:latest --build-arg VITE_BACKEND_URL=http://localhost:8080 .
```

## 🌐 Deploy lên Server

### Option 1: Docker Compose trên VPS

1. Clone repository lên server
2. Copy `.env` file
3. Chạy `docker-compose up -d`

### Option 2: Sử dụng GitHub Actions để deploy

1. Cấu hình SSH key trong GitHub Secrets
2. Cập nhật step `deploy` trong workflow files
3. Push code lên branch `main`

### Option 3: Sử dụng Cloud Platforms

- **AWS**: ECS, EKS, Elastic Beanstalk
- **Google Cloud**: Cloud Run, GKE
- **Azure**: Container Instances, AKS
- **DigitalOcean**: App Platform, Droplets với Docker

## 📝 Notes

- Database data được lưu trong Docker volume `mysql_data`
- Để backup database: `docker exec auth-mysql mysqldump -u root -p authdb > backup.sql`
- Để restore: `docker exec -i auth-mysql mysql -u root -p authdb < backup.sql`
- Logs được lưu trong Docker logging driver (có thể cấu hình trong `docker-compose.prod.yml`)

## 🔐 Security Best Practices

1. **Không commit `.env` file** vào Git
2. **Sử dụng strong passwords** cho database
3. **Rotate JWT secrets** định kỳ
4. **Enable HTTPS** trong production (sử dụng reverse proxy như Nginx)
5. **Limit resource usage** (đã cấu hình trong `docker-compose.prod.yml`)
6. **Regular updates** cho Docker images
