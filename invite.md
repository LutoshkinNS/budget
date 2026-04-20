План: Совместный доступ к аккаунту

Контекст

Пользователи хотят совместно вести учёт расходов в одном аккаунте. Сейчас структура БД (модель AccountUser) уже поддерживает это, но нет ни механизма приглашения, ни переключения аккаунта в JWT.

Поскольку модель User не хранит имя пользователя (только id), идентифицировать другого пользователя по имени невозможно. Выбрана схема инвайт-кодов: владелец генерирует код, передаёт его любым способом,
приглашённый вводит код в приложении.

Что нужно реализовать

1. БД — добавить таблицу AccountInvitation
2. TypeSpec — добавить контракты для switch-account, создания и погашения инвайта
3. Бэкенд — три новых обработчика
4. Фронтенд — UI в Settings для генерации кода, погашения и переключения аккаунта

 ---
Шаг 1: Prisma — новая модель

Файл: server/prisma/schema.prisma

Добавить модель и back-relation на Account:

model AccountInvitation {
id        Int       @id @default(autoincrement())
code      String    @unique
accountId Int
account   Account   @relation(fields: [accountId], references: [id])
createdBy Int
expiresAt DateTime
usedAt    DateTime?
usedBy    Int?
}

// В модели Account добавить:
invitations AccountInvitation[]

После изменений:
cd server && npx prisma migrate dev --name add_account_invitations

 ---
Шаг 2: TypeSpec контракты

server/typespec/general.tsp

Добавить в enum ErrorCode:
INVITATION_NOT_FOUND: "INVITATION_NOT_FOUND",
ALREADY_MEMBER: "ALREADY_MEMBER",
FORBIDDEN: "FORBIDDEN"

server/typespec/domains/account.tsp

Добавить модели:
model AccountInvitation {
id: integer;
code: string;
accountId: integer;
expiresAt: utcDateTime;
usedAt?: utcDateTime;
usedBy?: integer;
}

model RedeemInvitationRequest {
code: string;
}

model ForbiddenError {
code: ErrorCode.FORBIDDEN;
message: string;
statusCode: 403;
}

model ForbiddenResponse {
@statusCode statusCode: 403;
@body error: ForbiddenError;
}

model InvitationNotFoundError {
code: ErrorCode.INVITATION_NOT_FOUND;
message: string;
statusCode: 404;
}

model InvitationNotFoundResponse {
@statusCode statusCode: 404;
@body error: InvitationNotFoundError;
}

server/typespec/domains/auth.tsp

Добавить модель запроса переключения аккаунта:
model SwitchAccountRequest {
@minValue(1)
accountId: integer;
}

server/typespec/main.tsp

В интерфейс Auth добавить:
@route("/switch-account")
@post op switchAccount(
@body body: SwitchAccountRequest
): SuccessResponse | AuthUnauthorizedResponse | ForbiddenResponse | InternalServerErrorResponse;

В интерфейс Accounts добавить два маршрута:
@route("/{accountId}/invitations")
@post createInvitation(
@path accountId: integer
): AccountInvitation | ForbiddenResponse | AuthUnauthorizedResponse | InternalServerErrorResponse;

@route("/invitations/redeem")
@post redeemInvitation(
@body body: RedeemInvitationRequest
): AccountInvitation | InvitationNotFoundResponse | AuthUnauthorizedResponse | InternalServerErrorResponse;

После изменений запустить полный пайплайн:
cd server && npm run typespec && cd ../frontend && npm run api:generate

 ---
Шаг 3: Бэкенд обработчики

3a. POST /auth/switch-account

Новый файл: server/src/domains/auth/handlers/switchAccount.handler.ts

Логика:
1. Проверить, что accountId принадлежит пользователю (через ownedAccounts OR AccountUser)
2. Если нет — вернуть 403
3. Перевыпустить оба токена (access + refresh) с новым accountId, аналогично login.handler.ts

Файл: server/src/domains/auth/routes.ts — добавить маршрут с preHandler: [app.authenticate]

Пример проверки членства:
const account = await prisma.account.findFirst({
where: {
id: accountId,
OR: [{ ownerId: userId }, { users: { some: { userId } } }]
}
});
if (!account) return reply.code(403).send(AUTH_ERRORS.FORBIDDEN);

3b. POST /accounts/:accountId/invitations (создание)

Новый файл: server/src/domains/accounts/handlers/createInvitation.handler.ts

Логика:
1. Проверить, что пользователь является владельцем аккаунта (только owner, не просто член)
2. Сгенерировать код: crypto.randomBytes(4).toString('hex') (8 hex символов)
3. Создать AccountInvitation с expiresAt = now + 72h
4. Вернуть объект инвайта (фронтенд покажет код)

Файл: server/src/domains/accounts/routes.ts — добавить маршрут с preHandler: [app.authenticate]

3c. POST /accounts/invitations/redeem (погашение)

Новый файл: server/src/domains/accounts/handlers/redeemInvitation.handler.ts

Логика:
1. Найти инвайт по code где usedAt IS NULL AND expiresAt > now
2. Если не найден — 404
3. Проверить, что пользователь ещё не является членом аккаунта (предотвратить дубль)
4. Создать AccountUser { userId, accountId } в транзакции
5. Пометить инвайт использованным: usedAt = now, usedBy = userId
6. Вернуть объект инвайта

Файл: server/src/domains/accounts/routes.ts — добавить маршрут с preHandler: [app.authenticate]

 ---
Шаг 4: Фронтенд

Формат приглашения — ссылка вида {origin}/invite/{code}.
Когда пользователь переходит по ссылке, приложение автоматически погашает инвайт.
Приглашать могут только владельцы аккаунта.

4a. Новый публичный маршрут /invite/:code

Новый файл: frontend/src/app/routes/_public/invite.$code.tsx

Логика:
1. Если пользователь не авторизован → сохранить код в sessionStorage → редирект на /login
2. После логина проверить sessionStorage → автоматически погасить инвайт → редирект на /
3. Если пользователь авторизован → сразу вызвать redeemInvitation(code):
- Успех → уведомление «Вы добавлены в аккаунт» + редирект на /
- Ошибка → уведомление с текстом ошибки + редирект на /

4b. Entity: погашение инвайта

Новый файл: frontend/src/entities/accounts/useRedeemInvitation.ts

Обёртка над useAccountsRedeemInvitation (generated hook):
- После успеха: инвалидировать useAccounts, useMe
- При ошибке: показать уведомление

4c. Entity: переключение аккаунта

Новый файл: frontend/src/entities/user/useSwitchAccount.ts

Обёртка над useAuthSwitchAccount (generated hook):
- После успешного переключения инвалидировать: useMe, useAccounts, категории, расходы

4d. Feature: генерация ссылки-приглашения

Новый файл: frontend/src/features/accounts/ui/InviteToAccount.tsx

- Принимает accountId: number
- Кнопка «Пригласить»
- После успеха показывает полную ссылку (window.location.origin + '/invite/' + code) с кнопкой «Копировать ссылку»
- Показывает срок действия (72 часа)

4e. Переключение аккаунта в AccountsSelect

Файл: frontend/src/features/accounts/ui/AccountsSelect.tsx

- Получить currentAccountId из useMe() — отображать как выбранное значение
- onChange → вызов useSwitchAccount(accountId)
- Блокировать select пока идёт переключение

4f. Settings page

Файл: frontend/src/pages/settings/Settings.tsx

Расширить страницу:
1. AccountsSelect (переключение аккаунта) — уже есть, доработать
2. Для каждого owned аккаунта показать InviteToAccount

Данные брать из useMe() (возвращает accounts[{ id, name, isOwner }]).

4g. Обработка ссылки после логина

Файл: frontend/src/features/auth/ui/ByTelegram.tsx

После успешного логина — перед редиректом на / — проверить sessionStorage на наличие сохранённого инвайт-кода:
- Если есть → редирект на /invite/{code} (не на /)
- Если нет → редирект на /

 ---
Порядок реализации

1. Prisma migration
2. TypeSpec изменения + регенерация схем на сервере и клиенте
3. Backend: switchAccount.handler.ts + маршрут
4. Backend: createInvitation.handler.ts + redeemInvitation.handler.ts + маршруты
5. Frontend: useSwitchAccount.ts
6. Frontend: AccountsSelect.tsx (доработка переключения)
7. Frontend: InviteToAccount.tsx
8. Frontend: RedeemInvitation.tsx
9. Frontend: Settings.tsx (интеграция)

 ---
Проверка

1. Войти как пользователь A через Telegram → попасть в свой аккаунт
2. На странице Settings нажать «Пригласить» → скопировать код
3. Войти как пользователь B → на Settings ввести код → успешное присоединение
4. Пользователь B видит аккаунт A в списке и может переключиться на него
5. Пользователь B может добавлять расходы в аккаунте A
6. Повторное погашение того же кода → ошибка
7. Переключение на чужой аккаунт (которого нет в списке) → 403
