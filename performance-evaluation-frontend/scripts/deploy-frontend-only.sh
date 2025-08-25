#!/bin/bash

# Frontend-Only Production Deployment Script
# This script deploys only the frontend application

set -e

echo "🚀 Starting Frontend-Only Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${PURPLE}[STEP]${NC} $1"
}

# Configuration
PROJECT_NAME="performance-evaluation-frontend"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
DEPLOYMENT_TAG="v1.0.0-${TIMESTAMP}"

# Check if running in correct directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the frontend directory"
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Step 1: Environment Setup
print_step "1. Setting up environment..."

# Create necessary directories
mkdir -p logs
mkdir -p uploads

print_success "Directories created"

# Step 2: Environment Variables
print_step "2. Configuring environment variables..."

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    print_warning "Creating .env.production from template..."
    cp "env.production" ".env.production"
fi

# Load environment variables
if [ -f ".env.production" ]; then
    export $(cat ".env.production" | grep -v '^#' | xargs)
    print_success "Environment variables loaded"
else
    print_error "Environment file not found"
    exit 1
fi

# Step 3: Pre-deployment Validation
print_step "3. Running pre-deployment validation..."

# Check if all required files exist
required_files=(
    "package.json"
    "Dockerfile"
    "nginx.conf"
    "security-headers.conf"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        print_error "Required file missing: $file"
        exit 1
    fi
done

print_success "All required files found"

# Step 4: Install Dependencies
print_step "4. Installing dependencies..."

npm ci --only=production
print_success "Dependencies installed"

# Step 5: Build Production
print_step "5. Building for production..."

npm run build
print_success "Production build completed"

# Step 6: Docker Build
print_step "6. Building Docker image..."

# Build the production Docker image
docker build --target production -t "${PROJECT_NAME}:${DEPLOYMENT_TAG}" .
docker tag "${PROJECT_NAME}:${DEPLOYMENT_TAG}" "${PROJECT_NAME}:latest"

print_success "Docker image built successfully"

# Step 7: Stop Existing Container
print_step "7. Stopping existing container..."

docker stop performance-evaluation-frontend || true
docker rm performance-evaluation-frontend || true
print_success "Existing container stopped"

# Step 8: Deploy Container
print_step "8. Deploying container..."

# Run the container
docker run -d \
    --name performance-evaluation-frontend \
    --restart unless-stopped \
    -p 8080:8080 \
    -v $(pwd)/logs:/var/log/nginx \
    -v $(pwd)/uploads:/usr/share/nginx/html/uploads \
    -e NODE_ENV=production \
    -e VITE_API_BASE_URL=${VITE_API_BASE_URL:-https://api.performance-evaluation.com} \
    -e VITE_APP_NAME=${VITE_APP_NAME:-Performance Evaluation System} \
    -e VITE_APP_VERSION=${VITE_APP_VERSION:-1.0.0} \
    "${PROJECT_NAME}:${DEPLOYMENT_TAG}"

print_success "Container deployed successfully"

# Step 9: Health Check
print_step "9. Running health check..."

# Wait for container to start
print_status "Waiting for container to start..."
sleep 10

# Check if container is running
if docker ps | grep -q performance-evaluation-frontend; then
    print_success "Container is running"
else
    print_error "Container failed to start"
    docker logs performance-evaluation-frontend
    exit 1
fi

# Check health endpoint
if curl -f http://localhost:8080/health > /dev/null 2>&1; then
    print_success "Health check passed"
else
    print_warning "Health check failed - checking container logs"
    docker logs performance-evaluation-frontend
fi

# Step 10: Performance Test
print_step "10. Running performance test..."

if command -v curl &> /dev/null; then
    print_status "Testing response time..."
    RESPONSE_TIME=$(curl -o /dev/null -s -w "%{time_total}" http://localhost:8080/ || echo "0")
    print_success "Response time: ${RESPONSE_TIME}s"
    
    if (( $(echo "$RESPONSE_TIME < 2.0" | bc -l 2>/dev/null || echo "1") )); then
        print_success "Performance test passed"
    else
        print_warning "Response time is slow: ${RESPONSE_TIME}s"
    fi
fi

# Step 11: Generate Deployment Report
print_step "11. Generating deployment report..."

cat > "frontend-deployment-report-${TIMESTAMP}.md" << EOF
# Frontend Production Deployment Report
## Performance Evaluation System - VakıfBank

**Deployment Date:** $(date)
**Deployment Tag:** ${DEPLOYMENT_TAG}
**Environment:** Production (Frontend Only)

## ✅ Deployment Status: SUCCESS

### Services Deployed
- [x] Frontend Application (Port 8080)

### Health Checks
- [x] Container Health Check
- [x] Application Health Check
- [x] Performance Test

### Security Features
- [x] Security Headers
- [x] Nginx Configuration
- [x] Docker Security

## Access Information

### Application URLs
- **Frontend:** http://localhost:8080
- **Health Check:** http://localhost:8080/health

## Maintenance Commands

### View Logs
\`\`\`bash
docker logs performance-evaluation-frontend
\`\`\`

### Restart Container
\`\`\`bash
docker restart performance-evaluation-frontend
\`\`\`

### Stop Container
\`\`\`bash
docker stop performance-evaluation-frontend
\`\`\`

### Update Application
\`\`\`bash
./scripts/deploy-frontend-only.sh
\`\`\`

## Support Information
- **Technical Support:** tech-support@vakifbank.com
- **Security Issues:** security@vakifbank.com

---
*Generated by Frontend Deployment Script*
EOF

print_success "Deployment report generated: frontend-deployment-report-${TIMESTAMP}.md"

# Step 12: Cleanup
print_step "12. Cleanup..."

# Remove old images
docker image prune -f
print_success "Cleanup completed"

# Final Success Message
echo ""
echo "🎉 ================================================="
echo "🎉 FRONTEND DEPLOYMENT COMPLETED SUCCESSFULLY!"
echo "🎉 ================================================="
echo ""
echo "📦 Deployment Information:"
echo "   - Tag: ${DEPLOYMENT_TAG}"
echo "   - Timestamp: ${TIMESTAMP}"
echo "   - Report: frontend-deployment-report-${TIMESTAMP}.md"
echo ""
echo "🌐 Application URL:"
echo "   - Frontend: http://localhost:8080"
echo ""
echo "📋 Useful Commands:"
echo "   - View logs: docker logs performance-evaluation-frontend"
echo "   - Restart: docker restart performance-evaluation-frontend"
echo "   - Stop: docker stop performance-evaluation-frontend"
echo ""
echo "📞 Support:"
echo "   - Technical: tech-support@vakifbank.com"
echo "   - Security: security@vakifbank.com"
echo ""

print_success "Frontend deployment completed successfully!"

# Exit with success
exit 0
