export const AUTH_DATA_MAX_AGE_SECONDS = 24 * 60 * 60;
export const ACCESS_TOKEN_MAX_AGE_SECONDS = 15 * 60;
export const REFRESH_TOKEN_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export const AUTH_ERROR_MESSAGES = {
  INVALID_TELEGRAM_AUTH: 'Неверные данные авторизации Telegram',
  AUTH_DATA_EXPIRED: 'Данные авторизации истекли'
} as const;
