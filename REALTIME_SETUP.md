# Realtime Election Results Setup

## Overview
This application now supports **realtime election results** using Laravel Reverb (free, self-hosted WebSocket server). Both admin and voters see live vote tallies during ongoing elections.

## Features Implemented

### ✅ Live Results
- Real-time vote count updates as votes are cast
- Automatic percentage calculations
- Throttled broadcasts (every 5 seconds) to handle high traffic
- Live turnout rate updates

### ✅ Optimizations
- Broadcasts only affected positions (not full election data)
- Client-side state management with React hooks
- Graceful fallback if WebSocket connection fails
- No polling required

## Local Development

### 1. Start Services
```bash
# Terminal 1: Start Reverb WebSocket server
sail artisan reverb:start

# Terminal 2: Start queue worker (for vote processing)
sail artisan queue:work --queue=vote_sealing

# Terminal 3: Start dev server
sail npm run dev

# Terminal 4: Start Laravel
sail artisan serve
```

Or use the composer script:
```bash
sail composer dev
```

### 2. Test Realtime Updates
1. Open two browser windows side-by-side
2. Log in as admin in one, voter in another
3. Navigate to an **Ongoing** election
4. Expand the "Results" section in both windows
5. Cast a vote as the voter
6. Watch the results update live in both windows within 5 seconds

## Production Deployment (Digital Ocean)

### 1. Server Requirements
- Ubuntu 20.04+ droplet
- PHP 8.2+, MySQL, Redis
- Supervisor (for queue workers and Reverb)
- Nginx with WebSocket proxy

### 2. Install & Configure

```bash
# On your droplet
cd /var/www/botochain

# Install dependencies
composer install --optimize-autoloader --no-dev
npm ci
npm run build

# Set environment
cp .env.example .env
php artisan key:generate

# Configure Reverb
php artisan reverb:install
```

### 3. Update `.env` for Production
```env
BROADCAST_CONNECTION=reverb
QUEUE_CONNECTION=database

# For production with HTTPS
REVERB_HOST=your-domain.com
REVERB_PORT=6001
REVERB_SCHEME=https

# Vite variables
VITE_REVERB_APP_KEY="${REVERB_APP_KEY}"
VITE_REVERB_HOST="${REVERB_HOST}"
VITE_REVERB_PORT="${REVERB_PORT}"
VITE_REVERB_SCHEME="${REVERB_SCHEME}"

# Throttle broadcasts to prevent overload
REALTIME_RESULTS_INTERVAL_SECONDS=5
```

### 4. Supervisor Configuration

Create `/etc/supervisor/conf.d/botochain.conf`:
```ini
[program:botochain-queue]
command=php /var/www/botochain/artisan queue:work --queue=vote_sealing,default --tries=3
autostart=true
autorestart=true
user=www-data
redirect_stderr=true
stdout_logfile=/var/www/botochain/storage/logs/queue.log

[program:botochain-reverb]
command=php /var/www/botochain/artisan reverb:start
autostart=true
autorestart=true
user=www-data
redirect_stderr=true
stdout_logfile=/var/www/botochain/storage/logs/reverb.log
```

Then:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start all
```

### 5. Nginx WebSocket Proxy

Add to your Nginx config:
```nginx
# WebSocket proxy for Reverb
location /app/ {
    proxy_pass http://127.0.0.1:6001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "Upgrade";
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_read_timeout 60s;
    proxy_connect_timeout 60s;
}
```

Reload Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Performance Tuning

### Expected Load
With 1000-2000 votes in 10 minutes:
- Peak rate: ~3-4 votes/second
- With 5-second throttle: ~1 broadcast every 5 seconds per election
- Total broadcasts: ~120 in 10 minutes (very manageable)

### If You Need More Capacity
Adjust throttle in `.env`:
```env
# Broadcast every 10 seconds instead of 5
REALTIME_RESULTS_INTERVAL_SECONDS=10
```

Or scale Reverb horizontally with Redis adapter (see [Reverb docs](https://reverb.laravel.com)).

## Monitoring

### Check Services
```bash
# Queue worker status
sail artisan queue:monitor

# Reverb connections
sail artisan reverb:ping

# Supervisor
sudo supervisorctl status
```

### Logs
```bash
# Queue worker logs
tail -f storage/logs/queue.log

# Reverb logs
tail -f storage/logs/reverb.log

# Laravel logs
tail -f storage/logs/laravel.log
```

## Troubleshooting

### Realtime not working?
1. Check Reverb is running: `sail artisan reverb:ping`
2. Verify queue worker is running: `sail artisan queue:monitor`
3. Check browser console for WebSocket errors
4. Ensure `.env` has correct VITE_REVERB_* variables
5. Rebuild frontend: `sail npm run build`

### High server load?
- Increase `REALTIME_RESULTS_INTERVAL_SECONDS`
- Check queue backlog: `sail artisan queue:monitor`
- Scale queue workers in supervisor config

### Connection timeouts?
- Increase Nginx `proxy_read_timeout`
- Check firewall allows port 6001
- Verify SSL/TLS if using `wss://`

## Architecture

```
Vote Cast
  ↓
VoteService creates vote
  ↓
SealVoteHash job queued
  ↓
Job processes hash & tallies vote
  ↓
Check throttle (5s interval)
  ↓
Broadcast ElectionResultsUpdated event
  ↓
Reverb pushes to subscribed clients
  ↓
React component updates state
  ↓
UI reflects new vote counts
```

## Security

- WebSocket channel requires authentication
- Only eligible voters/admins can subscribe to elections
- Broadcasts are throttled to prevent spam
- All vote integrity checks remain server-side

## Cost
- **FREE** - No third-party services required
- Runs on same droplet as your Laravel app
- Minimal resource overhead (~50-100MB RAM for Reverb)

## Support
For issues or questions about the realtime implementation, check:
- [Laravel Reverb Docs](https://reverb.laravel.com)
- [Laravel Broadcasting Docs](https://laravel.com/docs/broadcasting)
