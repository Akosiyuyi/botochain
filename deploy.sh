#!/bin/bash

#####################################################
# Botochain Deployment Script
# 
# Usage: ./deploy.sh [environment]
# Example: ./deploy.sh production
#
# This script automates deployment to your droplet
#####################################################

set -e  # Exit on any error

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
APP_DIR="/var/www/botochain"
STORAGE_DIRS=("storage" "bootstrap/cache")
APP_OWNER=${APP_OWNER:-deploy}

echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Botochain Deployment Script         ║${NC}"
echo -e "${GREEN}║   Environment: $ENVIRONMENT                  ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""

# Check if running on server
if [ ! -d "$APP_DIR" ]; then
    echo -e "${RED}Error: Application directory not found at $APP_DIR${NC}"
    echo "This script should run on the production server."
    exit 1
fi

cd "$APP_DIR"

# 1. Enable Maintenance Mode
echo -e "${YELLOW}[1/10] Enabling maintenance mode...${NC}"
php artisan down || true

# 2. Pull Latest Code
echo -e "${YELLOW}[2/10] Pulling latest code from Git...${NC}"
git pull origin main

# 3. Install Dependencies
echo -e "${YELLOW}[3/10] Installing Composer dependencies...${NC}"
composer install --no-interaction --prefer-dist --optimize-autoloader --no-dev

# 4. Install Frontend Dependencies
echo -e "${YELLOW}[4/10] Installing NPM dependencies...${NC}"
npm ci

# 5. Build Frontend Assets
echo -e "${YELLOW}[5/10] Building frontend assets...${NC}"
npm run build

# 6. Run Migrations
echo -e "${YELLOW}[6/10] Running database migrations...${NC}"
php artisan migrate --force

# 7. Clear & Cache Configuration
echo -e "${YELLOW}[7/10] Optimizing application...${NC}"
php artisan config:clear
php artisan route:clear
php artisan view:clear

php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Create storage link (safe to run multiple times with --force)
php artisan storage:link --force

# 8. Set Permissions
echo -e "${YELLOW}[8/10] Setting permissions...${NC}"
if id "$APP_OWNER" >/dev/null 2>&1; then
    chown -R "$APP_OWNER":www-data "$APP_DIR"
else
    chown -R www-data:www-data "$APP_DIR"
fi

find "$APP_DIR" -type d -exec chmod 755 {} \;
for dir in "${STORAGE_DIRS[@]}"; do
    find "$APP_DIR/$dir" -type d -exec chmod 775 {} \;
    find "$APP_DIR/$dir" -type f -exec chmod 664 {} \;
done

# 9. Restart Services
echo -e "${YELLOW}[9/10] Restarting services...${NC}"
supervisorctl restart botochain:*

if systemctl list-unit-files | grep -q '^php8.3-fpm\.service'; then
    systemctl reload php8.3-fpm
else
    systemctl reload php8.2-fpm
fi

systemctl reload nginx

# 10. Disable Maintenance Mode
echo -e "${YELLOW}[10/10] Disabling maintenance mode...${NC}"
php artisan up

# Success!
echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Deployment Complete! 🚀              ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}✓ Application updated${NC}"
echo -e "${GREEN}✓ Services restarted${NC}"
echo -e "${GREEN}✓ Caches cleared${NC}"
echo ""
echo "Check status: https://yourdomain.com"
echo "View logs: tail -f storage/logs/laravel.log"
