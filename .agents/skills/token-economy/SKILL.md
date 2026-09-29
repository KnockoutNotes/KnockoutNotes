---
name: token-economy
description: Minimize token consumption, unnecessary context loading, redundant tool calls, repeated file reads and excessive reasoning during coding, development and debugging tasks.
---

# Token Economy & Context Optimization

This skill provides operational rules for executing development and coding tasks with minimal token consumption, compact context windows, and zero wasteful tool usage while maintaining high engineering quality.

---

## 1. Precise Scope Analysis

- **Establish Boundaries**: Before invoking tools or writing code, dissect the user's prompt to identify the exact requested outcome.
- **Resist Scope Creep**: Strictly avoid unsolicited refactoring, code aesthetic reformatting, architectural overhauls, or proactive feature additions.
- **Clarify When Ambiguous**: If requirements are genuinely ambiguous, ask brief, targeted clarifying questions rather than generating multiple speculative implementations.
- **Task Decomposition**: For complex requests, structure the plan into small, logically sequential milestones. Complete and verify each step without straying into exploratory side-tasks.

---

## 2. Selective Inspection & Targeted Context Loading

- **Targeted Symbol & File Searches**: Use specific symbol, function, or filename searches (`grep_search`, `find_by_name`) constrained by subpaths instead of scanning directory trees broadly.
- **Zero Full-Codebase Ingestion**: Never dump entire directories or multi-megabyte source files into the prompt.
- **Filter Out High-Volume Assets**:
  - Never load `node_modules`, vendor bundles, build outputs, minified assets, lockfiles, or large database dumps unless explicitly instructed.
  - In this project, avoid reading large static data modules (such as `study-data.js`, `study-structures.js`, `regional-data.js`) unless the specific task directly targets their schema or contents.
- **Read Windows Rather Than Whole Files**: When inspecting files, specify targeted `StartLine` and `EndLine` slices rather than reading hundreds of lines of unrelated code.
- **Never Re-read Unchanged Files**: Retain knowledge already loaded in earlier turns. Do not call read or view tools on files whose contents have already been inspected and have not changed.

---

## 3. Minimalist Modifications & Component Reuse

- **Smallest Viable Diff**: Implement the smallest possible surgical change that fully satisfies the requirement.
- **Leverage Existing Primitives**:
  - Identify and reuse existing utility functions, UI styles, modal helpers, and design tokens rather than inventing new implementations.
  - Follow the codebase's existing architectural patterns and naming conventions.
- **Avoid Collateral Changes**: Do not touch neighboring functions, clean up unrelated linter warnings, or reorganize imports unless directly necessary for the assigned task.

---

## 4. Efficient Tool Usage & Concise Communication

- **Batch & Sequence Calls**: Combine necessary operations logically. Avoid exploratory chaining of commands.
- **Eliminate Polling Loops**: Never poll commands, tasks, or subagents in a loop. Rely on background events and reactive wakeups.
- **Concise Summaries**:
  - Keep conversational responses crisp, direct, and actionable.
  - Do not re-paste large code chunks or repeat information already established in the conversation history or generated artifacts.
  - State what was done, what was verified, and the immediate next step.

---

## 5. Focused Verification

- **Targeted Test Execution**: Run only the specific unit test, verification script, or assertion related to the modified component (e.g., execute `python tests/calculator_tests.py` rather than running an entire test suite when only calculator logic was altered).
- **No Redundant Re-verification**: Avoid executing full project builds, comprehensive audits, or static analysis sweeps unless specifically instructed or strictly required by CI.

---

## 6. Non-Negotiable Guardrails

- **Correctness & Safety First**: Never compromise functional correctness, clinical accuracy, data security, accessibility (a11y), or software maintainability to save tokens.
- **Clean Completion**: Once the requested task is implemented and verified against requirements, stop immediately.
