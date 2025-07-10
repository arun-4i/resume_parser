# Landing Page Plan

## Requirements Clarification

- **Feature Overview:** Create a public landing page with a top navbar, a collapsible sidebar, and a dummy home content area.
- **Component/API Specification:**
  - Navbar and sidebar must be reusable components, placed in `components/shared`.
  - Navbar: logo (left corner), avatar (right corner) with dropdown which appears when clicked on avatar (logout is a button, dark mode toggle is text on left and a toggle on right). 2 items in the navbar and 2 items in dropdown.
  - Sidebar: 4 links, collapsible, active link highlighting.
  - Use ShadCN avatar for navbar avatar.
  - Navbar and sidebar must be part of the protected layout: `src/app/(protected)/layout.tsx`.
  - The protected layout should render `{children}` inside the layout.
  - The protected page should be `src/app/(protected)/home/page.tsx` with dummy home content.
  - Fully responsive: sidebar collapses to drawer on mobile.
- **Validation Requirements:** No additional validation for now.
- **Business Logic Rules:** Sidebar toggle and active link highlighting required.
- **Error Handling:** No error states for now.
- **Security & Authorization:** Public page.
- **Logging & Auditing:** No events to log.
- **Performance/Scalability:** Follow industry standard best practices.
- **Additional Context:** Use ShadCN and TailwindCSS. Fully responsive design.

---

## Reference: Next.js 15 App Router Official Docs

- Folder structure, layouts, route groups, and file conventions are based on the latest [Next.js 15 App Router documentation](https://nextjs.org/docs/app/building-your-application/routing).
- Key conventions:
  - Use `(folder)` for route groups (not in URL).
  - Use `_folder` for private, non-route folders.
  - Use `layout.tsx` for shared UI and to wrap children.
  - Use `page.tsx` for route entry points.
  - Use `loading.tsx`, `error.tsx`, `not-found.tsx` for special UI states.
  - Use `api/route.ts` for API handlers.
  - Components: `PascalCase.tsx`; Hooks: `use-kebab-case.ts`; Files: `kebab-case.ts`; Folders: `kebab-case`.

---

## Plan Checklist

- [ ] Scaffold folder structure if needed (`components/shared`, `src/app/(protected)/`, etc.)
- [ ] Create `Navbar` component in `components/shared/Navbar.tsx`
- [ ] Create `Sidebar` component in `components/shared/Sidebar.tsx`
- [ ] Add logo (placeholder) and avatar (ShadCN) to navbar
- [ ] Implement dropdown in navbar (logout button, dark mode toggle with text and switch)
- [ ] Add 2 items to navbar and 2 items in dropdown
- [ ] Add 4 navigation links to sidebar
- [ ] Implement sidebar toggle (collapsible)
- [ ] Implement active link highlighting
- [ ] Make layout fully responsive (sidebar as drawer on mobile)
- [ ] Create protected layout in `src/app/(protected)/layout.tsx` with navbar, sidebar, and `{children}`
- [ ] Create protected home page in `src/app/(protected)/home/page.tsx` with dummy content
- [ ] Integrate all components in the protected layout

---

## Bug-Prevention & Quality Checklist

- [ ] Accessibility (a11y) checked
- [ ] Responsive on all breakpoints
- [ ] State edge cases handled
- [ ] Error boundaries in place
- [ ] Security best practices followed
- [ ] Performance reviewed
- [ ] Linting/formatting passed

---

## Plan Approved By:

---

## Retrospective & Feedback

- What errors or blockers were encountered?
- Was the feature request clear?
- How could the plan/checklist or rules be improved?
- Did any part of the rules or workflow cause confusion?
- What action(s) will be taken to address feedback?
- What should the AI do differently next time?
- Any other notes?

---

**Please confirm if this updated plan matches your requirements, or let me know if there are any further details or changes needed (e.g., should the protected layout require authentication, or is it just a structural grouping?).**
