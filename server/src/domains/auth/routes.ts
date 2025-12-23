import LoginRequest from '#s/LoginRequest.js';
import NoAccountError from '#s/NoAccountError.js';
import SuccessResponse from '#s/SuccessResponse.js';
import UnauthorizedError from '#s/UnauthorizedError.js';
import UserInfo from '#s/UserInfo.js';
import type { FastifyApp } from '#src/appInit.ts';

import { loginHandler } from './handlers/login.handler.ts';
import { logoutHandler } from './handlers/logout.handler.ts';
import { meHandler } from './handlers/me.handler.ts';
import { refreshHandler } from './handlers/refresh.handler.ts';

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
        response: { 200: UserInfo }
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
