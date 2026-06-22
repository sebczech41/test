# Cemetery & Crematorium Manager

Real-time calendar system for booking and managing burials, cremations, and
appointments across multiple sites, plus tracking grave/plot reservations and
recurring family fees (monthly/yearly).

## Stack

- **backend/** — Laravel API (Sanctum auth, Cashier for Stripe billing)
- **frontend/** — React + Vite + TypeScript SPA (FullCalendar for scheduling)

## Backend setup

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

Seeded login: `admin@example.com` / `password`

To enable Stripe billing, set `STRIPE_KEY` / `STRIPE_SECRET` in `.env`.

Recurring fee generation runs via:

```bash
php artisan app:generate-reservation-payments
```

Scheduled daily in `routes/console.php` — run `php artisan schedule:work` (or
a cron entry calling `php artisan schedule:run` every minute) in production.

## Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The dev server proxies `/api` requests to `http://127.0.0.1:8000`.

## Domain model

- **Site** — a cemetery/crematorium location
- **Plot** — a grave, niche, or mausoleum slot at a site
- **Family** — the billable customer record (Stripe customer via Cashier)
- **Reservation** — links a family to a plot with a recurring fee
- **Booking** — a calendar event (burial, cremation, appointment) at a site
- **Payment** — a fee due/paid record tied to a reservation
