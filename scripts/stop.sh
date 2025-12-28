#!/bin/bash

# RareNet Stop Script
# Stops all RareNet services

echo "Stopping RareNet services..."

# Stop frontend
if [ -f "frontend/frontend.pid" ]; then
    kill $(cat frontend/frontend.pid) 2>/dev/null
    rm frontend/frontend.pid
    echo "✓ Frontend stopped"
fi

# Stop backend
if [ -f "backend/backend.pid" ]; then
    kill $(cat backend/backend.pid) 2>/dev/null
    rm backend/backend.pid
    echo "✓ Backend stopped"
fi

# Stop Docker services
docker-compose down
echo "✓ CyborgDB and Redis stopped"

echo ""
echo "All services stopped successfully!"
