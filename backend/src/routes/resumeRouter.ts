import { Router } from "express";

import multer from "multer";
import { validateSummaryBody } from "@validators/resumeValidator";
import { autoRegisterRoutes } from "@utils/autoRegisterRoutes";
import { registry } from "@utils/swaggerRegistry";
import { resumeRoutes, resumeSummaryController } from "@controllers/resumeController";

const router = Router();
const upload = multer();

router.post("/summary",
 upload.single("file"), validateSummaryBody,resumeSummaryController.summary
);

autoRegisterRoutes(router, resumeRoutes as any, registry);

export { router as resumeRouter };
