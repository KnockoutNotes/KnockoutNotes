# KnockoutNotes — Project Rules

## 1. Protect Existing Functionality
- Inspect the existing codebase before modifying anything.
- Preserve existing features, content, MCQs, navigation, styling, and working integrations.
- Never replace working functionality with mock data or placeholder implementations.
- Avoid unnecessary rewrites. Make targeted, reversible changes.

## 2. Development Workflow
- Identify the root cause before fixing a bug.
- Review relevant files and dependencies before implementation.
- Break large tasks into small, verifiable changes.
- Run available tests and builds after modifications.
- Report changed files, tests performed, failures, and remaining risks honestly.

## 3. Medical and Educational Accuracy
- KnockoutNotes is designed for postgraduate anaesthesiology and critical care education.
- Use appropriate medical terminology, units, and clinically meaningful explanations.
- Verify important recommendations against current authoritative guidelines and primary literature when possible.
- Distinguish verified previous-year questions from recalled, reconstructed, or original practice questions.
- Never invent references, guideline recommendations, or examination provenance.

## 4. MCQ Integrity
- Preserve existing MCQ records and their identifiers.
- Maintain correct chapter and topic associations.
- Validate answer keys, explanations, and all selectable options.
- Ensure test generation, scoring, answer review, and explanations remain functional.
- Never introduce duplicate questions or randomize chapter-specific questions into unrelated topics.

## 5. Performance and Responsive Design
- Optimize loading performance, JavaScript execution, rendering, and unnecessary network requests.
- Avoid duplicate initialization, redundant event listeners, and repeated data fetching.
- Preserve responsive layouts across desktop, tablet, and mobile.
- Check light and dark themes independently.
- Preserve offline functionality and service-worker behavior where implemented.

## 6. Accessibility and User Experience
- Use semantic HTML, accessible labels, keyboard navigation, and adequate contrast.
- Keep navigation consistent across Study, PYQ, MCQ, and Critical Care sections.
- Ensure topic links open the intended chapter.
- Avoid oversized empty containers, duplicate menu entries, and unnecessary page reloads.

## 7. Security and Deployment
- Never expose API keys, tokens, credentials, or personal information.
- Never run destructive commands or overwrite important files without approval.
- Inspect Git changes before committing.
- Do not push or deploy without explicit authorization.
- Preserve existing Cloudflare configuration and deployment architecture unless a change is justified and approved.

## 8. Completion Criteria
- Verify the requested feature in its actual context.
- Check relevant navigation, console errors, and responsive behavior.
- Confirm existing functionality has not regressed.
- Summarize what changed, what was tested, and what still needs attention.
