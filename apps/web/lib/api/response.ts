import type { ApiFailure, ApiResponse } from "@menuflow/shared";

export function success<T>(data: T): ApiResponse<T> {
  return { ok: true, data };
}

export function failure(message: string, code?: string): ApiFailure {
  return {
    ok: false,
    error: {
      message,
      code
    }
  };
}
