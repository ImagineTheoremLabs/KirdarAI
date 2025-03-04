#!/bin/bash

echo "Restarting Kirdar AI Frontend Service..."

# Check if PM2 is running the service
if pm2 list | grep -q "kirdar-frontend"; then
    echo "Restarting via PM2..."
    pm2 restart kirdar-frontend
else
    echo "PM2 service not found. Trying to start manually..."
    
    # Kill any existing Node.js processes on port 5173
    PORT_PID=$(lsof -i :5173 -t)
    if [ ! -z "$PORT_PID" ]; then
        echo "Killing process on port 5173: $PORT_PID"
        kill -9 $PORT_PID
    fi
    
    # Start the server
    echo "Starting frontend server..."
    cd "$(dirname "$0")"
    npm run build
    NODE_ENV=production nohup npm run preview > frontend.log 2>&1 &
    
    echo "Frontend server started with PID: $!"
    echo "You can check the logs with: tail -f frontend.log"
fi

echo "Done!" 