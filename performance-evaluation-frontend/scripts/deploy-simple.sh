#!/bin/bash

# Simple Production Deployment Script
# This script deploys the application with minimal checks

set -e

echo "🚀 Starting Simple Production Deployment..."

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
PORT=8080

# Check if running in correct directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the frontend directory"
    exit 1
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js and try again."
    exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm and try again."
    exit 1
fi

# Step 1: Environment Setup
print_step "1. Setting up environment..."

# Create necessary directories
mkdir -p logs
mkdir -p uploads
mkdir -p dist

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
    "vite.config.ts"
    "tsconfig.json"
    "tailwind.config.js"
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

# Skip if dependencies are already installed
if [ -d "node_modules" ]; then
    print_success "Dependencies already installed"
else
    npm install --ignore-scripts
    print_success "Dependencies installed"
fi

# Step 5: Build Production (Skip Type Checking)
print_step "5. Building for production..."

# Set environment to production and build
export NODE_ENV=production
export VITE_APP_ENVIRONMENT=production

# Build without type checking
npx vite build --mode production
print_success "Production build completed"

# Step 6: Validate Build
print_step "6. Validating build..."

# Check if dist directory exists and has content
if [ ! -d "dist" ]; then
    print_error "Build failed - dist directory not found"
    exit 1
fi

if [ ! -f "dist/index.html" ]; then
    print_error "Build failed - index.html not found in dist"
    exit 1
fi

print_success "Build validation passed"

# Step 7: Install Production Server
print_step "7. Installing production server..."

# Install serve for production serving
npm install -g serve
print_success "Production server installed"

# Step 8: Start Production Server
print_step "8. Starting production server..."

# Kill any existing process on the port
lsof -ti:${PORT} | xargs kill -9 2>/dev/null || true

# Start the production server
print_status "Starting server on port ${PORT}..."
serve -s dist -l ${PORT} > logs/server.log 2>&1 &
SERVER_PID=$!

# Wait for server to start
sleep 5

# Check if server is running
if kill -0 $SERVER_PID 2>/dev/null; then
    print_success "Production server started (PID: $SERVER_PID)"
else
    print_error "Failed to start production server"
    cat logs/server.log
    exit 1
fi

# Step 9: Health Check
print_step "9. Running health check..."

# Wait for server to be ready
sleep 3

# Check if server is responding
if curl -f http://localhost:${PORT}/ > /dev/null 2>&1; then
    print_success "Health check passed"
else
    print_error "Health check failed"
    cat logs/server.log
    exit 1
fi

# Step 10: Performance Test
print_step "10. Running performance test..."

if command -v curl &> /dev/null; then
    print_status "Testing response time..."
    RESPONSE_TIME=$(curl -o /dev/null -s -w "%{time_total}" http://localhost:${PORT}/ || echo "0")
    print_success "Response time: ${RESPONSE_TIME}s"
    
    if (( $(echo "$RESPONSE_TIME < 2.0" | bc -l 2>/dev/null || echo "1") )); then
        print_success "Performance test passed"
    else
        print_warning "Response time is slow: ${RESPONSE_TIME}s"
    fi
fi

# Step 11: Bundle Analysis
print_step "11. Analyzing bundle..."

# Check bundle size
BUNDLE_SIZE=$(du -sb dist/ | cut -f1)
MAX_SIZE=5242880 # 5MB

if [ "$BUNDLE_SIZE" -gt "$MAX_SIZE" ]; then
    print_warning "Bundle size ($BUNDLE_SIZE bytes) exceeds recommended size ($MAX_SIZE bytes)"
else
    print_success "Bundle size ($BUNDLE_SIZE bytes) is within limits"
fi

# Step 12: Generate Deployment Report
print_step "12. Generating deployment report..."

cat > "simple-deployment-report-${TIMESTAMP}.md" << EOF
# Simple Production Deployment Report
## Performance Evaluation System - VakıfBank

**Deployment Date:** $(date)
**Deployment Tag:** ${DEPLOYMENT_TAG}
**Environment:** Production (Simple Build)
**Server PID:** ${SERVER_PID}

## ✅ Deployment Status: SUCCESS

### Services Deployed
- [x] Frontend Application (Port ${PORT})
- [x] Production Build
- [x] Static File Server

### Health Checks
- [x] Server Health Check
- [x] Application Health Check
- [x] Performance Test

### Build Information
- **Bundle Size:** ${BUNDLE_SIZE} bytes
- **Build Time:** $(date)
- **Environment:** Production
- **Build Type:** Simple (No Type Checking)

## Access Information

### Application URLs
- **Frontend:** http://localhost:${PORT}
- **Health Check:** http://localhost:${PORT}/

## Maintenance Commands

### View Logs
\`\`\`bash
tail -f logs/server.log
\`\`\`

### Stop Server
\`\`\`bash
kill ${SERVER_PID}
\`\`\`

### Restart Server
\`\`\`bash
kill ${SERVER_PID} && ./scripts/deploy-simple.sh
\`\`\`

### Update Application
\`\`\`bash
./scripts/deploy-simple.sh
\`\`\`

## Performance Metrics
- **Response Time:** ${RESPONSE_TIME}s
- **Bundle Size:** ${BUNDLE_SIZE} bytes
- **Server Status:** Running

## Notes
- This deployment skipped TypeScript type checking for faster deployment
- For production use, consider running full type checking and tests
- Security audit was not performed in this simple deployment

## Support Information
- **Technical Support:** tech-support@vakifbank.com
- **Security Issues:** security@vakifbank.com

---
*Generated by Simple Deployment Script*
EOF

print_success "Deployment report generated: simple-deployment-report-${TIMESTAMP}.md"

# Step 13: Create Management Script
print_step "13. Creating management script..."

cat > "manage-server.sh" << EOF
#!/bin/bash
# Server Management Script

case "\$1" in
    "start")
        echo "Starting server..."
        serve -s dist -l ${PORT} > logs/server.log 2>&1 &
        echo \$! > server.pid
        echo "Server started with PID: \$(cat server.pid)"
        ;;
    "stop")
        if [ -f server.pid ]; then
            echo "Stopping server..."
            kill \$(cat server.pid) 2>/dev/null || true
            rm server.pid
            echo "Server stopped"
        else
            echo "No server PID file found"
        fi
        ;;
    "restart")
        \$0 stop
        sleep 2
        \$0 start
        ;;
    "status")
        if [ -f server.pid ] && kill -0 \$(cat server.pid) 2>/dev/null; then
            echo "Server is running (PID: \$(cat server.pid))"
        else
            echo "Server is not running"
        fi
        ;;
    "logs")
        tail -f logs/server.log
        ;;
    *)
        echo "Usage: \$0 {start|stop|restart|status|logs}"
        exit 1
        ;;
esac
EOF

chmod +x manage-server.sh
print_success "Management script created"

# Step 14: Final Validation
print_step "14. Final validation..."

# Check if server is still running
if kill -0 $SERVER_PID 2>/dev/null; then
    print_success "Server is running and healthy"
else
    print_error "Server is not running"
    exit 1
fi

# Final Success Message
echo ""
echo "🎉 ================================================="
echo "🎉 SIMPLE PRODUCTION DEPLOYMENT COMPLETED!"
echo "🎉 ================================================="
echo ""
echo "📦 Deployment Information:"
echo "   - Tag: ${DEPLOYMENT_TAG}"
echo "   - Timestamp: ${TIMESTAMP}"
echo "   - Report: simple-deployment-report-${TIMESTAMP}.md"
echo "   - Server PID: ${SERVER_PID}"
echo ""
echo "🌐 Application URL:"
echo "   - Frontend: http://localhost:${PORT}"
echo ""
echo "📋 Management Commands:"
echo "   - View logs: tail -f logs/server.log"
echo "   - Stop server: kill ${SERVER_PID}"
echo "   - Restart: ./manage-server.sh restart"
echo "   - Status: ./manage-server.sh status"
echo ""
echo "📞 Support:"
echo "   - Technical: tech-support@vakifbank.com"
echo "   - Security: security@vakifbank.com"
echo ""

print_success "Simple production deployment completed successfully!"

# Keep the script running to maintain the server
print_status "Server is running. Press Ctrl+C to stop."
trap "echo 'Stopping server...'; kill $SERVER_PID; exit 0" INT TERM

# Wait for the server process
wait $SERVER_PID
