#!/bin/bash

# Stop and remove containers

echo "════════════════════════════════════════════════════════════"
echo "🛑 Stopping all services..."
echo "════════════════════════════════════════════════════════════"

docker-compose down

echo "✓ All services stopped."
echo ""
echo "Remove volumes (reset database):"
echo "  docker-compose down -v"
echo ""
