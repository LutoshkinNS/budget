import fastifyJwt from '@fastify/jwt';
import fastifyCors from '@fastify/cors';
import type { FastifyApp } from '#src/appInit.ts';

async function jwtPlugin(app: FastifyApp) {

    await app.register(fastifyCors, {
        origin: app.envs.FRONTEND_URL,
        credentials: true
    });

    await app.register(fastifyJwt, {
        secret: app.envs.JWT_SECRET,
        sign: {
            expiresIn: '15m'
        },
        cookie: {
            cookieName: 'accessToken',
            signed: false
        }
    });

    app.decorate('authenticate', async function(request, reply) {
        try {
            await request.jwtVerify();
        } catch (err) {
            reply.code(401).send({
                code: 'Не авторизован',
                message: 'Неправильный или истекший токен'
            });
        }
    });
}

(jwtPlugin as any)[Symbol.for('skip-override')] = true;

export default jwtPlugin;
