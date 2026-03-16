import { createHash, createHmac } from 'node:crypto';

import { FromSchema } from 'json-schema-to-ts';

import LoginRequest from '#s/LoginRequest.js';

type TelegramUserData = FromSchema<typeof LoginRequest>;

/**
 * Проверяет подлинность данных авторизации Telegram
 * @see https://core.telegram.org/widgets/login#checking-authorization
 */
export function validateTelegramAuth(
  data: TelegramUserData,
  botToken: string
): boolean {
  const { hash, ...authData } = data;

  // data_check_string из всех полей кроме hash, отсортированных в алфавитном порядке по ключу
  const dataCheckString = Object.entries(authData)
    .filter(([_, value]) => value !== undefined)
    .sort(([key1], [key2]) => key1.localeCompare(key2, 'en'))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  // secret_key = SHA256(bot_token)
  const secretKey = createHash('sha256').update(botToken).digest();

  // hash = HMAC-SHA256(data_check_string, secret_key)
  const computedHash = createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  return computedHash === hash;
}
