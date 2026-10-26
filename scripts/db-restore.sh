#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="backups"

if [ ! -d "${BACKUP_DIR}" ] || [ -z "$(ls -A "${BACKUP_DIR}" 2>/dev/null)" ]; then
    echo "Error: No backup files found in ${BACKUP_DIR}/"
    exit 1
fi

LATEST_BACKUP=$(ls -t "${BACKUP_DIR}"/resolveit_backup_*.sql.gz | head -n 1)

echo "Restoring database from latest backup: ${LATEST_BACKUP}..."
gunzip -c "${LATEST_BACKUP}" | docker compose exec -T postgres psql -U "${POSTGRES_USER:-resolveit_app}" -d "${POSTGRES_DB:-resolveit_db}"
echo "Database successfully restored from ${LATEST_BACKUP}."
