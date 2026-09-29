---
name: efficient-debugging
description: Diagnose and resolve coding errors using targeted investigation, minimal file reads, limited retries and focused testing to reduce unnecessary token and quota consumption.
---

# Efficient Debugging Protocol

This skill guides root-cause diagnosis and bug resolution using structured, hypothesis-driven debugging. It eliminates speculative edits, uncontrolled retry loops, and unnecessary token burn.

---

## 1. Error Triage & Reproduction

- **Analyze Evidence First**: Before opening or modifying files, carefully examine the exact error message, stack trace, HTTP response status, browser console log, or test failure output.
- **Isolate the Failure**:
  - Identify the precise line, function, route, or UI state where the failure originates.
  - Reproduce or verify the failure through a minimal test command or targeted reproduction step before writing any fix.

---

## 2. Hypothesis-Driven Diagnosis

- **Formulate Explicit Hypotheses**: Before editing code, clearly articulate why the failure occurs (e.g., *"Function X receives `undefined` when data key Y is missing in payload"*).
- **Inspect Only Culprit Files**:
  - Open only the specific file(s) and line range identified in the call stack or failure hypothesis.
  - Do not read surrounding unrelated architectural layers or speculative files.
- **Reject Speculative Multi-File Edits**: Never alter multiple unrelated components simultaneously in hopes of fixing an issue by chance.

---

## 3. Surgical & Incremental Changes

- **Single Atomic Fixes**: Apply one focused modification at a time.
- **Preserve Unrelated Logic**: Maintain all existing adjacent behaviors, comments, and guards unless directly implicated in the defect.
- **Avoid Heavy Environmental Actions**:
  - Do not reinstall dependencies, delete cache folders, rewrite configuration files, or rebuild entire environments unless direct evidence shows environmental corruption.

---

## 4. Focused Validation & Regression Checks

- **Smallest Viable Verification**: Execute only the specific test or script that exercises the fixed path (e.g., `python tests/test_crisis_calculators.py -k test_target_calc`).
- **No Redundant Test Passes**: Do not re-run tests that have already succeeded unless the underlying code, inputs, or execution environment have changed.
- **Confined Regression Scope**: Verify immediately adjacent functions or dependents that touch the altered contract. Avoid running full, unrelated test suites.

---

## 5. Three-Attempt Circuit Breaker

To prevent cascading token waste and runaway debugging loops:

1. **Count Failures**: Track consecutive unsuccessful fix attempts for the same bug.
2. **Halt at Attempt 3**: If 3 consecutive code modifications fail to resolve the issue:
   - **Stop modifying code immediately.**
   - Synthesize a concise diagnostic summary:
     - What was investigated (exact error, files inspected).
     - What was attempted across the 3 iterations and the outcome of each.
     - What concrete evidence is now known vs. unknown.
   - Propose an alternative diagnostic approach or ask the user for specific clarification before proceeding.

---

## 6. Honest & Concise Reporting

- **Summary Requirements**: When communicating the resolution:
  - State the **root cause** in 1–2 sentences.
  - List the **files modified** with relevant line references.
  - Describe the **solution applied**.
  - Detail the **exact test or validation command** executed and its result.
- **Evidence-Based Claims**: Never state or imply that a bug is fixed unless objective verification (test output, log output, or validation command) explicitly confirms the fix.
