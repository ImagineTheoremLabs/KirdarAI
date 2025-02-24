# Kirdar AI Platform

This project is a web application that simulates training interactions for healthcare and mental health sectors, allowing mentors to train guest users through AI-powered role-play scenarios.

## AWS EC2 Deployment Instructions

For the fastest and easiest way to deploy this application to AWS EC2, follow these steps:

1. **Run the deployment preparation script:**
   ```bash
   ./deploy.sh
   ```
   This will:
   - Build the frontend application
   - Create a deployment package in the `deploy` directory
   - Generate comprehensive deployment instructions

2. **Edit environment files:**
   Before uploading to EC2, update the environment variables in:
   - `deploy/kirdar-ai-backend/.env` (update MONGODB_URI, BACKEND_URL, FRONTEND_URL)
   - `deploy/.env` (update VITE_API_URL)

3. **Follow detailed AWS EC2 setup instructions in:**
   - `deploy/EC2_SETUP.md`

4. **Upload and install on EC2:**
   - Transfer the deployment package to your EC2 instance
   - Run the installation script on EC2
   - Access your deployed application

The application uses:
- Backend: Node.js, Express, MongoDB
- Frontend: React with Vite
- AWS: EC2 instance with Nginx as reverse proxy

The deployment configuration follows best practices for production, including:
- PM2 for process management
- Nginx for serving frontend and proxying API requests
- Environment-based configuration
- Security settings for firewall
