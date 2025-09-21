#!/bin/bash

echo "======================================"
echo "Starting Pharmaceutical Sales Tracker"
echo "======================================"
echo ""

# Check if backend is running
if curl -s http://localhost:5001/ > /dev/null; then
    echo "✅ Backend is already running on port 5001"
else
    echo "Starting backend server..."
    cd backend
    npm start &
    sleep 3
fi

echo ""
echo "Starting frontend application..."
cd ../frontend

# Export the environment variable for the port
export PORT=3000

# Start the React app
npm start