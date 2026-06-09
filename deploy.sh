#!/usr/bin/env bash
set -euo pipefail

cd /opt/budget

echo "==> [1/7] git pull"
git pull --ff-only origin master

echo "==> [2/7] Pre-build cleanup"
docker image prune -f

echo "==> [3/7] Build server"
docker compose --env-file .env build server

echo "==> [4/7] Restart server (--no-deps keeps frontend alive)"
docker compose --env-file .env up -d --no-deps server

echo "==> [5/7] Mid-build cleanup (free space before frontend)"
docker image prune -f

echo "==> [6/7] Build frontend"
docker compose --env-file .env build frontend

echo "==> [7/7] Restart frontend"
docker compose --env-file .env up -d --no-deps frontend

echo "==> Final cleanup"
docker image prune -f
docker builder prune -f --filter "until=24h"

echo "==> Deploy complete"
docker compose ps
