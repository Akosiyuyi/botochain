# Botochain Instructions

Purpose
- Keep code clean, efficient, consistent, and deployable.
- Align Laravel 12 + Inertia (React) + Tailwind + Sail/Docker + Lucide + Chart.js patterns.
- Reduce back-and-forth and ensure dark-mode/responsiveness.

Tech Stack
- Backend: Laravel 12, Service layer, Eloquent models, Queues (redis/db), Migrations/Seeders.
- Frontend: Inertia + React, TailwindCSS, Lucide icons, react-chartjs-2.
- Tooling: Vite, ESLint + Prettier, PHP-CS-Fixer (optional), Docker/Sail, GitHub Actions.
- Observability: Telescope (local only), Logs via Monolog.
- DB: MySQL (Sail), Redis (optional queues/cache).

Architecture
- Controllers: thin, call Service classes only.
- Services: single-responsibility methods that return serializable arrays for Inertia.
- React components: small, composable, Tailwind for styling, dark-mode aware.
- Do not place business logic in controllers or views.

Data Contracts (AdminDashboardViewService::getDashboardData)
- stats: { totalElections, activeElections, totalVoters, totalVotes, turnoutRate, completedElections }
- electionStatusOverview: { draft, upcoming, ongoing, finalized, compromised }
- recentActivity: [{ type, title, time, icon }] // keep emoji icons
- systemStatus: {
  dataIntegrity: { status, message },
  activeElections: { status, message },
  systemPerformance: { status, message, details[] }, // multi-line
  alerts: { status, message }
}
- systemTraffic: {
  labels[], votesPerHour[], activeUsersPerHour[], peakTime, peakVotes, totalVotes24h, currentLoad
}

Frontend UI/UX Rules
- Dark Mode: use Tailwind dark: classes. Avoid Chart.js legends/gridlines; use custom HTML legends.
- Responsiveness: mobile-first; stack on small screens, side-by-side on lg+. Use min widths for charts.
- Charts:
  - react-chartjs-2 only.
  - Disable Chart.js legend; render a custom div legend.
  - Remove gridlines; style tooltips with theme-aware colors.
  - Donut charts: center metrics with absolute inset-0 and translate transforms.
- System Status container: color depends on overall status (warning/active/healthy/optimal).
- Recent Activity: emoji icons from backend; no Lucide here unless requested.

Coding Standards
- PHP: PSR-12; type-hint methods; early returns; avoid static facades in business logic (pass dependencies where sensible).
- JS/TS: ES modules; functional components; hooks; prop types or TS types where feasible.
- Naming: snake_case DB columns; camelCase JS props; PascalCase components; ServiceClass per domain.
- Imports: absolute aliases via Vite where configured (e.g., @/Components).
- Avoid magic numbers; centralize thresholds in Service constants when needed.

Performance Guidelines
- Aggregation: prefer grouped queries (COUNT, SUM, CASE) over multiple counts.
- exists() for boolean checks; select only needed columns.
- System Traffic: 2 grouped queries total (votes per hour, login_logs per hour via DISTINCT email).
- Indexes:
  - votes.created_at
  - login_logs.login_attempt_time, login_logs.email, login_logs.status
  - elections.status, elections.created_at, elections.updated_at
- Caching:
  - Use cache for expensive aggregates (TTL 60–300s) if needed.
  - Use route/config/view caches in production.

Security
- Validate requests (Form Requests).
- Authorize with Policies/Gates.
- Sanitize/escape output via React and Blade defaults.
- Protect secrets via .env; never commit secrets.
- Rate-limit sensitive endpoints (login).
- Use HTTPS in production; secure cookies; set APP_ENV=production.

Testing
- PHPUnit (or Pest): Services unit tests for aggregation logic (thresholds, status).
- Feature tests for dashboard props.
- Frontend: minimal component tests if using Vitest/Jest (optional).
- Seed fixtures for local dev; use factories.

Docker & Sail
- Local:
  - ./vendor/bin/sail up -d
  - ./vendor/bin/sail artisan migrate --seed
  - ./vendor/bin/sail npm ci && ./vendor/bin/sail npm run dev
- Queues:
  - ./vendor/bin/sail artisan queue:work or install Horizon
- Env:
  - DB_HOST=mysql, DB_DATABASE=botochain, DB_USERNAME=sail, DB_PASSWORD=password
  - QUEUE_CONNECTION=database or redis
  - CACHE_DRIVER=redis or database

Build & Deploy (Production)
- Build:
  - npm ci
  - npm run build (Vite)
  - php artisan config:cache
  - php artisan route:cache
  - php artisan view:cache
  - php artisan event:cache
- DB:
  - php artisan migrate --force
- Queues:
  - Supervisor or Horizon managing workers
- Web:
  - Nginx → php-fpm container (Docker) or host PHP.
- Opcache enabled; set APP_DEBUG=false; LOG_LEVEL=info.
- Health checks: GET / (landing) + queue worker status.
- Backups: nightly DB dump + storage files if needed.

Git Workflow
- Branches: feature (feat/AdminUi), fix, perf, chore.
- Commits: conventional (feat(ui): add SystemTrafficChart; perf(service): aggregate queries).
- PR checklist:
  - Screenshots: light/dark, mobile/desktop.
  - Query count review (local telescope or query log).
  - Matches data contracts and UI rules.

File/Folder Conventions
- app/Services: business logic; return arrays for Inertia.
- resources/js/Pages: Inertia pages.
- resources/js/Components: small reusable components.
- database/migrations: atomic changes with indexes.
- database/seeders: minimal realistic data.

Error Handling & Logging
- Catch and log unexpected exceptions in Services if external I/O involved.
- Use context in logs (ids, counts).
- No logs of sensitive data (emails/passwords) beyond necessity.

Accessibility
- Semantic HTML tags; ARIA where needed.
- Sufficient contrast in dark/light themes.
- Keyboard navigable; focus styles present.

AI Assistance (GitHub Copilot)
- When requesting changes:
  - Use four-backtick code blocks with filepath comments.
  - Include “…existing code…” markers for partial edits.
  - Specify constraints (e.g., no Chart.js legend, use LoginLogs for “Active Users”).
  - Ask for Linux commands for terminal steps when relevant.

Release Checklist
- ENV set (APP_KEY, DB, QUEUE, CACHE).
- Migrations run; seeds optional.
- Assets built; caches warmed.
- Queue workers running.
- Error monitoring/log rotation configured.
- Backups verified.

Notes
- Keep SystemTrafficChart collapsible by default.
- Prefer emoji in RecentActivity for quick scanning.
- Stick to custom legends for charts to avoid theme mismatch.