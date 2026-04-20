#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
[ -f "$SCRIPT_DIR/.env" ] && set -a && source "$SCRIPT_DIR/.env" && set +a

VPS_HOST="${VPS_HOST:-}"
VPS_USER="${VPS_USER:-deploy}"
REMOTE_DB="${REMOTE_DB:-/opt/budget/apps/server/data/budget.db}"
BACKUP_DIR="${BACKUP_DIR:-$HOME/budget-backups}"

if [ -z "$VPS_HOST" ]; then
  echo "Ошибка: задай переменную VPS_HOST"
  echo "  export VPS_HOST=<IP-адрес VDS>"
  exit 1
fi

mkdir -p "$BACKUP_DIR"
BACKUP_FILE="$BACKUP_DIR/budget.db.$(date +%Y%m%d_%H%M%S)"

echo "==> Скачиваю базу с $VPS_USER@$VPS_HOST..."
scp "$VPS_USER@$VPS_HOST:$REMOTE_DB" "$BACKUP_FILE"

echo "==> Готово: $BACKUP_FILE"
ls -lh "$BACKUP_FILE"
