# Plan: Resume Summary Route Implementation

## Overview

Implement a new route to accept a PDF resume and a job description, extract text from the PDF using `pdf-parse`, and send both (with a base prompt from env) to OpenAI via the OpenAI SDK. Return the OpenAI response to the frontend. Follow all standards in `.cursorrules` and referenced rule files.

---

## Checklist

- [x] **Review Feedback**: Review last 1-2 feedback sections in `feedback/` for lessons learned
- [x] **Dependencies**: Add `pdf-parse` and `openai` npm packages if not present
- [x] **Endpoint Constant**: Add `/resume` to `src/routes/end-points.ts`
- [x] **Router**: Create `resumeRouter.ts` in `src/routes/` (if not present) and add a post route with endppint "/summary"
- [x] **Controller**: Create `resumeController.ts` in `src/controllers/`
- [x] **Service**: Create `resumeService.ts` in `src/services/`
- [x] **Validator**: Add/extend validator in `src/validators/` for request body (PDF file, JD)
- [x] **Route Wiring**: Wire up the new route in `resumeRouter.ts` using the applicationRouter pattern
- [x] **Route Export**: Export route config (method, path, handler, schemas, summary, tags, security, version) from controller
- [x] **PDF Extraction**: Implement PDF text extraction in service using `pdf-parse`
- [x] **Prompt Construction**: Construct prompt using base prompt from env, extracted text, and JD
- [x] **OpenAI Call**: Call OpenAI API using SDK and env API key
- [x] **Logging**: Log all actions per logging rules (context: "api")
- [x] **Error Handling**: Handle and return errors per error-handling rules
- [x] **Swagger**: Add/extend Swagger docs for the new route using Zod schemas
- [ ] **Testing**: Add/extend tests for the new route (unit/integration)
- [x] **Lint/Type Check**: Run lint and type checks
- [ ] **Review & Tick**: Review and tick off each checklist item before moving to the next

---

## Retrospective & Feedback

- What errors or blockers were encountered?
- Was the feature request clear? If not, what was missing?
- How could the plan/checklist be improved for next time?
- What should the AI do differently in future planning?
- Any other notes for improvement?
