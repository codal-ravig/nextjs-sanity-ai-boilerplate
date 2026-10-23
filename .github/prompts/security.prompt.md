# Security Prompt

> Prompt template used by the Security Agent to detect vulnerabilities in AI-generated code.

## System Prompt

```
You are an Enterprise Security Validation Agent with expertise in:
- OWASP Top 10 vulnerabilities
- Secure coding practices
- Threat modeling
- Cryptographic best practices
- Authentication and authorization patterns

You analyze code with a security-first mindset. You assume all inputs are malicious
until proven otherwise. You flag risks by severity and provide actionable fixes.

Zero tolerance for: hardcoded secrets, SQL injection, XSS, and missing auth checks.

Reference standard: https://owasp.org
```

## Quick Scan Prompt

```
Analyze this code for:
- SQL Injection
- XSS (Cross-Site Scripting)
- Authentication flaws
- Authorization issues
- Secret exposure

Return:
- PASS / FAIL
- Severity: Critical | High | Medium | Low
- Vulnerabilities found (file:line, description)
- Fix suggestions with corrected code
```

## Security Scan Prompt

````
Perform a security analysis of the following code.

## Context
- **File:** {{FILE_PATH}}
- **Type:** {{CODE_TYPE}} (API endpoint / service / utility / frontend)
- **Handles User Input:** {{YES_NO}}
- **Accesses Database:** {{YES_NO}}
- **External API Calls:** {{YES_NO}}

## Security Rules
Reference: .github/rules/security-rules.md

## Scan For

### Injection Vulnerabilities
- SQL injection (string concatenation in queries)
- Command injection (user input in shell commands)
- NoSQL injection (unvalidated object queries)
- XSS (unsanitized output in HTML)
- Path traversal (user input in file paths)

### Authentication & Authorization
- Missing auth checks on endpoints
- Broken access control (IDOR)
- Weak session management
- Missing rate limiting on sensitive endpoints

### Data Exposure
- Hardcoded secrets (API keys, passwords, tokens)
- Sensitive data in logs
- Excessive data in API responses
- Missing encryption for PII

### Configuration
- Debug mode enabled
- Overly permissive CORS
- Missing security headers
- Insecure cookie settings

## Code to Analyze
```{{LANGUAGE}}
{{CODE}}
````

## Expected Output

### Risk Assessment

Rate overall risk: Critical / High / Medium / Low / Clean

### Findings (ordered by severity)

For each vulnerability:

1. **ID:** CWE identifier
2. **Severity:** Critical / High / Medium / Low
3. **Location:** file:line
4. **Description:** What's wrong
5. **Attack Vector:** How it could be exploited
6. **Impact:** What an attacker could achieve
7. **Fix:** Code showing the secure implementation

### Recommendations

- Immediate actions (must do before merge)
- Short-term improvements (next sprint)
- Long-term hardening (backlog)

## Dependency Audit Prompt

```
Audit the following dependency list for security risks.

## Dependencies

{{PACKAGE_JSON_DEPS}}

## Check For

1. Known CVEs (critical and high severity)
2. Unmaintained packages (no updates in 12+ months)
3. Packages with excessive permissions
4. Typosquatting risks
5. License compliance issues

## Output

| Package | Version | Risk | CVE | Action |
| ------- | ------- | ---- | --- | ------ |
```

## Threat Model Prompt

```
Create a threat model for the following feature.

## Feature Description

{{FEATURE_DESCRIPTION}}

## Data Flow

{{DATA_FLOW_DESCRIPTION}}

## Identify

1. Trust boundaries crossed
2. Entry points for attackers
3. Assets at risk
4. Potential threats (STRIDE model)
5. Mitigations required

## Output as

| Threat | Category | Likelihood | Impact | Mitigation |
```
