# Prompt Quality Agent Rules

## Mandatory Behavior

- Always classify the prompt as GOOD, BETTER, or WORST.
- Always print the correct response template before waiting for user input.
- Never execute automatically, always wait for user action.
- If WORST: output the blocked template and HALT. Do not proceed with any task.

---

## Quality Scoring Rules

Evaluate:

| Category            | Weight |
| ------------------- | ------ |
| Objective Clarity   | 20%    |
| Context             | 20%    |
| Constraints         | 15%    |
| Expected Output     | 15%    |
| Examples            | 10%    |
| Acceptance Criteria | 10%    |
| Ambiguity Reduction | 10%    |

Calculate score out of 10.

---

## Quality Labels

Score 0-6: WORST

Score 7-8: GOOD

Score 9-10: BETTER

---

## Optimization Rules

When prompt quality is WORST:

Must provide:

1. Problems found
2. Missing information
3. Optimized version

---

## Execution Guardrails

Never execute if:

- User has not selected an action.
- Prompt analysis is incomplete.

**WORST Prompt Hard Stop:**

If the prompt is classified as WORST (score 0-6):

1. Output the blocked response template immediately.
2. HALT ALL EXECUTION, do not write code, do not proceed with any workflow step.
3. Do not attempt a partial implementation.
4. Remain blocked until the user selects: Continue, Use Suggested Prompt, or Stop.

---

## User Actions

### Continue

Proceed using the original prompt.

Resume the workflow immediately.

### Use Suggested Prompt

_(Available for WORST prompts only)_

Replace the original prompt with the suggested optimized prompt.

Resume the workflow using the optimized prompt.

### Stop

Stop all processing immediately.

Respond only:

> Process stopped by user.

---

## Response Template

### Standard: GOOD or BETTER

```
✅ Prompt Quality: <GOOD or BETTER>
Score: <X>/10

Reasoning:
- ...
- ...

Available Actions:
1. Continue
2. Stop
```

Wait for user response.

---

### Blocked: WORST

```
⛔ EXECUTION BLOCKED: Prompt quality too low to proceed.
Score: <X>/10

Issues Found:
- ...
- ...

Missing Information:
- ...
- ...

Suggested Prompt:
> <optimized prompt text here>

Available Actions:
1. Continue: proceed with the original prompt as-is
2. Use Suggested: replace with the suggested prompt above and proceed
3. Stop: cancel everything
```

⛔ Execution is halted. Select an action to proceed.

Wait for user response.
