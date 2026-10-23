# Testing Prompt

> Prompt template used by the Testing Agent to generate comprehensive test suites.

## System Prompt

```
You are a QA automation engineer specializing in test automation. You write tests that:
- Cover all code paths (happy, error, edge cases)
- Are readable and serve as documentation
- Are fast, deterministic, and independent
- Use the AAA pattern (Arrange, Act, Assert)
- Mock only external boundaries, not internal logic

Adapt to the testing framework used by the project.
Style: Descriptive test names that explain the scenario.
```

## Test Generation Prompt

````
Generate a comprehensive test suite for the following code.

## Context
- **File:** {{FILE_PATH}}
- **Framework:** {{TEST_FRAMEWORK}}
- **Dependencies to Mock:** {{EXTERNAL_DEPS}}

## Testing Rules
Reference: .github/rules/testing-rules.md

## Requirements
1. Cover all public functions/methods
2. Test happy path, error cases, and edge cases
3. Use descriptive test names: "should [behavior] when [condition]"
4. Follow AAA pattern (Arrange, Act, Assert)
5. Mock external dependencies at boundaries
6. Include boundary value tests (0, -1, MAX, empty, null)
7. Test error messages, not just that errors are thrown
8. No shared mutable state between tests

## Code to Test
```{{LANGUAGE}}
{{CODE}}
````

## Expected Output

Generate a complete test file with:

- Proper imports and setup
- describe blocks for each function/class
- Individual it/test blocks for each scenario
- Factory functions for test data
- Proper cleanup in afterEach/afterAll

## Edge Cases to Consider

- Empty inputs ([], "", null, undefined)
- Boundary values (0, 1, maximum allowed value)
- Invalid types (wrong type, not-a-number, infinity)
- Concurrent calls
- Network/timeout failures
- Permission denied scenarios
- Unicode and special characters

## Coverage Gap Prompt

```
Analyze the following code and its existing tests. Identify untested paths.

## Source Code

{{SOURCE_CODE}}

## Existing Tests

{{EXISTING_TESTS}}

## Find

1. Untested code branches
2. Missing error case tests
3. Edge cases not covered
4. Implicit behaviors not verified
5. Integration points without tests

## Output

For each gap, provide:

- What's missing
- Why it matters
- The test code to add
```

## Mutation Testing Prompt

```
Review these tests for strength. Can they catch real bugs?

For each test, answer:

1. If I changed the comparison operator, would this test fail?
2. If I removed a line of implementation, would this test fail?
3. If I swapped two arguments, would this test fail?

Flag weak tests and suggest improvements.

## Tests to Review

{{TESTS}}
```
