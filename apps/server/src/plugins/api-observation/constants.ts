export const API_OBSERVATION = {
  runtime: 'server',
  event: {
    httpCompleted: 'http-completed'
  },
  operation: {
    categoriesList: 'categoriesList',
    unknown: 'unknown-operation'
  },
  method: {
    get: 'GET',
    post: 'POST',
    put: 'PUT',
    patch: 'PATCH',
    delete: 'DELETE',
    options: 'OPTIONS',
    head: 'HEAD',
    other: 'OTHER'
  },
  outcome: {
    success: 'success',
    httpError: 'http-error',
    cancelled: 'cancelled'
  },
  pluginName: 'apiObservation',
  hook: {
    request: 'onRequest',
    response: 'onResponse',
    close: 'onClose'
  },
  socketEvent: {
    aborted: 'aborted',
    close: 'close'
  },
  routeSuffix: {
    categoriesWithSlash: '/categories/',
    categories: '/categories'
  },
  httpErrorThreshold: 400,
  promiseThenType: 'function'
} as const;
