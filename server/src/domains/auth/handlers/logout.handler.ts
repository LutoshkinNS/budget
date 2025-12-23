import type { FastifyReply, FastifyRequest } from 'fastify';

export async function logoutHandler(_req: FastifyRequest, reply: FastifyReply) {
  return reply
    .clearCookie('accessToken', { path: '/' })
    .clearCookie('refreshToken', { path: '/api/v1/auth' })
    .send({ success: true });
}
