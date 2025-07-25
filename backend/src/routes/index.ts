import { Router } from "express";
import { userRouter } from "./userRouter";
import { END_POINTS } from "./end-points";
import HealthRouter from "./health";
import { resumeRouter } from "./resumeRouter";

const router = Router();

router.use(END_POINTS.USER, userRouter);
router.use(END_POINTS.HEALTH, HealthRouter);
router.use(END_POINTS.RESUME, resumeRouter);

export default router;
