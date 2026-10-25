export const AUTH_DATA_MAX_AGE_SECONDS = 24 * 60 * 60;
export const ACCESS_TOKEN_MAX_AGE_SECONDS = 15 * 60;
export const REFRESH_TOKEN_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export const AUTH_ERRORS = {
  INVALID_TELEGRAM_AUTH: {
    code: 'UNAUTHORIZED',
    message: 'Неверные данные авторизации Telegram'
  },
  AUTH_DATA_EXPIRED: {
    code: 'UNAUTHORIZED',
    message: 'Данные авторизации истекли'
  }
} as const;
