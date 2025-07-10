import { filter } from "compression";
import { Request, Response } from "express";
export const compressionConfig = {
  level: 6,
  threshold: 1024, // Only compress responses > 1KB
  filter: (req: Request, res: Response) => {
    // Don't compress if already encrypted/compressed
    if (res.getHeader("content-encoding")) {
      return false;
    }
    return filter(req, res);
  },
};
