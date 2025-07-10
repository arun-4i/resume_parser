import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/env";
import { userService } from "../services/userService";
import {
  createUserSchema,
  updateUserSchema,
} from "../validators/userValidator";
import { logger } from "@utils/logger";
import { asyncHandler } from "@utils/error";
import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

// --- Handler Implementations ---

const register = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const parsed = createUserSchema.safeParse(req.body);
    if (!parsed.success) {
      logger.warn("userAction", "Validation failed for register", {
        errors: parsed.error.errors,
      });
      res.status(400).json({
        success: false,
        message: "Validation error",
        error: {
          code: "VALIDATION_ERROR",
          details: parsed.error.errors,
        },
      });
      return;
    }

    let user;
    try {
      user = await userService.createUser(parsed.data);
    } catch (error: any) {
      if (
        error.code === "USER_EMAIL_ALREADY_EXISTS" ||
        error.message === "USER_EMAIL_ALREADY_EXISTS"
      ) {
        logger.warn("userAction", "Attempt to register with existing email", {
          email: req.body.email,
        });
        res.status(409).json({
          success: false,
          message: "Email already exists",
          error: {
            code: "USER_EMAIL_ALREADY_EXISTS",
          },
        });
        return;
      }
      logger.error("userAction", "Error registering user", { error });
      return next(error);
    }

    logger.info("userAction", "User registered", {
      userId: user.id,
      email: user.email,
    });
    const jwtOptions: jwt.SignOptions = {};
    if (config.JWT_EXPIRES_IN) {
      jwtOptions.expiresIn = config.JWT_EXPIRES_IN as any;
    }
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      config.JWT_SECRET,
      jwtOptions
    );
    res.status(201).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        token,
      },
    });
  }
);

const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }
    const user = await userService.findByEmail(email);
    if (!user?.isActive) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const jwtOptions: jwt.SignOptions = {};
    if (config.JWT_EXPIRES_IN) {
      jwtOptions.expiresIn = config.JWT_EXPIRES_IN as any;
    }
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      config.JWT_SECRET,
      jwtOptions
    );
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  }
);

const getAllUsers = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await userService.getAllUsers();
    res.json({ success: true, data: users });
  }
);

const updateUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      res.status(400).json({
        success: false,
        message: "Invalid user ID",
        error: {
          code: "INVALID_USER_ID",
        },
      });
      return;
    }

    const parsed = updateUserSchema.safeParse(req.body);
    if (!parsed.success) {
      logger.warn("userAction", "Validation failed for user update", {
        userId,
        errors: parsed.error.errors,
      });
      res.status(400).json({
        success: false,
        message: "Validation error",
        error: {
          code: "VALIDATION_ERROR",
          details: parsed.error.errors,
        },
      });
      return;
    }

    try {
      const updatedUser = await userService.updateUser(userId, parsed.data);

      logger.info("userAction", "User updated successfully", {
        userId,
      });

      res.json({
        success: true,
        data: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          isActive: updatedUser.isActive,
          updatedAt: updatedUser.updatedAt,
        },
      });
    } catch (error: any) {
      if (error.code === "USER_NOT_FOUND") {
        logger.warn("userAction", "Attempt to update non-existent user", {
          userId,
        });
        res.status(404).json({
          success: false,
          message: "User not found",
          error: {
            code: "USER_NOT_FOUND",
          },
        });
        return;
      }
      logger.error("userAction", "Error updating user", { userId, error });
      return next(error);
    }
  }
);

// --- Route Configs for Auto-Discovery ---

export const userRoutes = [
  {
    method: "post",
    path: "/register",
    handler: register,
    schemas: {
      body: createUserSchema,
    },
    summary: "Register a new user",
    tags: ["Users"],
    security: [{ bearerAuth: [] }],
    version: "v1",
  },
  {
    method: "post",
    path: "/login",
    handler: login,
    schemas: {
      body: z.object({
        email: z.string().email(),
        password: z.string().min(8),
      }),
    },
    summary: "User login",
    tags: ["Users"],
    security: [],
    version: "v1",
  },
  {
    method: "get",
    path: "/",
    handler: getAllUsers,
    schemas: {},
    summary: "Get all users",
    tags: ["Users"],
    security: [{ bearerAuth: [] }],
    version: "v1",
  },
  {
    method: "patch",
    path: "/:id",
    handler: updateUser,
    schemas: {
      params: z.object({
        id: z
          .string()
          .regex(/^\\d+$/)
          .openapi({ example: "123" }),
      }),
      body: updateUserSchema,
    },
    summary: "Update user",
    tags: ["Users"],
    security: [{ bearerAuth: [] }],
    version: "v1",
  },
] as const;
