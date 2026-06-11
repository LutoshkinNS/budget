#!/usr/bin/env bash
set -euo pipefail

cd /opt/budget

export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

echo "==> [1/9] Pre-build cleanup"
docker container prune -f
docker image prune -af
docker builder prune -af

echo "==> [2/9] git pull"
git pull --ff-only origin master

echo "==> [3/9] Build server"
docker compose --env-file .env build server

echo "==> [4/9] Restart server (--no-deps keeps frontend alive)"
docker compose --env-file .env up -d --no-deps --force-recreate server

echo "==> [5/9] Mid-build cleanup (free disk before frontend)"
docker container prune -f
docker image prune -af
docker builder prune -af

echo "==> [6/9] Build frontend"
docker compose --env-file .env build frontend

echo "==> [7/9] Restart frontend"
docker compose --env-file .env up -d --no-deps --force-recreate frontend

echo "==> [8/9] Final cleanup"
docker container prune -f
docker image prune -af
docker builder prune -af

echo "==> [9/9] Deploy complete"
docker compose ps
