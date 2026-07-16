# Текущее production-состояние

Последнее обновление: 5 июля 2026 года.

Этот раздел описывает фактическое состояние production. Старый пошаговый deployment guide сохранён ниже как справочная информация.

## Production endpoints

```text
Origin IPv4:          85.235.205.154
Frontend:             https://budget-best.ru
Same-origin API:      https://budget-best.ru/api/
Legacy API hostname:  https://api.budget-best.ru
Optional www:         https://www.budget-best.ru
```

`www.budget-best.ru` сейчас не является рабочим обязательным endpoint: origin-сертификат не содержит `www`.

## Топология

```text
Пользователь
  -> Cloudflare edge (для proxied hostname)
  -> host nginx :443
  -> /api/*  -> localhost:3000 -> budget_server
  -> /*      -> localhost:3001 -> budget_frontend:8080
```

Основные пути на VPS:

```text
/opt/budget/                              production checkout
/opt/budget/.env                          production secrets; не коммитить
/opt/budget/docker-compose.yml            compose configuration
/opt/budget/deploy.sh                     production deploy script
/opt/budget/apps/server/data/             persistent SQLite directory
/etc/nginx/sites-available/budget          host nginx virtual hosts
/etc/nginx/conf.d/cloudflare-realip.conf   trusted Cloudflare networks
/etc/letsencrypt/live/budget-best.ru/      origin certificate
```

Контейнеры:

```text
budget_server    host port 3000 -> container port 3000
budget_frontend  host port 3001 -> container port 8080
```

Проверка:

```bash
cd /opt/budget
docker compose --env-file .env ps
docker logs --since 30m --timestamps budget_server 2>&1 | tail -n 200
docker logs --since 30m --timestamps budget_frontend 2>&1 | tail -n 200
```

## Cloudflare и DNS

Тариф: Cloudflare Free.

Регистратор: Sprinthost. Домен остаётся под управлением Sprinthost; изменена только NS-делегация.

Authoritative nameservers:

```text
colin.ns.cloudflare.com
piper.ns.cloudflare.com
```

Старая зона Sprinthost сохранена для отката:

```text
ns1.sprinthost.ru
ns2.sprinthost.ru
ns3.sprinthost.net
ns4.sprinthost.net
```

NS-делегация Cloudflare подтверждена 5 июля 2026 года через `.ru` parent, `1.1.1.1` и `8.8.8.8`.

Текущие записи в Cloudflare Dashboard:

```text
budget-best.ru      A  85.235.205.154  Proxied
api.budget-best.ru  A  85.235.205.154  Proxied в Dashboard
www.budget-best.ru  A  85.235.205.154  DNS only
```

Основной `budget-best.ru` подтверждён внешне как proxied (`Server: cloudflare`, `CF-RAY` присутствует). `api.budget-best.ru` окончательно подтверждён как proxied в 21:13 МСК 5 июля: authoritative NS возвращают Cloudflare IP `188.114.96.1`/`188.114.97.1`, HTTPS содержит `Server: cloudflare` и `CF-RAY`.

`www` оставлен DNS-only, потому что текущий Let's Encrypt origin-сертификат не покрывает `www.budget-best.ru`. Перед включением proxy для `www` нужно либо добавить hostname в nginx/Certbot, либо удалить неиспользуемую DNS-запись.

Проверка DNS:

```bash
dig NS budget-best.ru @1.1.1.1 +short
dig A budget-best.ru @1.1.1.1 +short
dig A api.budget-best.ru @1.1.1.1 +short
```

Признаки proxied hostname:

```bash
curl -sS -D - -o /dev/null https://budget-best.ru/
```

В ответе должны быть:

```text
Server: cloudflare
CF-RAY: ...
```

## Cloudflare TLS

```text
Encryption mode:  Full (strict)
Universal SSL:    *.budget-best.ru, budget-best.ru
Type:             Universal / Managed
Expires:          03.10.2026
HTTP/3 (QUIC):    Off на время первого production-теста
```

Origin использует Let's Encrypt:

```text
Subject:     CN=budget-best.ru
Issuer:      Let's Encrypt YE2
Key type:    ECDSA
SAN:         budget-best.ru, api.budget-best.ru
Valid until: 01.09.2026 13:36:58
Certbot:     VALID, 57 days remaining on 05.07.2026
```

Не выбирать Cloudflare `Flexible`. Не удалять Let's Encrypt: он нужен для `Full (strict)` и прямого DNS-only rollback.

Certbot проверен после Cloudflare rollout:

```bash
certbot certificates
certbot renew --dry-run
```

Фактический результат 5 июля 2026:

```text
Congratulations, all simulated renewals succeeded
/etc/letsencrypt/live/budget-best.ru/fullchain.pem (success)
```

## Cloudflare cache

Активно Cache Rule:

```text
Name: Bypass API and PWA shell
Match:
  URI Path starts with /api/
  OR URI Path in /sw.js, /index.html, /manifest.webmanifest, /registerSW.js
  OR URI Path starts with /workbox-
Action: Bypass cache
Status: Active
```

Назначение:

- API и авторизация всегда доходят до origin;
- service worker и PWA shell не получают устаревшую edge-копию;
- хешированные `/assets/*` могут кэшироваться Cloudflare.

Ожидаемый анонимный API smoke test:

```bash
curl -sS -D - https://budget-best.ru/api/v1/auth/me
```

Нормальный результат без cookie:

```text
HTTP 401
{"code":"MISSING_TOKEN","message":"FastifyError","statusCode":401}
CF-Cache-Status: DYNAMIC
```

## Реальный IP пользователя за Cloudflare

Nginx собран с:

```text
--with-http_realip_module
```

`/etc/nginx/nginx.conf` подключает:

```nginx
include /etc/nginx/conf.d/*.conf;
```

Установлен файл:

```text
/etc/nginx/conf.d/cloudflare-realip.conf
```

Логика файла:

```nginx
real_ip_header CF-Connecting-IP;
real_ip_recursive on;
set_real_ip_from <официальные Cloudflare IPv4/IPv6 ranges>;
```

На 5 июля 2026 года установлены 15 IPv4 и 7 IPv6 сетей из:

```text
https://www.cloudflare.com/ips-v4
https://www.cloudflare.com/ips-v6
```

Файл прошёл `nginx -t`; выполнен `systemctl reload nginx`; сервис остался `active`.

Текущие временные файлы на сервере:

```text
/root/cloudflare-ips-v4.txt
/root/cloudflare-ips-v6.txt
/root/cloudflare-realip.conf.new
```

Real-IP подтверждён 5 июля 2026 года. Проверочный URL:

```text
https://budget-best.ru/default.png?probe=cf-realip-1
```

Проверка:

```bash
grep 'probe=cf-realip-1' /var/log/nginx/access.log | tail -n 5
```

Фактический результат:

```text
45.90.98.92      исходный VPN/client IP, HTTP 200
149.154.161.250  TelegramBot link preview, HTTP 200
149.154.161.232  TelegramBot link preview, HTTP 200
```

Первая колонка содержит исходный VPN/client IP, а не Cloudflare edge IP. Запросы `TelegramBot` относятся к link preview и не являются пользовательскими запросами браузера.

Безопасное обновление Cloudflare ranges:

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

Не использовать `sed` без нормализации перевода строки: официальный список может не иметь завершающего newline, из-за чего последняя IPv4 и первая IPv6 директивы склеятся.

## Nginx и логи

Host nginx:

```text
Version: nginx/1.24.0 (Ubuntu)
Access log: /var/log/nginx/access.log
Error log:  /var/log/nginx/error.log
```

Маршрутизация `budget-best.ru`:

```text
/api/* -> http://localhost:3000
/*     -> http://localhost:3001
```

Legacy `api.budget-best.ru`:

```text
/* -> http://localhost:3000
```

Полезные проверки:

```bash
nginx -t
systemctl is-active nginx
nginx -T 2>&1 | less

tail -n 100 /var/log/nginx/error.log
grep -E '/api/v1/auth/(client-event|login|me|refresh|logout)' \
  /var/log/nginx/access.log | tail -n 100
```

## Firewall и TCP

Текущее состояние, подтверждённое в ходе диагностики:

- временные iptables TCPMSS rules удалены;
- `net.ipv4.tcp_ecn = 2`;
- `net.ipv4.tcp_ecn_fallback = 1`;
- firewall пока не ограничен только Cloudflare IP;
- origin остаётся доступен напрямую для безопасного rollback.

Перед любым ужесточением firewall сначала проверить:

```bash
ufw status verbose
iptables -S
iptables -t mangle -S
ss -lntp
```

Не закрывать origin для прямого доступа до успешного Certbot dry-run, проверки административного доступа к VPS и подготовки проверенного правила firewall с возможностью отката.

## Deploy

Обычный production deploy:

```bash
cd /opt/budget
bash ./deploy.sh
```

Скрипт загружает изменения `master`, скачивает образы из GHCR и пересоздаёт контейнеры. Не записывать значения `.env`, Telegram token, JWT secret или GHCR token в этот файл.

Проверка после deploy:

```bash
cd /opt/budget
docker compose --env-file .env ps
curl -sS -D - -o /dev/null https://budget-best.ru/
curl -sS -D - https://budget-best.ru/api/v1/auth/me
```

## SQLite

Production database:

```text
/opt/budget/apps/server/data/budget.db
```

Не копировать только `budget.db` во время активной записи, если база работает в WAL mode. Для согласованной копии использовать SQLite backup либо остановить backend и копировать всю директорию данных вместе с возможными `-wal`/`-shm` файлами.

Перед восстановлением всегда остановить `budget_server` и сохранить отдельную копию текущей директории данных.

## Быстрый откат Cloudflare proxy

Если после включения proxy приложение недоступно:

1. Cloudflare Dashboard -> DNS -> Records.
2. Переключить `budget-best.ru` и `api` из `Proxied` в `DNS only`.
3. Проверить, что DNS снова возвращает `85.235.205.154`.
4. Не менять NS во время быстрого отката.

Проверка:

```bash
dig A budget-best.ru @1.1.1.1 +short
curl --resolve budget-best.ru:443:85.235.205.154 \
  -sS -D - -o /dev/null https://budget-best.ru/
```

Полный возврат NS к Sprinthost нужен только при проблеме с authoritative DNS и займёт больше времени.

## Откат nginx real-IP

Использовать только если real-IP конфигурация вызвала ошибку:

```bash
rm /etc/nginx/conf.d/cloudflare-realip.conf
nginx -t && systemctl reload nginx
systemctl is-active nginx
```

Удаление real-IP файла не отключает Cloudflare; nginx снова будет записывать edge IP Cloudflare.

## Незавершённые серверные задачи

- решить судьбу `www`: удалить запись или добавить hostname в nginx/Certbot;
- после стабильного теста решить, включать ли HTTP/3;
- firewall restriction to Cloudflare ranges пока не выполнять.

---

# Первоначальный план развертывания Budget App на VPS (Ubuntu/Debian)

Обзор

Развертывание приложения на VPS через Docker Compose. Сначала по IP-адресу, с возможностью добавить домен и SSL позже.

Архитектура (pnpm monorepo):
- apps/server (порт 3000) — Fastify API + SQLite база данных
- apps/frontend (порт 3001) — React приложение в nginx (внутри контейнера порт 8080)
- packages/api-contracts — TypeSpec API-контракты (общий пакет)

Docker Compose запускается из корня монорепо. Контекст сборки — корень проекта.

 ---                                                                                                                                                                                                        
Фаза 0: Настройка SSH на Windows 11

Все команды ниже можно выполнять в Git Bash или PowerShell.

**0.1 Проверка наличия SSH-ключа**

ls ~/.ssh/
Зачем: Проверяем, есть ли уже SSH-ключи. Если видите файлы id_rsa и id_rsa.pub (или id_ed25519 и id_ed25519.pub) — ключи уже есть, переходите к шагу 0.3.

**0.2 Создание SSH-ключа**

Сначала убедитесь, что папка .ssh существует:
mkdir -p ~/.ssh

Затем создайте ключ:
ssh-keygen -t ed25519 -C "your_email@example.com"

Или с кастомным именем (чтобы не перепутать ключи для разных серверов):
ssh-keygen -t ed25519 -C "your_email@example.com" -f ~/.ssh/budget_vps

Зачем: Генерирует пару ключей:
- Приватный ключ (id_ed25519) — хранится только у вас, НИКОМУ не передавать!
- Публичный ключ (id_ed25519.pub) — можно копировать на серверы

Параметры:
- -t ed25519 — тип ключа (Ed25519 современнее и безопаснее RSA)
- -C "email" — комментарий для идентификации ключа

Программа спросит:
1. Путь для сохранения — просто нажмите Enter (по умолчанию ~/.ssh/id_ed25519)
2. Passphrase (пароль) — можно оставить пустым (Enter) или задать дополнительный пароль

Где хранятся ключи:
- Git Bash: ~/.ssh/ это C:\Users\ВАШ_ПОЛЬЗОВАТЕЛЬ\.ssh\
- PowerShell: аналогично

**0.3 Копирование публичного ключа на сервер**

**Способ 1: Через Git Bash (рекомендуется)**
ssh-copy-id root@YOUR_VPS_IP

Если используете кастомное имя ключа:
ssh-copy-id -i ~/.ssh/budget_vps.pub root@YOUR_VPS_IP

Зачем: Автоматически копирует публичный ключ на сервер. Спросит пароль root один раз.
Примечание: ssh-copy-id есть в Git Bash, но отсутствует в PowerShell.

**Способ 2: Через PowerShell или Git Bash (вручную одной командой)**
cat ~/.ssh/id_ed25519.pub | ssh root@YOUR_VPS_IP "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys"

Если используете кастомное имя ключа, замените id_ed25519.pub на budget_vps.pub:
Зачем: Читает ваш публичный ключ, подключается к серверу и добавляет ключ в authorized_keys.
При первом подключении спросит пароль от root (его дал хостинг-провайдер).

**Способ 3: Полностью вручную**
# 1. Показать содержимое публичного ключа (замените имя файла если используете кастомное)
cat ~/.ssh/id_ed25519.pub
# или: cat ~/.ssh/budget_vps.pub

# 2. Скопировать весь вывод (начинается с ssh-ed25519...)

# 3. Подключиться к серверу по паролю
ssh root@YOUR_VPS_IP

# 4. На сервере создать файл и вставить ключ
mkdir -p ~/.ssh
nano ~/.ssh/authorized_keys
# Вставить ключ, сохранить: Ctrl+O, Enter, Ctrl+X

# 5. Установить права доступа
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
Зачем: Сервер разрешит вход только тем, чей публичный ключ есть в authorized_keys.
Права 700/600 обязательны — SSH откажет в авторизации если файлы доступны другим.

**0.4 Проверка подключения по ключу**

ssh root@YOUR_VPS_IP
Зачем: Если всё настроено правильно, сервер пустит без пароля (или спросит passphrase, если вы его задали).

Если не работает — проверьте:
1. Правильный ли IP-адрес
2. Скопирован ли ПУБЛИЧНЫЙ ключ (.pub), а не приватный
3. Права на файлы на сервере (chmod 700/600)

**0.5 Настройка SSH config (для кастомных ключей)**

Если вы создали ключ с кастомным именем (например, budget_vps), SSH не найдёт его автоматически.

Создайте или откройте файл конфигурации:
nano ~/.ssh/config

Добавьте блок для вашего сервера:
Host budget
    HostName YOUR_VPS_IP
    User deploy
    IdentityFile ~/.ssh/budget_vps

Зачем:
- Host budget — алиас (короткое имя) для подключения
- HostName — IP-адрес или домен сервера
- User — пользователь по умолчанию (позже смените root на deploy)
- IdentityFile — путь к приватному ключу

После этого подключение одной командой:
ssh budget

Вместо:
ssh -i ~/.ssh/budget_vps deploy@YOUR_VPS_IP

Примечание: Если используете стандартное имя ключа (id_ed25519), этот шаг можно пропустить.

---
Фаза 1: Подготовка VPS

**1.1 Подключение к VPS**

ssh root@YOUR_VPS_IP
Зачем: SSH — безопасный протокол для удаленного управления сервером. root — администратор с полными правами. Теперь вход работает по ключу без пароля.

**1.2 Обновление системы**

apt update && apt upgrade -y                                                                                                                                                                               
Зачем:
- apt update — обновляет список доступных пакетов из репозиториев
- apt upgrade -y — устанавливает новые версии уже установленных программ
- -y — автоматически отвечает "да" на все вопросы
- Это важно для безопасности и совместимости

**1.3 Установка Docker**

# Установка зависимостей для HTTPS репозиториев
apt install -y ca-certificates curl gnupg lsb-release                                                                                                                                                      
Зачем: Эти пакеты нужны для безопасной загрузки Docker:
- ca-certificates — корневые сертификаты для проверки HTTPS
- curl — утилита для скачивания файлов
- gnupg — для проверки цифровых подписей
- lsb-release — информация о версии Linux

# Создание директории для ключей и добавление GPG ключа Docker
install -m 0755 -d /etc/apt/keyrings                                                                                                                                                                       
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg                                                                                                    
chmod a+r /etc/apt/keyrings/docker.gpg                                                                                                                                                                     
Зачем: GPG ключ подтверждает, что пакеты Docker подлинные и не были подменены злоумышленником

# Добавление официального репозитория Docker
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list >       
/dev/null                                                                                                                                                                                                  
Зачем: Добавляем источник пакетов Docker. $(lsb_release -cs) автоматически подставляет кодовое имя вашей версии Ubuntu (например, jammy для 22.04)

# Установка Docker
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin docker-buildx-plugin
Зачем: Устанавливаем компоненты Docker:
- docker-ce — сам Docker Engine (Community Edition)
- docker-ce-cli — командная строка docker
- containerd.io — среда выполнения контейнеров
- docker-compose-plugin — для команды docker compose
- docker-buildx-plugin — BuildKit для продвинутых функций сборки (кэширование слоёв, --mount и др.)

# Проверка установки
docker --version
docker compose version
docker buildx version
Зачем: Убедиться, что всё установилось корректно

**1.4 Настройка firewall (UFW)**

ufw allow OpenSSH      # Разрешить SSH (порт 22)                                                                                                                                                           
ufw allow 80/tcp       # Разрешить HTTP                                                                                                                                                                    
ufw allow 443/tcp      # Разрешить HTTPS (для будущего SSL)                                                                                                                                                
ufw allow 3000/tcp     # Разрешить API сервер                                                                                                                                                              
ufw allow 3001/tcp     # Разрешить фронтенд                                                                                                                                                                
ufw enable             # Включить firewall                                                                                                                                                                 
ufw status             # Показать правила                                                                                                                                                                  
Зачем: UFW (Uncomplicated Firewall) — это firewall. Он блокирует все входящие подключения, кроме явно разрешенных. Без правила для SSH вы потеряете доступ к серверу!

**1.5 Создание пользователя для деплоя**

Зачем: Работать под root опасно — любая ошибка может сломать систему. Также боты постоянно пытаются подобрать пароль к root через SSH.

# Создать пользователя deploy
adduser deploy
Зачем: Создаёт нового пользователя. Система попросит задать пароль.

# Дать права sudo (выполнять команды от имени root когда нужно)
usermod -aG sudo deploy
Зачем: -aG добавляет пользователя в группу sudo. После этого можно выполнять команды с sudo.

# Добавить в группу docker (запускать docker без sudo)
usermod -aG docker deploy
Зачем: Без этого каждая команда docker потребует sudo.

# Скопировать SSH-ключ для нового пользователя
mkdir -p /home/deploy/.ssh
cp ~/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys
Зачем: Копируем ваш SSH-ключ, чтобы можно было входить под deploy без пароля.
- chown — меняет владельца файлов на deploy
- chmod 700/600 — ограничивает доступ к ключам (требование SSH)

# ВАЖНО: Проверить вход в НОВОМ терминале перед отключением root!
ssh deploy@YOUR_VPS_IP
Зачем: Если что-то пошло не так, вы всё ещё сможете войти под root в старом терминале.

# (Опционально) Отключить вход под root
nano /etc/ssh/sshd_config
# Найти и изменить: PermitRootLogin no
systemctl restart ssh
Зачем: После этого никто не сможет войти под root по SSH — только через sudo.
Примечание: На Ubuntu сервис называется ssh, на CentOS/RHEL — sshd.

Дальнейшие команды выполняйте под пользователем deploy. Если нужны права root — добавляйте sudo перед командой.

---
Фаза 2: Подготовка приложения

**2.1 Клонирование репозитория**

# Выполняется под пользователем deploy!
sudo mkdir -p /opt/budget                    # Создать директорию
sudo chown deploy:deploy /opt/budget         # Передать владение пользователю deploy
cd /opt
git clone YOUR_REPO_URL budget               # Клонировать репозиторий
cd budget                                    # Перейти в папку проекта
Зачем:
- /opt — стандартная директория Linux для стороннего ПО
- sudo нужен для создания папки в /opt (системная директория)
- chown передаёт права на папку пользователю deploy, чтобы дальше работать без sudo
- git clone — загружает весь код проекта с GitHub/GitLab

Структура монорепо после клонирования:
/opt/budget/
├── apps/
│   ├── server/        # Fastify backend
│   └── frontend/      # React frontend
├── packages/
│   └── api-contracts/ # TypeSpec контракты (общий пакет)
├── pnpm-workspace.yaml
├── docker-compose.yml
└── .env               # создать вручную!
  

**2.2 Создание production окружения**

nano .env    # Открыть редактор nano для создания файла                                                                                                                                         
Зачем: Файл .env содержит секретные настройки, которые НЕ должны быть в git-репозитории

Содержимое файла:
# Режим работы приложения
NODE_ENV=production

# Путь к базе данных SQLite внутри контейнера
DATABASE_URL=file:/app/data/budget.db

# Секретный ключ для JWT токенов авторизации
# ВАЖНО: Сгенерировать случайную строку минимум 32 символа!
JWT_SECRET=СГЕНЕРИРОВАТЬ_НОВЫЙ_СЕКРЕТ

# URL фронтенда (для CORS — защита от запросов с чужих сайтов)
FRONTEND_URL=http://YOUR_VPS_IP:3001

# Токен Telegram бота (получить у @BotFather)
TELEGRAM_BOT_TOKEN=ВАШ_TELEGRAM_BOT_TOKEN

# Имя Telegram бота (без @, используется на фронтенде)
VITE_TELEGRAM_BOT_NAME=ВАШ_BOT_USERNAME

# URL API для фронтенда (встраивается в сборку фронтенда)
VITE_API_URL=http://YOUR_VPS_IP:3000

# Опционально: доступ к GHCR для docker pull приватных образов.
# Если образы публичные, можно не задавать.
GHCR_USERNAME=ВАШ_GITHUB_USERNAME
GHCR_TOKEN=ВАШ_GITHUB_TOKEN_С_READ_PACKAGES

Генерация безопасного JWT секрета:                                                                                                                                                                         
openssl rand -base64 32                                                                                                                                                                                    
Зачем: openssl rand генерирует криптографически безопасную случайную строку. Это защищает токены авторизации от подделки.

**2.3 Создание директории для данных**

Вопрос: а если я буду клонировать репозиторий, то файл базы удалится?

mkdir -p apps/server/data    # Создать папку для базы данных                                                                                                                                              
chmod 755 apps/server/data   # Установить права доступа                                                                                                                                                    
Зачем:
- SQLite хранит данные в файле. Эта папка монтируется в контейнер через volume ./apps/server/data:/app/data
- chmod 755 — владелец может всё, остальные только читать и выполнять
- Без этой папки Docker создаст её от имени root и могут быть проблемы с правами

 ---                                                                                                                                                                                                        
Фаза 3: Развертывание

**3.1 Сборка образов**

Основной production-процесс: образы собираются не на VPS, а в GitHub Actions.

Workflow `.github/workflows/deploy.yml` при push в `master`:
- собирает server image из `apps/server/Dockerfile`
- собирает frontend image из `apps/frontend/Dockerfile`
- публикует образы в GHCR:
  - `ghcr.io/lutoshkinns/budget-server:latest`
  - `ghcr.io/lutoshkinns/budget-frontend:latest`
- подключается к VPS по SSH и запускает `/opt/budget/deploy.sh`

Зачем:
- VPS не тратит CPU/RAM/диск на сборку Docker-образов
- frontend получает `VITE_API_URL` и `VITE_TELEGRAM_BOT_NAME` на этапе сборки в Actions
- сервер только скачивает готовые images и пересоздаёт контейнеры

**3.2 Первичный запуск на VPS**

Если images уже опубликованы в GHCR:

cd /opt/budget
docker compose --env-file .env pull

# Запускаем контейнеры
docker compose --env-file .env up -d

Зачем:
- docker compose — управление несколькими контейнерами
- docker compose pull — скачивает готовые images из GHCR
- --env-file .env — использовать production-переменные окружения
- up -d — запустить в фоне, не блокируя терминал

Если GHCR недоступен или нужен аварийный fallback, можно собрать на VPS:

docker compose --env-file .env build
docker compose --env-file .env up -d

Это запасной вариант, а не основной production flow.

**3.3 Проверка статуса**

# Показать запущенные контейнеры
docker compose ps                                                                                                                                                                                          
Зачем: Убедиться, что оба контейнера (server, frontend) в статусе "Up"

# Смотреть логи сервера в реальном времени
docker compose logs -f server                                                                                                                                                                              
Зачем: -f (follow) — показывает новые логи по мере их появления. Полезно для отладки. Ctrl+C чтобы выйти.

# Смотреть логи фронтенда
docker compose logs -f frontend

**3.4 Проверка работоспособности**

- Открыть в браузере: http://YOUR_VPS_IP:3001 — должен загрузиться React UI
- Проверить API: http://YOUR_VPS_IP:3000 — должен ответить сервер

 ---                                                                                                                                                                                                        
Фаза 4: Полезные команды

**Обновление после изменений в коде**

Обычный путь обновления — push в `master`.

После push GitHub Actions:
1. Собирает и публикует Docker images в GHCR.
2. Подключается к VPS.
3. Запускает `/opt/budget/deploy.sh`.

`deploy.sh` на сервере делает:

cd /opt/budget
git pull --ff-only origin master
docker compose --env-file .env pull
docker compose --env-file .env up -d --no-build --force-recreate

Зачем:
- git pull обновляет docker-compose.yml, deploy.sh и остальные файлы на VPS
- docker compose pull скачивает готовые images, собранные в Actions
- --no-build гарантирует, что VPS не будет собирать images локально
- --force-recreate пересоздаёт контейнеры на новых images

Ручной запуск deploy, если workflow не дошёл до SSH-шагa:

cd /opt/budget
bash ./deploy.sh

Fallback при проблемах с GHCR или Docker Hub:

cd /opt/budget
git pull --ff-only origin master
docker compose --env-file .env build server
docker compose --env-file .env up -d --no-deps server

Использовать fallback только временно: основная схема — сборка в Actions и pull готовых images на VPS.

**Остановка приложения**

docker compose down                                                                                                                                                                                        
Зачем: Останавливает и удаляет контейнеры. Данные в server/data сохраняются!

**Полная остановка с удалением данных (ОСТОРОЖНО!)**

docker compose down -v                                                                                                                                                                                     
Зачем: -v удаляет volumes (тома). База данных будет УДАЛЕНА!

Вопрос: а как мне хранить её на сервере, чтобы она не удалялась?

**Просмотр всех логов**

docker compose logs -f                                                                                                                                                                                     
Зачем: Показывает логи всех контейнеров вместе

**Перезапуск одного сервиса**

docker compose restart server                                                                                                                                                                              
Зачем: Перезапускает только сервер, не трогая фронтенд

**Вход внутрь контейнера (для отладки)**

docker compose exec server sh                                                                                                                                                                              
Зачем: Открывает shell внутри контейнера. Можно посмотреть файлы, проверить переменные окружения. exit чтобы выйти.

**Бэкап базы данных**

cp /opt/budget/apps/server/data/budget.db /opt/budget/apps/server/data/budget.db.backup.$(date +%Y%m%d)                                                                                                      
Зачем: Копирует файл базы данных с текущей датой в имени. SQLite — это просто файл, его легко копировать.

**Восстановление из бэкапа**

docker compose down                           # Остановить приложение                                                                                                                                      
cp /opt/budget/apps/server/data/budget.db.backup.ДАТА /opt/budget/apps/server/data/budget.db                                                                                                               
docker compose up -d                          # Запустить снова
                                                                                                                                                                                                            
---
Фаза 5: Добавление домена и SSL

Эта фаза выполняется когда у вас есть доменное имя. Будем использовать два поддомена:
- budget-best.ru — фронтенд
- api.budget-best.ru — API сервер

**5.1 Настройка DNS**

В панели управления доменом добавить две A-записи:

Запись 1 (фронтенд):
Тип: A
Имя: @ (или пусто, в зависимости от провайдера)
Значение: YOUR_VPS_IP
TTL: 3600

Запись 2 (API):
Тип: A
Имя: api
Значение: YOUR_VPS_IP
TTL: 3600

Зачем: A-записи связывают доменные имена с IP-адресом. После этого:
- budget-best.ru → YOUR_VPS_IP
- api.budget-best.ru → YOUR_VPS_IP

Проверка (подождите 5-30 минут после добавления записей):
ping budget-best.ru
ping api.budget-best.ru
Зачем: Убедиться, что DNS-записи распространились и указывают на правильный IP.

**5.2 Установка Nginx на хосте**

# Подключиться к серверу
ssh deploy@YOUR_VPS_IP

# Установить nginx
sudo apt install -y nginx

# Проверить статус
sudo systemctl status nginx
Зачем: Nginx на хосте будет принимать HTTPS-запросы, терминировать SSL и проксировать их в Docker-контейнеры.

**5.3 Создание конфигурации Nginx**

Создайте файл конфигурации:
sudo nano /etc/nginx/sites-available/budget

Содержимое файла:
```nginx
# Фронтенд (budget-best.ru)
server {
    listen 80;
    server_name budget-best.ru;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# API (api.budget-best.ru)
server {
    listen 80;
    server_name api.budget-best.ru;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Зачем:
- listen 80 — пока слушаем HTTP (Certbot добавит HTTPS автоматически)
- proxy_pass — перенаправляет запросы в Docker-контейнеры
- proxy_set_header — передаёт оригинальную информацию о клиенте

Активация конфигурации:
# Создать символическую ссылку
sudo ln -s /etc/nginx/sites-available/budget /etc/nginx/sites-enabled/

# Удалить дефолтный сайт (опционально)
sudo rm /etc/nginx/sites-enabled/default

# Проверить синтаксис конфигурации
sudo nginx -t

# Перезагрузить nginx
sudo systemctl reload nginx
Зачем: sites-enabled содержит активные конфиги. nginx -t проверяет синтаксис перед применением.

**5.4 Установка Certbot и получение SSL-сертификатов**

# Установить Certbot и плагин для nginx
sudo apt install -y certbot python3-certbot-nginx

# Получить сертификаты для обоих доменов
sudo certbot --nginx -d budget-best.ru -d api.budget-best.ru
Зачем:
- certbot — клиент Let's Encrypt для бесплатных SSL-сертификатов
- python3-certbot-nginx — плагин для автоматической настройки nginx
- --nginx — автоматически изменит конфиг nginx для HTTPS

Certbot спросит:
1. Email — для уведомлений об истечении сертификата
2. Согласие с условиями — введите Y
3. Редирект HTTP→HTTPS — выберите 2 (Redirect) для автоматического редиректа

После успешного выполнения Certbot автоматически:
- Получит SSL-сертификаты
- Изменит конфигурацию nginx для HTTPS (порт 443)
- Добавит редирект с HTTP на HTTPS
- Настроит автоматическое обновление сертификатов

Проверка автообновления:
sudo certbot renew --dry-run
Зачем: --dry-run тестирует процесс обновления без реальных изменений. Сертификаты обновляются автоматически через cron/systemd timer.

**5.5 Обновление переменных окружения**

Обновите .env на сервере:
cd /opt/budget
nano .env

Измените:
# Было:
FRONTEND_URL=http://YOUR_VPS_IP:3001
VITE_API_URL=http://YOUR_VPS_IP:3000

# Стало:
FRONTEND_URL=https://budget-best.ru
VITE_API_URL=https://api.budget-best.ru

Зачем:
- FRONTEND_URL используется для CORS — теперь API будет принимать запросы с https://budget-best.ru
- VITE_API_URL встраивается в сборку фронтенда в GitHub Actions через build args
- VITE_TELEGRAM_BOT_NAME также встраивается в сборку — не требует изменений если имя бота не менялось

Важно: после перехода на GitHub Actions значения `VITE_API_URL` и `VITE_TELEGRAM_BOT_NAME` должны быть заданы в GitHub repository variables/secrets, потому что frontend image собирается в Actions, а не на VPS.

**5.6 Пересборка и перезапуск приложения**

Сделайте push в `master` или вручную запустите workflow `Deploy to VPS` в GitHub Actions.

Actions соберёт новые images с актуальными frontend build args и запустит `/opt/budget/deploy.sh` на VPS.

Если нужно вручную перезапустить уже опубликованные images:

cd /opt/budget
docker compose --env-file .env pull
docker compose --env-file .env up -d --no-build --force-recreate

Зачем: frontend-переменные встраиваются на этапе сборки image, поэтому менять только `.env` на VPS недостаточно для `VITE_API_URL`; нужен новый frontend image из Actions.

**5.7 Обновление firewall**

Теперь можно закрыть прямой доступ к портам 3000 и 3001:
sudo ufw delete allow 3000/tcp
sudo ufw delete allow 3001/tcp
sudo ufw status
Зачем: Все запросы теперь идут через nginx (порты 80/443). Прямой доступ к контейнерам больше не нужен и менее безопасен.

**5.8 Проверка работоспособности**

Откройте в браузере:
- https://budget-best.ru — должен загрузиться фронтенд с замочком в адресной строке
- https://api.budget-best.ru — должен ответить API сервер

Проверка SSL-сертификата:
curl -I https://budget-best.ru
Зачем: Должен вернуть HTTP/2 200 с заголовками. Обратите внимание на HTTP/2 — признак работающего HTTPS.

**5.9 Устранение неполадок**

Если что-то не работает:

# Проверить логи nginx
sudo tail -f /var/log/nginx/error.log

# Проверить статус certbot
sudo certbot certificates

# Проверить, что контейнеры запущены
docker compose ps

# Проверить логи контейнеров
docker compose logs -f

Частые проблемы:
1. "Connection refused" — контейнеры не запущены или слушают другой порт
2. "502 Bad Gateway" — nginx не может достучаться до контейнеров
3. "Certificate not valid" — DNS ещё не обновился, подождите и попробуйте снова

---
Важные замечания

**Безопасность**

1. Не коммитьте .env файлы — они должны быть только на сервере (уже в .gitignore)
2. Регулярно обновляйте систему — apt update && apt upgrade
3. Используйте пользователя deploy вместо root для повседневной работы
4. Храните SSH-ключи в безопасности, не используйте пароли для SSH

**Бэкапы**

Настройте автоматические бэкапы через cron:                                                                                                                                                                
crontab -e
# Добавить строку для ежедневного бэкапа в 3:00
0 3 * * * cp /opt/budget/apps/server/data/budget.db /opt/budget/apps/server/data/backups/budget.db.$(date +\%Y\%m\%d)

**Мониторинг**

Следите за местом на диске:                                                                                                                                                                                
df -h
                                                                                                                                                                                                            
---
Краткая шпаргалка

| Действие   | Команда                                                                      |
|------------|------------------------------------------------------------------------------|
| Собрать    | GitHub Actions: push в master или workflow_dispatch                         |
| Запустить  | docker compose --env-file .env up -d                                         |
| Остановить | docker compose down                                                          |
| Логи       | docker compose logs -f                                                       |
| Статус     | docker compose ps                                                            |
| Обновить   | bash /opt/budget/deploy.sh                                                   |
| Pull images | docker compose --env-file .env pull                                         |
| Fallback build | docker compose --env-file .env build server                              |
| Бэкап БД   | cp apps/server/data/budget.db apps/server/data/budget.db.bak                 |
 ---                                                                                                                                                                                                        
Файлы проекта

- docker-compose.yml — конфигурация контейнеров, контекст сборки — корень монорепо (уже готов)
- apps/server/Dockerfile — сборка backend, использует pnpm workspaces (уже готов)
- apps/frontend/Dockerfile — сборка frontend, использует pnpm workspaces (уже готов)
- pnpm-workspace.yaml — описание workspace-пакетов (apps/*, packages/*)
- .env — создать на VPS с секретами (не коммитить в git!)
