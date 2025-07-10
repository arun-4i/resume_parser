# Automated Swagger/OpenAPI Documentation Plan (2025-07-02)

## Goal

Implement a robust, automated framework for Swagger/OpenAPI documentation in the backend, using Zod schemas as the single source of truth, with auto-discovery of routes/controllers. The solution must address all known edge cases, be SonarQube/ESLint compliant, and follow .cursorrules and backend-dev.mdc standards.

---

## Requirements Clarification (Summary)

- **Single source of truth:** Zod schemas for validation and docs
- **Auto-discovery:** Minimal manual registration for new routes
- **Edge cases:** Handle params, query, body, response, errors, security, versioning, non-JSON, etc.
- **Docs endpoint:** `/api/docs` (UI), `/api/docs/openapi.json` (JSON)
- **Production:** Optionally restrict docs access
- **CI:** Validate OpenAPI spec in CI

---

## Implementation Checklist

### 1. **Design & Setup**

- [x] Review and update Zod schemas for all resources (body, params, query, response)
- [x] Decide on auto-discovery pattern (config object export per controller)
- [x] Create/Update `src/config/swagger.ts` for OpenAPI base config (info, servers, security, versioning)
- [x] Add/Update `src/utils/swaggerRegistry.ts` for OpenAPIRegistry singleton

### 2. **Dependencies**

- [x] Install `@asteasolutions/zod-to-openapi` and `swagger-ui-express` (latest)
- [x] Install types for all new dependencies

### 3. **Route Metadata & Auto-Discovery**

- [x] Refactor controllers to export route configs (method, path, handler, zod schemas, summary, tags, security, version)
- [x] Support body, params, query, and response schemas in metadata
- [x] Add error and standard response schemas to metadata
- [x] Add security and versioning info to metadata

### 4. **Auto-Registration Utility**

- [x] Implement `autoRegisterRoutes(router, controllers, registry)` in `src/utils/autoRegisterRoutes.ts`
  - [x] Register Express routes
  - [x] Register OpenAPI paths (body, params, query, response, errors, security)
  - [x] Detect and warn on path/method collisions
  - [x] Support non-JSON endpoints (e.g., file upload)
  - [x] Register global and per-route middleware in docs

### 5. **Swagger UI Integration**

- [x] Serve Swagger UI at `/api/docs` and JSON at `/api/docs/openapi.json`
- [x] Restrict docs access in production - use ENV variables and check
- [x] Add CORS headers for docs endpoints
- [x] Add audit logging for docs access

### 6. **Testing & Validation**

- [x] Validate that all endpoints, params, queries, and responses are documented
- [x] Validate error and security schemas in docs
- [x] Run SonarQube and ESLint for compliance

### 7. **Developer Experience**

- [x] Document how to add new routes with auto-discovery in README or `docs/`
- [x] Provide a template/example for new route config
- [x] Ensure minimal lines needed for new route documentation

### 8. **Retrospective & Feedback**

- [ ] After implementation, fill out the feedback section below

---

## Retrospective & Feedback (to be filled after implementation)

- What errors or blockers were encountered?
- Was the feature request clear? If not, what was missing?
- How could the plan/checklist be improved for next time?
- What should the AI do differently in future planning?
- Any other notes for improvement?
