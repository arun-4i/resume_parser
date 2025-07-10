import { Router } from "express";
import { unprotectedRoute } from "@middleware/autoEncryption";
import { config } from "@config/env";
import { logger } from "@utils/logger";

const HealthRouter = Router();

// Health check route
HealthRouter.get("/", unprotectedRoute, (req, res) => {
  const healthStatus = {
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
    },
    environment: config.NODE_ENV,
  };

  logger.info("system", "Health check requested", {
    requestId: (req as any).requestId,
    ip: req.ip,
    status: healthStatus.status,
  });

  res.json(healthStatus);
});

// Detailed health check with crypto service status
HealthRouter.get("/detailed", unprotectedRoute, async (req, res) => {
  try {
    const { jwtCryptoService } = await import("../utils/crypto");
    const cryptoHealth = jwtCryptoService.getHealthStatus();

    const detailedHealth = {
      success: true,
      status: cryptoHealth.status === "healthy" ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      services: {
        crypto: cryptoHealth,
        database: {
          status: "healthy", // Replace with actual DB health check
          connected: true,
        },
        cache: {
          status: "healthy", // Replace with actual cache health check
          connected: true,
        },
      },
      system: {
        uptime: Math.floor(process.uptime()),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        nodeVersion: process.version,
        platform: process.platform,
      },
    };

    logger.info("system", "Detailed health check requested", {
      requestId: (req as any).requestId,
      cryptoStatus: cryptoHealth.status,
    });

    const statusCode = detailedHealth.status === "healthy" ? 200 : 503;
    res.status(statusCode).json(detailedHealth);
  } catch (error) {
    logger.error("system", "Detailed health check failed", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    res.status(503).json({
      success: false,
      status: "unhealthy",
      error: "Health check failed",
      timestamp: new Date().toISOString(),
    });
  }
});

export default HealthRouter;
