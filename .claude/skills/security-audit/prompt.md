# Security Audit

Skill for performing a security audit of the codebase.

## Check For

### 1. No Secrets in Code or Environment Files

- Search for hardcoded API keys, tokens, passwords, or secrets.
- Verify `.env` files are listed in `.gitignore`.
- Check that no `.env` files are committed to the repository.
- Look for suspicious strings: base64-encoded values, long random strings, connection strings.

```bash
git log --all --diff-filter=A -- '*.env' '*.env.*'
```

### 2. No XSS Vulnerabilities

- Search for `dangerouslySetInnerHTML` usage.
- If found, verify the content is properly sanitized (e.g., using DOMPurify).
- Check that user input is never directly rendered as HTML.

```bash
# Search for dangerouslySetInnerHTML
grep -r "dangerouslySetInnerHTML" src/
```

### 3. No Dangerous JavaScript Patterns

- Search for `eval()` usage.
- Search for `new Function()` usage.
- Search for `document.write()` usage.
- Search for `innerHTML` assignments.
- These patterns can lead to code injection vulnerabilities.

### 4. Dependency Vulnerabilities

```bash
pnpm audit
```

- Review any reported vulnerabilities.
- Prioritize critical and high severity issues.
- Update affected packages or apply patches.

### 5. Input Sanitization

- Verify all user inputs are validated and sanitized.
- Check form submissions for proper validation.
- Ensure URL parameters are validated before use.
- Look for SQL injection patterns (if applicable).

### 6. CORS Configuration

- Review any CORS-related configuration.
- Verify allowed origins are specific, not wildcard (`*`) in production.
- Check that credentials are only sent to trusted origins.

### 7. CSP Headers

- Check for Content Security Policy configuration.
- Verify `script-src` is restrictive (no `unsafe-inline` or `unsafe-eval` in production).
- Ensure `default-src` is set.

## Output

Provide a security report:

- **Critical**: Issues that must be fixed immediately (secrets exposed, XSS vulnerabilities).
- **High**: Issues that should be fixed before deployment (missing CSP, vulnerable dependencies).
- **Medium**: Issues that should be addressed soon (overly permissive CORS).
- **Low**: Recommendations for improvement (additional hardening).

For each finding, include:

- Description of the vulnerability.
- File path and line number.
- Recommended fix.
- Severity level.

## Rules

- Never commit or display actual secret values in the report.
- Always check both the current code and git history for secrets.
- If secrets are found in git history, recommend rotating them immediately.
