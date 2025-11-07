# Security Guidelines for DNZwrk CRM

**Project:** dnzwrk-crm-sveltekit-dexie  
**Purpose:** Local-first, private, offline-capable personal CRM built with SvelteKit and Dexie.js

---

## 1. Introduction
These guidelines ensure that DNZwrk adheres to modern security best practices from design through deployment. While the core application is local-first and offline-only today, we anticipate future online sync features. This document covers both current and planned vectors.

## 2. Core Security Principles
- **Security by Design**: Integrate security at every layer—from SvelteKit routing to Dexie database schema.  
- **Least Privilege**: Grant only necessary permissions (e.g., IndexedDB uses only its own database).  
- **Defense in Depth**: Use multiple controls (input validation, CSP, sanitization).  
- **Fail Securely**: On Dexie errors, surface generic messages and log details safely.  
- **Secure Defaults**: Production builds disable verbose logging and debugging.

## 3. Threat Model & Scope
- **Local Attack Surface**: Malicious browser extensions, XSS injections via malformed data, unsafe third-party scripts.  
- **Future Sync Risks**: Unauthenticated API endpoints, data leakage in transit, improper CORS.  
- **PWA Risks**: Tampered service worker, manifest misconfigurations.

## 4. Secure Design for SvelteKit + Dexie.js
1. **IndexedDB Isolation**  
   - Use a dedicated database name (`dnzwrkDatabase`).  
   - Limit object stores to only the data you need (`commissions`).  
2. **Type Safety & Validation**  
   - Define `Commission` interface in TypeScript.  
   - Use schema validation (e.g., Zod or Yup) on all user input before saving to Dexie.  
3. **Error Handling**  
   - Wrap Dexie operations in `try…catch`.  
   - On failure (disk full, corrupted DB), show a friendly user message and log the error to an internal store (no PII).  
4. **Reactive Stores**  
   - Expose only safe methods (`addCommission`, `updateStatus`, `deleteCommission`).  
   - Do not allow direct mass mutation of the store.

## 5. Authentication & Access Control
Although DNZwrk is offline-only initially, plan ahead:
- **No Default Auth on Client**: Don’t collect credentials unless implementing sync.  
- **Future Sync Endpoints**:  
  - Require strong authentication (JWT with HS256/RS256, validate `exp`, `iss`, `aud`).  
  - Implement RBAC for administrative sync operations.  
- **Session Management**:  
  - If using cookies, set `HttpOnly`, `Secure`, `SameSite=Strict`.

## 6. Input Handling & Output Encoding
1. **Prevent Injection**  
   - SvelteKit uses parameterized queries internally; Dexie.js does not evaluate code.  
   - Sanitize all text inputs (title, client) to strip or encode HTML.  
2. **XSS Mitigation**  
   - Use Svelte's `{#html}` sparingly and only on sanitized content.  
   - Enforce a strict Content Security Policy (CSP) header via the SvelteKit adapter.  
3. **File Uploads (PWA Icons or Assets)**  
   - Validate and restrict file types (e.g., `.png`, `.ico`).  
   - Serve from `static/` with read-only permissions.

## 7. Data Protection & Privacy
- **Local Encryption (Optional)**: Consider encrypting the IndexedDB store using a client-derived key (e.g., Web Crypto API) if storing sensitive PII.  
- **Transport Security**: For future sync, require HTTPS/TLS 1.2+ on all endpoints.  
- **Secret Management**: Don’t hard-code API keys in client. Use environment variables in server builds or secrets managers in backend.

## 8. API & Service Security (Future Sync)
- **Versioned Endpoints**: `/api/v1/sync`.  
- **Rate Limiting**: Throttle sync requests per user/IP to prevent abuse.  
- **CORS**: Allow only trusted origins (your PWA host or custom domains).  
- **Input Validation**: Validate payloads with JSON schemas.  
- **Output Filtering**: Return only necessary fields—never internal metadata.

## 9. Web Application Security Hygiene
1. **Security Headers** (configure in `hooks.server.ts` or adapter config):  
   - `Content-Security-Policy`: block inline scripts, allow only self-hosted assets.  
   - `Strict-Transport-Security`: `max-age=31536000; includeSubDomains`.  
   - `X-Content-Type-Options: nosniff`.  
   - `X-Frame-Options: DENY`.  
2. **Service Worker**:  
   - Sign or hash the worker script.  
   - Validate requests in the fetch handler—never blindly proxy external requests.  
3. **Subresource Integrity (SRI)**:  
   - Add integrity attributes to any CDN-hosted scripts or styles in your `app.html` template.

## 10. PWA & Mobile Security
- **manifest.json**:  
  - Verify `start_url` is relative (`./`).  
  - Validate icons and display orientation.  
- **Offline Caching**:  
  - Whitelist essential routes and assets.  
  - Avoid caching third-party domains unless necessary and integrity-checked.

## 11. Infrastructure & Configuration Management
- **Build Settings**:  
  - Production builds must have `NODE_ENV=production`.  
  - Disable SvelteKit debug mode.  
- **Environment Variables**:  
  - Use `.env` files for server secrets—never commit them.  
- **Dependency Updates**:  
  - Regularly run `npm audit` and monitor Snyk or GitHub Dependabot alerts.  
- **Server Hardening** (if you deploy a backend):  
  - Open only required ports (80/443).  
  - Disable unused services and default credentials.

## 12. Dependency Management
- **Lockfiles**: Commit `package-lock.json` to ensure deterministic installs.  
- **Vet Packages**: Only install well-maintained SvelteKit, Dexie, html2canvas, and Tailwind packages.  
- **Regular Auditing**: Automate vulnerability scans in CI.

## 13. CI/CD & DevOps Practices
- **Secure Pipelines**:  
  - Store secrets (build tokens, API keys) in your CI secret manager.  
  - Run linters (`eslint`, `stylelint`) and security audits before deploy.  
- **Automated Testing**:  
  - Include tests for schema validation, API contract tests, and service worker behavior.  
- **Rollback Strategy**:  
  - Tag releases and allow quick rollback on regression or security incident.

---

**By following these guidelines, DNZwrk will maintain a strong security posture while delivering a private, offline-first CRM experience.**