# Example Feature Plan: [Feature Name]

# Description: Template for planning and tracking frontend features. Includes requirements clarification, plan checklist, bug-prevention, approval, and feedback. Agent-requestable.

## Requirements Clarification

- **Feature Overview:**
- **Component/API Specification:**
- **Layout & Positioning Details:** (For UI/layout features - ask specific positioning questions)
- **Responsive Behavior Specification:** (Mobile vs desktop requirements)
- **Visual Integration Requirements:** (Background, borders, blending preferences)
- **State Management Expectations:** (Data persistence, clearing triggers)
- **Animation & Interaction Preferences:** (Desired vs distracting effects)
- **Validation Requirements:**
- **Business Logic Rules:**
- **Error Handling:**
- **Security & Authorization:**
- **Logging & Auditing:**
- **Performance/Scalability:**
- **Additional Context:**

### Enhanced Pre-Implementation Questions (For UI/Layout Features)

**Before any UI/layout implementation, ask these specific questions:**

1. **Layout Positioning**: "Where exactly should each element be positioned? (left/center/right, top/bottom)"
2. **Responsive Behavior**: "How should this look and behave differently on mobile vs desktop?"
3. **Visual Integration**: "Should this blend seamlessly with the background or have distinct styling?"
4. **State Management**: "When should data be cleared vs preserved? What triggers state changes?"
5. **Animation Preferences**: "What animations are desired vs distracting? What should happen during transitions?"
6. **Form Structure**: "Should this be a single form or multiple sections? Where should buttons be positioned?"
7. **Background & Borders**: "Should elements have borders, backgrounds, or blend seamlessly?"
8. **Z-index & Layering**: "What should appear on top of what? Any overlay requirements?"

---

## Plan Checklist

- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

---

## Bug-Prevention & Quality Checklist

- [ ] Accessibility (a11y) checked
- [ ] Responsive on all breakpoints
- [ ] **Mobile/Desktop layout conflicts tested** (Enhanced validation)
- [ ] **Visual integration and background consistency verified** (Enhanced validation)
- [ ] **Button positioning and layout flow confirmed** (Enhanced validation)
- [ ] **Z-index layering tested on mobile and desktop** (Enhanced validation)
- [ ] State edge cases handled
- [ ] **Form state persistence behavior confirmed** (Enhanced validation)
- [ ] **Animation conflicts and timing tested** (Enhanced validation)
- [ ] Error boundaries in place
- [ ] Security best practices followed (XSS, CSRF, etc.)
- [ ] Performance reviewed (lazy loading, bundle size, etc.)
- [ ] Linting/formatting passed

### Enhanced Implementation Validation (For UI/Layout Features)

**During implementation, verify:**

- [ ] **Mobile/Desktop Consistency**: Test responsive behavior immediately
- [ ] **Visual Integration**: Verify background blending and border consistency
- [ ] **State Persistence**: Confirm when data should be preserved vs cleared
- [ ] **Animation Conflicts**: Check for interfering animations or timing issues
- [ ] **Z-index Layering**: Ensure proper element stacking on both mobile and desktop
- [ ] **Form Flow**: Test complete user journey from start to finish
- [ ] **Edge Cases**: Test with long content, empty states, and error conditions

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
