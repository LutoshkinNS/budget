import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { clientEventHandler } from './clientEvent.handler.js';

describe('clientEventHandler', () => {
  it('logs a sanitized client auth event and acknowledges it', async () => {
    const entries: unknown[] = [];
    const request = {
      body: {
        event: 'auth_callback',
        buildVersion: 'build-123',
        attemptId: 'attempt-123',
        displayMode: 'standalone',
        online: true
      },
      headers: {
        'user-agent': 'test-agent',
        origin: 'https://budget-best.ru',
        referer: 'https://budget-best.ru/login'
      },
      log: {
        info(entry: unknown) {
          entries.push(entry);
        }
      }
    };

    const result = await clientEventHandler(request as never);

    assert.deepEqual(result, { success: true });
    assert.deepEqual(entries, [
      {
        event: 'auth_client_event',
        clientEvent: 'auth_callback',
        buildVersion: 'build-123',
        attemptId: 'attempt-123',
        displayMode: 'standalone',
        online: true,
        userAgent: 'test-agent',
        origin: 'https://budget-best.ru',
        referer: 'https://budget-best.ru/login'
      }
    ]);
  });
});
