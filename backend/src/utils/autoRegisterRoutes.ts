import {
  Router,
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z, ZodTypeAny } from "zod";

interface RouteSchema {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
  response?: ZodTypeAny;
}

interface AutoRouteConfig {
  method: "get" | "post" | "put" | "patch" | "delete";
  path: string;
  handler: RequestHandler;
  schemas?: RouteSchema;
  summary?: string;
  tags?: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  security?: any[];
  version?: string;
  contentType?: string;
  middlewares?: RequestHandler[];
}

const registeredRoutes = new Set<string>();

function zodValidationMiddleware(
  schema: ZodTypeAny,
  source: "body" | "params" | "query"
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req[source]);
    if (!parsed.success) {
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
    req[source] = parsed.data;
    next();
  };
}

function buildMiddlewares(route: AutoRouteConfig): RequestHandler[] {
  const middlewares: RequestHandler[] = [];
  if (route.schemas) {
    if (route.schemas.params) {
      middlewares.push(zodValidationMiddleware(route.schemas.params, "params"));
    }
    if (route.schemas.query) {
      middlewares.push(zodValidationMiddleware(route.schemas.query, "query"));
    }
    if (route.schemas.body) {
      middlewares.push(zodValidationMiddleware(route.schemas.body, "body"));
    }
  }
  if (route.middlewares) {
    middlewares.push(...route.middlewares);
  }
  return middlewares;
}

function registerOpenApiPath(
  route: AutoRouteConfig,
  registry: OpenAPIRegistry
): void {
  registry.registerPath({
    method: route.method,
    path: route.path,
    tags: route.tags,
    summary: route.summary,
    security: route.security,
    request: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      params: route.schemas?.params as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      query: route.schemas?.query as any,
      body: route.schemas?.body
        ? {
            content: {
              [route.contentType ?? "application/json"]: {
                schema: route.schemas.body,
              },
            },
          }
        : undefined,
    },
    responses: {
      200: {
        description: "Success",
        content: {
          "application/json": {
            schema: route.schemas?.response || z.any(),
          },
        },
      },
      400: {
        description: "Validation error",
        content: {
          "application/json": {
            schema: z.object({
              success: z.literal(false),
              message: z.string(),
              error: z.object({
                code: z.string(),
                details: z.any().optional(),
              }),
            }),
          },
        },
      },
    },
  });
}

export function autoRegisterRoutes(
  router: Router,
  routes: AutoRouteConfig[],
  registry: OpenAPIRegistry
): void {
  for (const route of routes) {
    const routeKey = `${route.method.toUpperCase()} ${route.path}`;
    if (registeredRoutes.has(routeKey)) {
      console.warn(
        `[autoRegisterRoutes] Duplicate route detected: ${routeKey}`
      );
      continue;
    }
    registeredRoutes.add(routeKey);

    const middlewares = buildMiddlewares(route);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (router as any)[route.method](route.path, ...middlewares, route.handler);

    registerOpenApiPath(route, registry);
  }
}
