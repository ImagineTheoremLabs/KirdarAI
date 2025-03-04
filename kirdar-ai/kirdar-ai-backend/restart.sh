#!/bin/bash

echo "Restarting Kirdar AI Backend Service..."

# Check if PM2 is running the service
if pm2 list | grep -q "kirdar-backend"; then
    echo "Restarting via PM2..."
    pm2 restart kirdar-backend
else
    echo "PM2 service not found. Trying to start manually..."
    
    # Kill any existing Node.js processes on port 5001
    PORT_PID=$(lsof -i :5001 -t)
    if [ ! -z "$PORT_PID" ]; then
        echo "Killing process on port 5001: $PORT_PID"
        kill -9 $PORT_PID
    fi
    
    # Start the server
    echo "Starting server..."
    cd "$(dirname "$0")"
    NODE_ENV=production nohup node server.js > backend.log 2>&1 &
    
    echo "Server started with PID: $!"
    echo "You can check the logs with: tail -f backend.log"
fi

echo "Done!" 