#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# Automated Database Backup Script (Anti-Ransomware / Disaster Recovery)
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/var/backups/fms-database}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/fms_backup_${TIMESTAMP}.sql.gz"
RETENTION_DAYS=14

mkdir -p "${BACKUP_DIR}"

echo "[$(date)] 🗄️ Starting database backup..."

# If running with docker-compose:
if docker ps --format '{{.Names}}' | grep -q "fms_postgres_prod"; then
  docker exec -t fms_postgres_prod pg_dump -U "${POSTGRES_USER:-fms_admin}" "${POSTGRES_DB:-fms_prod}" | gzip > "${BACKUP_FILE}"
else
  # Direct pg_dump from DATABASE_URL
  pg_dump "${DATABASE_URL}" | gzip > "${BACKUP_FILE}"
fi

chmod 600 "${BACKUP_FILE}"
echo "[$(date)] ✅ Backup created successfully: ${BACKUP_FILE} ($(du -h "${BACKUP_FILE}" | cut -f1))"

# Rotate / delete backups older than RETENTION_DAYS
echo "[$(date)] 🧹 Cleaning up backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -name "fms_backup_*.sql.gz" -type f -mtime +"${RETENTION_DAYS}" -delete

echo "[$(date)] 🎉 Backup routine completed."
