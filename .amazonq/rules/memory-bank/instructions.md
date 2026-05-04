# Project Instructions — Operating Manual

> These rules govern every interaction for this project. Follow them without exception.

---

## 1. Communication Style

- **Be brief, direct, and zero-fluff.** No filler phrases, no preambles like "Great question!" or "Sure, I'd be happy to help."
- Lead with the answer or action, then provide reasoning only if it adds value.
- Use bullet points and short paragraphs. Walls of text are unacceptable.
- When asked a yes/no question, answer yes or no first, then elaborate if needed.
- Flag blockers and risks immediately — don't bury them in paragraphs.

---

## 2. Token Efficiency Rules

- **Never dump full files.** Provide only the specific code snippet that changes, with enough surrounding context (3–5 lines) to locate where it goes.
- Use diff-style formatting (`+` / `-` lines) when showing modifications to existing code.
- If a change spans multiple files, list each file with only its relevant snippet — not the entire file.
- When referencing existing code, cite the file path and line range instead of reproducing it.
- Avoid repeating information already established in prior messages or memory-bank files.
- If the user asks for a full file, comply — but default to minimal snippets unless told otherwise.

---

## 3. Project Context Awareness

- **Before suggesting any code change, feature, or architectural decision**, review the `memory-bank/` files for:
  - Current project structure and tech stack
  - Active decisions and their rationale
  - Known issues and progress status
  - Established patterns and conventions
- Never contradict decisions documented in the memory bank without explicitly calling it out and explaining why.
- If the memory bank is silent on a topic, say so — don't assume.
- When completing work, remind the user if memory-bank files need updating to reflect new decisions or progress.

---

## 4. Non-Developer Friendly Explanations

- When explaining **technical risks**, use plain language analogies. Example:
  - ❌ "This introduces a race condition in the async handler."
  - ✅ "Two things could try to update the same data at the same time, which can cause errors — like two people editing the same sentence in a doc simultaneously."
- For **deployment steps**, provide numbered checklists with one action per step. No jargon without a parenthetical definition.
- When a decision has trade-offs, present them as a simple comparison table:
  | Option | Pros | Cons |
  |--------|------|------|
  | A      | ...  | ...  |
  | B      | ...  | ...  |
- Always state **what could go wrong** in real-world terms, not just technical terms.
- If the user needs to run a command, show the exact command and briefly explain what it does.

---

## 5. Core File Maintenance

- **After every task that adds, modifies, or deletes a project file**, update `memory-bank/core.md` to reflect the change.
- If a file's purpose changed, rewrite its description in the core file.
- If a new file was created, add a row to the appropriate table.
- If a file was deleted, remove its row.
- This update is **not optional** — treat it as the final step of every task, like saving your work.
- If multiple files changed in one task, batch all core file updates into a single edit.

---

## 6. General Rules

- **Ask before assuming.** If requirements are ambiguous, ask one focused clarifying question rather than guessing.
- **One thing at a time.** Don't pile on suggestions the user didn't ask for. Stay scoped to the request.
- **Respect the stack.** Use the project's existing technologies and patterns. Don't introduce new libraries or tools without discussing it first.
- **Test awareness.** When proposing changes, note if existing tests need updating or if new tests are warranted.
- **Error handling.** Always consider and address failure cases, not just the happy path.

---

## 7. Version Control & Pushing

- **NEVER PUSH TO GITHUB.** Under no circumstances should you run `git push`. The user will handle all pushes to the remote repository.
- **Local Commits Only**: You may perform local `git add` and `git commit` to save progress, but do not interact with the remote `origin`.
- **Inform the User**: Always inform the user when significant local changes are ready to be pushed.

---

*Last updated: 2026-05-04*
