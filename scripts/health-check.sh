#!/bin/bash

#####################################################
# Botochain Health Check Script
# 
# Checks if all services are running properly
#####################################################

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "╔════════════════════════════════════════╗"
echo "║   Botochain Health Check               ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Function to check service
check_service() {
    local service=$1
    if systemctl is-active --quiet $service; then
        echo -e "${GREEN}✓${NC} $service is running"
        return 0
    else
        echo -e "${RED}✗${NC} $service is not running"
        return 1
    fi
}

# Function to check supervisor program
check_supervisor() {
    local pattern=$1
    local matches
    matches=$(supervisorctl status 2>/dev/null | awk -v pat="$pattern" '$1 ~ pat {print $2}')

    if [ -z "$matches" ]; then
        echo -e "${RED}✗${NC} $pattern is not configured in Supervisor"
        return 1
    fi

    local not_running
    not_running=$(echo "$matches" | grep -v '^RUNNING$' || true)

    if [ -z "$not_running" ]; then
        echo -e "${GREEN}✓${NC} $pattern is running"
        return 0
    else
        echo -e "${RED}✗${NC} $pattern has non-running processes"
        supervisorctl status 2>/dev/null | awk -v pat="$pattern" '$1 ~ pat {print "   - " $0}'
        return 1
    fi
}

# Function to detect running PHP-FPM service
detect_php_fpm_service() {
    local service
    service=$(systemctl list-unit-files --type=service --no-legend 2>/dev/null | awk '/^php[0-9]+\.[0-9]+-fpm\.service/ {print $1}' | sed 's/\.service$//' | sort -V | tail -n1)

    if [ -n "$service" ]; then
        echo "$service"
    else
        echo "php8.2-fpm"
    fi
}

# Check system services
echo "System Services:"
check_service nginx
check_service "$(detect_php_fpm_service)"
check_service mysql
check_service redis-server
check_service supervisor
echo ""

# Check supervisor programs
echo "Application Services:"
check_supervisor "^botochain:botochain-queue_"
check_supervisor "^botochain:botochain-reverb"
check_supervisor "^botochain:botochain-scheduler"
echo ""

# Check database connection
echo "Database Connection:"
if php -r "require '/var/www/botochain/vendor/autoload.php'; \$app = require '/var/www/botochain/bootstrap/app.php'; \$kernel = \$app->make(Illuminate\\Contracts\\Console\\Kernel::class); \$kernel->bootstrap(); DB::connection()->getPdo();" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Can connect to database"
else
    echo -e "${RED}✗${NC} Cannot connect to database"
fi
echo ""

# Check Redis connection
echo "Redis Connection:"
if redis-cli ping | grep -q PONG; then
    echo -e "${GREEN}✓${NC} Can connect to Redis"
else
    echo -e "${RED}✗${NC} Cannot connect to Redis"
fi
echo ""

# Check disk space
echo "Disk Space:"
df -h / | tail -1 | awk '{if (int($5) < 80) print "✓ Disk usage: " $5 " (OK)"; else print "⚠ Disk usage: " $5 " (WARNING)"}'
echo ""

# Check memory
echo "Memory Usage:"
free -m | awk 'NR==2{printf "Used: %s MB / %s MB (%.2f%%)\n", $3, $2, $3*100/$2 }'
echo ""

# Check application
echo "Application:"
if [ -f /var/www/botochain/.env ]; then
    echo -e "${GREEN}✓${NC} .env file exists"
else
    echo -e "${RED}✗${NC} .env file missing"
fi

if [ -f /var/www/botochain/bootstrap/cache/config.php ]; then
    echo -e "${GREEN}✓${NC} Configuration cached"
else
    echo -e "${YELLOW}⚠${NC} Configuration not cached"
fi

echo ""
echo "For detailed logs:"
echo "  Laravel: tail -f /var/www/botochain/storage/logs/laravel.log"
echo "  Queue: tail -f /var/www/botochain/storage/logs/queue.log"
echo "  Reverb: tail -f /var/www/botochain/storage/logs/reverb.log"
echo "  Scheduler: tail -f /var/www/botochain/storage/logs/scheduler.log"
