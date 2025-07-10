import { Router } from "express";
import { userRoutes } from "@controllers/userController";
import { autoRegisterRoutes } from "@utils/autoRegisterRoutes";
import { registry } from "@utils/swaggerRegistry";

const userRouter = Router();
autoRegisterRoutes(userRouter, userRoutes as any, registry);

export { userRouter };
