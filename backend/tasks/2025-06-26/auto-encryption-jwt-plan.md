# Auto Encryption/Decryption & Conditional JWT Verification Implementation Plan

## Goal

Implement environment-based auto encryption/decryption and conditional JWT verification in the backend_boilerplate. If the relevant env variable is enabled, JWT verification and encryption/decryption should be enforced; if disabled, these should be bypassed.

---

## Checklist

### 1. Research & Analysis

- [x] Review current encryption and JWT logic in `src/middleware/autoEncryption.ts` and `src/utils/crypto.ts`.
- [x] Review environment variable handling in `src/config/env.ts`.
- [x] Identify all routes/middleware that require conditional logic.
- [x] Decide on the env variable name for JWT verification (e.g., `JWT_VERIFICATION_ENABLED`).

### 2. Design

- [x] Specify the logic for conditional JWT verification:
  - If `JWT_VERIFICATION_ENABLED` is true, enforce JWT verification.
  - If false, skip JWT verification and treat all requests as authenticated (with minimal/no user context).
- [x] Specify the logic for conditional encryption/decryption (already controlled by `ENCRYPTION_ENABLED`).
- [x] Document the expected behavior for protected/unprotected routes in both modes.

### 3. Implementation

- [x] Update `.env.example` and documentation to include `JWT_VERIFICATION_ENABLED`.
- [x] Update `src/config/env.ts` to load and validate the new env variable.
- [x] Refactor `src/middleware/autoEncryption.ts`:
  - [x] Update `authenticateJWT` to check `config.JWT_VERIFICATION_ENABLED` and skip verification if disabled.
  - [x] Ensure user context is handled safely when JWT is not verified.
  - [x] Add logging for when JWT verification is skipped.
- [x] Update `protectedRoute` and `autoProtect` to use the new logic.
- [x] Ensure all encryption/decryption logic remains controlled by `ENCRYPTION_ENABLED`.

### 4. Testing

- [ ] Add/Update unit tests for middleware to cover both enabled/disabled scenarios.
- [ ] Manually test protected and unprotected routes with both env settings:
  - [ ] With JWT verification enabled (default/production mode).
  - [ ] With JWT verification disabled (development/testing mode).
- [ ] Test encryption/decryption toggling via `ENCRYPTION_ENABLED`.
- [ ] Validate logging and error handling in all scenarios.

### 5. Documentation

- [ ] Update project README and/or backend documentation to explain the new env variable and its effects.
- [ ] Document security implications of disabling JWT verification (for dev/test only).

### 6. Code Quality & Review

- [ ] Run ESLint, Prettier, and SonarQube checks.
- [ ] Peer review and approval.

---

## Notes

- Disabling JWT verification should **never** be used in production.
- All changes must maintain existing security and error handling standards.
- Ensure backward compatibility for existing deployments.
