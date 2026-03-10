import Account from '#s/Account.js';
import AccountInvitation from '#s/AccountInvitation.js';
import RedeemInvitationRequest from '#s/RedeemInvitationRequest.js';
import UnauthorizedError from '#s/UnauthorizedError.js';
import type { FastifyApp } from '#src/appInit.js';

import { accountsHandler } from './handlers/accounts.handler.js';
import { createInvitationHandler } from './handlers/createInvitation.handler.js';
import { redeemInvitationHandler } from './handlers/redeemInvitation.handler.js';

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

  app.post(
    '/:accountId/invitations',
    {
      preHandler: [app.authenticate],
      schema: {
        response: {
          200: AccountInvitation,
          401: UnauthorizedError
        }
      }
    },
    createInvitationHandler
  );

  app.post(
    '/invitations/redeem',
    {
      preHandler: [app.authenticate],
      schema: {
        body: RedeemInvitationRequest,
        response: {
          200: AccountInvitation,
          401: UnauthorizedError
        }
      }
    },
    redeemInvitationHandler
  );
}
