#!/bin/bash

# ERF3 Application Startup Script
# This script starts both the backend and frontend servers

echo "========================================="
echo "ERF3 Grant Funding Application System"
echo "========================================="
echo ""

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "Error: Please run this script from the ERF3-website directory"
    exit 1
fi

# Start backend server in background
echo "Starting backend server on port 3001..."
cd backend
npm start &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 2

# Start frontend server
echo "Starting frontend server on port 5173..."
cd frontend
npm run dev

# When frontend is stopped (Ctrl+C), also stop backend
echo ""
echo "Shutting down servers..."
kill $BACKEND_PID
echo "All servers stopped."
