#!/usr/bin/env bash
set -euo pipefail

TARGET="${NGINX_BUDGET_SITE:-/etc/nginx/sites-available/budget}"
SOURCE="${NGINX_BUDGET_SITE_SOURCE:-infra/nginx/sites-available/budget}"

if ! command -v nginx >/dev/null 2>&1; then
  echo "nginx is not installed; skip nginx site config"
  exit 0
fi

if [ ! -f "$SOURCE" ]; then
  echo "nginx budget site source not found at $SOURCE"
  exit 0
fi

if [ ! -f "$TARGET" ]; then
  echo "nginx budget site config not found at $TARGET; installing new config"
fi

BACKUP="${TARGET}.bak.$(date +%Y%m%d%H%M%S)"

if [ -f "$TARGET" ]; then
  cp "$TARGET" "$BACKUP"
fi

cp "$SOURCE" "$TARGET"

if ! nginx -t; then
  if [ -f "$BACKUP" ]; then
    cp "$BACKUP" "$TARGET"
  fi
  nginx -t || true
  echo "nginx config test failed; restored $BACKUP"
  exit 1
fi

systemctl reload nginx
echo "nginx budget site config installed to $TARGET; backup: $BACKUP"
