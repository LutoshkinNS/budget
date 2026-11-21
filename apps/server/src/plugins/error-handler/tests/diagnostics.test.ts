import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, it } from 'vitest';

const SECRETS = {
  code: 'private-secret-driver-code',
  name: 'private-secret-class-name',
  message: 'private-secret-password',
  stack: 'private-secret-stack-path',
  cause: 'private-secret-nested-cause',
  query: 'private-secret-query',
  cookie: 'private-secret-cookie',
  authorization: 'private-secret-authorization',
  userAgent: 'private-secret-user-agent',
  body: 'private-secret-request-body',
  rawUrl: 'private-secret-raw-url'
} as const;
const REQUEST_ERROR_MESSAGE = 'request_error';
const SAFE_MESSAGES = {
  internal: 'Внутренняя ошибка сервера.',
  validation: 'Некорректные параметры запроса.',
  unauthorized: 'Требуется действительная авторизация.',
  notFound: 'Запрошенный ресурс не найден.'
} as const;
const LOG_KEYS = [
  'category',
  'phase',
  'hostname',
  'level',
  'msg',
  'pid',
  'reqId',
  'requestId',
  'statusCode',
  'time'
] as const;

function isRequestErrorRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'msg' in value &&
    value.msg === REQUEST_ERROR_MESSAGE
  );
}

it('logs only the diagnostic allowlist from the actual app and preserves status diagnostics', () => {
  const serverRoot = resolve(
    dirname(fileURLToPath(import.meta.url)),
    '../../../..'
  );
  const script = `
    import appInit from './src/app-init.ts';
    const secrets = ${JSON.stringify(SECRETS)};
    const app = await appInit();
    const capturedResponses = [];
    async function capture(input) {
      const response = await app.inject(input);
      capturedResponses.push({ status: response.statusCode, body: response.json() });
    }
    app.get('/categories', {
      schema: { querystring: { type: 'object', properties: { type: { type: 'string', enum: ['expense'] } } } }
    }, async () => []);
    app.get('/fail', async () => {
      throw Object.assign(new Error(secrets.message), {
        code: secrets.code, name: secrets.name, stack: secrets.stack,
        cause: { password: secrets.cause }
      });
    });
    app.get('/protected', { preHandler: app.authenticate }, async () => []);
    app.get('/without-cookie-parser', {
      preHandler: async (request) => {
        request.cookies = undefined;
        await request.accessJwtVerify();
      }
    }, async () => []);
    app.get('/mint-expired', async (_request, reply) => reply.accessJwtSign({ userId: 1, exp: 1 }));
    app.get('/mint-valid', async (_request, reply) => reply.accessJwtSign({ userId: 1 }));
    app.post('/body', async () => []);
    const headers = {
      cookie: 'accessToken=' + secrets.cookie,
      authorization: 'Bearer ' + secrets.authorization,
      'user-agent': secrets.userAgent
    };
    await capture({ url: '/fail?token=' + secrets.query, headers });
    await capture({ url: '/categories?type=' + secrets.query, headers });
    await capture({ method: 'POST', url: '/body', headers: { 'content-type': 'application/json' }, payload: JSON.stringify({ password: secrets.body }).slice(0, -1) });
    await capture('/protected');
    const expired = (await app.inject('/mint-expired')).body;
    await capture({ url: '/protected', headers: { authorization: 'Bearer ' + expired } });
    await capture({ url: '/protected', headers: { authorization: 'Bearer ' + secrets.authorization + ' extra' } });
    await capture('/without-cookie-parser');
    const valid = (await app.inject('/mint-valid')).body;
    const tokenParts = valid.split('.');
    const signedContent = tokenParts.slice(0, 2).join('.');
    await capture({ url: '/protected', headers: { authorization: 'Bearer ' + signedContent + '.' + secrets.authorization } });
    await capture({ url: '/protected', headers: { authorization: 'Bearer ' + signedContent + '.' } });
    await capture({ url: '/' + secrets.rawUrl, headers });
    console.log(JSON.stringify({ capturedResponses }));
    await app.close();
    await app.prisma.$disconnect();
  `;
  const output = execFileSync(
    process.execPath,
    ['--import', 'tsx', '--input-type=module', '-e', script],
    {
      cwd: serverRoot,
      encoding: 'utf8',
      timeout: 15_000,
      windowsHide: true,
      env: {
        ...process.env,
        DATABASE_URL: 'file:diagnostics-unused.db',
        PORT: '3000',
        JWT_SECRET: 'diagnostics-isolated-key',
        FRONTEND_URL: 'http://127.0.0.1:3001',
        NODE_ENV: 'test',
        TELEGRAM_BOT_TOKEN: 'diagnostics-test-token'
      }
    }
  );
  const records: unknown[] = output
    .trim()
    .split(/\r?\n/)
    .map((line) => JSON.parse(line));
  const errors = records.filter(isRequestErrorRecord);

  expect(errors).toHaveLength(10);
  expect(errors.map((record) => record.level)).toEqual([
    50, 40, 40, 40, 40, 40, 40, 40, 40, 40
  ]);
  expect(errors.map((record) => record.statusCode)).toEqual([
    500, 400, 400, 401, 401, 400, 400, 401, 401, 404
  ]);
  const responseRecord = records.find(
    (record): record is { capturedResponses: unknown } =>
      typeof record === 'object' &&
      record !== null &&
      'capturedResponses' in record
  );
  expect(responseRecord?.capturedResponses).toEqual([
    {
      status: 500,
      body: {
        message: SAFE_MESSAGES.internal,
        statusCode: 500
      }
    },
    {
      status: 400,
      body: {
        message: SAFE_MESSAGES.validation,
        statusCode: 400
      }
    },
    {
      status: 400,
      body: {
        message: SAFE_MESSAGES.validation,
        statusCode: 400
      }
    },
    {
      status: 401,
      body: {
        message: SAFE_MESSAGES.unauthorized,
        statusCode: 401
      }
    },
    {
      status: 401,
      body: {
        message: SAFE_MESSAGES.unauthorized,
        statusCode: 401
      }
    },
    {
      status: 400,
      body: {
        message: SAFE_MESSAGES.validation,
        statusCode: 400
      }
    },
    {
      status: 400,
      body: {
        message: SAFE_MESSAGES.validation,
        statusCode: 400
      }
    },
    {
      status: 401,
      body: {
        message: SAFE_MESSAGES.unauthorized,
        statusCode: 401
      }
    },
    {
      status: 401,
      body: {
        message: SAFE_MESSAGES.unauthorized,
        statusCode: 401
      }
    },
    {
      status: 404,
      body: {
        message: SAFE_MESSAGES.notFound,
        statusCode: 404
      }
    }
  ]);
  for (const record of errors) {
    expect(Object.keys(record).sort()).toEqual([...LOG_KEYS].sort());
    expect(record.requestId).toEqual(expect.stringMatching(/\S/));
    expect(record.requestId).toBe(record.reqId);
    expect(['validation', 'authentication', 'not-found', 'unknown']).toContain(
      record.category
    );
    expect(['request', 'parser', 'jwt', 'router', 'handler']).toContain(
      record.phase
    );
  }
  for (const secret of Object.values(SECRETS))
    expect(output).not.toContain(secret);
});
