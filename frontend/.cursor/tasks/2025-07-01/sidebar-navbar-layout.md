# Plan: Responsive Protected Layout with ShadCN Sidebar & Custom Navbar

## Overview

Implement a fully responsive protected layout for the application, featuring a collapsible shadcn sidebar and a custom navbar. The sidebar uses shadcn components and is collapsible/responsive. The navbar is a custom component with a logo, avatar dropdown (log out + dark mode toggle), and adapts for mobile/desktop as per requirements.

## Requirements Clarification

- Sidebar must use shadcn (from `src/components/ui/sidebar.tsx`), be collapsible, and responsive (offcanvas on mobile).
- Sidebar header text 'Sync Application' must be centered with proper padding on all sides, in both desktop and mobile views.
- Sidebar menu groups/items must be top-aligned (not vertically centered), with horizontal alignment unchanged, in both desktop and mobile views.
- Sidebar must be collapsible in desktop view, with a right-corner chevron toggle below the avatar (rotates on click, only visible on desktop).
- When collapsed, sidebar width shrinks and only icons are shown (labels hidden). All transitions (width, opacity, rotation) must be smooth and modern using Tailwind.
- Sidebar must be populated with menu items (e.g., Setup Details, Schedule Details, Schedule Logs, Users, Sync Configurations, Extract Status, Job Management) using shadcn sidebar primitives and lucide-react icons, matching the UI screenshot.
- Navbar must be a custom component in `src/components/navbar.tsx`:
  - Logo on left (centered on mobile)
  - Hamburger icon on left (mobile only, triggers sidebar)
  - Avatar on right with dropdown (log out + dark mode toggle)
  - Dropdown uses shadcn popover/menu pattern
  - Dark mode toggle uses Switch and ThemeProvider
- Both sidebar and navbar must be integrated into the protected layout (`src/app/(protected)/layout.tsx`).
- Layout must be fully responsive and accessible.
- Add shadcn charts to the homepage, using a minimalistic and modern design.

## Tasks

- [x] Review and reuse shadcn sidebar implementation.
- [x] Create custom Navbar component in `src/components/navbar.tsx`.
- [x] Implement avatar dropdown with log out and dark mode toggle.
- [x] Integrate sidebar and navbar into `src/app/(protected)/layout.tsx`.
- [x] Ensure full responsiveness and accessibility.
- [x] Refactor sidebar to collapse to icons with smooth width and label transitions (desktop only).
- [x] Add a right-aligned chevron toggle button below the avatar (desktop only, rotates on click, toggles sidebar state).
- [x] Use Tailwind for all sidebar transitions and animations.
- [x] Populate the sidebar with shadcn-style menu items as per the UI screenshot and requirements.
- [x] Add shadcn charts to the homepage, using a minimalistic and modern design.
- [ ] Center the text 'Sync Application' in the sidebar header with proper padding on all sides (desktop and mobile).
- [ ] Top-align the sidebar menu groups/items (not vertically centered), with horizontal alignment unchanged (desktop and mobile).
- [ ] Get user approval for this plan.
- [ ] Retrospective/feedback after implementation.

## Bug-Prevention & Quality Checklist

- [x] Accessibility (a11y) checked
- [x] Responsive on all breakpoints
- [x] State edge cases handled
- [x] Error boundaries in place
- [x] Security best practices followed
- [x] Performance reviewed
- [x] Linting/formatting passed
- [x] Tests written and passing (manual/visual)

## Feedback Section

- What errors or blockers were encountered?
- Was the feature request clear?
- How could the plan/checklist or rules be improved?
- Did any part of the rules or workflow cause confusion?
- What action(s) will be taken to address feedback?
- What should the AI do differently next time?
- Any other notes?
