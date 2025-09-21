#!/bin/bash

echo "======================================"
echo "Pharmaceutical Sales Tracking System"
echo "======================================"
echo ""

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null
then
    echo "⚠️  MongoDB is not running. Please start MongoDB first."
    echo "   Run: mongod"
    exit 1
fi

echo "✅ MongoDB is running"
echo ""

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
echo ""

# Seed the database
echo "🌱 Seeding database with demo data..."
npm run seed
echo ""

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install
echo ""

echo "======================================"
echo "✅ Setup Complete!"
echo "======================================"
echo ""
echo "To start the application:"
echo ""
echo "1. Backend (in terminal 1):"
echo "   cd backend && npm start"
echo ""
echo "2. Frontend (in terminal 2):"
echo "   cd frontend && npm start"
echo ""
echo "The application will open at http://localhost:3000"
echo ""
echo "Demo Accounts:"
echo "Manager: manager@demo.com / password123"
echo "Sales Rep: sales@demo.com / password123"
echo "======================================"