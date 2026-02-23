#!/bin/bash

#####################################################
# Botochain Server Setup Script
# 
# Usage: Run this once on a fresh Ubuntu 22.04 server
# bash <(curl -s https://raw.githubusercontent.com/Akosiyuyi/botochain/main/scripts/server-setup.sh)
#####################################################

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Botochain Server Setup              ║${NC}"
echo -e "${GREEN}║   Ubuntu 22.04 LTS                     ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""

# Check if root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${YELLOW}Please run as root or with sudo${NC}"
    exit 1
fi

# Update system
echo -e "${YELLOW}[1/9] Updating system packages...${NC}"
apt update && apt upgrade -y

# Install base packages
echo -e "${YELLOW}[2/9] Installing base packages...${NC}"
apt install -y software-properties-common curl git unzip

# Install PHP
echo -e "${YELLOW}[3/9] Installing PHP 8.2...${NC}"
add-apt-repository -y ppa:ondrej/php
apt update
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

# Install Nginx
echo -e "${YELLOW}[4/9] Installing Nginx...${NC}"
apt install -y nginx

# Install MySQL
echo -e "${YELLOW}[5/9] Installing MySQL...${NC}"
apt install -y mysql-server

# Install Redis
echo -e "${YELLOW}[6/9] Installing Redis...${NC}"
apt install -y redis-server

# Install Node.js
echo -e "${YELLOW}[7/9] Installing Node.js...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install Composer
echo -e "${YELLOW}[8/9] Installing Composer...${NC}"
curl -sS https://getcomposer.org/installer | php
mv composer.phar /usr/local/bin/composer
chmod +x /usr/local/bin/composer

# Install Supervisor
echo -e "${YELLOW}[9/9] Installing Supervisor...${NC}"
apt install -y supervisor

# Enable services
systemctl enable nginx php8.2-fpm mysql redis-server supervisor
systemctl start nginx php8.2-fpm mysql redis-server supervisor

echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Server Setup Complete! ✓             ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Next steps:${NC}"
echo "1. Configure MySQL database"
echo "2. Clone your repository"
echo "3. Run initial deployment script"
echo ""
echo "PHP version: $(php -v | head -n1)"
echo "Node version: $(node -v)"
echo "Composer version: $(composer --version --no-ansi)"
