import LoginRequest from '#s/LoginRequest.js';
import NoAccountError from '#s/NoAccountError.js';
import SuccessResponse from '#s/SuccessResponse.js';
import UnauthorizedError from '#s/UnauthorizedError.js';
import UserInfo from '#s/UserInfo.js';
import type { FastifyApp } from '#src/appInit.js';

import { loginHandler } from './handlers/login.handler.js';
import { logoutHandler } from './handlers/logout.handler.js';
import { meHandler } from './handlers/me.handler.js';
import { refreshHandler } from './handlers/refresh.handler.js';

export default async function authRoutes(app: FastifyApp) {
  app.post(
    '/login',
    {
      schema: {
        body: LoginRequest,
        response: {
          200: SuccessResponse,
          409: NoAccountError,
          401: UnauthorizedError
        }
      }
    },
    loginHandler
  );

  app.post(
    '/refresh',
    {
      schema: {
        response: { 200: SuccessResponse, 401: UnauthorizedError }
      }
    },
    refreshHandler
  );

  app.get(
    '/me',
    {
      preHandler: [app.authenticate],
      schema: {
        response: { 200: UserInfo, 401: UnauthorizedError }
      }
    },
    meHandler
  );

  app.post(
    '/logout',
    {
      preHandler: [app.authenticate]
    },
    logoutHandler
  );
}
