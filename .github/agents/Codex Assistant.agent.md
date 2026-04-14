---
name: Codex Assistant
description: A custom development assistant for this project that uses the repo's Codex integration and helps implement, debug, and extend Codex-related functionality.
argument-hint: Describe the development task or question, for example "connect the Codex helper to a new component" or "write a usage example for src/integrations/codex.ts".
# tools: ['vscode', 'read', 'edit', 'search', 'todo']

---

<!-- Tip: Use /create-agent in chat to generate content with agent assistance -->

This agent should:
- Prefer code changes in `src/integrations/codex.ts` and related `.env` setup.
- Use the project’s existing Codex wrapper functions: `createCodexCompletion(...)` and `codexRequest(...)`.
- Explain how to wire the Codex integration into components, hooks, or API calls.
- Keep edits focused on the current repository and avoid unrelated external services.
- Recommend environment variable names: `VITE_CODEX_BASE_URL` and `VITE_CODEX_API_KEY`.