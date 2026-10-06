#!/bin/bash

# Hotel Booking System - Docker Startup Script

set -e

echo "════════════════════════════════════════════════════════════"
echo "🐳 Khách Sạn Online - Docker Compose Startup"
echo "════════════════════════════════════════════════════════════"

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "✓ Created .env file. Please update with your configuration."
fi

# Build images
echo ""
echo "🔨 Building Docker images..."
docker-compose build

# Start services
echo ""
echo "🚀 Starting services..."
docker-compose up -d

echo ""
echo "✓ All services starting..."
echo ""
echo "Service URLs:"
echo "  • Frontend:        http://localhost:5173"
echo "  • API Gateway:     http://localhost:8020"
echo "  • Auth Service:    http://localhost:8021"
echo "  • User Service:    http://localhost:8022"
echo "  • Hotel-Room:      http://localhost:8023"
echo "  • Booking Service: http://localhost:8024"
echo "  • Payment-Noti:    http://localhost:8025"
echo "  • MySQL:           localhost:3306"
echo ""
echo "Check status: docker-compose ps"
echo "View logs:   docker-compose logs -f"
echo "Stop all:    docker-compose down"
echo ""
