# Production Deployment Guide

This document provides comprehensive instructions for deploying the Performance Evaluation System to production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Docker Deployment](#docker-deployment)
4. [CI/CD Pipeline](#cicd-pipeline)
5. [Monitoring Setup](#monitoring-setup)
6. [Security Configuration](#security-configuration)
7. [Performance Optimization](#performance-optimization)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

- **OS**: Ubuntu 20.04+ or CentOS 8+
- **CPU**: 4+ cores
- **RAM**: 8GB+ 
- **Storage**: 100GB+ SSD
- **Network**: Stable internet connection

### Software Requirements

- Docker 20.10+
- Docker Compose 2.0+
- Node.js 18+ (for local development)
- Git 2.30+

### Domain & SSL

- Domain name configured
- SSL certificate (Let's Encrypt or commercial)
- DNS records pointing to your server

## Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-org/performance-evaluation-system.git
cd performance-evaluation-system
```

### 2. Environment Configuration

Create environment-specific files:

```bash
# Production
cp performance-evaluation-frontend/env.production performance-evaluation-frontend/.env.production

# Staging
cp performance-evaluation-frontend/env.staging performance-evaluation-frontend/.env.staging
```

Update the environment variables with your actual values:

```bash
# Edit .env.production
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
VITE_GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
```

### 3. SSL Certificate Setup

```bash
# Create SSL directory
mkdir -p ssl

# Copy your SSL certificates
cp your-domain.crt ssl/certificate.crt
cp your-domain.key ssl/private.key
```

## Docker Deployment

### 1. Build and Deploy

```bash
# Build all services
docker-compose build

# Start all services
docker-compose up -d

# Check service status
docker-compose ps
```

### 2. Database Migration

```bash
# Run database migrations
docker-compose exec api dotnet ef database update

# Seed initial data (if needed)
docker-compose exec api dotnet run --seed-data
```

### 3. Health Checks

```bash
# Check application health
curl http://localhost/health

# Check individual services
curl http://localhost:3000/health  # Frontend
curl http://localhost:5000/health  # API
```

## CI/CD Pipeline

### 1. GitHub Actions Setup

1. Fork/clone the repository to your GitHub account
2. Add required secrets in GitHub repository settings:
   - `DOCKER_REGISTRY_TOKEN`
   - `SLACK_WEBHOOK_URL`
   - `LHCI_GITHUB_APP_TOKEN`

### 2. Automated Deployment

The CI/CD pipeline automatically:
- Runs tests and linting
- Performs security scans
- Builds Docker images
- Deploys to staging/production
- Runs performance tests

### 3. Manual Deployment

```bash
# Deploy to staging
git push origin develop

# Deploy to production
git push origin main
```

## Monitoring Setup

### 1. Prometheus Configuration

```bash
# Access Prometheus
http://your-domain:9090

# Check targets are healthy
# Targets should show "UP" status
```

### 2. Grafana Dashboard

```bash
# Access Grafana
http://your-domain:3001

# Default credentials
Username: admin
Password: admin

# Import dashboards from monitoring/grafana/dashboards/
```

### 3. Alert Configuration

Set up alerts for:
- High error rates (>5%)
- High response times (>2s)
- Low disk space (<10%)
- Service downtime

## Security Configuration

### 1. Firewall Setup

```bash
# Allow only necessary ports
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### 2. Security Headers

The application includes comprehensive security headers:
- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection

### 3. Rate Limiting

Nginx is configured with rate limiting:
- API endpoints: 10 requests/second
- Login endpoint: 5 requests/minute

## Performance Optimization

### 1. CDN Configuration

Configure your CDN (Cloudflare, AWS CloudFront, etc.):

```bash
# Cache static assets
*.js, *.css, *.png, *.jpg, *.svg -> Cache for 1 year
*.html -> Cache for 1 hour
/api/* -> No cache
```

### 2. Database Optimization

```sql
-- Create indexes for frequently queried columns
CREATE INDEX idx_users_email ON Users(Email);
CREATE INDEX idx_evaluations_status ON Evaluations(Status);
CREATE INDEX idx_evaluations_created_date ON Evaluations(CreatedDate);
```

### 3. Caching Strategy

- **Redis**: Session storage, API response caching
- **Browser**: Static assets, API responses
- **CDN**: Global static asset distribution

## Troubleshooting

### Common Issues

#### 1. Application Won't Start

```bash
# Check logs
docker-compose logs frontend
docker-compose logs api

# Check environment variables
docker-compose exec frontend env | grep VITE_
```

#### 2. Database Connection Issues

```bash
# Check database status
docker-compose exec database sqlcmd -S localhost -U sa -P YourStrong@Passw0rd

# Check connection string
docker-compose exec api env | grep ConnectionStrings
```

#### 3. Performance Issues

```bash
# Check resource usage
docker stats

# Check application metrics
curl http://localhost:5000/metrics

# Check nginx logs
docker-compose logs nginx
```

### Log Analysis

```bash
# View real-time logs
docker-compose logs -f

# Search for errors
docker-compose logs | grep -i error

# Check specific service
docker-compose logs api | tail -100
```

### Backup and Recovery

#### Database Backup

```bash
# Create backup
docker-compose exec database sqlcmd -S localhost -U sa -P YourStrong@Passw0rd -Q "BACKUP DATABASE PerformanceEvaluation TO DISK = '/var/opt/mssql/backup/backup.bak'"

# Restore from backup
docker-compose exec database sqlcmd -S localhost -U sa -P YourStrong@Passw0rd -Q "RESTORE DATABASE PerformanceEvaluation FROM DISK = '/var/opt/mssql/backup/backup.bak'"
```

#### Application Backup

```bash
# Backup volumes
docker run --rm -v performance-evaluation-system_db_data:/data -v $(pwd):/backup alpine tar czf /backup/db_backup.tar.gz -C /data .

# Restore volumes
docker run --rm -v performance-evaluation-system_db_data:/data -v $(pwd):/backup alpine tar xzf /backup/db_backup.tar.gz -C /data
```

## Maintenance

### Regular Tasks

1. **Weekly**:
   - Review application logs
   - Check disk space
   - Update security patches

2. **Monthly**:
   - Review performance metrics
   - Update dependencies
   - Test backup/restore procedures

3. **Quarterly**:
   - Security audit
   - Performance optimization review
   - Capacity planning

### Updates

```bash
# Update application
git pull origin main
docker-compose build
docker-compose up -d

# Update dependencies
npm update
docker-compose build --no-cache
```

## Support

For additional support:
- Check the application logs
- Review monitoring dashboards
- Contact the development team
- Create an issue in the GitHub repository

## Security Checklist

- [ ] SSL certificate installed and valid
- [ ] Firewall configured
- [ ] Security headers enabled
- [ ] Rate limiting configured
- [ ] Database backups scheduled
- [ ] Monitoring alerts configured
- [ ] Access logs enabled
- [ ] Error tracking configured
- [ ] Regular security updates scheduled
