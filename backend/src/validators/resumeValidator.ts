import { NextFunction, Request, Response } from "express";
import { z } from "zod";

export const summarySchema = z.object({
  file: z.any(), // Multer will provide the file object
  jobDescription: z.string().min(1, "Job description is required"),
  email: z.string() .min(1, "Email is required").email("Please enter a valid email address")
});

export function validateSummaryBody(req: Request, res: Response, next: NextFunction): void {
  try {
    summarySchema.parse({
      file: req.file,
      jobDescription: req.body.jobDescription,
      email: req.body.email,
    });
    next();
  } catch (err: any) {
    res.status(400).json({ error: err.errors ?? err.message });
  }
}
