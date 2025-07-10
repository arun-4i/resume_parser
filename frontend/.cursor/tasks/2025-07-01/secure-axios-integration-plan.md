# Secure Axios Integration Plan

## Requirements Clarification

- **Feature Overview:**
  Implement secure request/response handling in the frontend by automatically encrypting outgoing requests and decrypting incoming responses using the backend-compatible scheme. JWT tokens must be attached to all requests. All logic should be handled via Axios interceptors to minimize code repetition in server actions.

- **Component/API Specification:**

  - Encryption/decryption logic must match backend (AES-256-GCM, PBKDF2 key from JWT, etc.).
  - JWT token must be attached as a Bearer token in the Authorization header.
  - Axios interceptors should handle all encryption, decryption, and token attachment.
  - JWT should be stored in memory (React context/store) for security and accessibility.

- **Validation Requirements:**

  - All requests (except GET/HEAD/OPTIONS) must be encrypted.
  - All responses matching the encrypted payload structure must be decrypted.
  - Requests without a valid JWT should be rejected or redirected to login.

- **Business Logic Rules:**

  - Encryption key is derived from JWT and master key (must match backend).
  - Payload structure: `{ data, iv, authTag, timestamp }`.
  - JWT must be refreshed or re-authenticated if expired.

- **Error Handling:**

  - Graceful error messages for encryption/decryption/token errors.
  - Fallback to login on token expiration.

- **Security & Authorization:**

  - JWT never stored in localStorage/sessionStorage.
  - All sensitive operations require valid JWT.
  - No secrets or keys hardcoded in frontend.

- **Logging & Auditing:**

  - Log encryption/decryption/token errors (in dev only, not in production).

- **Performance/Scalability:**

  - Interceptors must not introduce significant latency.
  - Solution must be scalable for all API calls.

- **Additional Context:**
  - No README or documentation changes unless specifically requested.
  - All code must follow frontend standards and pass linting, formatting, and review.

---

## Plan Checklist

- [ ] Port backend encryption/decryption logic to browser-compatible code (Web Crypto API or CryptoJS)
- [ ] Implement a secure, in-memory JWT storage (React context/store)
- [ ] Add Axios request interceptor:
  - [ ] Encrypt request body (non-GET/HEAD/OPTIONS) using JWT-derived key
  - [ ] Attach JWT as Bearer token in Authorization header
- [ ] Add Axios response interceptor:
  - [ ] Decrypt response if it matches the encrypted payload structure
- [ ] Handle token expiration and error cases (redirect to login if needed)
- [ ] Ensure all code follows frontend standards and passes linting/formatting
- [ ] Write tests for encryption/decryption and interceptor logic

---

## Bug-Prevention & Quality Checklist

- [ ] Accessibility (a11y) checked
- [ ] Responsive on all breakpoints (if UI is affected)
- [ ] State edge cases handled
- [ ] Error boundaries in place
- [ ] Security best practices followed (XSS, CSRF, etc.)
- [ ] Performance reviewed (latency, bundle size, etc.)
- [ ] Linting/formatting passed
- [ ] Tests written and passing

---

## Plan Approved By:

---

## Retrospective & Feedback

- What errors or blockers were encountered?
- Was the feature request clear? If not, what was missing?
- How could the plan/checklist or rules be improved for next time?
- Did any part of the rules or workflow cause confusion or slow you down? Suggest a rule/process change if so.
- What concrete action(s) will be taken to address feedback before the next cycle?
- What should the AI do differently in future planning?
- Any other notes for improvement?
