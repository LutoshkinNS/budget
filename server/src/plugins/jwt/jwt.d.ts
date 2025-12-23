/* eslint-disable @typescript-eslint/no-unused-vars */
import type { FastifyJwtNamespace } from '@fastify/jwt';
import type { FastifyReply, FastifyRequest } from 'fastify';

import '@fastify/jwt';

type AccessTokenPayload = {
  userId: number;
  accountId: number;
};

type RefreshTokenPayload = AccessTokenPayload & {
  type: 'refresh';
};

declare module 'fastify' {
  interface FastifyInstance
    extends
      FastifyJwtNamespace<{
        jwtDecode: 'accessJwtDecode';
        jwtSign: 'accessJwtSign';
        jwtVerify: 'accessJwtVerify';
      }>,
      FastifyJwtNamespace<{
        jwtDecode: 'refreshJwtDecode';
        jwtSign: 'refreshJwtSign';
        jwtVerify: 'refreshJwtVerify';
      }> {
    authenticate: (request: FastifyRequest) => Promise<void>;
  }

  interface FastifyRequest {
    accessJwtVerify(): Promise<void>;
    refreshJwtVerify(): Promise<void>;
  }

  interface FastifyReply {
    accessJwtSign(payload: AccessTokenPayload): Promise<string>;
    refreshJwtSign(payload: RefreshTokenPayload): Promise<string>;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: AccessTokenPayload;
  }
}
