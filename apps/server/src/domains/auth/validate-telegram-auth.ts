import { createHash, createHmac } from 'node:crypto';

import { FromSchema } from 'json-schema-to-ts';

import LoginRequest from '#s/LoginRequest.js';

type TelegramUserData = FromSchema<typeof LoginRequest>;

/** @see https://core.telegram.org/widgets/login#checking-authorization */
export function validateTelegramAuth(
  data: TelegramUserData,
  botToken: string
): boolean {
  const { hash, ...authData } = data;

  const dataCheckString = Object.entries(authData)
    .filter(([_, value]) => value !== undefined)
    .sort(([key1], [key2]) => key1.localeCompare(key2, 'en'))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const secretKey = createHash('sha256').update(botToken).digest();

  const computedHash = createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  return computedHash === hash;
}
