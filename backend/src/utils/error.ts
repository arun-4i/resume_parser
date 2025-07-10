import { logger } from "./logger";

// BASE ERROR CLASS

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = "INTERNAL_ERROR",
    isOperational: boolean = true,
    details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.details = details;

    // Capture stack trace (exclude constructor from stack)
    Error.captureStackTrace(this, this.constructor);
  }
}

// SPECIFIC ERROR CLASSES (For Service/Repository Layers)

export class ValidationError extends AppError {
  constructor(message: string, field?: string, value?: any) {
    super(message, 400, "VALIDATION_ERROR", true, { field, value });
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication failed") {
    super(message, 401, "AUTHENTICATION_ERROR", true);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "Access denied") {
    super(message, 403, "AUTHORIZATION_ERROR", true);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super(`${resource} not found`, 404, "NOT_FOUND_ERROR", true, { resource });
  }
}

export class ConflictError extends AppError {
  constructor(message: string, conflictField?: string) {
    super(message, 409, "CONFLICT_ERROR", true, { field: conflictField });
  }
}

export class DatabaseError extends AppError {
  constructor(
    message: string = "Database operation failed",
    originalError?: any
  ) {
    super(message, 500, "DATABASE_ERROR", true, {
      originalError: originalError?.message ?? originalError,
      errorCode: originalError?.code,
      sqlState: originalError?.sqlState,
    });
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message?: string, statusCode: number = 503) {
    super(
      message ?? `${service} service unavailable`,
      statusCode,
      "EXTERNAL_SERVICE_ERROR",
      true,
      { service }
    );
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = "Rate limit exceeded") {
    super(message, 429, "RATE_LIMIT_ERROR", true);
  }
}

export class BusinessLogicError extends AppError {
  constructor(message: string, businessRule?: string) {
    super(message, 422, "BUSINESS_LOGIC_ERROR", true, { businessRule });
  }
}

// ERROR HANDLER MIDDLEWARE

import type { Request, Response, NextFunction } from "express";
import { config } from "../config/env";

interface ErrorResponse {
  success: false;
  error: string;
  code: string;
  requestId?: string;
  timestamp: string;
  path?: string;
  details?: any;
  stack?: string;
}

export const errorHandler = (
  error: AppError | Error,
  req: Request,
  res: Response,
): void => {
  const requestId = (req as any).requestId ?? "unknown";
  const isProduction = config.NODE_ENV === "production";

  // Convert unknown errors to AppError
  let appError: AppError;
  if (error instanceof AppError) {
    appError = error;
  } else {
    // Handle known error types
    appError = handleKnownErrors(error);
  }

  // Log error with context
  const logLevel = appError.statusCode >= 500 ? "error" : "warn";
  logger[logLevel]("api", "Error handled by middleware", {
    requestId,
    userId: (req as any).user?.userId,
    errorName: appError.name,
    errorCode: appError.code,
    message: appError.message,
    statusCode: appError.statusCode,
    isOperational: appError.isOperational,
    path: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    stack: appError.stack,
    details: appError.details,
  });

  // Create response
  const errorResponse: ErrorResponse = {
    success: false,
    error: sanitizeErrorMessage(appError, isProduction),
    code: appError.code,
    requestId,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
  };

  // Add details in development
  if (!isProduction) {
    errorResponse.details = {
      originalMessage: appError.message,
      errorName: appError.name,
      isOperational: appError.isOperational,
      ...(appError.details && { errorDetails: appError.details }),
    };

    // Include stack trace for server errors
    if (appError.statusCode >= 500) {
      errorResponse.stack = appError.stack;
    }
  }

  // Send response
  res.status(appError.statusCode).json(errorResponse);

  // Alert for critical errors in production
  if (isProduction && appError.statusCode >= 500 && !appError.isOperational) {
    alertCriticalError(appError, requestId, req);
  }
};

// UTILITY FUNCTIONS

function handleKnownErrors(error: Error): AppError {
  // JWT Errors
  if (error.name === "JsonWebTokenError") {
    return new AuthenticationError("Invalid token");
  }
  if (error.name === "TokenExpiredError") {
    return new AuthenticationError("Token expired");
  }
  if (error.name === "NotBeforeError") {
    return new AuthenticationError("Token not active yet");
  }

  // Validation Errors (from libraries)
  if (error.name === "ValidationError") {
    return new ValidationError(error.message);
  }

  // Database Errors (Sequelize examples)
  if (error.name === "SequelizeValidationError") {
    return new ValidationError("Database validation failed", undefined, error);
  }
  if (error.name === "SequelizeUniqueConstraintError") {
    return new ConflictError("Duplicate entry found");
  }
  if (error.name === "SequelizeConnectionError") {
    return new DatabaseError("Database connection failed", error);
  }

  // Mongoose Errors (if using MongoDB)
  if (error.name === "CastError") {
    return new ValidationError("Invalid ID format");
  }
  if (error.name === "MongoError" && (error as any).code === 11000) {
    return new ConflictError("Duplicate entry found");
  }

  // HTTP/Network Errors
  if ((error as any).code === "ECONNREFUSED") {
    return new ExternalServiceError("database", "Database connection refused");
  }
  if ((error as any).code === "ETIMEDOUT") {
    return new ExternalServiceError("external", "Request timeout");
  }

  // Default: Unknown error
  return new AppError(
    "An unexpected error occurred",
    500,
    "INTERNAL_ERROR",
    false, // Not operational (programming error)
    { originalError: error.message }
  );
}

function sanitizeErrorMessage(error: AppError, isProduction: boolean): string {
  // In production, don't expose internal error details for non-operational errors
  if (isProduction && !error.isOperational) {
    return "An unexpected error occurred. Please try again later.";
  }

  // Sanitize specific error patterns
  let message = error.message;

  // Remove file paths
  message = message.replace(/\/[^\s]*\/[^\s]*/g, "[FILE_PATH]");

  // Remove SQL details in production
  if (isProduction && message.toLowerCase().includes("sql")) {
    return "Database operation failed";
  }

  return message;
}

function alertCriticalError(
  error: AppError,
  requestId: string,
  req: Request
): void {
  // Here you would integrate with external monitoring services
  // Examples: Sentry, Bugsnag, DataDog, New Relic, Slack webhooks

  logger.error("system", "CRITICAL ERROR - External alert triggered", {
    requestId,
    error: error.message,
    stack: error.stack,
    path: req.originalUrl,
    userId: (req as any).user?.userId,
    timestamp: new Date().toISOString(),
  });

  // Example: Send to external monitoring
  // await sendToSentry(error, { requestId, userId, path });
  // await sendSlackAlert(error, requestId);
}

// ========================================
// 404 HANDLER
// ========================================

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = new NotFoundError(`Route ${req.originalUrl}`);
  next(error);
};

// ========================================
// ASYNC WRAPPER (Optional - for controllers)
// ========================================

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// ========================================
// GLOBAL ERROR HANDLERS
// ========================================

export const setupGlobalErrorHandlers = (): void => {
  // Handle unhandled promise rejections
  process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
    logger.error("system", "Unhandled Promise Rejection", {
      reason: reason instanceof Error ? reason.message : String(reason),
      stack: reason instanceof Error ? reason.stack : undefined,
    });

    // In production, gracefully shutdown
    if (config.NODE_ENV === "production") {
      logger.error(
        "system",
        "Shutting down due to unhandled promise rejection"
      );
      process.exit(1);
    }
  });

  // Handle uncaught exceptions
  process.on("uncaughtException", (error: Error) => {
    logger.error("system", "Uncaught Exception", {
      error: error.message,
      stack: error.stack,
    });

    // Always exit on uncaught exceptions
    logger.error("system", "Shutting down due to uncaught exception");
    process.exit(1);
  });
};

// ========================================
// EXPORTS
// ========================================

// Only use named exports and a single default export object without redeclaring
export default {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  DatabaseError,
  ExternalServiceError,
  RateLimitError,
  BusinessLogicError,
  errorHandler,
  notFoundHandler,
  asyncHandler,
  setupGlobalErrorHandlers,
};
