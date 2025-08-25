# Production Deployment Guide
## Performance Evaluation System - VakıfBank

This guide provides comprehensive instructions for deploying the Performance Evaluation System to production with enterprise-grade security, performance optimization, and monitoring.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Build Optimization](#build-optimization)
4. [Docker Deployment](#docker-deployment)
5. [Security Hardening](#security-hardening)
6. [Performance Optimization](#performance-optimization)
7. [Monitoring & Logging](#monitoring--logging)
8. [CI/CD Pipeline](#cicd-pipeline)
9. [SSL/TLS Configuration](#ssltls-configuration)
10. [Backup & Recovery](#backup--recovery)
11. [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

### System Requirements
- **Node.js**: 18.x or higher
- **Docker**: 20.x or higher
- **Nginx**: 1.20+ (for reverse proxy)
- **SSL Certificate**: Valid SSL certificate for production domain
- **Database**: PostgreSQL 13+ or SQL Server 2019+
- **Redis**: 6.x+ (for caching and sessions)

### Required Software
```bash
# Install Node.js dependencies
npm install -g @vitejs/cli
npm install -g typescript
npm install -g jest

# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Nginx
sudo apt update
sudo apt install nginx
```

## ⚙️ Environment Configuration

### Production Environment Variables

Create `.env.production` file:

```env
# Application
NODE_ENV=production
VITE_APP_NAME="Performance Evaluation System"
VITE_APP_VERSION="1.0.0"
VITE_APP_ENVIRONMENT="production"

# API Configuration
VITE_API_BASE_URL=https://api.performance-evaluation.vakifbank.com
VITE_API_TIMEOUT=30000
VITE_API_RETRY_ATTEMPTS=3

# Authentication
VITE_JWT_SECRET=your-super-secure-jwt-secret-key
VITE_SESSION_SECRET=your-super-secure-session-secret
VITE_COOKIE_SECURE=true
VITE_COOKIE_HTTP_ONLY=true
VITE_COOKIE_SAME_SITE=strict

# Security
VITE_CSP_NONCE=your-csp-nonce
VITE_HSTS_MAX_AGE=31536000
VITE_CONTENT_SECURITY_POLICY=strict

# Performance
VITE_ENABLE_SERVICE_WORKER=true
VITE_ENABLE_CACHE=true
VITE_ENABLE_COMPRESSION=true
VITE_BUNDLE_ANALYZER=false

# Monitoring
VITE_ENABLE_ANALYTICS=true
VITE_SENTRY_DSN=your-sentry-dsn
VITE_LOG_LEVEL=error

# CDN Configuration
VITE_CDN_URL=https://cdn.vakifbank.com
VITE_STATIC_ASSETS_URL=https://static.vakifbank.com

# Feature Flags
VITE_ENABLE_PWA=true
VITE_ENABLE_OFFLINE_MODE=true
VITE_ENABLE_PUSH_NOTIFICATIONS=true
```

### Nginx Configuration

Create `/etc/nginx/sites-available/performance-evaluation`:

```nginx
server {
    listen 80;
    server_name performance-evaluation.vakifbank.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name performance-evaluation.vakifbank.com;

    # SSL Configuration
    ssl_certificate /etc/ssl/certs/performance-evaluation.crt;
    ssl_certificate_key /etc/ssl/private/performance-evaluation.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Root directory
    root /var/www/performance-evaluation;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/atom+xml image/svg+xml;

    # API proxy
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 30s;
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
    }

    # Static assets with caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary Accept-Encoding;
    }

    # HTML files - no caching
    location ~* \.html$ {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
    }

    # Service worker
    location = /sw.js {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Service-Worker-Allowed "/";
    }

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

## 🚀 Build Optimization

### Production Build Script

Create `scripts/build-production.sh`:

```bash
#!/bin/bash

echo "🚀 Starting production build..."

# Set environment
export NODE_ENV=production
export GENERATE_SOURCEMAP=false
export INLINE_RUNTIME_CHUNK=false

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/
rm -rf build/

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Run security audit
echo "🔒 Running security audit..."
npm audit --audit-level=high

# Run tests
echo "🧪 Running tests..."
npm run test:ci

# Build application
echo "🔨 Building application..."
npm run build

# Optimize images
echo "🖼️ Optimizing images..."
npm run optimize-images

# Generate service worker
echo "⚙️ Generating service worker..."
npm run generate-sw

# Bundle analysis
if [ "$ANALYZE_BUNDLE" = "true" ]; then
    echo "📊 Analyzing bundle..."
    npm run analyze-bundle
fi

# Create production artifacts
echo "📦 Creating production artifacts..."
tar -czf performance-evaluation-frontend-$(date +%Y%m%d-%H%M%S).tar.gz dist/

echo "✅ Production build completed!"
```

### Vite Configuration for Production

Update `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { compression } from 'vite-plugin-compression';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
            },
          },
        ],
      },
    }),
    compression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
    visualizer({
      filename: 'bundle-analysis.html',
      open: false,
    }),
  ],
  build: {
    target: 'es2015',
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          charts: ['recharts', 'd3'],
          utils: ['date-fns', 'lodash'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 3000,
    host: true,
  },
  preview: {
    port: 4173,
    host: true,
  },
});
```

## 🐳 Docker Deployment

### Docker Compose for Production

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  # Frontend Application
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    image: performance-evaluation-frontend:latest
    container_name: pe-frontend
    restart: unless-stopped
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - VITE_API_BASE_URL=https://api.performance-evaluation.vakifbank.com
    volumes:
      - ./logs:/var/log/nginx
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - api
    networks:
      - pe-network

  # API Backend
  api:
    build:
      context: ../PerformanceEvaluation.API
      dockerfile: Dockerfile
    image: performance-evaluation-api:latest
    container_name: pe-api
    restart: unless-stopped
    ports:
      - "5000:5000"
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ConnectionStrings__DefaultConnection=Server=db;Database=PerformanceEvaluation;User Id=sa;Password=${DB_PASSWORD}
      - JWT__Secret=${JWT_SECRET}
      - JWT__Issuer=performance-evaluation.vakifbank.com
      - JWT__Audience=performance-evaluation.vakifbank.com
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs
    depends_on:
      - db
      - redis
    networks:
      - pe-network

  # Database
  db:
    image: mcr.microsoft.com/mssql/server:2019-latest
    container_name: pe-db
    restart: unless-stopped
    environment:
      - ACCEPT_EULA=Y
      - SA_PASSWORD=${DB_PASSWORD}
      - MSSQL_PID=Enterprise
    volumes:
      - db-data:/var/opt/mssql
      - ./backups:/backups
    ports:
      - "1433:1433"
    networks:
      - pe-network

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: pe-redis
    restart: unless-stopped
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis-data:/data
    ports:
      - "6379:6379"
    networks:
      - pe-network

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: pe-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
      - ./logs:/var/log/nginx
    depends_on:
      - frontend
      - api
    networks:
      - pe-network

  # Monitoring Stack
  prometheus:
    image: prom/prometheus:latest
    container_name: pe-prometheus
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'
    networks:
      - pe-network

  grafana:
    image: grafana/grafana:latest
    container_name: pe-grafana
    restart: unless-stopped
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
    volumes:
      - grafana-data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards:ro
      - ./monitoring/grafana/datasources:/etc/grafana/provisioning/datasources:ro
    depends_on:
      - prometheus
    networks:
      - pe-network

volumes:
  db-data:
  redis-data:
  prometheus-data:
  grafana-data:

networks:
  pe-network:
    driver: bridge
```

### Deployment Script

Create `scripts/deploy.sh`:

```bash
#!/bin/bash

set -e

echo "🚀 Starting deployment..."

# Load environment variables
source .env.production

# Build Docker images
echo "🔨 Building Docker images..."
docker-compose -f docker-compose.prod.yml build

# Run security scan
echo "🔒 Running security scan..."
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image performance-evaluation-frontend:latest

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

# Backup database
echo "💾 Creating database backup..."
docker exec pe-db /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P $DB_PASSWORD \
  -Q "BACKUP DATABASE PerformanceEvaluation TO DISK = '/backups/backup-$(date +%Y%m%d-%H%M%S).bak'"

# Start services
echo "▶️ Starting services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Run health checks
echo "🏥 Running health checks..."
curl -f http://localhost/health || exit 1
curl -f http://localhost:5000/health || exit 1

# Run database migrations
echo "🗄️ Running database migrations..."
docker exec pe-api dotnet ef database update

# Clear caches
echo "🧹 Clearing caches..."
docker exec pe-redis redis-cli -a $REDIS_PASSWORD FLUSHALL

echo "✅ Deployment completed successfully!"
```

## 🔒 Security Hardening

### Security Checklist

- [ ] **SSL/TLS Configuration**
  - [ ] Valid SSL certificate installed
  - [ ] HSTS headers configured
  - [ ] TLS 1.2+ enforced
  - [ ] Strong cipher suites configured

- [ ] **Content Security Policy**
  - [ ] CSP headers implemented
  - [ ] Nonce-based CSP for inline scripts
  - [ ] Frame-ancestors policy set
  - [ ] Object-src set to 'none'

- [ ] **Authentication & Authorization**
  - [ ] JWT tokens with secure configuration
  - [ ] Session management implemented
  - [ ] Role-based access control
  - [ ] Multi-factor authentication

- [ ] **Input Validation & Sanitization**
  - [ ] All user inputs validated
  - [ ] XSS protection implemented
  - [ ] SQL injection prevention
  - [ ] File upload validation

- [ ] **Rate Limiting**
  - [ ] API rate limiting configured
  - [ ] Login attempt limiting
  - [ ] DDoS protection
  - [ ] Brute force protection

### Security Headers Configuration

```nginx
# Security headers for all responses
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'nonce-${CSP_NONCE}'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'self';" always;
```

## ⚡ Performance Optimization

### Performance Checklist

- [ ] **Bundle Optimization**
  - [ ] Code splitting implemented
  - [ ] Tree shaking enabled
  - [ ] Dead code elimination
  - [ ] Bundle size analysis

- [ ] **Caching Strategy**
  - [ ] Static assets cached
  - [ ] API responses cached
  - [ ] Service worker implemented
  - [ ] CDN configured

- [ ] **Compression**
  - [ ] Gzip compression enabled
  - [ ] Brotli compression enabled
  - [ ] Image optimization
  - [ ] Minification enabled

- [ ] **Loading Performance**
  - [ ] Lazy loading implemented
  - [ ] Critical CSS inlined
  - [ ] Resource hints configured
  - [ ] Preloading strategies

### Performance Monitoring

```javascript
// Performance monitoring configuration
const performanceConfig = {
  // Core Web Vitals
  LCP: 2500, // Largest Contentful Paint
  FID: 100,  // First Input Delay
  CLS: 0.1,  // Cumulative Layout Shift
  
  // Custom metrics
  bundleSize: 500000, // 500KB
  apiResponseTime: 1000, // 1 second
  renderTime: 100, // 100ms
};
```

## 📊 Monitoring & Logging

### Monitoring Stack

1. **Application Monitoring**: Sentry for error tracking
2. **Performance Monitoring**: Web Vitals and custom metrics
3. **Infrastructure Monitoring**: Prometheus + Grafana
4. **Log Aggregation**: ELK Stack or similar

### Logging Configuration

```javascript
// Logging configuration
const loggingConfig = {
  level: process.env.LOG_LEVEL || 'info',
  format: 'json',
  transports: [
    'file',
    'console',
    'remote'
  ],
  metadata: {
    service: 'performance-evaluation-frontend',
    version: process.env.VITE_APP_VERSION,
    environment: process.env.NODE_ENV
  }
};
```

### Health Check Endpoints

```javascript
// Health check implementation
app.get('/health', (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.VITE_APP_VERSION
  };
  
  res.status(200).json(health);
});
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:ci
      
      - name: Run security audit
        run: npm audit --audit-level=high
      
      - name: Build application
        run: npm run build
      
      - name: Run E2E tests
        run: npm run test:e2e

  security-scan:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v3
      
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'performance-evaluation-frontend:latest'
          format: 'sarif'
          output: 'trivy-results.sarif'
      
      - name: Upload Trivy scan results
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'

  deploy:
    runs-on: ubuntu-latest
    needs: [test, security-scan]
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Docker Buildx
        uses: docker/setup-buildx-action@v2
      
      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      
      - name: Build and push Docker image
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: |
            ${{ secrets.DOCKER_USERNAME }}/performance-evaluation-frontend:latest
            ${{ secrets.DOCKER_USERNAME }}/performance-evaluation-frontend:${{ github.sha }}
      
      - name: Deploy to production
        run: |
          echo "${{ secrets.SSH_PRIVATE_KEY }}" > private_key
          chmod 600 private_key
          ssh -i private_key -o StrictHostKeyChecking=no ${{ secrets.SSH_USER }}@${{ secrets.SSH_HOST }} '
            cd /opt/performance-evaluation &&
            docker-compose -f docker-compose.prod.yml pull &&
            docker-compose -f docker-compose.prod.yml up -d &&
            docker system prune -f
          '
```

## 🔐 SSL/TLS Configuration

### SSL Certificate Setup

```bash
# Generate SSL certificate (Let's Encrypt)
sudo certbot --nginx -d performance-evaluation.vakifbank.com

# Or use custom certificate
sudo cp performance-evaluation.crt /etc/ssl/certs/
sudo cp performance-evaluation.key /etc/ssl/private/
sudo chmod 644 /etc/ssl/certs/performance-evaluation.crt
sudo chmod 600 /etc/ssl/private/performance-evaluation.key
```

### SSL Configuration

```nginx
# SSL configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
ssl_stapling on;
ssl_stapling_verify on;
```

## 💾 Backup & Recovery

### Backup Strategy

```bash
#!/bin/bash
# Backup script

# Database backup
docker exec pe-db /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P $DB_PASSWORD \
  -Q "BACKUP DATABASE PerformanceEvaluation TO DISK = '/backups/backup-$(date +%Y%m%d-%H%M%S).bak'"

# File backup
tar -czf uploads-backup-$(date +%Y%m%d-%H%M%S).tar.gz uploads/

# Configuration backup
tar -czf config-backup-$(date +%Y%m%d-%H%M%S).tar.gz \
  docker-compose.prod.yml \
  nginx.conf \
  .env.production

# Upload to cloud storage
aws s3 cp backup-*.tar.gz s3://performance-evaluation-backups/
```

### Recovery Procedure

```bash
#!/bin/bash
# Recovery script

# Stop services
docker-compose -f docker-compose.prod.yml down

# Restore database
docker exec pe-db /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P $DB_PASSWORD \
  -Q "RESTORE DATABASE PerformanceEvaluation FROM DISK = '/backups/backup-20240101-120000.bak'"

# Restore files
tar -xzf uploads-backup-20240101-120000.tar.gz

# Start services
docker-compose -f docker-compose.prod.yml up -d
```

## 🔧 Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clear cache and rebuild
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

2. **Docker Issues**
   ```bash
   # Clean Docker system
   docker system prune -a
   docker volume prune
   docker network prune
   ```

3. **Performance Issues**
   ```bash
   # Check bundle size
   npm run analyze-bundle
   
   # Check memory usage
   docker stats
   
   # Check logs
   docker-compose logs -f
   ```

4. **Security Issues**
   ```bash
   # Run security audit
   npm audit --audit-level=high
   
   # Check SSL configuration
   openssl s_client -connect performance-evaluation.vakifbank.com:443
   ```

### Monitoring Commands

```bash
# Check application health
curl -f http://localhost/health

# Check API health
curl -f http://localhost:5000/health

# Check database connection
docker exec pe-db /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P $DB_PASSWORD \
  -Q "SELECT 1"

# Check Redis connection
docker exec pe-redis redis-cli -a $REDIS_PASSWORD ping

# Monitor logs
docker-compose logs -f --tail=100
```

## 📞 Support

For deployment support and issues:

- **Technical Support**: tech-support@vakifbank.com
- **Security Issues**: security@vakifbank.com
- **Documentation**: https://docs.performance-evaluation.vakifbank.com

---

**Built with ❤️ for VakıfBank Performance Evaluation System**
