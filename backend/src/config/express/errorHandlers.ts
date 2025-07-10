import { Request, Response, NextFunction } from "express";
import { config } from "@config/env";
import { logger } from "@utils/logger";

export const notFoundHandler =
  (baseUrl: string) => (req: Request, res: Response) => {
    logger.warn("api", "Route not found", {
      method: req.method,
      path: req.originalUrl,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      timestamp: new Date().toISOString(),
    });

    res.status(404).json({
      success: false,
      error: "Route not found",
      path: req.originalUrl,
      method: req.method,
      code: "ROUTE_NOT_FOUND",
      availableEndpoints: {
        health: "/auth/health",
        api: baseUrl,
      },
    });
  };

export const globalErrorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestId = (req as any).requestId ?? "unknown";

  // Log the error with full context
  logger.error("system", "Unhandled application error", {
    requestId,
    error: error.message,
    stack: error.stack,
    path: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    body: req.method !== "GET" ? req.body : undefined,
    timestamp: new Date().toISOString(),
  });

  // Send appropriate error response
  const isDevelopment = config.NODE_ENV === "development";

  res.status(500).json({
    success: false,
    error: "Internal server error",
    code: "INTERNAL_ERROR",
    requestId,
    timestamp: new Date().toISOString(),
    ...(isDevelopment && {
      details: {
        message: error.message,
        stack: error.stack,
      },
    }),
  });
};
