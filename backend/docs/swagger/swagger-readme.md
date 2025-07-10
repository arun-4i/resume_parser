## Adding New Routes with Auto-Discovery (Swagger Automation)

This project uses an auto-discovery pattern for route registration and OpenAPI documentation. To add a new API route:

### 1. Define Zod Schemas

Create your request/response validation schemas in `src/validators/yourResourceValidator.ts`:

```ts
import { z } from "zod";
export const createProductSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
});
```

### 2. Implement Handlers

Write your Express handler functions in `src/controllers/yourResourceController.ts`:

```ts
import { Request, Response } from "express";
import { createProductSchema } from "@/validators/yourResourceValidator";

const createProduct = async (req: Request, res: Response) => {
  // ... business logic ...
};
```

### 3. Export Route Configs

Export an array of route configs from your controller:

```ts
import { z } from "zod";
export const productRoutes = [
  {
    method: "post",
    path: "/products",
    handler: createProduct,
    schemas: { body: createProductSchema },
    summary: "Create a new product",
    tags: ["Products"],
    security: [{ bearerAuth: [] }],
    version: "v1",
  },
  // ...more routes
];
```

### 4. Register Routes in the Router

In your router file (e.g., `src/routes/productRouter.ts`):

```ts
import { Router } from "express";
import { productRoutes } from "@/controllers/yourResourceController";
import { autoRegisterRoutes } from "@/utils/autoRegisterRoutes";
import { registry } from "@/utils/swaggerRegistry";

const productRouter = Router();
autoRegisterRoutes(productRouter, productRoutes, registry);
export { productRouter };
```

### 5. Add Router to Main App

Wire up your new router in `src/routes/index.ts` and ensure it is mounted in `src/app.ts`.

### 6. Done!

- Your route is now registered with Express and documented in Swagger UI automatically.
- Visit `/api/docs` to see the updated API documentation.

**Tip:**

- Always use Zod schemas for validation and documentation.
- Use the same config object structure for all routes.
- Security, error, and response schemas are handled automatically.
