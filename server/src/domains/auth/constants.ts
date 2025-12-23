// Константы времени для токенов и авторизации
export const AUTH_DATA_MAX_AGE_SECONDS = 24 * 60 * 60; // 24 часа
export const ACCESS_TOKEN_MAX_AGE_SECONDS = 15 * 60; // 15 минут
export const REFRESH_TOKEN_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 дней

// Константы ошибок
export const AUTH_ERRORS = {
  INVALID_TELEGRAM_AUTH: {
    code: 'UNAUTHORIZED',
    message: 'Неверные данные авторизации Telegram'
  },
  AUTH_DATA_EXPIRED: {
    code: 'UNAUTHORIZED',
    message: 'Данные авторизации истекли'
  },
  NO_ACCOUNT: {
    code: 'NO_ACCOUNT',
    message: 'У пользователя нет связанных аккаунтов'
  }
} as const;
