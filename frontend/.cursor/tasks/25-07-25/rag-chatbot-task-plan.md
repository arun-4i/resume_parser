# Task Plan: Clone Chat UI for Custom RAG Chatbot (25-07-25)

## Objective

Clone the existing chat UI (ResumeCompareClient, ResumeCompareChat, ResumeCompareForm, etc.) to create a new custom RAG chatbot with multi-chat (multiple conversation) support, starting from a new `page.tsx` and components. Integrate with a new API endpoint (details to be provided) and ensure all code is modular, maintainable, and follows project rules.

---

## Steps

1. **Clone Chat UI Structure**

   - Duplicate the chat UI components (`ResumeCompareClient`, `ResumeCompareChat`, `ResumeCompareForm`, etc.) for the RAG chatbot.
   - Start from a new `page.tsx` for the RAG chatbot.
   - Ensure the UI/UX matches the existing chat, adapting only as needed for RAG features.

2. **Server Actions**

   - Implement server actions for chat message submission and retrieval.
   - Ensure all API calls are made via server actions using the axios instance, refer to `resume-compare-server-action` for flow, not Next.js API routes.
   - Keep server actions and components in separate files/directories.

3. **Multi-Chat Support**
   Phase-1
- The chat UI must allow sending multiple messages per session, with a scrollable conversation area (like ChatGPT).
  
  Phase-2
  - Add support for multiple chat sessions (conversations), similar to ChatGPT.
  - Implement chat session management and chat history display.
  - Allow users to create, switch, and delete chat sessions.

4. **API Integration**

   - On page load, call an API to obtain a session token.
   - For every chat request, append the session token and send the API request.
   - Integrate the new RAG chatbot API endpoint (to be provided).
   - Handle API responses and errors gracefully.

5. **Clarifications & Feedback**
   - Request any additional details needed (API endpoint, session token, custom features).
   - Use the feedback/retrospective process after each step to improve implementation and planning.

---

## Notes

- Follow all standards and workflow defined in `.cursorrules` and referenced rules files.
- Use only PowerShell commands for any terminal operations.
- Place all new rules, tasks, and docs inside the `.cursor` folder structure.
- Keep code clear, concise, and modular.
- Use inline CSS as per project preference.
- No logging in frontend code.
- Use Context7 MCP for documentation if needed.

---

## Awaiting Clarification

- API endpoint for RAG chatbot responses (to be provided)
- Session token requirements and how to obtain/send it (to be provided)
- Any additional custom features or requirements

---

_Please provide the API endpoint, session token details, and any other requirements before implementation begins._
