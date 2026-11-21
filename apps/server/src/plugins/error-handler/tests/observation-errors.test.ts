import { setImmediate } from 'node:timers/promises';

import fastify from 'fastify';
import { expect, it } from 'vitest';

import apiObservationPlugin from '../../api-observation/api-observation.js';
import type { ApiObservation } from '../../api-observation/types.js';
import errorHandlerPlugin from '../error-handler-plugin.js';

const MODES = ['noop', 'collector', 'throw', 'reject'] as const;
const ROUTE = '/api/v1/accounts/:accountId/categories';
const URL = '/api/v1/accounts/42/categories';
const OBSERVER_FAILURE = 'private-observer-failure';

it.each(MODES)(
  'keeps safe500 and a single completion with a %s observer',
  async (mode) => {
    const events: ApiObservation[] = [];
    const app = fastify({ logger: false });
    try {
      await app.register(
        apiObservationPlugin,
        mode === 'noop'
          ? {}
          : {
              observe: (event) => {
                events.push(event);
                if (mode === 'throw') throw new Error(OBSERVER_FAILURE);
                if (mode === 'reject')
                  return Promise.reject(new Error(OBSERVER_FAILURE));
              }
            }
      );
      await app.register(errorHandlerPlugin);
      await app.register(async (routes) => {
        routes.get(ROUTE, async () => {
          throw new Error('private-original-failure');
        });
      });

      const response = await app.inject(URL);
      await setImmediate();
      expect(response.statusCode).toBe(500);
      expect(response.json()).toEqual({
        message: expect.stringMatching(/\S/),
        statusCode: 500
      });
      if (mode === 'noop') expect(events).toEqual([]);
      else
        expect(events).toEqual([
          {
            runtime: 'server',
            event: 'http-completed',
            operation: 'categoriesList',
            method: 'GET',
            outcome: 'http-error',
            status: 500,
            durationMs: expect.any(Number)
          }
        ]);
      expect(JSON.stringify(events)).not.toContain('private-');
      for (const event of events)
        expect(event.durationMs).toBeGreaterThanOrEqual(0);
    } finally {
      await app.close();
    }
  }
);

it('isolates two apps and catches a pending observer rejection after the first app closes', async () => {
  const firstEvents: ApiObservation[] = [];
  const secondEvents: ApiObservation[] = [];
  let rejectSink!: (reason: Error) => void;
  const sink = new Promise<void>((_resolve, reject) => {
    rejectSink = reject;
  });
  const first = fastify({ logger: false });
  const second = fastify({ logger: false });
  try {
    await first.register(apiObservationPlugin, {
      observe: (event) => {
        firstEvents.push(event);
        return sink;
      }
    });
    await second.register(apiObservationPlugin, {
      observe: (event) => {
        secondEvents.push(event);
      }
    });
    await first.register(errorHandlerPlugin);
    await second.register(errorHandlerPlugin);
    expect((await first.inject(URL)).statusCode).toBe(404);
    await first.close();
    rejectSink(new Error(OBSERVER_FAILURE));
    await setImmediate();
    expect((await second.inject(URL)).statusCode).toBe(404);
    expect(firstEvents).toHaveLength(1);
    expect(secondEvents).toHaveLength(1);
    expect(firstEvents[0]).toMatchObject({
      status: 404,
      outcome: 'http-error'
    });
    expect(secondEvents[0]).toMatchObject({
      status: 404,
      outcome: 'http-error'
    });
  } finally {
    await first.close();
    await second.close();
  }
});
