#!/usr/bin/env bash
set -e

echo "==> Checking prerequisites..."
command -v php >/dev/null 2>&1 || { echo "PHP not found. Install with: brew install php"; exit 1; }
command -v composer >/dev/null 2>&1 || { echo "Composer not found. Install with: brew install composer"; exit 1; }
command -v node >/dev/null 2>&1 || { echo "Node not found. Install with: brew install node"; exit 1; }

echo "==> Setting up backend..."
cd backend
composer install --no-interaction --prefer-dist
[ ! -f .env ] && cp .env.example .env && php artisan key:generate
php artisan migrate --seed --force
cd ..

echo "==> Setting up frontend..."
cd frontend
npm install
cd ..

echo ""
echo "✅ Setup complete! Starting servers..."
echo "   Backend:  http://127.0.0.1:8000"
echo "   Frontend: http://localhost:5173"
echo "   Login:    admin@example.com / password"
echo ""
echo "Press Ctrl+C to stop both servers."
echo ""

trap 'kill 0' INT
php backend/artisan serve &
(cd frontend && npm run dev) &
wait
