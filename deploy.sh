#!/usr/bin/env bash
set -euo pipefail

cd /opt/budget

if [ -f .env ]; then
  set -a
  . ./.env
  set +a
fi

echo "==> [1/8] Disk before cleanup"
df -h
timeout 30s docker system df -v || true

echo "==> [2/8] Pre-deploy cleanup"
docker container prune -f
docker image prune -af
docker builder prune -af

echo "==> [3/8] git pull"
git pull --ff-only origin master

echo "==> Apply nginx site config"
sudo bash infra/nginx/apply-same-origin-api.sh

if [ -n "${GHCR_USERNAME:-}" ] && [ -n "${GHCR_TOKEN:-}" ]; then
  echo "==> [4/8] Login to GHCR"
  echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USERNAME" --password-stdin
else
  echo "==> [4/8] Skip GHCR login (GHCR_USERNAME/GHCR_TOKEN not set)"
fi

echo "==> [5/8] Pull images"
docker compose --env-file .env pull

echo "==> [6/8] Restart services"
docker compose --env-file .env up -d --no-build --force-recreate

echo "==> [7/8] Final cleanup"
docker container prune -f
docker image prune -af
docker builder prune -af

echo "==> [8/8] Deploy complete"
df -h
timeout 30s docker system df -v || true
docker compose ps
