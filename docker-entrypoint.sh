#!/bin/sh
set -e

echo "[entrypoint] Starting FMS Production..."

# Database Migration with retry mechanism
echo "[entrypoint] Running database migrations..."
MAX_RETRIES=30
RETRY_COUNT=0

until node node_modules/prisma/build/index.js migrate deploy; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
    echo "[entrypoint] ERROR: Database migration failed after $MAX_RETRIES attempts."
    exit 1
  fi
  echo "[entrypoint] Database is not ready yet ($RETRY_COUNT/$MAX_RETRIES). Waiting 2s..."
  sleep 2
done

echo "[entrypoint] Database migrations applied successfully."

# Optional Initial Admin Bootstrap
if [ -n "$BOOTSTRAP_ADMIN_EMAIL" ] && [ -n "$BOOTSTRAP_ADMIN_PASSWORD" ]; then
  echo "[entrypoint] Checking/Bootstrapping initial admin account ($BOOTSTRAP_ADMIN_EMAIL)..."
  node dist-bootstrap/bootstrap.js || echo "[entrypoint] Bootstrap completed or admin already exists."
fi

echo "[entrypoint] Starting Next.js server..."
exec "$@"
