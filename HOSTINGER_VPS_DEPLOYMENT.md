# 🚀 Hostinger VPS Deployment Guide

## Offwire Clothing Store (MEVN Stack)

This guide walks you through deploying the **Offwire** clothing store application (Vue.js frontend + Express.js/Prisma backend with MySQL) on a Hostinger VPS.

---

## 📋 Prerequisites

- Hostinger VPS with **Ubuntu 22.04** (MEVN Stack template recommended)
- SSH access to your VPS
- Your VPS IP address
- Domain name: `offwire.lumicore-labs.com`
- GitHub repository: `https://github.com/MG4ACA/klova.git`

---

## 🎯 Architecture Overview

```
┌─────────────────────────────────────────────┐
│            Hostinger VPS Server             │
│                                             │
│  ┌──────────────────────────────────────┐   │
│  │  Nginx (Reverse Proxy)               │   │
│  │  Port 80 / 443                       │   │
│  └───────────────┬──────────────────────┘   │
│                  │                           │
│  ┌───────────────▼──────────┐  ┌──────────┐ │
│  │  Vue.js Frontend         │  │ Express  │ │
│  │  (Static Files)          │  │ Backend  │ │
│  │  /var/www/html/          │  │ Port 3000│ │
│  │   offwire-frontend       │  └────┬─────┘ │
│  └──────────────────────────┘       │       │
│                                ┌────▼─────┐ │
│                                │  MySQL   │ │
│                                │ offwire_ │ │
│                                │  store   │ │
│                                └──────────┘ │
└─────────────────────────────────────────────┘
```

---

## 📦 Step 1: Connect to Your VPS

```bash
# Connect via SSH
ssh root@your_vps_ip

# Or with a specific user
ssh username@your_vps_ip
```

---

## 🔧 Step 2: Initial Server Setup

### 2.1 Update System Packages

```bash
sudo apt update && sudo apt upgrade -y
```

### 2.2 Install Required Tools

```bash
# Install Git
sudo apt install git -y

# Install Node.js 20.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify versions
node -v
npm -v

# Install PM2 (Process Manager)
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y

# Install MySQL Server
sudo apt install mysql-server -y
sudo systemctl start mysql
sudo systemctl enable mysql
sudo systemctl status mysql
```

### 2.3 Configure Firewall

```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
sudo ufw status
```

---

## 🗄️ Step 3: Set Up MySQL Database

### 3.1 Secure MySQL Installation

```bash
sudo mysql_secure_installation
```

Follow the prompts to:
- Set root password
- Remove anonymous users
- Disallow root login remotely
- Remove test database

### 3.2 Create Database and User

```bash
sudo mysql -u root -p
```

```sql
-- Create the Offwire database
CREATE DATABASE offwire_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create a dedicated user
CREATE USER 'offwire_user'@'localhost' IDENTIFIED BY 'your_strong_password_here';

-- Grant privileges
GRANT ALL PRIVILEGES ON offwire_store.* TO 'offwire_user'@'localhost';

-- Apply changes
FLUSH PRIVILEGES;

EXIT;
```

---

## 📥 Step 4: Clone the Repository

### 4.1 Create Application Directory

```bash
sudo mkdir -p /var/www/offwire
sudo chown -R $USER:$USER /var/www/offwire
cd /var/www/offwire
```

### 4.2 Clone from GitHub

```bash
git clone https://github.com/MG4ACA/klova.git .
```

> **Note:** The `.` clones into the current directory.

### 4.3 Verify Structure

```bash
ls -la
# Expected: backend/  frontend/  package.json  README.md  ...
```

### 4.4 Pull Latest Updates (when needed)

```bash
cd /var/www/offwire

git fetch --all
git branch
# git checkout main  (or your target branch)
git pull origin main

# If conflicts occur:
# git reset --hard origin/main
```

---

## 🔨 Step 5: Set Up Backend

### 5.1 Navigate to Backend Directory

```bash
cd /var/www/offwire/backend
```

### 5.2 Install Dependencies

```bash
npm install --production
```

### 5.3 Configure Environment Variables

```bash
nano .env
```

Paste the following and fill in your values:

```env
# Application
NODE_ENV=production
PORT=3000

# Database (Prisma uses DATABASE_URL)
DATABASE_URL="mysql://offwire_user:your_strong_password_here@localhost:3306/offwire_store"

# Keep individual vars for any direct mysql2 usage (optional fallback)
DB_HOST=localhost
DB_USER=offwire_user
DB_PASSWORD=your_strong_password_here
DB_NAME=offwire_store

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_complex
JWT_EXPIRES_IN=7d

# Frontend URL
FRONTEND_URL=https://offwire.lumicore-labs.com

# WhatsApp Configuration
WHATSAPP_NUMBER=94705045099
WHATSAPP_API_URL=https://wa.me/

# File Upload Configuration
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/jpg,image/png,image/webp

# Admin Defaults
ADMIN_EMAIL=admin@offwire.com
ADMIN_PASSWORD=change_this_immediately
```

**Generate a secure JWT secret:**

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 5.4 Generate Prisma Client & Push Schema

```bash
# Generate the Prisma client
npx prisma generate

# Push schema to the MySQL database (creates all tables)
npx prisma db push
```

> ⚠️ `prisma db push` will create all tables defined in `schema.prisma` without running migrations.
> Use `npx prisma migrate deploy` if you have a `migrations/` folder committed.

### 5.5 Seed the Database

```bash
# Seed categories first
node seed-categories.js

# Seed admin user
node seed-admin.js

# Seed product data
node seed-tshirts.js

# Seed product images
node seed-images.js
```

### 5.6 Test Backend Locally

```bash
# Quick test run
node server.js

# In another SSH session, test the health endpoint
curl http://localhost:3000/api/health
```

Expected response:
```json
{"success":true,"message":"Klova API is running","timestamp":"..."}
```

Press `Ctrl+C` to stop, then manage via PM2.

### 5.7 Start Backend with PM2

```bash
# Start backend
pm2 start server.js --name offwire-backend

# Save PM2 process list
pm2 save

# Enable PM2 to start on system boot
pm2 startup
# Run the command it prints (e.g., sudo env PATH=... pm2 startup systemd ...)

# Check status
pm2 status
```

**Useful PM2 Commands:**

```bash
# View live logs
pm2 logs offwire-backend

# Restart
pm2 restart offwire-backend

# Stop
pm2 stop offwire-backend

# Monitor resources
pm2 monit
```

---

## 🎨 Step 6: Set Up Frontend

### 6.1 Navigate to Frontend Directory

```bash
cd /var/www/offwire/frontend
```

### 6.2 Create Production Environment File

```bash
nano .env.production
```

```env
# Point to your production domain
VITE_API_BASE_URL=https://offwire.lumicore-labs.com

# WhatsApp Business Number
VITE_WHATSAPP_NUMBER=94705045099
```

### 6.3 Install Dependencies and Build

```bash
npm install
npm run build
```

This creates a `dist/` folder with all optimized static files.

### 6.4 Deploy Build to Nginx Directory

```bash
# Create the directory for the frontend
sudo mkdir -p /var/www/html/offwire-frontend

# Copy built files
sudo cp -r dist/* /var/www/html/offwire-frontend/

# Set correct permissions
sudo chown -R www-data:www-data /var/www/html/offwire-frontend
sudo chmod -R 755 /var/www/html/offwire-frontend
```

---

## 🌐 Step 7: Configure Nginx

### 7.1 Create Nginx Site Configuration

```bash
sudo nano /etc/nginx/sites-available/offwire
```

Paste this configuration:

```nginx
# Upstream backend (Offwire Express API)
upstream offwire_backend {
    server localhost:3000;
    keepalive 64;
}

server {
    listen 80;
    server_name offwire.lumicore-labs.com www.offwire.lumicore-labs.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend — Serve Vue.js SPA
    location / {
        root /var/www/html/offwire-frontend;
        index index.html;
        try_files $uri $uri/ /index.html;

        # Cache static assets aggressively
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|webp)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API — Proxy to Express.js on port 3000
    location /api/ {
        proxy_pass http://offwire_backend/api/;
        proxy_http_version 1.1;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploaded product images — served directly from backend uploads folder
    location /uploads/ {
        alias /var/www/offwire/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public";
    }

    # Nginx logs
    access_log /var/log/nginx/offwire-access.log;
    error_log  /var/log/nginx/offwire-error.log;
}
```

### 7.2 Enable Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/offwire /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
sudo systemctl enable nginx
```

---

## 🔒 Step 8: Set Up SSL with Let's Encrypt

### 8.1 Install Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 8.2 Obtain SSL Certificate

```bash
sudo certbot --nginx -d offwire.lumicore-labs.com -d www.offwire.lumicore-labs.com
```

Certbot will auto-configure Nginx for HTTPS and set up auto-renewal.

### 8.3 Test Auto-Renewal

```bash
sudo certbot renew --dry-run
```

---

## ✅ Step 9: Verify Deployment

### 9.1 Check Backend

```bash
# PM2 status
pm2 status

# Live logs
pm2 logs offwire-backend

# Health check
curl http://localhost:3000/api/health
```

### 9.2 Check Nginx

```bash
sudo systemctl status nginx
sudo tail -f /var/log/nginx/offwire-error.log
sudo tail -f /var/log/nginx/offwire-access.log
```

### 9.3 Check MySQL

```bash
sudo systemctl status mysql
mysql -u offwire_user -p offwire_store -e "SHOW TABLES;"
```

### 9.4 Test Application in Browser

Visit:
- `https://offwire.lumicore-labs.com`

You should see the Offwire storefront! Try logging in with your seeded admin account.

---

## 🔄 Step 10: Automated Deployment Script (For Updates)

Create a reusable deploy script:

```bash
nano /var/www/offwire/deploy.sh
```

```bash
#!/bin/bash
set -e

echo "🚀 Starting Offwire deployment..."
cd /var/www/offwire

# Pull latest code
echo "📥 Pulling latest changes from GitHub..."
git pull origin main

# ── Backend ──────────────────────────────────────
echo "🔨 Updating backend..."
cd backend
npm install --production
npx prisma generate
npx prisma db push   # or: npx prisma migrate deploy
pm2 restart offwire-backend
cd ..

# ── Frontend ─────────────────────────────────────
echo "🎨 Building frontend..."
cd frontend
npm install
npm run build
sudo cp -r dist/* /var/www/html/offwire-frontend/
sudo chown -R www-data:www-data /var/www/html/offwire-frontend
cd ..

# ── Nginx ─────────────────────────────────────────
echo "🌐 Reloading Nginx..."
sudo systemctl reload nginx

echo "✅ Offwire deployment complete!"
pm2 status
```

Make it executable:

```bash
chmod +x /var/www/offwire/deploy.sh
```

Run a deployment:

```bash
/var/www/offwire/deploy.sh
```

---

## 🛠️ Maintenance Commands

### Check Service Status

```bash
pm2 status
sudo systemctl status nginx
sudo systemctl status mysql

df -h       # Disk space
free -m     # Memory usage
```

### View Logs

```bash
# Backend logs
pm2 logs offwire-backend

# Nginx logs
sudo tail -f /var/log/nginx/offwire-access.log
sudo tail -f /var/log/nginx/offwire-error.log

# MySQL logs
sudo tail -f /var/log/mysql/error.log
```

### Backup Database

```bash
mkdir -p ~/backups

# Manual backup
mysqldump -u offwire_user -p offwire_store > ~/backups/offwire_store_$(date +%Y%m%d_%H%M%S).sql
```

**Automated daily backup (2 AM):**

```bash
nano ~/backup-offwire.sh
```

```bash
#!/bin/bash
BACKUP_DIR=~/backups
mkdir -p $BACKUP_DIR
mysqldump -u offwire_user -p'your_strong_password_here' offwire_store \
  > $BACKUP_DIR/offwire_store_$(date +%Y%m%d_%H%M%S).sql

# Keep only last 7 days
find $BACKUP_DIR -name "offwire_store_*.sql" -mtime +7 -delete
```

```bash
chmod +x ~/backup-offwire.sh

# Schedule via crontab
crontab -e
# Add: 0 2 * * * /root/backup-offwire.sh
```

---

## 🐛 Troubleshooting

### Backend Not Starting

```bash
pm2 logs offwire-backend

# Port already in use?
sudo lsof -i :3000
sudo kill -9 <PID>

# Prisma client not generated?
cd /var/www/offwire/backend
npx prisma generate
pm2 restart offwire-backend

# Test DB connection
mysql -u offwire_user -p offwire_store
```

### Frontend Not Loading

```bash
sudo tail -f /var/log/nginx/offwire-error.log

# Verify files exist
ls -la /var/www/html/offwire-frontend

# Validate Nginx config
sudo nginx -t
sudo systemctl reload nginx
```

### 502 Bad Gateway

```bash
# Backend not running?
pm2 status
pm2 restart offwire-backend

# Check port 3000
sudo netstat -tlnp | grep 3000
```

### Database Connection Issues

```bash
# Test connection
mysql -u offwire_user -p offwire_store

# Is MySQL running?
sudo systemctl status mysql
sudo systemctl restart mysql

# Check DATABASE_URL in .env
cat /var/www/offwire/backend/.env | grep DATABASE_URL
```

### CORS Errors in Browser

Make sure `FRONTEND_URL` in `/var/www/offwire/backend/.env` is set to `https://offwire.lumicore-labs.com`, then restart:

```bash
pm2 restart offwire-backend
```

---

## 📝 Post-Deployment Checklist

- [ ] Backend is running via PM2 (`pm2 status`)
- [ ] MySQL database `offwire_store` is created with all tables
- [ ] Prisma client generated (`npx prisma generate`)
- [ ] Database seeded
- [ ] Frontend built with `VITE_API_BASE_URL=https://offwire.lumicore-labs.com`
- [ ] Frontend served by Nginx at `/var/www/html/offwire-frontend`
- [ ] Nginx server_name set to `offwire.lumicore-labs.com`
- [ ] SSL certificate installed with Certbot for `offwire.lumicore-labs.com`
- [ ] `/api/health` returns `{"success":true}`
- [ ] Firewall configured (`ufw status`)
- [ ] Database backups automated
- [ ] Deployment script tested (`./deploy.sh`)

---

**Last Updated:** August 2026  
**Version:** 2.0.0 — Offwire
