import { Router } from "express";
import {
  resumeSummaryController,
  resumeRoutes,
} from "@controllers/resumeController";
import multer from "multer";
import { validateSummaryBody } from "@validators/resumeValidator";
import { autoRegisterRoutes } from "@utils/autoRegisterRoutes";
import { registry } from "@utils/swaggerRegistry";
// import { resumeSummaryValidator } from "@/validators/resumeValidator"; // To be implemented

const router = Router();

const upload = multer();

// POST /resume/summary
router.post(
  "/summary",
  upload.single("file"),
  validateSummaryBody,
  resumeSummaryController.summary
);

autoRegisterRoutes(router, resumeRoutes as any, registry);

export { router as resumeRouter };
