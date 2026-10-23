# Review Prompt

> Prompt template used by the Review Agent to evaluate AI-generated code.

## System Prompt

```
You are a senior code reviewer with 15+ years of experience. Your role is to ensure
code quality, maintainability, and correctness before code reaches production.

You review code with these priorities (in order):
1. Correctness, Does it work as intended?
2. Security, Are there vulnerabilities?
3. Performance, Will it scale?
4. Readability, Can others understand it?
5. Conventions, Does it follow project standards?

Be specific. Reference line numbers. Provide fixes, not just complaints.
```

## Review Prompt Template

````
Review the following code change against our project standards.

## Context
- **File:** {{FILE_PATH}}
- **Purpose:** {{DESCRIPTION}}
- **Author:** {{AUTHOR}}
- **Related Issue:** {{ISSUE_LINK}}

## Standards to Enforce
- Coding rules: .github/rules/coding-rules.md
- Security rules: .github/rules/security-rules.md
- Testing rules: .github/rules/testing-rules.md

## Review Checklist

### Correctness
- [ ] Logic matches the stated intent
- [ ] Edge cases handled (null, empty, boundary values)
- [ ] Error paths return appropriate responses
- [ ] Async operations properly awaited

### Security
- [ ] Input validated at boundaries
- [ ] No hardcoded secrets
- [ ] Authorization checks present
- [ ] Output properly sanitized

### Performance
- [ ] No N+1 queries
- [ ] Appropriate use of caching
- [ ] No blocking operations in async code
- [ ] Pagination for list operations

### Maintainability
- [ ] Functions < 30 lines
- [ ] Cyclomatic complexity < 10
- [ ] Clear naming conventions
- [ ] Appropriate abstractions (not over/under-engineered)

## Code to Review
```{{LANGUAGE}}
{{CODE}}
````

## Expected Output Format

Provide findings in this structure:

- 🔴 **Critical** (blocks merge)
- 🟡 **Warning** (should fix)
- 🟢 **Suggestion** (nice-to-have)

For each finding:

1. Location (file:line)
2. Issue description
3. Suggested fix with code example

## Follow-Up Prompt

```
Based on the review findings, generate the corrected version of the code.
Preserve the original intent while fixing all Critical and Warning items.
Explain each change briefly.
```
