import type { API_OBSERVATION } from './constants.js';

export type ApiObservation = {
  runtime: typeof API_OBSERVATION.runtime;
  event: typeof API_OBSERVATION.event.httpCompleted;
  operation: (typeof API_OBSERVATION.operation)[keyof typeof API_OBSERVATION.operation];
  method: (typeof API_OBSERVATION.method)[keyof typeof API_OBSERVATION.method];
  outcome: (typeof API_OBSERVATION.outcome)[keyof typeof API_OBSERVATION.outcome];
  status?: number;
  durationMs: number;
};

export type ApiObserver = (event: ApiObservation) => void | Promise<void>;

export type ApiObservationOptions = {
  observe?: ApiObserver;
};

export type RequestCompletion = {
  startedAt: bigint;
  completed: boolean;
};
