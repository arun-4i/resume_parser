# Task Plan: Responsive Modal User Info Form Enhancement (24-07-25)

## Overview

Implement a responsive modal that opens on page load, prompting the user for their name, phone, and email. The modal uses the `responsive-modal` component, shadcn forms, react-hook-form, and floating-label inputs. The collected data is saved in Zustand global state and combined with file/jobDescription data for API submission. Animations should use Framer Motion where appropriate, and all code must strictly follow project rules and standards.

---

## Pre-Implementation Questions & Answers (per code review rules)

- **Layout Positioning:** Modal is bottom-aligned on mobile and centered on desktop (handled by responsive-modal). Modal is not always full-screen on mobile, but is bottom-aligned as per design.
- **Responsive Behavior:** Modal cannot be dismissed before the form is valid and submitted. If the user tries to close it early, don't close the modal and show a toast warning.
- **Visual Integration:** Modal background is distinct with a background blur (already implemented by responsive-modal).
- **State Management:** User info should reset on every page load, store in Zustand, append to chat, and clear Zustand store after chat is submitted.
- **Animation Preferences:** No custom animation for now; use responsive-modal's built-in transitions. Animation enhancements can be added after initial implementation.
- **Form Structure:** All fields are required. Email uses standard email validation. Phone uses standard 10-digit validation. Name is required (standard text validation).
- **Background & Borders:** Responsive modal already provides border/shadow; do not add extra styling.
- **Z-index & Layering:** Modal overlays all content, including chat. Modal cannot be closed until all fields are filled and submitted, then user is moved to the chat page.

---

## Component Architecture & Flow

### Component Breakdown

1. **UserInfoModal**

   - Uses: `responsive-modal`, shadcn form, react-hook-form, floating-label inputs
   - Props: none (opens on page load, manages its own open state)
   - State: local form state (react-hook-form), writes to Zustand on submit
   - Behavior: cannot be closed until valid; shows toast if attempted
   - Children: `UserInfoForm`

2. **UserInfoForm**

   - Uses: shadcn form, floating-label inputs
   - Props: `onSubmit: (data) => void`, `isSubmitting: boolean`
   - State: managed by react-hook-form
   - Fields: firstName, email, phone (all required)
   - Validation: Zod schema (centralized)
   - On submit: calls `onSubmit`, disables modal close until valid

3. **Zustand Store** (`useUserInfoStore`)

   - State: `{ firstName, email, phone }`
   - Actions: `setUserInfo`, `clearUserInfo`
   - Usage: set on modal submit, clear after chat submit
   - Accessed by: chat submit logic/component

4. **Chat/ResumeCompareClient** (existing or new)
   - Reads user info from Zustand
   - Combines with file/jobDescription
   - Submits combined payload to API
   - Clears user info from Zustand after submit

### Data Flow

- On page load, `UserInfoModal` opens
- User fills form in `UserInfoForm` (inside modal)
- On valid submit, user info is saved to Zustand and modal closes
- User proceeds to chat/resume compare flow
- On chat submit, user info from Zustand is combined with file/jobDescription and sent to API
- After successful submit, Zustand user info is cleared

### Props & State Summary

- `UserInfoModal`: manages open state, passes `onSubmit` to form
- `UserInfoForm`: receives `onSubmit`, manages form state
- `useUserInfoStore`: global state for user info, actions for set/clear
- Chat/ResumeCompare: reads from store, clears after submit

---

## Implementation Steps

### 1. Schema & Validation

- [ ] Define Zod schema for user info: `{ firstName, email, phone }` with validation (email, 10-digit phone, required fields)
- [ ] Reuse/extend existing centralized schema patterns

### 2. Modal UI & Form

- [ ] Use `responsive-modal` for modal structure
- [ ] Use shadcn form primitives and react-hook-form for form logic
- [ ] Use floating-label inputs for all fields
- [ ] Ensure accessibility (labels, ARIA, keyboard nav)
- [ ] Modal opens on page load (useEffect or layout effect)
- [ ] Modal cannot be dismissed until form is valid and submitted; show toast warning if attempted

### 3. State Management

- [ ] Setup Zustand store (`useUserInfoStore`) for user info
- [ ] Reset user info state on every page load
- [ ] Ensure state is accessible to chat/file/jobDescription submit logic
- [ ] Clear Zustand store after chat submit
- [ ] Memoize selectors as needed

### 4. Animation & Responsiveness

- [ ] Use only responsive-modal's built-in transitions for now (no custom animation)
- [ ] Test modal and form on all breakpoints (sm, md, lg, xl, 2xl)
- [ ] Ensure no horizontal scroll or overflow

### 5. Integration

- [ ] On chat submit, combine user info state with file/jobDescription and send to API
- [ ] Ensure type safety and validation on combined payload
- [ ] Clear Zustand store after successful submit

### 6. Code Review & Testing

- [ ] Review against all referenced rules: .cursorrules, frontend-dev, css-layout, responsiveness, animation-framer, state, frontend-code-review
- [ ] Test accessibility (keyboard, screen reader)
- [ ] Test on real devices if possible
- [ ] Remove any unused animation or modal code

---

## Review Checklist (per code review rule)

- [ ] Code clarity, maintainability, and correctness
- [ ] TypeScript strict mode, explicit types, no `any`
- [ ] Zod + React Hook Form for all validation
- [ ] Responsive/mobile-first, no horizontal scroll
- [ ] Proper z-index, overlay, and scroll handling
- [ ] Responsive-modal transitions only (no custom animation)
- [ ] Accessibility: ARIA, keyboard, labels
- [ ] State management: Zustand for global, useState for local
- [ ] No lint or formatting errors
- [ ] All pre-implementation questions answered/confirmed

---

## Notes

- If any requirement is unclear, clarify with user before implementation.
- Update this plan if requirements or rules change during implementation.
