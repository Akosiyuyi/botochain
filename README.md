# Botochain

Botochain is a blockchain-verifiable election platform built with Laravel 12, Inertia.js, React, and Tailwind CSS.

It provides:
- Role-based portals for **super-admin/admin** and **voter** users
- Election lifecycle management (draft, upcoming, ongoing, ended/finalized, compromised)
- Eligibility-based voting and vote history
- Hash-chain vote integrity verification
- Realtime election result updates via Laravel Reverb
- Export support for election reports (Excel and PDF)

## Core Features

- **Admin dashboard analytics** with election status overview, recent activity, system status, and 24-hour traffic trends
- **Election setup workflow** for school levels, positions, candidates, and partylists
- **Eligibility-aware voting** (voters only see elections/positions they can vote in)
- **Auditability** with vote verification endpoints and login logs
- **Realtime broadcasting** on election channels with role + eligibility checks
- **Queue-backed jobs** for election status updates, vote sealing, and finalization dispatch

## Tech Stack

- **Backend:** Laravel 12, PHP 8.2+, MySQL, Laravel Reverb
- **Frontend:** Inertia.js + React 18, Tailwind CSS, Lucide, Chart.js (`react-chartjs-2`)
- **Auth/RBAC:** Laravel auth + Spatie permissions
- **Exports:** `maatwebsite/excel`, `barryvdh/laravel-dompdf`
- **Local Dev:** Laravel Sail / Docker

## Quick Start (Sail/Docker)

### 1) Install dependencies

```bash
composer install
npm ci
```

### 2) Configure environment

```bash
cp .env.example .env
```

Set at least these values in `.env` before seeding:

```env
APP_NAME=BotoChain
DB_HOST=mysql
DB_DATABASE=botochain
DB_USERNAME=sail
DB_PASSWORD=password

ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=change-me-immediately
```

### 3) Start containers and bootstrap app

```bash
./vendor/bin/sail up -d
./vendor/bin/sail artisan key:generate
./vendor/bin/sail artisan migrate --seed
./vendor/bin/sail artisan storage:link
```

### 4) Run development services

Use one terminal per process:

```bash
./vendor/bin/sail npm run dev
./vendor/bin/sail artisan queue:work
./vendor/bin/sail artisan reverb:start
./vendor/bin/sail artisan schedule:work
```

Or run the default Laravel dev stack (no Reverb/scheduler included):

```bash
composer dev
```

## Seeded Access

`DatabaseSeeder` creates one initial super-admin account:
- Email: `ADMIN_EMAIL` from `.env`
- Password: `ADMIN_PASSWORD` from `.env`

Change these values before first production seed.

## Useful Commands

```bash
# Run tests
php artisan test
# or
composer test

# Queue worker
php artisan queue:work

# Realtime websocket server
php artisan reverb:start

# Build assets for production
npm run build
```

## Realtime Setup

Realtime election result updates are implemented with Laravel Reverb and private channels.

- Channel auth is defined in `routes/channels.php`
- Reverb config is in `config/reverb.php`
- Setup guide: `REALTIME_SETUP.md`

## Routing Overview

- `/admin/*` → admin/super-admin routes (dashboard, elections, users, students, exports, setup)
- `/voter/*` → voter routes (dashboard, elections, voting, vote history)
- Shared authenticated routes for profile and vote/election verification

## Testing

Tests are organized under:
- `tests/Feature`
- `tests/Unit`

For coverage and suite analysis, see:
- `docs/TEST_COVERAGE_ANALYSIS.md`

## Deployment & Operations

- Full deployment walkthrough: `docs/DEPLOYMENT.md`
- Production deployment script: `deploy.sh`
- Health check script: `scripts/health-check.sh`
- Rollback helper: `scripts/rollback.sh`

Production env baseline is provided in:
- `.env.production.example`

## Project Documentation

- `docs/DEPLOYMENT.md` – step-by-step server deployment
- `docs/TEST_COVERAGE_ANALYSIS.md` – testing scope and quality
- `docs/database/README.md` – ERD usage and schema overview

## License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
