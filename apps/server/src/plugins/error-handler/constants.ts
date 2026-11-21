export const ERROR_HANDLER = {
  category: {
    validation: 'validation',
    authentication: 'authentication',
    notFound: 'not-found',
    unknown: 'unknown'
  },
  phase: {
    request: 'request',
    parser: 'parser',
    jwt: 'jwt',
    router: 'router',
    handler: 'handler'
  },
  header: {
    wwwAuthenticate: 'www-authenticate',
    retryAfter: 'retry-after',
    allow: 'allow'
  },
  logMessage: {
    requestError: 'request_error'
  },
  pluginName: 'error-handler'
} as const;
