/**
 * Sentry Error Tracking Integration
 * Requires: npm install @sentry/nextjs
 * 
 * This is a stub implementation that works without Sentry installed.
 * Install @sentry/nextjs when ready to enable error tracking.
 */

let Sentry: any = null;

try {
  Sentry = require("@sentry/nextjs");
} catch (e) {
  // Sentry not installed - gracefully continue without it
  console.log("@sentry/nextjs not installed - error tracking disabled");
}

export function initSentry() {
  if (!Sentry) {
    console.log("Sentry not available - error tracking disabled");
    return;
  }

  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    console.log("Sentry DSN not configured - error tracking disabled");
    return;
  }

  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    integrations: [
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true
      })
    ],
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0
  });
}

/**
 * Capture exception with context
 */
export function captureException(
  error: Error,
  context?: Record<string, any>,
  level: "fatal" | "error" | "warning" | "info" = "error"
) {
  if (!Sentry || !process.env.NEXT_PUBLIC_SENTRY_DSN) return;

  Sentry.captureException(error, {
    level,
    contexts: {
      custom: context
    }
  });

  console.error("[Sentry]", error.message, context);
}

/**
 * Capture message with context
 */
export function captureMessage(
  message: string,
  context?: Record<string, any>,
  level: "debug" | "info" | "warning" | "error" | "fatal" = "info"
) {
  if (!Sentry || !process.env.NEXT_PUBLIC_SENTRY_DSN) return;

  Sentry.captureMessage(message, level);
  console.log(`[Sentry] ${level.toUpperCase()}: ${message}`, context);
}

/**
 * Set user context for tracking
 */
export function setUserContext(userId: string, email?: string, name?: string) {
  if (!Sentry || !process.env.NEXT_PUBLIC_SENTRY_DSN) return;

  Sentry.setUser({
    id: userId,
    email,
    username: name
  });
}

/**
 * Clear user context
 */
export function clearUserContext() {
  if (!Sentry || !process.env.NEXT_PUBLIC_SENTRY_DSN) return;
  Sentry.setUser(null);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
  message: string,
  data?: Record<string, any>,
  category: string = "custom",
  level: "debug" | "info" | "warning" | "error" = "info"
) {
  if (!Sentry || !process.env.NEXT_PUBLIC_SENTRY_DSN) return;

  Sentry.addBreadcrumb({
    message,
    data,
    category,
    level,
    timestamp: Date.now() / 1000
  });
}

/**
 * Wrap async function with error tracking
 */
export function wrapAsync<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context?: { name?: string; [key: string]: any }
) {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args);
    } catch (error) {
      captureException(error as Error, {
        functionName: context?.name || fn.name,
        ...context
      });
      return null;
    }
  };
}

/**
 * Report API error
 */
export function reportApiError(
  endpoint: string,
  method: string,
  statusCode: number,
  error: string,
  context?: Record<string, any>
) {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;

  Sentry.captureMessage(
    `API Error: ${method} ${endpoint} (${statusCode})`,
    "error"
  );

  addBreadcrumb(
    `API Error: ${endpoint}`,
    {
      method,
      statusCode,
      error,
      ...context
    },
    "api",
    "error"
  );
}

export default {
  initSentry,
  captureException,
  captureMessage,
  setUserContext,
  clearUserContext,
  addBreadcrumb,
  wrapAsync,
  reportApiError
};
