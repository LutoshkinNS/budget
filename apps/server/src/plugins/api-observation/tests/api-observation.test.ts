import { execFileSync } from 'node:child_process';
import { once } from 'node:events';
import { get } from 'node:http';
import { dirname, resolve } from 'node:path';
import { setImmediate } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

import fastify from 'fastify';
import { describe, expect, it } from 'vitest';

import apiObservationPlugin from '../api-observation.js';
import type { ApiObservation } from '../types.js';

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((accept) => {
    resolve = accept;
  });
  return { promise, resolve };
}

describe('server API observation lifecycle', () => {
  it('observes a route registered later by a sibling plugin', async () => {
    const events: ApiObservation[] = [];
    const app = fastify({ logger: false });
    try {
      await app.register(apiObservationPlugin, {
        observe: (event) => {
          events.push(event);
        }
      });
      await app.register(async (routes) => {
        routes.get('/api/v1/accounts/:accountId/categories', async () => []);
      });
      const response = await app.inject('/api/v1/accounts/42/categories');
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual([]);
      expect(events).toEqual([
        expect.objectContaining({
          runtime: 'server',
          event: 'http-completed',
          operation: 'categoriesList',
          method: 'GET',
          outcome: 'success',
          status: 200
        })
      ]);
    } finally {
      await app.close();
    }
  });

  it('completes a disconnected fully received deferred GET exactly once', async () => {
    const events: ApiObservation[] = [];
    const app = fastify({ logger: false });
    await app.register(apiObservationPlugin, {
      observe: (event) => {
        events.push(event);
      }
    });
    const entered = deferred<boolean>();
    const release = deferred<void>();
    const disconnected = deferred<void>();
    const finished = deferred<void>();
    app.get(
      '/api/v1/accounts/:accountId/categories',
      async (request, reply) => {
        reply.raw.once('close', () => disconnected.resolve());
        if (!request.raw.complete) {
          const ended = once(request.raw, 'end');
          request.raw.resume();
          await ended;
        }
        entered.resolve(request.raw.complete);
        await release.promise;
        finished.resolve();
        return [];
      }
    );
    const url = await app.listen({ host: '127.0.0.1', port: 0 });
    const client = get(url + '/api/v1/accounts/42/categories');
    client.on('error', () => undefined);
    try {
      expect(await entered.promise).toBe(true);
      client.destroy();
      await disconnected.promise;
      await setImmediate();
      expect(events).toEqual([
        expect.objectContaining({
          runtime: 'server',
          event: 'http-completed',
          operation: 'categoriesList',
          method: 'GET',
          outcome: 'cancelled'
        })
      ]);
      release.resolve();
      await finished.promise;
      await setImmediate();
      expect(events).toHaveLength(1);
    } finally {
      client.destroy();
      release.resolve();
      await app.close();
    }
  });

  it('catches a deferred sink rejection after app close without another emission', async () => {
    const events: ApiObservation[] = [];
    let reject!: (reason: Error) => void;
    const sink = new Promise<void>((_resolve, fail) => {
      reject = fail;
    });
    const app = fastify({ logger: false });
    await app.register(apiObservationPlugin, {
      observe: (event) => {
        events.push(event);
        return sink;
      }
    });
    app.get('/categories', async () => []);
    const response = await app.inject('/categories');
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual([]);
    await app.close();
    reject(new Error('Pilot sink failed after close'));
    await setImmediate();
    await expect(app.inject('/categories')).rejects.toThrow();
    expect(events).toHaveLength(1);
  });

  it('serializes actual app logs and events without synthetic request secrets', () => {
    const serverRoot = resolve(
      dirname(fileURLToPath(import.meta.url)),
      '../../../..'
    );
    const script = `
      import appInit from './src/app-init.ts';
      const app = await appInit({ observe: event => { console.log(JSON.stringify(event)); } });
      app.get('/api/v1/accounts/:accountId/categories', {
        schema: { querystring: { type: 'object', properties: { type: { type: 'string', enum: ['expense'] } } } }
      }, async () => []);
      const response = await app.inject({
        url: '/api/v1/accounts/42/categories?type=pilot-private-query',
        headers: { cookie: 'accessToken=pilot-private-cookie', authorization: 'Bearer pilot-private-header', 'user-agent': 'pilot-private-agent' }
      });
      console.log(JSON.stringify({ pilotResponse: { status: response.statusCode, body: response.json() } }));
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
          DATABASE_URL: 'file:pilot-unused.db',
          PORT: '3000',
          JWT_SECRET: 'pilot-safe-log-secret',
          FRONTEND_URL: 'http://127.0.0.1:3001',
          NODE_ENV: 'test',
          TELEGRAM_BOT_TOKEN: 'pilot-safe-log-token'
        }
      }
    );
    const records: unknown[] = output
      .trim()
      .split(/\r?\n/)
      .map((line) => JSON.parse(line));
    expect(records).toContainEqual(
      expect.objectContaining({ msg: 'request_error', category: 'validation' })
    );
    expect(records).toContainEqual(
      expect.objectContaining({
        event: 'http-completed',
        operation: 'categoriesList',
        outcome: 'http-error',
        status: 400
      })
    );
    expect(records).toContainEqual({
      pilotResponse: {
        status: 400,
        body: {
          message: 'Некорректные параметры запроса.',
          statusCode: 400
        }
      }
    });
    for (const secret of [
      'pilot-private-query',
      'pilot-private-cookie',
      'pilot-private-header',
      'pilot-private-agent',
      '/api/v1/accounts/42'
    ]) {
      expect(output).not.toContain(secret);
    }
    console.log(output);
  });
});
