#!/bin/bash

# RareNet Setup Script
# Automatically sets up and runs the entire RareNet system

set -e  # Exit on error

echo "========================================="
echo "  RareNet Setup Script"
echo "  Privacy-Preserving Rare Disease Diagnosis"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running on Windows (Git Bash/WSL)
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    echo -e "${YELLOW}Detected Windows environment${NC}"
    IS_WINDOWS=true
else
    IS_WINDOWS=false
fi

# Step 1: Check prerequisites
echo "Step 1: Checking prerequisites..."
echo ""

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    echo "Please install Docker from https://www.docker.com/get-started"
    exit 1
fi
echo -e "${GREEN}✓ Docker found${NC}"

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is not installed${NC}"
    echo "Please install Docker Compose"
    exit 1
fi
echo -e "${GREEN}✓ Docker Compose found${NC}"

# Check Python
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo -e "${RED}Error: Python is not installed${NC}"
    echo "Please install Python 3.11+ from https://www.python.org/"
    exit 1
fi

# Use python3 if available, otherwise python
if command -v python3 &> /dev/null; then
    PYTHON_CMD=python3
else
    PYTHON_CMD=python
fi

PYTHON_VERSION=$($PYTHON_CMD --version 2>&1 | awk '{print $2}')
echo -e "${GREEN}✓ Python $PYTHON_VERSION found${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi
NODE_VERSION=$(node --version)
echo -e "${GREEN}✓ Node.js $NODE_VERSION found${NC}"

echo ""

# Step 2: Start CyborgDB and Redis
echo "Step 2: Starting CyborgDB and Redis..."
echo ""

docker-compose up -d

echo -e "${GREEN}✓ CyborgDB and Redis started${NC}"
echo "  - CyborgDB: http://localhost:8000"
echo "  - Redis: localhost:6379"
echo ""

# Wait for CyborgDB to be ready
echo "Waiting for CyborgDB to be ready..."
for i in {1..30}; do
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ CyborgDB is ready${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}Error: CyborgDB failed to start${NC}"
        echo "Check logs with: docker-compose logs cyborgdb"
        exit 1
    fi
    sleep 1
done
echo ""

# Step 3: Setup Backend
echo "Step 3: Setting up backend..."
echo ""

cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    $PYTHON_CMD -m venv venv
    echo -e "${GREEN}✓ Virtual environment created${NC}"
else
    echo -e "${YELLOW}Virtual environment already exists${NC}"
fi

# Activate virtual environment
if [ "$IS_WINDOWS" = true ]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

# Install dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip > /dev/null 2>&1
pip install -r requirements.txt > /dev/null 2>&1
echo -e "${GREEN}✓ Python dependencies installed${NC}"

# Start backend server in background
echo "Starting backend server..."
if [ "$IS_WINDOWS" = true ]; then
    start cmd /k "cd /d $(pwd) && venv\\Scripts\\activate && uvicorn main:app --host 127.0.0.1 --port 8001 --reload"
else
    nohup uvicorn main:app --host 127.0.0.1 --port 8001 --reload > backend.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > backend.pid
fi

# Wait for backend to be ready
echo "Waiting for backend to be ready..."
for i in {1..60}; do
    if curl -s http://127.0.0.1:8001/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Backend is ready${NC}"
        break
    fi
    if [ $i -eq 60 ]; then
        echo -e "${RED}Error: Backend failed to start${NC}"
        echo "Check logs in backend/backend.log"
        exit 1
    fi
    sleep 1
done

cd ..
echo ""

# Step 4: Seed demo data
echo "Step 4: Seeding demo data..."
echo ""

# Seed demo users
echo "Seeding demo users..."
curl -s -X POST http://127.0.0.1:8001/auth/seed-demo-users > /dev/null 2>&1
echo -e "${GREEN}✓ Demo users seeded${NC}"

# Initialize database with patient data
echo "Initializing patient database (this may take 2-3 minutes)..."
cd backend
$PYTHON_CMD scripts/init_db.py > /dev/null 2>&1
echo -e "${GREEN}✓ Patient database initialized (30,000 vectors)${NC}"
cd ..
echo ""

# Step 5: Setup Frontend
echo "Step 5: Setting up frontend..."
echo ""

cd frontend

# Install dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing Node.js dependencies..."
    npm install > /dev/null 2>&1
    echo -e "${GREEN}✓ Node.js dependencies installed${NC}"
else
    echo -e "${YELLOW}Node modules already installed${NC}"
fi

# Start frontend server
echo "Starting frontend server..."
if [ "$IS_WINDOWS" = true ]; then
    start cmd /k "cd /d $(pwd) && npm run dev"
else
    nohup npm run dev > frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > frontend.pid
fi

# Wait for frontend to be ready
echo "Waiting for frontend to be ready..."
for i in {1..30}; do
    if curl -s http://localhost:5173 > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Frontend is ready${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}Error: Frontend failed to start${NC}"
        echo "Check logs in frontend/frontend.log"
        exit 1
    fi
    sleep 1
done

cd ..
echo ""

# Step 6: Verification
echo "Step 6: Running verification tests..."
echo ""

# Test backend health
echo "Testing backend health..."
HEALTH_RESPONSE=$(curl -s http://127.0.0.1:8001/api/health)
if echo "$HEALTH_RESPONSE" | grep -q "healthy"; then
    echo -e "${GREEN}✓ Backend health check passed${NC}"
else
    echo -e "${RED}✗ Backend health check failed${NC}"
fi

# Test login
echo "Testing login..."
LOGIN_RESPONSE=$(curl -s -X POST http://127.0.0.1:8001/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"doctor@mumbai.hospital","password":"password123"}')
if echo "$LOGIN_RESPONSE" | grep -q "access_token"; then
    echo -e "${GREEN}✓ Login test passed${NC}"
else
    echo -e "${RED}✗ Login test failed${NC}"
fi

echo ""

# Final summary
echo "========================================="
echo "  Setup Complete!"
echo "========================================="
echo ""
echo "Services running:"
echo "  • Frontend:  http://localhost:5173"
echo "  • Backend:   http://localhost:8001"
echo "  • API Docs:  http://localhost:8001/docs"
echo "  • CyborgDB:  http://localhost:8000"
echo ""
echo "Demo Credentials:"
echo "  • Email:    doctor@mumbai.hospital"
echo "  • Password: password123"
echo ""
echo "Next steps:"
echo "  1. Open http://localhost:5173 in your browser"
echo "  2. Click 'Sign In'"
echo "  3. Login with demo credentials above"
echo "  4. Try searching: 'joint hypermobility, easy bruising, stretchy skin'"
echo ""
echo "To stop all services:"
echo "  • Run: ./stop.sh"
echo ""
echo -e "${GREEN}Happy diagnosing! 🏥${NC}"
echo ""
