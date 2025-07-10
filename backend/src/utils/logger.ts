// src/utils/logger.ts
import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";
import fs from "fs";
import { config } from "@config/env";

export type LogLabel = "db" | "userAction" | "auth" | "api" | "system";

export interface LogMeta {
  [key: string]: any;
}

// Environment-based configuration
const LOG_LEVEL = config.LOG_LEVEL ?? "info";
const LOG_DIR = config.LOG_DIR ?? "logs";
const LOG_BASE_FILENAME = config.LOG_BASE_FILENAME ?? "app";
const LOG_MAX_SIZE = config.LOG_MAX_SIZE ?? "10m";
const LOG_DATE_PATTERN = config.LOG_DATE_PATTERN ?? "YYYY-MM-DD-HH";
const LOG_CONSOLE_ENABLED =
  config.LOG_CONSOLE_ENABLED === "true" || config.NODE_ENV === "development";
const LOG_FILE_ENABLED = config.LOG_FILE_ENABLED !== "false";
const LOG_JSON_PRETTY = config.LOG_JSON_PRETTY === "true";

// Ensure log directory exists
if (LOG_FILE_ENABLED && !fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

class TypedLogger {
  private readonly logger = createLogger({
    level: LOG_LEVEL,
    format: format.combine(
      format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      format.errors({ stack: true }),
      format.splat(),
      LOG_JSON_PRETTY ? format.prettyPrint() : format.json()
    ),
    transports: [
      // File transport with proper rotation (only if enabled)
      ...(LOG_FILE_ENABLED
        ? [
            new DailyRotateFile({
              filename: path.join(LOG_DIR, `${LOG_BASE_FILENAME}-%DATE%.log`),
              datePattern: LOG_DATE_PATTERN,
              maxSize: LOG_MAX_SIZE,
              format: format.combine(
                format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
                format.errors({ stack: true }),
                LOG_JSON_PRETTY ? format.prettyPrint() : format.json()
              ),
            }),
          ]
        : []),
      // Console transport (only if enabled)
      // ...(LOG_CONSOLE_ENABLED
      //   ? [
      //       new transports.Console({
      //         format: format.combine(
      //           format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      //           format.printf(
      //             ({ timestamp, level, message, label, ...meta }) => {
      //               const metaStr = Object.keys(meta).length
      //                 ? `\n${JSON.stringify(meta, null, 2)}`
      //                 : "";
      //               return `${timestamp} [${typeof label === "string" ? label : "app"}] ${level.toUpperCase()}: ${message}${metaStr}`;
      //             }
      //           )
      //         ),
      //       }),
      //     ]
      //   : []),
    ],
    exitOnError: false,
  });

  log(
    level: "info" | "warn" | "error" | "debug",
    label: LogLabel,
    message: string,
    meta?: LogMeta
  ): void {
    this.logger.log(level, message, { label, ...meta });
  }

  info(label: LogLabel, message: string, meta?: LogMeta): void {
    this.log("info", label, message, meta);
  }

  warn(label: LogLabel, message: string, meta?: LogMeta): void {
    this.log("warn", label, message, meta);
  }

  error(label: LogLabel, message: string, meta?: LogMeta): void {
    this.log("error", label, message, meta);
  }

  debug(label: LogLabel, message: string, meta?: LogMeta): void {
    this.log("debug", label, message, meta);
  }

  // Helper method to get logger instance for advanced usage
  getInstance() {
    return this.logger;
  }
}

export const logger = new TypedLogger();
