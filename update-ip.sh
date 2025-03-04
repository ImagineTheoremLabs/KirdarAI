#!/bin/bash

# Script to update IP address and domain name across the Kirdar AI application
# Usage: ./update-ip.sh <new-domain-name>
# Example: ./update-ip.sh ec2-52-1-240-73.compute-1.amazonaws.com

set -e

if [ -z "$1" ]; then
    echo "Error: No domain name provided."
    echo "Usage: ./update-ip.sh <new-domain-name>"
    echo "Example: ./update-ip.sh ec2-52-1-240-73.compute-1.amazonaws.com"
    exit 1
fi

NEW_DOMAIN=$1
# Extract IP from domain (assuming EC2 format: ec2-A-B-C-D.compute-1.amazonaws.com)
NEW_IP=$(echo $NEW_DOMAIN | sed -E 's/ec2-([0-9]+)-([0-9]+)-([0-9]+)-([0-9]+).*/\1.\2.\3.\4/')

echo "Updating configuration with new domain: $NEW_DOMAIN"
echo "Extracted IP: $NEW_IP"

# Get the current directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$SCRIPT_DIR/kirdar-ai"
BACKEND_DIR="$SCRIPT_DIR/kirdar-ai/kirdar-ai-backend"

echo "Updating frontend .env file..."
sed -i "s|VITE_API_URL=http://ec2-.*\.compute-1\.amazonaws\.com:5001|VITE_API_URL=http://$NEW_DOMAIN:5001|g" "$FRONTEND_DIR/.env"

echo "Updating vite.config.js file..."
# Replace domain in allowedHosts array
sed -i "s|'ec2-.*\.compute-1\.amazonaws\.com'|'$NEW_DOMAIN'|g" "$FRONTEND_DIR/vite.config.js"
# Replace IP in allowedHosts array
sed -i "s|'[0-9]\+\.[0-9]\+\.[0-9]\+\.[0-9]\+'|'$NEW_IP'|g" "$FRONTEND_DIR/vite.config.js"

echo "Updating backend .env file..."
sed -i "s|BACKEND_URL=http://ec2-.*\.compute-1\.amazonaws\.com:5001|BACKEND_URL=http://$NEW_DOMAIN:5001|g" "$BACKEND_DIR/.env"
sed -i "s|FRONTEND_URL=http://ec2-.*\.compute-1\.amazonaws\.com:5173|FRONTEND_URL=http://$NEW_DOMAIN:5173|g" "$BACKEND_DIR/.env"

echo "Updating backend app.js file..."
# Update the CORS configuration logging
sed -i "s|'http://ec2-.*\.compute-1\.amazonaws\.com:5173'|'http://$NEW_DOMAIN:5173'|g" "$BACKEND_DIR/app.js"

echo "Configuration files updated successfully!"
echo ""
echo "Now restarting services to apply changes..."

# Restart backend
echo "Restarting backend..."
bash "$BACKEND_DIR/restart.sh"

# Restart frontend
echo "Restarting frontend..."
bash "$FRONTEND_DIR/restart.sh"

echo ""
echo "Update complete! Your application should now be accessible at:"
echo "Frontend: http://$NEW_DOMAIN:5173"
echo "Backend: http://$NEW_DOMAIN:5001"
echo "API Health Check: http://$NEW_DOMAIN:5001/api/health" 