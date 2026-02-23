#!/bin/bash

#####################################################
# Botochain Rollback Script
# 
# Usage: ./rollback.sh [steps]
# Example: ./rollback.sh 1
#
# Rolls back the last N migrations
#####################################################

set -e

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'

STEPS=${1:-1}
APP_DIR="/var/www/botochain"

echo -e "${RED}╔════════════════════════════════════════╗${NC}"
echo -e "${RED}║   ⚠️  ROLLBACK WARNING                 ║${NC}"
echo -e "${RED}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}This will rollback $STEPS migration(s)${NC}"
echo -e "${YELLOW}Press Ctrl+C to cancel or Enter to continue...${NC}"
read

cd $APP_DIR

# Enable maintenance mode
echo -e "${YELLOW}[1/5] Enabling maintenance mode...${NC}"
php artisan down

# Rollback migrations
echo -e "${YELLOW}[2/5] Rolling back migrations...${NC}"
php artisan migrate:rollback --step=$STEPS --force

# Clear caches
echo -e "${YELLOW}[3/5] Clearing caches...${NC}"
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Restart services
echo -e "${YELLOW}[4/5] Restarting services...${NC}"
supervisorctl restart botochain-queue:*
supervisorctl restart botochain-reverb:*
supervisorctl restart botochain-scheduler:*

# Disable maintenance mode
echo -e "${YELLOW}[5/5] Disabling maintenance mode...${NC}"
php artisan up

echo ""
echo -e "${GREEN}Rollback complete!${NC}"
echo "Check status: tail -f storage/logs/laravel.log"
