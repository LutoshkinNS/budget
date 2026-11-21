export const ERROR_HANDLER = {
  category: {
    validation: 'validation',
    authentication: 'authentication',
    notFound: 'not-found',
    unknown: 'unknown'
  },
  phase: {
    router: 'router',
    handler: 'handler'
  },
  logMessage: {
    requestError: 'request_error'
  },
  pluginName: 'error-handler'
} as const;
