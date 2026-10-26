#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="${BACKUP_DIR}/resolveit_backup_${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

echo "Creating database backup to ${FILENAME}..."
docker compose exec -T postgres pg_dump -U "${POSTGRES_USER:-resolveit_app}" "${POSTGRES_DB:-resolveit_db}" | gzip > "${FILENAME}"
echo "Backup successfully created: ${FILENAME} ($(du -h "${FILENAME}" | cut -f1))"
