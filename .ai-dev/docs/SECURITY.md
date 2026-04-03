# Security Specification
**Team Task Management System**

> **Document Version:** 1.0
> **Generated:** 2026-04-01
> **Classification:** Internal
> **Security Review:** Required before production deployment

---

## 1. THREAT MODEL

| Threat | Attack Vector | Risk Level | Mitigation |
|--------|---------------|------------|------------|
| **Authentication** |
| Credential Brute Force | Automated login attempts with common passwords | High | Account lockout (5 failed attempts), 15-minute lockout period, strong password requirements (min 8 chars) |
| Session Hijacking | XSS attacks stealing JWT tokens | High | httpOnly cookies, SameSite=Strict, secure cookie flags, JWT expires in 15 minutes |
| Token Replay Attacks | Intercepted JWT tokens reused by attackers | Medium | Short access token lifetime (15 min), refresh token rotation, secure transmission only |
| Weak Password Attacks | Users choosing easily guessable passwords | Medium | bcrypt hashing (≥12 rounds), minimum password complexity requirements |
| **Authorization** |
| Privilege Escalation | Users accessing resources beyond their role | High | Role-based access control middleware, project membership validation, resource ownership checks |
| Insecure Direct Object Reference | Direct access to resources via ID manipulation | High | Authorization checks on every protected endpoint, project membership validation |
| Admin Privilege Abuse | Malicious admin accessing all data | Medium | Audit logging, principle of least privilege, last admin protection |
| **Injection** |
| SQL Injection | Malicious SQL in user inputs | Critical | Parameterized queries via Prisma ORM, input validation with Zod |
| NoSQL Injection | Malicious queries via JSON payloads | Medium | Input sanitization, strict schema validation, ORM protection |
| Command Injection | OS command execution via user input | Critical | No direct system calls, sanitized file operations |
| **Data Exposure** |
| Sensitive Data in Logs | Passwords/tokens logged by application | High | Structured logging excludes sensitive fields, log sanitization |
| Database Credential Exposure | DB connection strings in source code | Critical | Environment variable storage, secrets management |
| Information Leakage | Stack traces expose internal structure | Medium | Production error handlers, generic error messages |
| **CSRF** |
| Cross-Site Request Forgery | Malicious requests from authenticated users | Medium | SameSite cookie attributes, CSRF tokens for state changes |
| **XSS** |
| Stored XSS | Malicious scripts in task/comment content | High | Content sanitization, CSP headers, HTML encoding |
| Reflected XSS | URL parameter injection in error pages | Medium | Input validation, output encoding, CSP headers |
| **Rate Limiting** |
| API DoS | High-volume requests overwhelming server | Medium | Rate limiting (100 req/15min), endpoint-specific limits |
| Resource Exhaustion | Large payload attacks | Medium | Request size limits, JSON parsing limits |
| **Session Security** |
| Session Fixation | Attacker provides session ID to victim | Low | Session ID regeneration on login, secure session management |
| Concurrent Sessions | Multiple active sessions per user | Low | Session monitoring, refresh token validation |

---

## 2. AUTHENTICATION & AUTHORIZATION

### JWT Configuration
```json
{
  "accessToken": {
    "algorithm": "HS256",
    "expiry": "15 minutes",
    "storage": "httpOnly cookie",
    "cookieName": "access_token",
    "cookieOptions": {
      "httpOnly": true,
      "secure": true,
      "sameSite": "strict",
      "path": "/"
    }
  },
  "refreshToken": {
    "algorithm": "HS256",
    "expiry": "7 days",
    "storage": "httpOnly cookie",
    "cookieName": "refresh_token",
    "rotation": true,
    "cookieOptions": {
      "httpOnly": true,
      "secure": true,
      "sameSite": "strict",
      "path": "/api/auth"
    }
  }
}
```

### Refresh Token Strategy
- **Automatic Rotation:** New refresh token issued on every refresh
- **Revocation:** Old refresh tokens invalidated immediately
- **Storage:** Database table with expiry tracking
- **Cleanup:** Expired tokens purged daily via cron job

### Account Lockout Rules
- **Failed Attempts Limit:** 5 consecutive failed attempts
- **Lockout Duration:** 15 minutes
- **Reset Conditions:** Successful login or timeout expiry
- **Scope:** Per email address (prevents username enumeration)

### PERMISSION MATRIX

| Action | Admin | Member | Viewer |
|--------|-------|--------|--------|
| **Authentication** |
| Login/Logout | ✅ | ✅ | ✅ |
| Change Password | ✅ | ✅ | ✅ |
| **User Management** |
| Send Invitations | ✅ | ❌ | ❌ |
| View User List | ✅ | ❌ | ❌ |
| Change User Roles | ✅ | ❌ | ❌ |
| **Project Management** |
| Create Projects | ✅ | ❌ | ❌ |
| Edit Project Details | ✅ | ❌ | ❌ |
| Archive/Delete Projects | ✅ | ❌ | ❌ |
| View Project List | ✅ | ✅ (own projects) | ✅ (own projects) |
| **Project Membership** |
| Add Members | ✅ | ❌ | ❌ |
| Remove Members | ✅ | ❌ | ❌ |
| Change Member Roles | ✅ | ❌ | ❌ |
| View Member List | ✅ | ✅ | ✅ |
| **Task Management** |
| Create Tasks | ✅ | ✅ | ❌ |
| Edit Tasks | ✅ | ✅ | ❌ |
| Delete Tasks | ✅ | ✅ (own tasks) | ❌ |
| Assign Tasks | ✅ | ✅ | ❌ |
| Change Task Status | ✅ | ✅ | ❌ |
| View Tasks | ✅ | ✅ | ✅ |
| **Comments** |
| Post Comments | ✅ | ✅ | ❌ |
| Edit Comments | ✅ | ✅ (own, 15min) | ❌ |
| Delete Comments | ✅ | ✅ (own) | ❌ |
| View Comments | ✅ | ✅ | ✅ |
| **Labels** |
| Create Labels | ✅ | ❌ | ❌ |
| Edit Labels | ✅ | ❌ | ❌ |
| Delete Labels | ✅ | ❌ | ❌ |
| Assign Labels | ✅ | ✅ | ❌ |
| **Reports & Analytics** |
| View Admin Reports | ✅ | ❌ | ❌ |
| Export Data | ✅ | ❌ | ❌ |
| View Completion Trends | ✅ | ❌ | ❌ |

---

## 3. INPUT VALIDATION REQUIREMENTS

| Endpoint Group | Validation Rules | Sanitization Required |
|----------------|------------------|----------------------|
| **Authentication** |
| `/api/auth/register` | Email: RFC 5322 format, unique; Password: min 8 chars, max 128; Name: 1-100 chars, alphanumeric + spaces | HTML encode name, normalize email |
| `/api/auth/login` | Email: valid format; Password: 1-128 chars | Base validation only |
| `/api/auth/invite` | Email: valid format, not existing user; Role: enum validation | HTML encode, normalize email |
| **User Management** |
| `/api/users/me` | Name: 1-100 chars; Email: RFC 5322, unique if changed | HTML encode name, normalize email |
| `/api/users/me/notification-preferences` | Boolean validation for all preference fields | None required |
| **Project Management** |
| `/api/projects` | Name: 1-100 chars, required; Description: max 1000 chars; Color: hex format (#RRGGBB) | HTML encode name/description |
| `/api/projects/:id` | UUID format validation for ID parameter | None required |
| `/api/projects/:id/members` | user_id: valid UUID, existing user; role: enum (ADMIN, MEMBER, VIEWER) | None required |
| **Task Management** |
| `/api/projects/:projectId/tasks` | Title: 1-255 chars; Description: max 5000 chars; Priority: enum; Due date: YYYY-MM-DD; Assignee: valid UUID | HTML encode title/description |
| `/api/tasks/:id` | Same as create + Status: enum validation | HTML encode title/description |
| **Comments** |
| `/api/tasks/:id/comments` | Body: 1-5000 chars, required | HTML encode, strip dangerous tags |
| `/api/comments/:id` | Body: 1-5000 chars for updates | HTML encode, strip dangerous tags |
| **Labels** |
| `/api/projects/:id/labels` | Name: 1-50 chars, unique per project; Color: hex format | HTML encode name |
| `/api/tasks/:id/labels` | label_id: valid UUID, project scope validation | None required |
| **Reports** |
| `/api/reports/*` | Date ranges: YYYY-MM-DD format; Project ID: valid UUID | None required |
| **Universal Rules** |
| All endpoints | Request size: max 10MB; JSON depth: max 5 levels; Field count: max 100 per object | Rate limiting, CORS validation |

---

## 4. DATA PROTECTION

### Fields That Must Be Encrypted at Rest

**High Sensitivity (Database Encryption Required):**
- `users.password_hash` - bcrypt hashed passwords
- `refresh_tokens.token_hash` - Refresh token values
- `invite_tokens.token` - Invitation tokens

**Medium Sensitivity (Application-Level Encryption Recommended):**
- `users.email` - User email addresses (PII)
- `comments.body` - Comment content (may contain sensitive project info)
- `tasks.description` - Task descriptions (may contain sensitive project details)

### Fields That MUST NEVER Appear in API Responses

**Absolutely Forbidden:**
- `users.password_hash` - Password hashes
- `refresh_tokens.token_hash` - Refresh token values
- `invite_tokens.token` - Raw invitation tokens
- `activity_logs.raw_payload` - Internal system data

**Conditionally Restricted:**
- `users.email` - Only return own email or if admin viewing users
- `users.updated_at` - Internal system timestamps
- `*.deleted_at` - Soft delete timestamps (filtered out entirely)

### PII Data Handling and Retention

**Personal Identifiable Information:**
- User full names (`users.name`)
- Email addresses (`users.email`)
- IP addresses (in access logs)
- Activity patterns (behavioral data)

**Data Retention Policy:**
- **Active Users:** Data retained indefinitely while account active
- **Inactive Users:** Account lockout after 12 months inactivity notification
- **Deleted Accounts:** Soft delete for 30 days, then hard delete with data anonymization
- **Audit Logs:** 2 years retention for security events
- **Application Logs:** 90 days retention

**Data Minimization:**
- Only collect data necessary for application functionality
- No tracking or analytics beyond operational needs
- User consent for any optional data collection

### Logging Rules

**MUST LOG (Security Events):**
- Authentication attempts (success/failure) with timestamp, IP, user agent
- Authorization failures with user ID, resource, attempted action
- Account lockouts and password changes
- Admin privilege usage (project creation, role changes)
- Data export and report generation
- System errors and exceptions

**MUST NEVER LOG:**
- Raw passwords or password hashes
- JWT tokens or refresh tokens
- Session cookies or authentication headers
- Full request/response bodies containing PII
- Database connection strings or secrets

**LOG FORMAT (Structured JSON):**
```json
{
  "timestamp": "2026-04-01T12:00:00.000Z",
  "level": "info|warn|error",
  "event": "auth_success|auth_failure|privilege_escalation",
  "user_id": "uuid-or-null",
  "ip_address": "xxx.xxx.xxx.xxx",
  "user_agent": "browser-string",
  "resource": "/api/endpoint",
  "action": "GET|POST|PUT|DELETE",
  "metadata": {
    "project_id": "uuid-if-applicable",
    "error_code": "if-error",
    "risk_level": "low|medium|high"
  }
}
```

---

## 5. RATE LIMITING

| Endpoint or Group | Limit | Window | Action on Breach |
|-------------------|-------|---------|------------------|
| **Authentication** |
| `/api/auth/login` | 10 requests | 15 minutes | 423 Locked + IP tracking |
| `/api/auth/register` | 5 requests | 1 hour | 429 Too Many Requests |
| `/api/auth/refresh` | 20 requests | 5 minutes | 429 Too Many Requests |
| `/api/auth/invite` | 10 requests | 1 hour | 429 Too Many Requests |
| **API Operations** |
| `/api/*` (General) | 100 requests | 15 minutes | 429 Too Many Requests |
| `/api/tasks/*` | 200 requests | 15 minutes | 429 Too Many Requests |
| `/api/projects/*` | 50 requests | 15 minutes | 429 Too Many Requests |
| **Data Export** |
| `/api/reports/*` | 10 requests | 5 minutes | 429 Too Many Requests |
| `/api/dashboard/*` | 30 requests | 5 minutes | 429 Too Many Requests |
| **File Operations** |
| Upload endpoints | 5 requests | 1 minute | 429 Too Many Requests |
| **Search/Filter** |
| Complex queries | 30 requests | 1 minute | 429 Too Many Requests |
| **Global Limits** |
| Per IP address | 500 requests | 15 minutes | 429 + temporary IP ban |
| Per user account | 1000 requests | 15 minutes | 429 + account flag |

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 85
X-RateLimit-Reset: 1640995200
Retry-After: 300
```

**Bypass Conditions:**
- Health check endpoints (`/api/health`)
- Static assets and public content
- Internal service communications (when applicable)

---

## 6. INFRASTRUCTURE SECURITY

### CORS Policy (Allowed Origins)

**Production:**
```javascript
{
  origin: [
    'https://taskapp.vercel.app',
    'https://taskapp-preview-*.vercel.app'  // Preview deployments
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-CSRF-Token'
  ]
}
```

**Development:**
```javascript
{
  origin: ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['*']
}
```

### HTTP Security Headers (Helmet.js Configuration)

```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-eval'"],  // Next.js requires unsafe-eval
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  noSniff: true,
  xssFilter: true,
  frameguard: { action: 'deny' },
  dnsPrefetchControl: { allow: false },
  permittedCrossDomainPolicies: false
}))
```

### Environment Variable Handling Rules

**Secret Classification:**
- **Critical:** `JWT_SECRET`, `JWT_REFRESH_SECRET`, `DATABASE_URL`
- **Sensitive:** `RESEND_API_KEY`, `EMAIL_FROM`
- **Configuration:** `NODE_ENV`, `API_PORT`, `BCRYPT_ROUNDS`
- **Public:** `API_BASE_URL`, `RATE_LIMIT_WINDOW_MS`

**Storage Requirements:**
- **Development:** `.env` file (gitignored)
- **Production:** Platform environment variables (Vercel, Railway)
- **CI/CD:** Encrypted secrets storage
- **Never:** Hardcoded in source code or config files

**Validation:**
```javascript
// Environment variable validation with Zod
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  RESEND_API_KEY: z.string().startsWith('re_'),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  API_PORT: z.string().transform(Number).pipe(z.number().positive()),
  BCRYPT_ROUNDS: z.string().transform(Number).pipe(z.number().min(10))
})
```

### Secrets Management

**Secrets Rotation Schedule:**
- `JWT_SECRET`: Every 6 months or security incident
- `JWT_REFRESH_SECRET`: Every 6 months or security incident
- `DATABASE_URL`: As needed for security compliance
- `RESEND_API_KEY`: Every 12 months or vendor requirement

**Access Control:**
- Only senior developers and DevOps have production secret access
- Segregated secrets per environment (dev/staging/prod)
- Audit trail for all secret access and modifications

---

## 7. PRE-LAUNCH SECURITY CHECKLIST

**Authentication & Authorization:**
- [ ] JWT secret keys generated with cryptographically secure randomness (≥32 chars)
- [ ] httpOnly cookies configured with Secure and SameSite flags
- [ ] Password hashing uses bcrypt with ≥12 rounds
- [ ] Account lockout implemented (5 attempts, 15-minute lockout)
- [ ] Refresh token rotation working and old tokens invalidated
- [ ] All protected endpoints verify JWT and user permissions
- [ ] Role-based access control enforced for Admin/Member/Viewer roles
- [ ] Project membership validation on all project-scoped endpoints
- [ ] Last admin protection prevents removing final project admin

**Input Validation & Sanitization:**
- [ ] All API endpoints use Zod schemas for input validation
- [ ] SQL injection protection via Prisma parameterized queries
- [ ] HTML encoding applied to user-generated content (names, descriptions, comments)
- [ ] Request size limits configured (10MB max)
- [ ] JSON parsing depth limits enforced (5 levels max)
- [ ] File upload validation if applicable (not in MVP scope)
- [ ] Email format validation using RFC 5322 compliance
- [ ] UUID format validation for all ID parameters

**Data Protection:**
- [ ] Sensitive fields encrypted at rest (password hashes, tokens)
- [ ] PII data identified and handled according to retention policy
- [ ] Soft delete implemented for all user data (users, projects, tasks)
- [ ] Passwords never appear in API responses or logs
- [ ] Database connection strings stored in environment variables
- [ ] No sensitive data in error messages or stack traces
- [ ] Audit logging captures all security-relevant events

**Rate Limiting & DDoS Protection:**
- [ ] Rate limiting configured per endpoint group
- [ ] Auth endpoints have stricter limits (10/15min for login)
- [ ] Global per-IP limits implemented (500/15min)
- [ ] Rate limit headers included in responses
- [ ] Health check endpoints excluded from rate limiting
- [ ] Rate limit bypass for internal services configured

**Infrastructure Security:**
- [ ] CORS policy restricts origins to production domains only
- [ ] Security headers configured via Helmet.js
- [ ] Content Security Policy blocks unsafe inline content
- [ ] HSTS enabled with 1-year max age and subdomain inclusion
- [ ] X-Frame-Options set to DENY
- [ ] X-Content-Type-Options set to nosniff
- [ ] Referrer Policy configured to limit data leakage

**Environment & Secrets:**
- [ ] All secrets stored in platform environment variables (not code)
- [ ] Development .env file in .gitignore
- [ ] Environment variable validation implemented with Zod
- [ ] No hardcoded credentials anywhere in codebase
- [ ] Separate secrets per environment (dev/staging/prod)
- [ ] Secret rotation schedule documented and implemented

**Database Security:**
- [ ] Database user has minimum required permissions
- [ ] Database password is strong and unique
- [ ] Database connection uses SSL/TLS encryption
- [ ] No direct database access from internet
- [ ] Database backups encrypted and secured
- [ ] Migration files reviewed for security implications

**API Security:**
- [ ] OpenAPI specification updated and matches implementation
- [ ] No internal system information exposed in error responses
- [ ] API versioning strategy implemented if needed
- [ ] Request/response logging excludes sensitive data
- [ ] API documentation reviewed for security disclosures
- [ ] Error handling provides generic messages to clients

**Frontend Security:**
- [ ] All API calls use relative URLs through Next.js proxy
- [ ] No sensitive data stored in localStorage or sessionStorage
- [ ] Client-side validation complemented by server-side validation
- [ ] XSS protection via content sanitization
- [ ] CSRF protection via SameSite cookies
- [ ] No inline scripts or styles that bypass CSP

**Operational Security:**
- [ ] Structured logging implemented with sensitive data excluded
- [ ] Log retention policy implemented (90 days application, 2 years audit)
- [ ] Health check endpoint available for monitoring
- [ ] Error monitoring configured for production
- [ ] Incident response plan documented
- [ ] Security contact information provided
- [ ] Vulnerability disclosure process established

**Testing & Validation:**
- [ ] Security unit tests written for auth/authorization logic
- [ ] Integration tests verify rate limiting functionality
- [ ] End-to-end tests confirm role-based access control
- [ ] Manual penetration testing performed
- [ ] Vulnerability scanning completed
- [ ] Configuration review completed by security team
- [ ] Third-party dependency audit performed (npm audit)
- [ ] OWASP Top 10 vulnerabilities addressed

**Deployment Security:**
- [ ] Production deployment uses HTTPS exclusively
- [ ] Certificate management automated and monitored
- [ ] Production secrets different from development
- [ ] Backup and recovery procedures tested
- [ ] Rollback procedures documented and tested
- [ ] Production access restricted to authorized personnel
- [ ] Change management process includes security review

---

**Security Document Complete**
*Generated: 2026-04-01*
*Review Required: Security team approval before production deployment*
*Next Update: Post-MVP security assessment*