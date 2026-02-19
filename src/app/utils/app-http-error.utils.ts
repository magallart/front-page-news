import type { AppHttpError } from '../interfaces/app-http-error.interface';

export function isAppHttpError(error: unknown): error is AppHttpError {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const record = error as Record<string, unknown>;
  return record['name'] === 'AppHttpError' && typeof record['userMessage'] === 'string';
}

export function getUserErrorMessage(error: unknown, fallback: string): string {
  if (isAppHttpError(error)) {
    const normalizedUserMessage = error.userMessage.trim();
    if (normalizedUserMessage.length > 0) {
      return normalizedUserMessage;
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallback;
}
