import { config } from "@config/env";
import { logger } from "@utils/logger";
import { Request, Response } from "express";

export const getRateLimitOptions = () => ({
  windowMs: (config.RATE_LIMIT_WINDOW ?? 15) * 60 * 1000, // Default 15 minutes
  max: config.RATE_LIMIT_MAX_REQUESTS ?? 100,
  message: {
    success: false,
    error: "Too many requests from this IP, please try again later",
    retryAfter: Math.ceil((config.RATE_LIMIT_WINDOW ?? 15) * 60),
    code: "RATE_LIMITED",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn("system", "Rate limit exceeded", {
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString(),
    });

    res.status(429).json({
      success: false,
      error: "Too many requests from this IP, please try again later",
      retryAfter: Math.ceil((config.RATE_LIMIT_WINDOW ?? 15) * 60),
      code: "RATE_LIMITED",
    });
  },
});
