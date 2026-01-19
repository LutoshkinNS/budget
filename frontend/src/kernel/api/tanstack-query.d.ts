import "@tanstack/react-query";

import { BaseError } from "./ApiError.ts";

declare module "@tanstack/react-query" {
  interface Register {
    defaultError: BaseError;
  }
}
