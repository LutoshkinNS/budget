import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

import { API_OBSERVATION } from './constants.js';
import type {
  ApiObservation,
  ApiObservationOptions,
  RequestCompletion
} from './types.js';

function getOperation(request: FastifyRequest): ApiObservation['operation'] {
  const route = request.routeOptions.url;
  if (
    request.method === API_OBSERVATION.method.get &&
    route &&
    (route.endsWith(API_OBSERVATION.routeSuffix.categoriesWithSlash) ||
      route.endsWith(API_OBSERVATION.routeSuffix.categories))
  ) {
    return API_OBSERVATION.operation.categoriesList;
  }

  return API_OBSERVATION.operation.unknown;
}

function getMethod(method: string): ApiObservation['method'] {
  switch (method) {
    case API_OBSERVATION.method.get:
    case API_OBSERVATION.method.post:
    case API_OBSERVATION.method.put:
    case API_OBSERVATION.method.patch:
    case API_OBSERVATION.method.delete:
    case API_OBSERVATION.method.options:
    case API_OBSERVATION.method.head:
      return method;
    default:
      return API_OBSERVATION.method.other;
  }
}

async function apiObservationPlugin(
  app: FastifyInstance,
  options: ApiObservationOptions
) {
  const { observe } = options;
  const requestStates = new WeakMap<FastifyRequest, RequestCompletion>();
  let closed = false;

  function safeObserve(event: ApiObservation) {
    if (!observe || closed) return;

    try {
      const result = observe(event);
      if (result && typeof result.then === API_OBSERVATION.promiseThenType) {
        void result.catch(() => undefined);
      }
    } catch {
      // Сбой приёмника не должен влиять на HTTP-ответ.
    }
  }

  function complete(
    request: FastifyRequest,
    reply: FastifyReply,
    outcome: ApiObservation['outcome']
  ) {
    const state = requestStates.get(request);
    if (!state || state.completed) return;
    state.completed = true;

    const elapsed =
      Number(process.hrtime.bigint() - state.startedAt) / 1_000_000;
    const durationMs = Number.isFinite(elapsed) ? Math.max(0, elapsed) : 0;

    safeObserve({
      runtime: API_OBSERVATION.runtime,
      event: API_OBSERVATION.event.httpCompleted,
      operation: getOperation(request),
      method: getMethod(request.method),
      outcome,
      ...(outcome === API_OBSERVATION.outcome.cancelled
        ? {}
        : { status: reply.statusCode }),
      durationMs
    });
  }

  app.addHook(API_OBSERVATION.hook.request, (request, reply, done) => {
    requestStates.set(request, {
      startedAt: process.hrtime.bigint(),
      completed: false
    });
    request.raw.once(API_OBSERVATION.socketEvent.aborted, () => {
      complete(request, reply, API_OBSERVATION.outcome.cancelled);
    });
    reply.raw.once(API_OBSERVATION.socketEvent.close, () => {
      if (!reply.raw.writableFinished) {
        complete(request, reply, API_OBSERVATION.outcome.cancelled);
      }
    });
    done();
  });

  app.addHook(API_OBSERVATION.hook.response, (request, reply, done) => {
    complete(
      request,
      reply,
      reply.statusCode >= API_OBSERVATION.httpErrorThreshold
        ? API_OBSERVATION.outcome.httpError
        : API_OBSERVATION.outcome.success
    );
    done();
  });

  app.addHook(API_OBSERVATION.hook.close, (_instance, done) => {
    closed = true;
    done();
  });
}

export default fp(apiObservationPlugin, {
  name: API_OBSERVATION.pluginName
});
