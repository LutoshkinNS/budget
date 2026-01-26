import Account from '#s/Account.js';
import UnauthorizedError from '#s/UnauthorizedError.js';
import type { FastifyApp } from '#src/appInit.js';

import { accountsHandler } from './handlers/accounts.handler.js';

export default async function accountsRoutes(app: FastifyApp) {
  app.get(
    '/',
    {
      preHandler: [app.authenticate],
      schema: {
        response: {
          200: { type: 'array', items: Account },
          401: UnauthorizedError
        }
      }
    },
    accountsHandler
  );
}
