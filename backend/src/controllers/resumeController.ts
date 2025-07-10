import type { Request, Response, Express } from "express";
import { resumeService } from "@services/resumeService";
import { logger } from "@utils/logger";
import { registry } from "@utils/swaggerRegistry";
import { summarySchema } from "@validators/resumeValidator";

// Register schema for OpenAPI
registry.register("ResumeSummaryRequest", summarySchema);

export const resumeSummaryController = {
  summary: (req: Request, res: Response): void => {
    // console.info("FILE: ", req.file);
    // console.info("JD: ", req.body.jobDescription);
    // Multer adds file
    const file = req.file as Express.Multer.File;
    const jobDescription = req.body.jobDescription;
    const email = req.body.email;
    // @ts-ignore: Assume user is attached by auth middleware if present
    const userId = (req as any).user?.id ?? null;

    logger.info("api", "Received resume summary request", { userId });
    resumeService
      .summarizeResume(file.buffer, jobDescription, email)
      .then((result: any) => {
        logger.info("api", "OpenAI response sent", { userId });
        // Return only the LLM response content
        // const content = result?.choices?.[0]?.message?.content;
        // console.info("RESULT: ", result);
        res.json({ success:true, data: result });
      })
      .catch((err: unknown) => {
        logger.error("api", "Resume summary error", { error: err, userId });
        if (
          err &&
          typeof err === "object" &&
          "status" in err &&
          "message" in err
        ) {
          res
            .status((err as any).status ?? 500)
            .json({ error: (err as any).message ?? "Internal Server Error" });
        } else {
          res.status(500).json({ error: "Internal Server Error" });
        }
      });
  },
};

export const resumeSummaryRouteConfig = {
  method: "post",
  path: "/summary",
  handler: resumeSummaryController.summary,
  schemas: {
    request: summarySchema,
  },
  summary: "Summarize resume using OpenAI",
  tags: ["Resume"],
  security: [{ bearerAuth: [] }],
  version: "1.0.0",
};

export const resumeRoutes = [resumeSummaryRouteConfig] as const;
