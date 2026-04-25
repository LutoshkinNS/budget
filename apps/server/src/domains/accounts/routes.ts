import Account from '#s/Account.js';
import AccountInvitation from '#s/AccountInvitation.js';
import AccountMember from '#s/AccountMember.js';
import AccountUpdate from '#s/AccountUpdate.js';
import RedeemInvitationRequest from '#s/RedeemInvitationRequest.js';
import UnauthorizedError from '#s/UnauthorizedError.js';
import type { FastifyApp } from '#src/appInit.js';

import { accountsHandler } from './handlers/accounts.handler.js';
import { createInvitationHandler } from './handlers/createInvitation.handler.js';
import { listMembersHandler } from './handlers/listMembers.handler.js';
import { redeemInvitationHandler } from './handlers/redeemInvitation.handler.js';
import {
  updateAccountHandler,
  type UpdateBody,
  type UpdateParams
} from './handlers/update.handler.js';

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

  app.get<{ Params: { accountId: number } }>(
    '/:accountId/members',
    {
      preHandler: [app.authenticate],
      schema: {
        params: {
          type: 'object',
          properties: { accountId: { type: 'integer' } },
          required: ['accountId']
        },
        response: {
          200: { type: 'array', items: AccountMember },
          401: UnauthorizedError
        }
      }
    },
    listMembersHandler
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

  app.patch<{ Params: UpdateParams; Body: UpdateBody }>(
    '/:accountId',
    {
      preHandler: [app.authenticate],
      schema: {
        body: AccountUpdate,
        response: { 200: Account, 401: UnauthorizedError }
      }
    },
    updateAccountHandler
  );
}
