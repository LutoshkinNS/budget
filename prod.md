# Production Runbook

Последнее обновление: 16 июля 2026 года.

Документ описывает текущее production-состояние `budget-best.ru`, рабочий deploy-flow и безопасные процедуры проверки/отката. Старый первичный VPS guide с placeholder-IP, прямыми портами и переходом "домен позже" удалён как устаревший: production уже работает через Cloudflare, host nginx и same-origin API.

## Коротко

- Основной сайт: `https://budget-best.ru`.
- Основной API для frontend: same-origin `https://budget-best.ru/api/*`.
- `https://api.budget-best.ru` оставлен как legacy hostname для старых клиентов и прямых проверок.
- `https://www.budget-best.ru` не является поддерживаемым endpoint: DNS указывает на origin, но HTTPS-сертификат не покрывает `www`.
- Production checkout: `/opt/budget`.
- Deploy: push в `master` запускает GitHub Actions, который собирает images в GHCR и выполняет `/opt/budget/deploy.sh` на VPS.
- Данные SQLite хранятся на VPS в `/opt/budget/apps/server/data/`.

## Источники правды

Репозиторий:

- `docker-compose.yml` - production compose: container names, ports, volumes, images.
- `deploy.sh` - production deploy script.
- `.github/workflows/deploy.yml` - pipeline сборки, публикации images и деплоя.
- `infra/nginx/sites-available/budget` - nginx-конфиг для same-origin API и legacy API hostname.
- `infra/nginx/apply-same-origin-api.sh` - безопасная установка nginx-конфига при `APPLY_NGINX_CONFIG=1`.
- `apps/frontend/vite.config.ts` и `apps/frontend/src/common/api/fetcher.ts` - поведение frontend API base URL.

Production-only состояние на VPS:

- `/opt/budget/.env` - secrets and deploy variables. Никогда не коммитить.
- `/etc/nginx/sites-available/budget` - активный nginx-конфиг.
- `/etc/nginx/conf.d/cloudflare-realip.conf` - Cloudflare real-IP config.
- `/etc/letsencrypt/live/budget-best.ru/` - Let's Encrypt origin certificate.
- `/opt/budget/apps/server/data/` - persistent SQLite data directory.

## Проверено 16.07.2026

Публичные DNS/HTTP проверки снаружи VPS:

```text
budget-best.ru NS: piper.ns.cloudflare.com, colin.ns.cloudflare.com
budget-best.ru A:  172.67.200.148, 104.21.44.136
api.budget-best.ru A: 188.114.97.1, 188.114.96.1
www.budget-best.ru A: 85.235.205.154
```

`https://budget-best.ru/`:

```text
HTTP 200
Server: cloudflare
CF-RAY: present
CF-Cache-Status: DYNAMIC
```

`https://budget-best.ru/api/v1/auth/me` без cookie:

```text
HTTP 401
{"code":"MISSING_TOKEN","message":"FastifyError","statusCode":401}
Server: cloudflare
CF-Cache-Status: DYNAMIC
Access-Control-Allow-Origin: https://budget-best.ru
```

`https://www.budget-best.ru/` не проходит обычную TLS-проверку, потому что certificate principal не совпадает с `www.budget-best.ru`. Не использовать и не рекламировать `www`, пока nginx/Certbot/DNS не обновлены осознанно.

## Топология

```text
User
  -> Cloudflare edge for proxied hostnames
  -> host nginx :443
      /api/*  -> http://localhost:3000 -> budget_server
      /*      -> http://localhost:3001 -> budget_frontend:8080
```

Containers:

```text
budget_server    host port 3000 -> container port 3000
budget_frontend  host port 3001 -> container port 8080
```

Compose mounts SQLite data:

```text
./apps/server/data:/app/data
DATABASE_URL=file:/app/data/budget.db
```

## Endpoints

| Endpoint                                 | Status              | Notes                                                                                |
| ---------------------------------------- | ------------------- | ------------------------------------------------------------------------------------ |
| `https://budget-best.ru`                 | primary             | Frontend and same-origin API.                                                        |
| `https://budget-best.ru/api/*`           | primary API         | Frontend calls this path in production.                                              |
| `https://api.budget-best.ru/api/*`       | legacy              | Proxied through Cloudflare and nginx to backend. Keep only for compatibility/checks. |
| `https://www.budget-best.ru`             | not supported       | DNS-only origin; TLS verification fails for `www`.                                   |
| `https://85.235.205.154` / direct origin | rollback/debug only | Do not document as a user endpoint.                                                  |

## Cloudflare и DNS

Cloudflare Free используется для DNS/proxy перед VPS. Sprinthost остаётся регистратором; nameserver delegation указывает на Cloudflare:

```text
colin.ns.cloudflare.com
piper.ns.cloudflare.com
```

Текущие ожидаемые DNS records:

```text
budget-best.ru      A  85.235.205.154  Proxied
api.budget-best.ru  A  85.235.205.154  Proxied
www.budget-best.ru  A  85.235.205.154  DNS only, unsupported
```

Так как proxied records публично возвращают Cloudflare IP, proxying нужно проверять по headers, а не ожидать `85.235.205.154` из public DNS:

```bash
dig NS budget-best.ru @1.1.1.1 +short
dig A budget-best.ru @1.1.1.1 +short
dig A api.budget-best.ru @1.1.1.1 +short
curl -sS -D - -o /dev/null https://budget-best.ru/
```

Ожидаемые признаки proxied response:

```text
Server: cloudflare
CF-RAY: ...
```

## TLS и Cache

Cloudflare mode должен оставаться `Full (strict)`. Не переключать на `Flexible`: auth cookies, redirects и origin TLS assumptions завязаны на реальный HTTPS до origin.

Origin certificate управляется Certbot для:

```text
budget-best.ru
api.budget-best.ru
```

Полезные проверки на VPS:

```bash
certbot certificates
certbot renew --dry-run
nginx -t
systemctl is-active nginx
```

Cloudflare cache должен bypass API и PWA shell files:

```text
/api/*
/sw.js
/index.html
/manifest.webmanifest
/registerSW.js
/workbox-*
```

Причина:

- API and auth requests must always reach origin.
- Service worker and app shell must not be served as stale edge copies.
- Hashed assets under `/assets/*` may be cached.

Smoke test:

```bash
curl -sS -D - https://budget-best.ru/api/v1/auth/me
```

Ожидаемый anonymous result:

```text
HTTP 401
CF-Cache-Status: DYNAMIC
{"code":"MISSING_TOKEN","message":"FastifyError","statusCode":401}
```

## Nginx

Канонический nginx-конфиг лежит в `infra/nginx/sites-available/budget`.

Он описывает:

- `budget-best.ru` with `/api/` proxied to `localhost:3000` and frontend to `localhost:3001`.
- `api.budget-best.ru` proxied to `localhost:3000` for legacy compatibility.
- HTTP to HTTPS redirects managed by Certbot.

Применять nginx-конфиг из repo во время deploy только при явном включении:

```bash
APPLY_NGINX_CONFIG=1 bash ./deploy.sh
```

Deploy script вызывает:

```bash
sudo -n /usr/bin/bash /opt/budget/infra/nginx/apply-same-origin-api.sh
```

Installer делает backup текущего target, копирует repo config, запускает `nginx -t`, восстанавливает backup при ошибке и reload nginx только после валидного конфига.

Полезные nginx checks:

```bash
nginx -t
nginx -T 2>&1 | less
systemctl is-active nginx
tail -n 100 /var/log/nginx/error.log
grep -E '/api/v1/auth/(client-event|login|me|refresh|logout)' \
  /var/log/nginx/access.log | tail -n 100
```

## Real Client IP

Host nginx настроен через `http_realip_module` и `/etc/nginx/conf.d/cloudflare-realip.conf`:

```nginx
real_ip_header CF-Connecting-IP;
real_ip_recursive on;
set_real_ip_from <official Cloudflare IPv4/IPv6 ranges>;
```

Безопасная процедура обновления:

```bash
curl -fsSL https://www.cloudflare.com/ips-v4 -o /root/cloudflare-ips-v4.txt
curl -fsSL https://www.cloudflare.com/ips-v6 -o /root/cloudflare-ips-v6.txt

{
  echo 'real_ip_header CF-Connecting-IP;'
  echo 'real_ip_recursive on;'
  awk 'NF {printf "set_real_ip_from %s;\n", $0}' \
    /root/cloudflare-ips-v4.txt \
    /root/cloudflare-ips-v6.txt
} > /root/cloudflare-realip.conf.new

install -m 0644 /root/cloudflare-realip.conf.new \
  /etc/nginx/conf.d/cloudflare-realip.conf
nginx -t && systemctl reload nginx
systemctl is-active nginx
```

Не собирать этот файл наивной `sed`-конкатенацией: Cloudflare IP lists могут не иметь завершающего newline, и malformed output может склеить две директивы.

## Deploy

Normal path:

```text
push to master
  -> .github/workflows/deploy.yml
  -> build server image
  -> build frontend image
  -> push both images to GHCR
  -> SSH to VPS
  -> cd /opt/budget && git pull --ff-only origin master && bash ./deploy.sh
```

Images:

```text
ghcr.io/lutoshkinns/budget-server:latest
ghcr.io/lutoshkinns/budget-server:<commit-sha>
ghcr.io/lutoshkinns/budget-frontend:latest
ghcr.io/lutoshkinns/budget-frontend:<commit-sha>
```

`deploy.sh` currently:

1. Loads `/opt/budget/.env` if present.
2. Prints disk/docker usage.
3. Prunes containers/images/build cache before deploy.
4. Runs `git pull --ff-only origin master`.
5. Optionally applies nginx config when `APPLY_NGINX_CONFIG=1`.
6. Logs in to GHCR when `GHCR_USERNAME` and `GHCR_TOKEN` are set.
7. Pulls images.
8. Recreates containers with `--no-build --force-recreate`.
9. Prunes Docker again and prints final status.

Manual deploy from VPS:

```bash
cd /opt/budget
bash ./deploy.sh
```

Post-deploy checks:

```bash
cd /opt/budget
docker compose --env-file .env ps
docker logs --since 30m --timestamps budget_server 2>&1 | tail -n 200
docker logs --since 30m --timestamps budget_frontend 2>&1 | tail -n 200
curl -sS -D - -o /dev/null https://budget-best.ru/
curl -sS -D - https://budget-best.ru/api/v1/auth/me
```

## Frontend API URL

Production использует same-origin API. В `.github/workflows/deploy.yml` frontend image build намеренно передаёт:

```text
VITE_API_URL=
```

Это делает `__API_BASE_URL__` пустой строкой на build time, поэтому generated API calls вроде `/api/v1/auth/me` идут на `https://budget-best.ru/api/v1/auth/me`.

Не задавать production frontend `VITE_API_URL=https://api.budget-best.ru`, если это не осознанный возврат к cross-origin API behavior. При cross-origin API нужно заново проверить CORS, cookies и Cloudflare cache rules.

Для local dev Vite proxy может использовать `VITE_API_URL` из local env, чтобы proxy `/api` на backend.

## Environment Variables

Production `.env` существует только на VPS и не должен попадать в git.

Server/runtime variables:

```text
NODE_ENV=production
DATABASE_URL=file:/app/data/budget.db
JWT_SECRET=<secret>
FRONTEND_URL=https://budget-best.ru
TELEGRAM_BOT_TOKEN=<secret>
```

Frontend/build variables:

```text
VITE_API_URL=            # empty for same-origin production
VITE_TELEGRAM_BOT_NAME=<bot-name>
VITE_APP_VERSION=<commit-sha from GitHub Actions>
```

Deploy variables:

```text
GHCR_USERNAME=<optional>
GHCR_TOKEN=<optional read:packages token>
APPLY_NGINX_CONFIG=0|1
NGINX_BUDGET_SITE=/etc/nginx/sites-available/budget
NGINX_BUDGET_SITE_SOURCE=infra/nginx/sites-available/budget
```

Никогда не записывать в этот файл реальные Telegram token, JWT secret, GHCR token или содержимое production `.env`.

## Bootstrap нового VPS

Этот раздел нужен только для развёртывания нового сервера или восстановления infrastructure с нуля. Это не ежедневная production-процедура; текущий production deploy описан в разделе `Deploy`.

### 1. SSH-ключ на Windows

Проверить существующие ключи:

```bash
ls ~/.ssh/
```

Создать новый ключ, если подходящего нет:

```bash
mkdir -p ~/.ssh
ssh-keygen -t ed25519 -C "<email>" -f ~/.ssh/budget_vps
```

Скопировать публичный ключ на VPS:

```bash
ssh-copy-id -i ~/.ssh/budget_vps.pub root@<vps-ip>
```

Если `ssh-copy-id` недоступен, вручную добавить содержимое `~/.ssh/budget_vps.pub` в `/root/.ssh/authorized_keys` на сервере и выставить права:

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

Локальный SSH alias:

```sshconfig
Host budget
    HostName <vps-ip>
    User deploy
    IdentityFile ~/.ssh/budget_vps
```

### 2. Базовая подготовка VPS

Выполнять первичную настройку под `root`, затем перейти на пользователя `deploy`.

```bash
apt update && apt upgrade -y
apt install -y ca-certificates curl gnupg lsb-release git ufw nginx certbot python3-certbot-nginx
```

Установить Docker из официального репозитория:

```bash
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
  | tee /etc/apt/sources.list.d/docker.list > /dev/null

apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin docker-buildx-plugin
docker --version
docker compose version
docker buildx version
```

Firewall baseline:

```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
ufw status verbose
```

Порты `3000` и `3001` не должны быть постоянными публичными endpoints. Разрешать их через firewall только временно для IP-only smoke test до настройки nginx/домена, затем закрывать.

### 3. Пользователь deploy

```bash
adduser deploy
usermod -aG sudo deploy
usermod -aG docker deploy

mkdir -p /home/deploy/.ssh
cp /root/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys
```

Проверить вход в новом терминале до отключения root login:

```bash
ssh deploy@<vps-ip>
```

После успешной проверки можно отключить root SSH login:

```bash
nano /etc/ssh/sshd_config
# PermitRootLogin no
systemctl restart ssh
```

### 4. Код и production env

```bash
sudo mkdir -p /opt/budget
sudo chown deploy:deploy /opt/budget
git clone <repo-url> /opt/budget
cd /opt/budget
mkdir -p apps/server/data
chmod 755 apps/server/data
```

Создать `/opt/budget/.env`:

```text
NODE_ENV=production
DATABASE_URL=file:/app/data/budget.db
JWT_SECRET=<openssl-rand-base64-32>
FRONTEND_URL=https://budget-best.ru
TELEGRAM_BOT_TOKEN=<telegram-bot-token>
VITE_TELEGRAM_BOT_NAME=<bot-name-without-at>
VITE_API_URL=
GHCR_USERNAME=<optional-github-username>
GHCR_TOKEN=<optional-read-packages-token>
APPLY_NGINX_CONFIG=0
```

Сгенерировать JWT secret:

```bash
openssl rand -base64 32
```

`VITE_API_URL` в production должен быть пустым для same-origin API. Не ставить туда `https://api.budget-best.ru`, если не возвращаемся осознанно к cross-origin API.

### 5. GitHub Actions secrets и variables

Минимально нужны:

```text
secrets.VPS_HOST
secrets.VPS_USER
secrets.VPS_SSH_KEY
secrets.VPS_PORT              # optional, defaults to 22
vars.VITE_TELEGRAM_BOT_NAME   # or secrets.VITE_TELEGRAM_BOT_NAME
```

Images публикуются в GHCR через `secrets.GITHUB_TOKEN` workflow-а. Если images/private package policy потребует pull auth на VPS, задать `GHCR_USERNAME` и `GHCR_TOKEN` в `/opt/budget/.env`.

### 6. Первый запуск

Обычный путь: push в `master` или ручной `workflow_dispatch` в GitHub Actions. После публикации images можно вручную запустить на VPS:

```bash
cd /opt/budget
bash ./deploy.sh
docker compose --env-file .env ps
```

Временный IP-only smoke test до настройки домена возможен, но не является production target:

```bash
curl -sS -D - -o /dev/null http://<vps-ip>:3001/
curl -sS -D - http://<vps-ip>:3000/api/v1/auth/me
```

Если для такого теста открывались `3000/tcp` и `3001/tcp`, закрыть их после настройки nginx:

```bash
ufw delete allow 3000/tcp
ufw delete allow 3001/tcp
ufw status verbose
```

### 7. Домен, nginx и TLS

1. Делегировать DNS на Cloudflare nameservers.
2. В Cloudflare создать proxied records для `budget-best.ru` и `api.budget-best.ru`.
3. Получить/обновить Let's Encrypt certificate для `budget-best.ru` и `api.budget-best.ru`.
4. Применить nginx config из repo:

```bash
cd /opt/budget
APPLY_NGINX_CONFIG=1 bash ./deploy.sh
nginx -t
systemctl is-active nginx
certbot renew --dry-run
```

После этого production smoke tests должны проходить через `https://budget-best.ru/` и `https://budget-best.ru/api/*`, а не через прямые порты.

## SQLite

Production database path:

```text
/opt/budget/apps/server/data/budget.db
```

Не копировать только `budget.db`, пока backend активно пишет, если включён SQLite WAL mode. Использовать один из вариантов:

1. Stop backend, copy the whole data directory including possible `-wal` and `-shm` files, then start backend.
2. Use SQLite `.backup` from a consistent connection.

Безопасный file-level backup с downtime:

```bash
cd /opt/budget
docker compose --env-file .env stop server
backup_dir="/opt/budget/backups/sqlite/$(date +%Y%m%d%H%M%S)"
mkdir -p "$backup_dir"
cp -a apps/server/data/. "$backup_dir/"
docker compose --env-file .env start server
```

Restore procedure:

```bash
cd /opt/budget
docker compose --env-file .env stop server
restore_from="/opt/budget/backups/sqlite/<backup-dir>"
current_backup="/opt/budget/backups/sqlite/pre-restore-$(date +%Y%m%d%H%M%S)"
mkdir -p "$current_backup"
cp -a apps/server/data/. "$current_backup/"
rm -f apps/server/data/budget.db apps/server/data/budget.db-wal apps/server/data/budget.db-shm
cp -a "$restore_from"/. apps/server/data/
docker compose --env-file .env start server
```

Не использовать `docker compose down -v`: в этом проекте SQLite data подключена bind mount, но сама привычка опасна для production runbooks.

## Rollback

### Rollback Application Images

Если последний deploy плохой и известен предыдущий рабочий GHCR tag:

```bash
cd /opt/budget
SERVER_IMAGE=ghcr.io/lutoshkinns/budget-server:<good-sha> \
FRONTEND_IMAGE=ghcr.io/lutoshkinns/budget-frontend:<good-sha> \
docker compose --env-file .env up -d --no-build --force-recreate
```

Если менялись `docker-compose.yml` или infra files, лучше revert Git commit и redeploy через обычный pipeline.

### Rollback Cloudflare Proxy

Быстрый rollback, если Cloudflare proxy вызывает проблемы доступности:

1. Cloudflare Dashboard -> DNS -> Records.
2. Switch `budget-best.ru` and `api.budget-best.ru` from `Proxied` to `DNS only`.
3. Confirm DNS returns `85.235.205.154`.
4. Do not change nameservers during a fast rollback.

Checks:

```bash
dig A budget-best.ru @1.1.1.1 +short
curl --resolve budget-best.ru:443:85.235.205.154 \
  -sS -D - -o /dev/null https://budget-best.ru/
```

Полный nameserver rollback на Sprinthost нужен только при проблемах authoritative DNS; он медленнее и имеет больший blast radius.

### Rollback Nginx Real-IP

Использовать только если real-IP config ломает nginx:

```bash
rm /etc/nginx/conf.d/cloudflare-realip.conf
nginx -t && systemctl reload nginx
systemctl is-active nginx
```

Это не отключает Cloudflare. Это только заставляет nginx снова логировать Cloudflare edge IP.

## Firewall

Текущая documented posture:

- origin remains directly reachable for rollback/debug;
- firewall is not restricted to Cloudflare ranges only;
- host ports `3000` and `3001` are still published by Docker compose;
- no TCPMSS workaround should be active.

Перед ужесточением firewall:

```bash
ufw status verbose
iptables -S
iptables -t mangle -S
ss -lntp
certbot renew --dry-run
```

Не блокировать direct access к origin, пока не проверены admin SSH access, Certbot renewal и rollback path.

## Operations Cheat Sheet

| Action                  | Command                                                |
| ----------------------- | ------------------------------------------------------ |
| Deploy                  | `cd /opt/budget && bash ./deploy.sh`                   |
| Container status        | `docker compose --env-file .env ps`                    |
| Server logs             | `docker logs --since 30m --timestamps budget_server`   |
| Frontend logs           | `docker logs --since 30m --timestamps budget_frontend` |
| Nginx config test       | `nginx -t`                                             |
| Nginx reload            | `systemctl reload nginx`                               |
| Certbot dry-run         | `certbot renew --dry-run`                              |
| API smoke test          | `curl -sS -D - https://budget-best.ru/api/v1/auth/me`  |
| Cloudflare header check | `curl -sS -D - -o /dev/null https://budget-best.ru/`   |

## Open Items

- Decide what to do with `www.budget-best.ru`: remove DNS record, or add `www` to nginx/Certbot and optionally redirect it to apex.
- Decide whether to enable HTTP/3 in Cloudflare after a stable observation period.
- Decide whether to restrict origin access to Cloudflare IP ranges; do not do this without a tested SSH/rollback path.
- Consider removing the duplicate `git pull` in deploy flow: GitHub Actions runs `git pull` before `deploy.sh`, and `deploy.sh` runs it again. It is harmless, but redundant.
- Consider adding automated SQLite backups instead of relying only on manual backup commands.
