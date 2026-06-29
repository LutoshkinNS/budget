import AuthClientEvent from '#s/AuthClientEvent.js';
import LoginRequest from '#s/LoginRequest.js';
import NoAccountError from '#s/NoAccountError.js';
import SuccessResponse from '#s/SuccessResponse.js';
import SwitchAccountRequest from '#s/SwitchAccountRequest.js';
import UnauthorizedError from '#s/UnauthorizedError.js';
import UserInfo from '#s/UserInfo.js';
import type { FastifyApp } from '#src/appInit.js';

import { clientEventHandler } from './handlers/clientEvent.handler.js';
import { devLoginHandler } from './handlers/devLogin.handler.js';
import { loginHandler } from './handlers/login.handler.js';
import { logoutHandler } from './handlers/logout.handler.js';
import { meHandler } from './handlers/me.handler.js';
import { refreshHandler } from './handlers/refresh.handler.js';
import { switchAccountHandler } from './handlers/switchAccount.handler.js';

export default async function authRoutes(app: FastifyApp) {
  if (process.env.NODE_ENV !== 'production') {
    app.get('/dev-login', devLoginHandler);
  }

  app.post(
    '/client-event',
    {
      schema: {
        body: AuthClientEvent,
        response: { 200: SuccessResponse }
      }
    },
    clientEventHandler
  );

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

  app.post(
    '/switch-account',
    {
      preHandler: [app.authenticate],
      schema: {
        body: SwitchAccountRequest,
        response: { 200: SuccessResponse, 401: UnauthorizedError }
      }
    },
    switchAccountHandler
  );
}
