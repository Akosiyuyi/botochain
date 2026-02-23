# Botochain Deployment Guide - Digital Ocean

**Last Updated:** February 10, 2026  
**Target:** Ubuntu 22.04 LTS on Digital Ocean  
**Estimated Time:** 4-6 hours for first deployment

---

## Prerequisites

- Digital Ocean account with GitHub Student Developer Pack
- Domain name pointed to droplet IP
- SSH access to your droplet
- Local machine with Git and SSH configured

---

## Step 1: Server Setup

### 1.1 Create Digital Ocean Droplet

1. Login to Digital Ocean Dashboard
2. Click "Create" → "Droplets"
3. **Image:** Ubuntu 22.04 LTS (latest)
4. **Size:** Recommended $24/month (4GB RAM, 2 vCPU)
   - Minimum: $12/month but expect slower performance
5. **Region:** Choose closest to your location
6. **Authentication:** SSH Key (recommended) or Password
7. **Enable backups:** Yes (costs extra 20% but recommended)
8. Click "Create Droplet"
9. Note your droplet IP address

### 1.2 Initial Server Configuration

Connect to your droplet:
```bash
ssh root@YOUR_DROPLET_IP
```

Update system packages:
```bash
apt update && apt upgrade -y
```

Set hostname:
```bash
hostnamectl set-hostname botochain
```

### 1.3 Create Application User

```bash
# Create app user
useradd -m -s /bin/bash app_user

# Add sudo privileges
usermod -aG sudo app_user

# Switch to app user
su - app_user
```

### 1.4 Setup SSH for App User (Optional but Recommended)

On your **local machine**:
```bash
# Generate SSH key if you don't have one
ssh-keygen -t ed25519 -C "your-email@example.com"

# Copy public key
cat ~/.ssh/id_ed25519.pub
```

Back on **droplet** as `app_user`:
```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Paste your public key
nano ~/.ssh/authorized_keys

# Secure permissions
chmod 600 ~/.ssh/authorized_keys
```

Now you can SSH as `app_user`:
```bash
ssh app_user@your-droplet-ip
```

---

## Step 2: Install Core Dependencies

SSH back as root or use `sudo`:

### 2.1 Install PHP & Extensions

```bash
apt install -y software-properties-common
add-apt-repository -y ppa:ondrej/php
apt update

# Install PHP 8.2 with required extensions
apt install -y \
    php8.2-fpm \
    php8.2-mysql \
    php8.2-mbstring \
    php8.2-xml \
    php8.2-bcmath \
    php8.2-curl \
    php8.2-zip \
    php8.2-redis \
    php8.2-cli

# Verify installation
php -v
```

### 2.2 Install Nginx

```bash
apt install -y nginx

# Start Nginx
systemctl start nginx
systemctl enable nginx

# Test
systemctl status nginx
```

### 2.3 Install MySQL

```bash
apt install -y mysql-server

# Secure MySQL (optional but recommended)
mysql_secure_installation

# Start MySQL
systemctl start mysql
systemctl enable mysql
```

**Create database for application:**
```bash
mysql -u root -p

# In MySQL prompt:
CREATE DATABASE botochain;
CREATE USER 'botochain'@'localhost' IDENTIFIED BY 'strong_password_here';
GRANT ALL PRIVILEGES ON botochain.* TO 'botochain'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 2.4 Install Redis

```bash
apt install -y redis-server

# Start Redis
systemctl start redis-server
systemctl enable redis-server

# Test connection
redis-cli ping  # Should return PONG
```

### 2.5 Install Node.js

```bash
# Setup NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js
apt install -y nodejs

# Verify
node -v
npm -v
```

### 2.6 Install Composer

```bash
curl -sS https://getcomposer.org/installer | php
mv composer.phar /usr/local/bin/composer
chmod +x /usr/local/bin/composer

# Verify
composer --version
```

### 2.7 Install Supervisor

```bash
apt install -y supervisor

# Start supervisor
systemctl start supervisor
systemctl enable supervisor
```

### 2.8 Install Git

```bash
apt install -y git

# Configure git (optional)
git config --global user.name "Deploy User"
git config --global user.email "deploy@botochain.local"
```

---

## Step 3: Deploy Application

### 3.1 Clone Repository

```bash
cd /var/www
sudo git clone https://github.com/Akosiyuyi/botochain.git
sudo chown -R app_user:app_user botochain
cd botochain
```

### 3.2 Set Permissions

```bash
# Set owner
sudo chown -R app_user:www-data /var/www/botochain

# Set directory permissions
sudo chmod -R 755 /var/www/botochain

# Make storage writable
sudo chmod -R 775 /var/www/botochain/storage
sudo chmod -R 775 /var/www/botochain/bootstrap/cache
```

### 3.3 Install PHP Dependencies

```bash
cd /var/www/botochain
composer install --optimize-autoloader --no-dev
```

### 3.4 Configure Environment

```bash
# Copy your production template
cp .env.production.example .env

# Edit with your production values
nano .env
```

**Required values to set:**
```env
APP_KEY=                    # Will generate next
APP_URL=https://yourdomain.com
APP_DEBUG=false

DB_HOST=localhost
DB_DATABASE=botochain
DB_USERNAME=botochain
DB_PASSWORD=your_strong_password

# Mail service (Brevo SMTP)
MAIL_MAILER=smtp
MAIL_HOST=smtp-relay.brevo.com
MAIL_PORT=587
MAIL_USERNAME=your_brevo_login_email
MAIL_PASSWORD=your_brevo_smtp_key
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@botochain.app
MAIL_FROM_NAME="${APP_NAME}"

# Reverb (WebSocket)
REVERB_APP_ID=your-app-id
REVERB_APP_KEY=your-app-key
REVERB_APP_SECRET=your-app-secret
REVERB_HOST=yourdomain.com
REVERB_PORT=6001
REVERB_SCHEME=https

# Redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
```

### 3.5 Generate Application Key

```bash
php artisan key:generate
```

### 3.6 Install Frontend Dependencies

```bash
npm ci
npm run build
```

### 3.7 Create Storage Symlink

```bash
php artisan storage:link
```

This creates a symbolic link from `public/storage` to `storage/app/public` so uploaded files are accessible.

### 3.8 Configure Admin Email Forwarding (Names.com)

If you want all `admin@botochain.app` emails forwarded to your personal inbox:

1. Open Names.com → your domain `botochain.app`.
2. Go to **Email Forwarding**.
3. Create a forwarder:
    - **Alias / mailbox:** `admin`
    - **Destination:** your personal email (example: `yourname@gmail.com`)
4. Save changes and wait for propagation.
5. Send a test email to `admin@botochain.app` and confirm it arrives in your personal inbox.

Notes:
- This forwarding is for inbound email (messages people send to `admin@botochain.app`).
- Brevo SMTP is still used by Laravel for outbound OTP/forgot-password messages.
- Keep `MAIL_FROM_ADDRESS` as a verified sender under `botochain.app`.

---

## Step 4: Database Setup

### 4.1 Run Migrations

```bash
php artisan migrate --force
```

### 4.2 Seed Initial Data

```bash
php artisan db:seed --force
```

**Note:** This creates a default super-admin with:
- Email: `admin@gmail.com`
- Password: `password`
- **IMPORTANT: Change immediately after first login!**

### 4.3 Verify Database

```bash
php artisan tinker
User::count()  # Should return 1
exit
```

---

## Step 5: Laravel Reverb Setup (WebSocket)

### 5.1 Install Reverb

```bash
php artisan reverb:install
```

Follow the prompts to configure Reverb.

### 5.2 Generate Credentials

```bash
php artisan reverb:install
# Follow prompts - generates REVERB_APP_ID, REVERB_APP_KEY, REVERB_APP_SECRET
```

### 5.3 Update .env

Add credentials to `.env`:
```env
REVERB_APP_ID=generated-id
REVERB_APP_KEY=generated-key
REVERB_APP_SECRET=generated-secret
REVERB_HOST=yourdomain.com
REVERB_PORT=6001
REVERB_SCHEME=https
```

Update Vite variables:
```env
VITE_REVERB_APP_KEY="${REVERB_APP_KEY}"
VITE_REVERB_HOST="${REVERB_HOST}"
VITE_REVERB_PORT="${REVERB_PORT}"
VITE_REVERB_SCHEME="${REVERB_SCHEME}"
```

### 5.4 Rebuild Frontend

```bash
npm run build
```

---

## Step 6: Nginx Configuration

### 6.1 Create Nginx Site Configuration

```bash
sudo nano /etc/nginx/sites-available/botochain
```

Paste the following configuration:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Certificates (Let's Encrypt - will be configured next)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    root /var/www/botochain/public;
    index index.php index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;
    gzip_disable "msie6";

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # PHP-FPM configuration
    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    # WebSocket proxy for Reverb
    location /app/ {
        proxy_pass http://127.0.0.1:6001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
    }

    # Deny access to dot files
    location ~ /\. {
        deny all;
    }

    # Allow public storage symlink (created by `php artisan storage:link`)
    location ^~ /storage/ {
        try_files $uri $uri/ =404;
        access_log off;
        expires 30d;
    }

    # Deny access to env files
    location ~ \.env {
        deny all;
    }
}
```

### 6.2 Enable Site

```bash
# Create symlink to sites-enabled
sudo ln -s /etc/nginx/sites-available/botochain /etc/nginx/sites-enabled/

# Disable default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# If test passes, reload Nginx
sudo systemctl reload nginx
```

---

## Step 7: SSL Certificate (Let's Encrypt)

### 7.1 Install Certbot

```bash
apt install -y certbot python3-certbot-nginx
```

### 7.2 Generate Certificate

```bash
certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Follow prompts
# - Enter email
# - Accept terms
# - Choose whether to share email
```

### 7.3 Update Nginx Config

Replace the SSL cert paths in your Nginx config:
```bash
sudo nano /etc/nginx/sites-available/botochain
```

Update these lines:
```nginx
ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
```

### 7.4 Test & Reload

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 7.5 Auto-Renewal

```bash
# Check auto-renewal is enabled
certbot renew --dry-run

# View renewal schedule
systemctl status certbot.timer
```

---

## Step 8: Configure Supervisor (Queue & Reverb)

### 8.1 Create Supervisor Config

```bash
sudo nano /etc/supervisor/conf.d/botochain.conf
```

Paste the following:

```ini
[program:botochain-queue]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/botochain/artisan queue:work --queue=vote_sealing,election_finalization,default --tries=3 --timeout=300
autostart=true
autorestart=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/botochain/storage/logs/queue.log

[program:botochain-reverb]
command=php /var/www/botochain/artisan reverb:start --host 127.0.0.1 --port 6001
autostart=true
autorestart=true
user=www-data
numprocs=1
redirect_stderr=true
stdout_logfile=/var/www/botochain/storage/logs/reverb.log

[program:botochain-scheduler]
command=php /var/www/botochain/artisan schedule:work
autostart=true
autorestart=true
user=www-data
numprocs=1
redirect_stderr=true
stdout_logfile=/var/www/botochain/storage/logs/scheduler.log

[group:botochain]
programs=botochain-queue,botochain-reverb,botochain-scheduler
priority=999
```

### 8.2 Load & Start Services

```bash
# Reread config
sudo supervisorctl reread

# Update supervisor
sudo supervisorctl update

# Start all programs
sudo supervisorctl start all

# Check status
sudo supervisorctl status
```

Expected output:
```
botochain-queue:botochain-queue_00   RUNNING   pid 1234, uptime 0:00:05
botochain-queue:botochain-queue_01   RUNNING   pid 1235, uptime 0:00:05
botochain-reverb:botochain-reverb_00 RUNNING   pid 1236, uptime 0:00:05
```

---

## Step 9: Optimize Laravel

Run these commands to optimize for production:

```bash
cd /var/www/botochain

# Cache configuration
php artisan config:cache

# Cache routes
php artisan route:cache

# Cache views
php artisan view:cache

# Cache events
php artisan event:cache

# Optimize autoload
composer install --optimize-autoloader --no-dev
```

---

## Step 10: Firewall Configuration

```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS
sudo ufw allow 443/tcp

# Allow WebSocket (Reverb)
sudo ufw allow 6001/tcp

# Check rules
sudo ufw status
```

---

## Step 11: Verify Deployment

### 11.1 Check Services Running

```bash
# Check Nginx
sudo systemctl status nginx

# Check PHP-FPM
sudo systemctl status php8.2-fpm

# Check MySQL
sudo systemctl status mysql

# Check Redis
sudo systemctl status redis-server

# Check Supervisor
sudo supervisorctl status
```

### 11.2 Test Application

- Visit `https://yourdomain.com`
- You should see the login page
- Try logging in with default credentials (from seeder)

### 11.3 Test Real-time Features

1. Open two browser windows
2. Log in as admin in one, voter in another
3. Navigate to an ongoing election
4. Click "Results" section
5. Cast a vote as voter
6. Both windows should show updated results within 5 seconds

### 11.4 Test Email

```bash
php artisan tinker

Mail::raw('Test email from Botochain', function($m) {
    $m->to('your-email@example.com')
      ->subject('Botochain Deployment Test');
});

exit
```

Check your email should receive it within a few seconds.

### 11.5 Check Logs

```bash
# Laravel logs
tail -f /var/www/botochain/storage/logs/laravel.log

# Queue logs
tail -f /var/www/botochain/storage/logs/queue.log

# Reverb logs
tail -f /var/www/botochain/storage/logs/reverb.log

# Nginx error logs
tail -f /var/log/nginx/error.log

# MySQL logs
tail -f /var/log/mysql/error.log
```

---

## Post-Deployment Checklist

- [ ] Website accessible at https://yourdomain.com
- [ ] Login page loads
- [ ] Can login with seeded admin account
- [ ] Changed default admin password
- [ ] Created test election
- [ ] Cast test vote
- [ ] Real-time results update in real-time
- [ ] Email notifications working
- [ ] `admin@botochain.app` forwarding to personal inbox works
- [ ] All logs show no errors
- [ ] Supervisor services running (supervisorctl status shows all RUNNING)
- [ ] SSL certificate valid (lock icon in browser)
- [ ] Mobile responsive

---

## Monitoring & Maintenance

### Restart Services

```bash
# Restart all Supervisor programs
sudo supervisorctl restart all

# Restart Nginx
sudo systemctl restart nginx

# Restart PHP-FPM
sudo systemctl restart php8.2-fpm
```

### Monitor Logs

```bash
# Monitor all in one window
multitail -f /var/www/botochain/storage/logs/laravel.log \
          -f /var/www/botochain/storage/logs/queue.log \
          -f /var/www/botochain/storage/logs/reverb.log
```

### Database Backup

```bash
# Manual backup
mysqldump -u botochain -p botochain > botochain_backup.sql

# Schedule automated daily backup (add to crontab)
crontab -e

# Add this line:
0 2 * * * mysqldump -u botochain -p'password' botochain > /backup/botochain_$(date +\%Y\%m\%d).sql
```

### Monitor Disk Space

```bash
# Check disk usage
df -h

# Check specific directory
du -sh /var/www/botochain

# Set alerts if needed
watch -n 300 'df -h'
```

### Update & Security

```bash
# Update system (monthly)
sudo apt update && sudo apt upgrade -y

# Update composer packages
composer update

# Update npm packages
npm update

# Check for Laravel security issues
composer audit
```

---

## Troubleshooting

### Real-time not working?
```bash
# Check if Reverb is running
supervisorctl status botochain-reverb

# Check if listening on port 6001
netstat -tlnp | grep 6001

# Check browser console for WebSocket errors
# Browser DevTools → Console → Look for WebSocket errors

# Rebuild frontend
cd /var/www/botochain && npm run build
```

### Queue not processing votes?
```bash
# Check queue status
php artisan queue:monitor

# Check supervisor logs
tail -f /var/www/botochain/storage/logs/queue.log

# Restart queue worker
sudo supervisorctl restart botochain-queue:*
```

### PHP errors?
```bash
# Check PHP-FPM status
sudo systemctl status php8.2-fpm

# Check PHP error logs
tail -f /var/log/php8.2-fpm.log

# Check Laravel logs
tail -f /var/www/botochain/storage/logs/laravel.log
```

### High memory usage?
```bash
# Check what's using memory
free -h
top

# Restart services
sudo supervisorctl restart all
sudo systemctl restart nginx
```

---

## Support & Resources

- **Laravel Docs:** https://laravel.com/docs
- **Laravel Reverb:** https://reverb.laravel.com
- **Digital Ocean:** https://www.digitalocean.com/community
- **Nginx:** https://nginx.org/en/docs/
- **MySQL:** https://dev.mysql.com/doc/

---

## Rollback Plan

If something goes wrong:

```bash
# Check what broke
tail -f /var/www/botochain/storage/logs/laravel.log

# Restart services
sudo supervisorctl restart all

# Clear caches
php artisan cache:clear
php artisan config:clear

# Rollback database (if needed)
php artisan migrate:rollback
```

---

**Deployment Complete! 🚀**

Your Botochain application is now live on Digital Ocean.
