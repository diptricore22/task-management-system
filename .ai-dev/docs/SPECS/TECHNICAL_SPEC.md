# 🗃️ Technical Specification

> **The technical blueprint for the system. This document bridges the PRD (what) with the code (how).  
> Reference this when designing or implementing any system component.**

---

## System Overview

| Field | Value |
|-------|-------|
| **App Name** | _[Name]_ |
| **Version** | _[v0.1.0]_ |
| **Tech Stack** | _[list primary technologies]_ |
| **Architecture Pattern** | _[e.g., MVC, Layered, Microservices, Monolith]_ |
| **Last Updated** | _[YYYY-MM-DD]_ |

---

## Technology Decisions

| Layer | Technology | Version | Justification |
|-------|-----------|---------|--------------|
| Language | TypeScript | 5.x | Type safety across frontend + backend |
| Frontend | Next.js (App Router) | 14+ | SSR, routing, proxy rewrites |
| Backend | Node.js + Express | 20 LTS / 4.x | Flexible, well-supported REST server |
| CSS | Tailwind CSS | 3.x | Utility-first — primary styling |
| UI Library | shadcn/ui | latest | Accessible components, Tailwind-based |
| ORM | Prisma | 5.x | Type-safe DB access + migrations |
| Validation | Zod | 3.x | Schema validation frontend + backend |
| Testing | Vitest | 1.x | Fast, ESM-native |
| Package Manager | npm | 10+ | Standard — always use npm |
| Logger | winston / pino | — | Structured JSON logging in production |

---

## API Design Standards

### Request/Response Shape

All API responses MUST follow this envelope:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;        // Machine-readable error code
    message: string;     // Human-readable message
    details?: unknown;   // Optional: validation errors, etc.
  };
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}
```

**Success example:**
```json
{
  "success": true,
  "data": { "id": "uuid", "name": "John" },
  "meta": { "pagination": { "page": 1, "limit": 10, "total": 50 } }
}
```

**Error example:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": { "email": "Invalid email format" }
  }
}
```

### HTTP Status Codes

| Code | Use Case |
|------|---------|
| 200 | Success (GET, PUT, PATCH) |
| 201 | Created (POST) |
| 204 | No content (DELETE) |
| 400 | Bad request / Validation error |
| 401 | Unauthenticated |
| 403 | Unauthorized (authenticated but no permission) |
| 404 | Not found |
| 409 | Conflict (e.g., duplicate record) |
| 422 | Unprocessable entity |
| 429 | Rate limited |
| 500 | Internal server error |

### API Routing Standards

> See `dev/API_CONVENTIONS.md` for full detail.

| Rule | Detail |
|------|--------|
| **Prefix** | All routes start with `/api/` — e.g., `/api/users`, `/api/appointments` |
| **Versioning** | **No URL versioning** — no `/api/v1/`. Use `/api/` only |
| **Express mount** | `app.use('/api', apiRouter)` in Express entry point |
| **Frontend calls** | Browser uses `fetch('/api/...')` — proxied by Next.js to Express via rewrites |
| **OpenAPI** | Update `apps/api/src/openapi.ts` for every endpoint change. Swagger UI at `/api/docs` |
| **CORS** | Browser→Next.js is same-origin. CORS only needed for Next.js server → Express server |

### Naming Conventions

- **Endpoints:** `kebab-case`, plural nouns: `/api/users`, `/api/clinic-records`
- **Query params:** `camelCase`: `?pageNum=1&sortBy=createdAt`
- **Request body:** `camelCase` JSON fields
- **Response body:** `camelCase` JSON fields
- **Frontend imports:** Always use `@/` alias — e.g., `@/lib/api`, `@/components/common/Button`

---

## Error Code Registry

| Code | HTTP Status | Meaning |
|------|------------|---------|
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `UNAUTHORIZED` | 401 | Not logged in |
| `FORBIDDEN` | 403 | No permission |
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `CONFLICT` | 409 | Duplicate or conflict |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## Pagination Standard

All list endpoints must support cursor-based or offset pagination:

**Query params:**
```
?page=1&limit=20&sortBy=createdAt&sortOrder=desc
```

**Response meta:**
```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

## Logging Standards

| Level | When to Use |
|-------|------------|
| `error` | Unhandled exceptions, system failures |
| `warn` | Expected failures, deprecated usage |
| `info` | Key business events (user registered, order placed) |
| `debug` | Detailed flow info (development only) |

**Rules:**
- Never log passwords, tokens, or PII
- Always include a `requestId` for tracing
- Log structured JSON in production

---

## Configuration Management

| Config | Source | Example |
|--------|--------|---------|
| App config | `.env` / env vars | `NODE_ENV`, `APP_URL` |
| Feature flags | _[DB table / LaunchDarkly / env var]_ | `FEATURE_X_ENABLED=true` |
| Dynamic config | _[DB table / CMS]_ | App settings changeable at runtime |

---

## Performance Requirements

| Metric | Target | Notes |
|--------|--------|-------|
| API response time (p95) | < 300ms | Excluding DB-heavy operations |
| Page load (LCP) | < 2.5s | On 4G |
| DB query time (p95) | < 100ms | Add indexes as needed |
| File upload | < 30s | For files up to 10MB |
