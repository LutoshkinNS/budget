import Account from '#s/Account.ts';
import UnauthorizedError from '#s/UnauthorizedError.ts';
import type { FastifyApp } from '#src/appInit.ts';

import { accountsHandler } from './handlers/accounts.handler.ts';

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
