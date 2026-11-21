import { validateHeaderValue } from 'node:http';

import { ERROR_HANDLER } from './constants.js';

const HTTP_TOKEN = /^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/;

type ErrorHeaderName =
  (typeof ERROR_HANDLER.header)[keyof typeof ERROR_HANDLER.header];

type SafeErrorHeaders = Partial<Record<ErrorHeaderName, string | string[]>>;

const allowedHeaders = new Set<string>(Object.values(ERROR_HANDLER.header));

export function getSafeErrorHeaders(error: unknown): SafeErrorHeaders {
  const source = getRecordProperty(error, 'headers');
  if (!source) return {};

  let entries: Array<[string, unknown]>;
  try {
    entries = Object.entries(source);
  } catch {
    return {};
  }

  const seen = new Set<string>();
  const duplicateNames = new Set<string>();
  for (const [name] of entries) {
    const normalizedName = name.toLowerCase();
    if (seen.has(normalizedName)) duplicateNames.add(normalizedName);
    seen.add(normalizedName);
  }

  const safeHeaders: SafeErrorHeaders = {};
  for (const [name, value] of entries) {
    const normalizedName = name.toLowerCase();
    if (
      !allowedHeaders.has(normalizedName) ||
      duplicateNames.has(normalizedName)
    ) {
      continue;
    }

    const safeValue = getSafeValue(normalizedName, value);
    if (safeValue !== undefined) {
      if (normalizedName === ERROR_HANDLER.header.wwwAuthenticate) {
        safeHeaders[ERROR_HANDLER.header.wwwAuthenticate] = safeValue;
      } else if (normalizedName === ERROR_HANDLER.header.retryAfter) {
        safeHeaders[ERROR_HANDLER.header.retryAfter] = safeValue;
      } else if (normalizedName === ERROR_HANDLER.header.allow) {
        safeHeaders.allow = safeValue;
      }
    }
  }

  return safeHeaders;
}

function getSafeValue(
  name: string,
  value: unknown
): string | string[] | undefined {
  const values = Array.isArray(value) ? value : [value];
  if (
    values.length === 0 ||
    !values.every((item): item is string => isSafeHeaderText(name, item))
  ) {
    return undefined;
  }

  if (name === ERROR_HANDLER.header.wwwAuthenticate) {
    return Array.isArray(value) ? values : values[0];
  }
  if (name === ERROR_HANDLER.header.allow && Array.isArray(value)) {
    const combinedValue = values.join(', ');
    return isAllow(combinedValue) ? combinedValue : undefined;
  }
  if (values.length !== 1) return undefined;

  const text = values[0];
  if (text === undefined) return undefined;
  if (name === ERROR_HANDLER.header.retryAfter && !isRetryAfter(text)) {
    return undefined;
  }
  if (name === ERROR_HANDLER.header.allow && !isAllow(text)) {
    return undefined;
  }

  return text;
}

function isSafeHeaderText(name: string, value: unknown): value is string {
  if (
    typeof value !== 'string' ||
    value.length === 0
  ) {
    return false;
  }

  try {
    validateHeaderValue(name, value);
    return true;
  } catch {
    return false;
  }
}

function isRetryAfter(value: string): boolean {
  if (/^\d+$/.test(value)) return true;

  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date.toUTCString() === value;
}

function isAllow(value: string): boolean {
  return value.split(',').every((method) => HTTP_TOKEN.test(method.trim()));
}

function getRecordProperty(value: unknown, property: string): object | undefined {
  if (typeof value !== 'object' || value === null) return undefined;

  try {
    const propertyValue: unknown = Reflect.get(value, property);
    return typeof propertyValue === 'object' && propertyValue !== null
      ? propertyValue
      : undefined;
  } catch {
    return undefined;
  }
}
