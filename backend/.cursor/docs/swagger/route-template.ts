// Example: Template for a new resource route using auto-discovery
import { z } from "zod";
import { Request, Response } from "express";

// 1. Define Zod schemas
export const createResourceSchema = z.object({
  name: z.string().min(1),
  value: z.number().positive(),
});

// 2. Implement handler
const createResource = async (req: Request, res: Response) => {
  // ... business logic ...
  res.status(201).json({
    success: true,
    data: {
      /* ... */
    },
  });
};

// 3. Export route config
export const resourceRoutes = [
  {
    method: "post",
    path: "/resources",
    handler: createResource,
    schemas: { body: createResourceSchema },
    summary: "Create a new resource",
    tags: ["Resources"],
    security: [{ bearerAuth: [] }],
    version: "v1",
  },
  // Add more routes as needed
];
