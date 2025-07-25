# Function API Migration Plan (backend → backend_boilerplate)

## Requirements Recap

- **Endpoints:** POST `/`, GET `/`, PUT `/:id` (same as application)
- **Model:** See `function.ts` (fields: function_id, function_code, function_name, etc.)
- **Validation, business logic, security, logging, auditing:** Same as application unless loopholes are found.
- **Error handling:** Review backend for missing cases and address them.
- **Security, compliance, encryption, and decryption are handled by middleware and do not need to be implemented explicitly in this feature.**
- **For every new route, endpoint constants must be created in the appropriate constants file and used in the route file, and the router must be added accordingly.**

---

## ☑️ Migration Checklist

### 1. Project Structure & Boilerplate Alignment

- [x] Create/verify all required folders: `controllers/`, `services/`, `repositories/`, `models/`, `validators/`, `routes/`
- [x] Use camelCase for files, PascalCase for classes/interfaces, absolute imports

### 2. Model Layer

- [x] Migrate and refactor the Function model to `backend_boilerplate/src/models/function.ts` (align with Sequelize, add types, ensure all fields, timestamps, associations)
- [x] Add/verify model in `models/views/` if needed for query optimization

### 3. Repository Layer

- [x] Implement `functionRepository.ts` for all DB operations (CRUD, queries)
- [x] Ensure no direct model usage outside repository

### 4. Service Layer

- [x] Implement `functionService.ts` for business logic (create, get, update)
- [x] Use try/catch, throw typed errors, handle all business rules
- [x] Ensure all error cases are covered (e.g., duplicate function_code, not found, forbidden, etc.)

### 5. Controller Layer

- [x] Implement `functionController.ts` (thin, HTTP concerns only)
- [x] Use async handler, proper error formatting, and response structure
- [x] Validate requests using Zod schemas

### 6. Validator Layer

- [x] Create `functionValidator.ts` with Zod schemas for all endpoints (POST, PUT, etc.)
- [x] Add validation middleware to routes

### 7. Routes Layer

- [x] Create endpoint constants in the appropriate constants file (e.g., `end-points.ts`).
- [x] Use endpoint constants in the route file.
- [x] Implement `functionRouter.ts` (POST `/`, GET `/`, PUT `/:id`)
- [x] Add the router to the main router/index.
- [x] Apply authentication, authorization, rate limiting, encryption, and validation middleware (handled by middleware, not explicit in feature code)
- [x] Use API versioning (e.g., `/api/v1/functions`)

### 8. Error Handling & Response Format

- [x] Use centralized error middleware
- [x] Standardize error and success response formats (per rules)
- [x] Ensure all error scenarios from backend are covered and improved if needed

### 9. Logging & Auditing

- [x] Log all CRUD operations using Winston (structured, no sensitive info)
- [x] Implement audit logging for create/update actions (user context, timestamps)

### 10. Security & Compliance

- [x] Confirm that all security, compliance, encryption, and decryption are handled by middleware (no explicit implementation needed here)
- [x] Sanitize all inputs, mask sensitive data in logs
- [x] Apply Helmet, CORS, rate limiting, and other security middleware (middleware)

### 11. Documentation & Tests

- [ ] Add/extend Swagger/OpenAPI docs for all endpoints
- [ ] Add/extend Jest unit tests for controller, service, and repository

### 12. Review & Refactor

- [x] Review for DRY, SOLID, and SonarQube/ESLint compliance
- [x] Refactor for maintainability, performance, and security
- [x] All standards, error handling, logging, and compliance have been checked and are in line with backend-dev and .cursorrules.

---

## Retrospective & Feedback

_To be filled out only after implementation is complete:_

- What errors or blockers were encountered?
- Was the feature request clear? If not, what was missing?
- How could the plan/checklist be improved for next time?
- What should the AI do differently in future planning?
- Any other notes for improvement?
