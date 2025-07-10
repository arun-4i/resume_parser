// src/middlewares/middleware.ts
import type { Request, Response, NextFunction } from "express";
import { jwtCryptoService } from "@utils/crypto";
import { logger } from "@utils/logger";
import { END_POINTS } from "@routes/end-points";
import { config } from "@config/env";

// ========================================
// TYPES & INTERFACES
// ========================================

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
  jwtToken?: string;
  requestId?: string;
}

interface EncryptedPayload {
  data: string;
  iv: string;
  authTag: string;
  timestamp: number;
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Extract JWT token from Authorization header
 */
const extractJWT = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.substring(7);
};

/**
 * Generate request ID for tracing
 */
const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Check if request has encrypted payload
 */
const hasEncryptedPayload = (body: any): body is EncryptedPayload => {
  return (
    body &&
    typeof body === "object" &&
    typeof body.data === "string" &&
    typeof body.iv === "string" &&
    typeof body.authTag === "string" &&
    typeof body.timestamp === "number"
  );
};

/**
 * Validate request timestamp (prevent replay attacks)
 */
const isValidTimestamp = (
  timestamp: number,
  maxAgeMs: number = 5 * 60 * 1000
): boolean => {
  const now = Date.now();
  return timestamp > 0 && now - timestamp <= maxAgeMs;
};

// ========================================
// HELPER FUNCTIONS FOR PROTECTED ROUTE
// ========================================

function authenticateJWT(
  req: AuthenticatedRequest,
  res: Response
): { payload: any; jwtToken: string } | null {
  // Check if JWT verification is enabled via env
  if (!config.JWT_VERIFICATION_ENABLED) {
    logger.warn(
      "auth",
      "JWT verification is DISABLED via environment variable. Skipping JWT check.",
      {
        requestId: req.requestId,
        path: req.path,
        ip: req.ip,
      }
    );
    // Set a default/anonymous user context
    req.user = {
      userId: "anonymous",
      email: "anonymous@local",
      role: "guest",
    };
    req.jwtToken = undefined;
    return { payload: req.user, jwtToken: "" };
  }
  const jwtToken = extractJWT(req);
  if (!jwtToken) {
    logger.warn("auth", "Missing JWT token for protected route", {
      requestId: req.requestId,
      path: req.path,
      ip: req.ip,
    });
    res.status(401).json({
      success: false,
      error: "Authentication required",
      code: "MISSING_TOKEN",
    });
    return null;
  }
  const payload = jwtCryptoService.verifyJWT(jwtToken);
  if (!payload) {
    logger.warn("auth", "Invalid or expired JWT token", {
      requestId: req.requestId,
      path: req.path,
      ip: req.ip,
    });
    res.status(401).json({
      success: false,
      error: "Invalid or expired token",
      code: "INVALID_TOKEN",
    });
    return null;
  }
  req.user = {
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
  };
  req.jwtToken = jwtToken;
  logger.info("auth", "User authenticated successfully", {
    requestId: req.requestId,
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
    path: req.path,
  });
  return { payload, jwtToken };
}

function decryptRequestIfNeeded(
  req: AuthenticatedRequest,
  res: Response,
  jwtToken: string,
  userId: string
): boolean {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    logger.debug("api", "Skipping decryption for method", {
      requestId: req.requestId,
      method: req.method,
      userId,
    });
    return true;
  }

  if (!config.ENCRYPTION_ENABLED) {
    logger.debug("api", "Encryption is disabled. Skipping decryption.", {
      requestId: req.requestId,
      userId,
    });
    return true;
  }

  if (req.body && hasEncryptedPayload(req.body)) {
    const { data, iv, authTag, timestamp } = req.body;
    if (!isValidTimestamp(timestamp)) {
      logger.warn("auth", "Request timestamp validation failed", {
        requestId: req.requestId,
        userId,
        timestamp,
        age: Date.now() - timestamp,
      });
      res.status(400).json({
        success: false,
        error: "Request expired or invalid timestamp",
        code: "INVALID_TIMESTAMP",
      });
      return false;
    }
    const decryptionResult = jwtCryptoService.decrypt(
      data,
      iv,
      authTag,
      jwtToken
    );
    if (!decryptionResult.success) {
      logger.error("auth", "Request decryption failed", {
        requestId: req.requestId,
        userId,
        path: req.path,
        error: decryptionResult.error,
      });
      res.status(400).json({
        success: false,
        error: "Invalid encrypted payload",
        code: "DECRYPTION_FAILED",
      });
      return false;
    }
    try {
      req.body = JSON.parse(decryptionResult.data);
      logger.debug("api", "Request decrypted successfully", {
        requestId: req.requestId,
        userId,
        path: req.path,
        originalSize: data.length,
        decryptedSize: decryptionResult.data.length,
      });
    } catch (parseError) {
      logger.error("api", "Failed to parse decrypted payload", {
        requestId: req.requestId,
        userId,
        error:
          parseError instanceof Error ? parseError.message : "Unknown error",
      });
      res.status(400).json({
        success: false,
        error: "Invalid payload format",
        code: "PARSE_ERROR",
      });
      return false;
    }
  }
  return true;
}

function overrideResponseJson(
  res: Response,
  req: AuthenticatedRequest,
  jwtToken: string,
  userId: string
) {
  const originalJson = res.json.bind(res);
  res.json = function (obj: any) {
    try {
      if (res.statusCode >= 400) {
        logger.debug("api", "Skipping encryption for error response", {
          requestId: req.requestId,
          userId,
          statusCode: res.statusCode,
        });
        return originalJson(obj);
      }
      if (obj.skipEncryption === true) {
        const { skipEncryption, ...cleanObj } = obj;
        logger.debug("api", "Skipping encryption as requested", {
          requestId: req.requestId,
          userId,
        });
        return originalJson(cleanObj);
      }

      if (!config.ENCRYPTION_ENABLED) {
        logger.debug("api", "Encryption is disabled. Skipping encryption.", {
          requestId: req.requestId,
          userId,
        });
        return originalJson(obj);
      }

      const jsonString = JSON.stringify(obj);
      const encrypted = jwtCryptoService.encrypt(jsonString, jwtToken);
      const encryptedPayload: EncryptedPayload = {
        data: encrypted.encryptedData,
        iv: encrypted.iv,
        authTag: encrypted.authTag,
        timestamp: Date.now(),
      };
      logger.debug("api", "Response encrypted successfully", {
        requestId: req.requestId,
        userId,
        path: req.path,
        originalSize: jsonString.length,
        encryptedSize: encrypted.encryptedData.length,
      });
      return originalJson(encryptedPayload);
    } catch (error) {
      logger.error("api", "Response encryption failed", {
        requestId: req.requestId,
        userId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return originalJson({
        success: false,
        error: "Response encryption failed",
        code: "ENCRYPTION_FAILED",
      });
    }
  };
}

// ========================================
// PROTECTED ROUTES MIDDLEWARE
// ========================================

/**
 * Middleware for protected routes - requires authentication + handles encryption
 */
export const protectedRoute = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    req.requestId = generateRequestId();
    res.setHeader("x-request-id", req.requestId);
    logger.info("api", "Protected route accessed", {
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      jwtVerification: config.JWT_VERIFICATION_ENABLED ? "enabled" : "DISABLED",
    });
    // Step 1: JWT Authentication
    const authResult = authenticateJWT(req, res);
    if (!authResult) {
      return;
    }
    const { payload, jwtToken } = authResult;
    // Step 2: Request Decryption (if needed)
    if (!decryptRequestIfNeeded(req, res, jwtToken, payload.userId)) return;
    // Step 3: Response Encryption Setup
    overrideResponseJson(res, req, jwtToken, payload.userId);
    next();
  } catch (error) {
    logger.error("system", "Protected route middleware error", {
      requestId: req.requestId,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      path: req.path,
      method: req.method,
    });
    res.status(500).json({
      success: false,
      error: "Internal server error",
      code: "MIDDLEWARE_ERROR",
    });
  }
};

// ========================================
// UNPROTECTED ROUTES MIDDLEWARE
// ========================================

/**
 * Middleware for unprotected routes - no authentication, no encryption
 */
export const unprotectedRoute = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Generate request ID for tracing
    req.requestId = generateRequestId();
    res.setHeader("x-request-id", req.requestId);

    logger.info("api", "Unprotected route accessed", {
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      contentType: req.get("Content-Type"),
    });

    // Add response logging
    const originalJson = res.json.bind(res);

    res.json = function (obj: any) {
      logger.info("api", "Unprotected route response", {
        requestId: req.requestId,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        encrypted: false,
      });

      return originalJson(obj);
    };

    // Continue to controller (no auth/encryption)
    next();
  } catch (error) {
    logger.error("system", "Unprotected route middleware error", {
      requestId: req.requestId,
      error: error instanceof Error ? error.message : "Unknown error",
      path: req.path,
      method: req.method,
    });

    res.status(500).json({
      success: false,
      error: "Internal server error",
      code: "MIDDLEWARE_ERROR",
    });
  }
};

// ========================================
// UTILITY MIDDLEWARE FUNCTIONS
// ========================================

/**
 * Skip encryption for a specific response (use in controllers)
 */
export const skipResponseEncryption = (res: Response): void => {
  (res as any).locals = (res as any).locals ?? {};
  (res as any).locals.skipEncryption = true;
};

/**
 * Get current authenticated user from request
 */
export const getCurrentUser = (req: AuthenticatedRequest) => {
  return req.user || null;
};

/**
 * Check if current request is authenticated
 */
export const isAuthenticated = (req: AuthenticatedRequest): boolean => {
  return !!req.user && !!req.jwtToken;
};

/**
 * Get request ID for logging/tracing
 */
export const getRequestId = (req: AuthenticatedRequest): string => {
  return req.requestId ?? "unknown";
};

// ========================================
// REQUEST LOGGING MIDDLEWARE (OPTIONAL)
// ========================================

/**
 * Enhanced request logging middleware (can be used globally)
 */
export const requestLogger = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const startTime = Date.now();
  const requestId = req.requestId ?? generateRequestId();
  req.requestId = requestId;

  // Log request start
  logger.info("api", "Request started", {
    requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    contentType: req.get("Content-Type"),
    contentLength: req.get("Content-Length"),
  });

  // Log response when finished
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const user = req.user;

    logger.info("api", "Request completed", {
      requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      responseSize: res.get("Content-Length"),
      userId: user?.userId,
      authenticated: !!user,
    });
  });

  next();
};

// ========================================
// CENTRAL AUTO-PROTECTION MIDDLEWARE
// ========================================
const unprotectedRoutes = [
  "/api/user/register",
  "/api/user/login",
  "/api/health",
  "/api/health/detailed",
];

export function autoProtect(req: Request, res: Response, next: NextFunction) {
  // Make any route starting with /auth or /auth/ unprotected
  // console.log("req path: ", req.path, req.path.startsWith("/api/auth/"));
  const isUnprotected = unprotectedRoutes.some((route) =>
    req.path.includes(route)
  );
  if (isUnprotected) {
    // Call unprotectedRoute middleware
    return unprotectedRoute(req, res, next);
  } else {
    // Call protectedRoute middleware
    return protectedRoute(req, res, next);
  }
}

export default {
  protectedRoute,
  unprotectedRoute,
  skipResponseEncryption,
  getCurrentUser,
  isAuthenticated,
  getRequestId,
  requestLogger,
};
