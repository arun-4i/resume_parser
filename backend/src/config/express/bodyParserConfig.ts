import { Request, Response } from "express";
import { logger } from "@utils/logger";

export const jsonBodyParserOptions = {
  limit: "10mb",
  verify: (req: Request, res: Response, buf: Buffer) => {
    const size = buf.length;
    if (size > 1024 * 1024) {
      logger.warn("api", "Large request received", {
        size: `${(size / 1024 / 1024).toFixed(2)}MB`,
        path: req.path,
        method: req.method,
        ip: req.ip,
      });
    }
  },
};

export const urlencodedBodyParserOptions = {
  extended: true,
  limit: "10mb",
};
