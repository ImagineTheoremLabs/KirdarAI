#!/bin/bash

# Kirdar-AI AWS EC2 Deployment Script
# This script helps deploy the application to an EC2 instance

echo "🚀 Building frontend application..."
cd /Users/sahilwikhe/downloads/mentorguestworking4\\(scenarios\\)\ 3/kirdar-ai
npm run build

echo "📦 Creating deployment package..."
# Create a deployment directory
mkdir -p ./deploy

# Copy backend files
cp -r ./kirdar-ai-backend ./deploy/
# Remove node_modules from backend (will reinstall on server)
rm -rf ./deploy/kirdar-ai-backend/node_modules

# Copy frontend dist folder
cp -r ./dist ./deploy/

# Create a README with deployment instructions
cat > ./deploy/README.md << 'EOF'
# Kirdar AI Deployment Instructions

## Prerequisites
- Ubuntu EC2 instance with at least 2GB RAM
- Node.js 18+ and npm installed
- MongoDB installed or MongoDB Atlas account

## Setup Steps

### 1. Install Node.js if not already installed
```
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Install MongoDB if using local database
```
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

### 3. Setup Application
```
# Install PM2 globally for process management
sudo npm install pm2 -g

# Backend setup
cd kirdar-ai-backend
npm install
# Edit the .env file with your EC2 details
nano .env

# Start backend with PM2
pm2 start server.js --name kirdar-backend
pm2 save
pm2 startup
```

### 4. Setup Nginx for serving frontend
```
sudo apt install nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Configure Nginx
sudo nano /etc/nginx/sites-available/kirdar-ai
```

Add this configuration:
```
server {
    listen 80;
    server_name your_ec2_domain_or_ip;

    # Frontend static files
    location / {
        root /path/to/deploy/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy
    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```
sudo ln -s /etc/nginx/sites-available/kirdar-ai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5. Setup firewall if needed
```
sudo ufw allow 'Nginx Full'
sudo ufw allow 22
sudo ufw enable
```

Congratulations! Your application should now be running.
EOF

echo "🔧 Creating installation script..."
cat > ./deploy/install.sh << 'EOF'
#!/bin/bash

# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Install Node.js 18.x if not installed
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Check Node.js and npm versions
node -v
npm -v

# Install PM2 globally
sudo npm install -g pm2

# Setup the backend
cd kirdar-ai-backend
npm install

# Check if .env file exists and has been updated
if grep -q "ec2-xx-xx-xx" .env; then
    echo "⚠️ WARNING: Please update your .env file with correct AWS EC2 details"
    echo "You need to edit: BACKEND_URL and FRONTEND_URL in the .env file"
fi

# Start the backend server with PM2
pm2 start server.js --name kirdar-backend
pm2 save
pm2 startup

# Install Nginx for frontend serving
sudo apt-get install -y nginx

# Create Nginx configuration
sudo tee /etc/nginx/sites-available/kirdar-ai > /dev/null << EOL
server {
    listen 80;
    server_name _;

    # Frontend static files
    location / {
        root $(pwd)/../dist;
        try_files \$uri \$uri/ /index.html;
        index index.html;
    }

    # Backend API proxy
    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOL

# Enable the site by creating a symbolic link
sudo ln -sf /etc/nginx/sites-available/kirdar-ai /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Configure firewall if needed
sudo ufw allow 'Nginx Full'
sudo ufw allow 22
sudo ufw enable

echo "✅ Installation complete!"
echo "Your application should be accessible at http://YOUR_EC2_IP"
echo "Remember to update your .env files with the correct EC2 IP/domain"
EOF

# Make installation script executable
chmod +x ./deploy/install.sh

echo "📝 Creating EC2 setup instructions..."
cat > ./deploy/EC2_SETUP.md << 'EOF'
# AWS EC2 Setup for Kirdar AI

## 1. Launch an EC2 Instance

1. Log in to the AWS Management Console and navigate to EC2
2. Click "Launch Instance"
3. Choose Ubuntu Server 22.04 LTS
4. Select t2.micro for free tier or t2.small/t2.medium for better performance
5. Configure Instance Details as needed
6. Add at least 20GB of storage
7. Configure Security Group:
   - Allow SSH (Port 22) from your IP
   - Allow HTTP (Port 80) from anywhere
   - Allow HTTPS (Port 443) from anywhere
8. Review and Launch
9. Create or select an existing key pair, download it if new

## 2. Connect to Your Instance

```bash
chmod 400 your-key-pair.pem
ssh -i your-key-pair.pem ubuntu@your-ec2-public-dns
```

## 3. Update Environment Files Before Deployment

Before uploading the deployment package to your EC2 instance, update:

1. `kirdar-ai-backend/.env`: Set the MONGODB_URI, BACKEND_URL and FRONTEND_URL
2. `dist/.env` (if exists): Update VITE_API_URL

## 4. Upload the Deployment Package

From your local machine:

```bash
scp -i your-key-pair.pem -r ./deploy ubuntu@your-ec2-public-dns:~/kirdar-ai
```

## 5. Run the Installation Script

On your EC2 instance:

```bash
cd ~/kirdar-ai
chmod +x install.sh
./install.sh
```

## 6. Verify the Deployment

Open your browser and navigate to:
```
http://your-ec2-public-dns
```

Your application should now be running!
EOF

echo "✅ Deployment package created! Follow the instructions in deploy/EC2_SETUP.md to deploy to AWS EC2."
echo "Before uploading to EC2, update the environment files with your actual EC2 IP or domain."