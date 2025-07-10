# Feature Plan: Resume Upload, Parsing, and LLM JD Comparison

# Description: Implements a Next.js UI and API for uploading a resume (PDF/DOCX), parsing it, inputting a Job Description, and sending both to an LLM for evaluation. Follows .cursorrules and referenced standards.

## Requirements Clarification

- **Feature Overview:**
  - Allow users to upload a resume (PDF/DOCX), parse it, input a Job Description, and receive an LLM-based evaluation comparing the two.
  - The website must support both LTR (English) and RTL (Arabic-like) layouts, with a language switcher dropdown in the navbar.
- **Component/API Specification:**
  - Frontend: File upload component, JD textarea, parsed resume display, LLM result display.
  - Navbar: Language switcher dropdown for English/Arabic (LTR/RTL toggle).
  - Backend: Next.js API route for file+JD upload, resume parsing (simple-resume-parser), prompt formatting, OpenAI LLM call, result return.
- **Validation Requirements:**
  - Only accept PDF/DOCX for resume upload. JD must not be empty. Handle file size limits.
  - Language switch must update UI direction and text.
- **Business Logic Rules:**
  - Use simple-resume-parser for extraction(https://github.com/kervin5/simple-resume-parser). Use provided prompt format for LLM. Return structured result. use Context7 MCP to access documentation.
  - All UI must correctly switch between LTR and RTL layouts and text.
- **Error Handling:**
  - Show user-friendly errors for invalid file, parse failures, LLM/API errors, and network issues.
- **Security & Authorization:**
  - Sanitize all inputs. No sensitive data logging. Use secure file handling. No auth required for MVP.
- **Logging & Auditing:**
  - Log errors server-side only. No PII in logs.
- **Performance/Scalability:**
  - Handle files up to 5MB. Async API. UI must not block on upload/parse/LLM.
  - Language switch must be instant and not reload the page.
- **Additional Context:**
  - Use OpenAI API key (to be provided) in env. Follow all .cursorrules and referenced standards.

---

## Plan Checklist

- [ ] Review .cursorrules and referenced rules files for compliance
- [ ] Design clean UI: upload, textarea, parsed resume, LLM result
- [ ] Implement frontend components and hooks
- [ ] Implement Next.js API route: file+JD upload, parsing, LLM call
- [ ] Add language switcher dropdown to navbar (English/Arabic, LTR/RTL)
- [ ] Integrate frontend with backend API
- [ ] Test end-to-end flow and refine UI/UX
- [ ] Test RTL/LTR switching and translations
- [ ] Retrospective and feedback

---

## Bug-Prevention & Quality Checklist

- [ ] Accessibility (a11y) checked
- [ ] Responsive on all breakpoints
- [ ] State edge cases handled
- [ ] Error boundaries in place
- [ ] Security best practices followed
- [ ] Performance reviewed
- [ ] Linting/formatting passed
- [ ] Tests written and passing
- [ ] RTL/LTR switching and translations verified

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

# Resume Parser & LLM Comparison — Task Progress

This file tracks progress for the feature as per the approved plan in `.cursor/tasks/2025-07-08/plan.md` and .cursorrules.

## Task Checklist

- [x] Design clean UI: upload, textarea, parsed resume, LLM result
- [ ] Implement frontend components and hooks
- [ ] Add language switcher dropdown to navbar (English/Arabic, LTR/RTL)
- [ ] Implement Next.js API route: file+JD upload, parsing, LLM call
- [ ] Integrate frontend with backend API
- [ ] Test end-to-end flow and refine UI/UX
- [ ] Test RTL/LTR switching and translations
- [ ] Retrospective and feedback

---

## Notes

- All UI will use shadcn components for a modern, minimal, and clean look.
- Dark mode, quick/clean animations, and accessibility will be prioritized.
- Progress will be updated as each task is completed.
