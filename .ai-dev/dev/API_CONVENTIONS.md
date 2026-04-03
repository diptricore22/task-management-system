# 📡 API Conventions

> **Non-negotiable rules for how the API is structured, routed, and consumed across the frontend and backend.**  
> AI must read this before generating any API endpoint, route, or frontend API call.

---

## Stack

| Side | Technology |
|------|-----------|
| **Frontend** | Next.js (App Router or Pages Router) |
| **Backend** | Node.js + Express |
| **Package Manager** | npm |

---

## 1. URL Prefix

- **All** API routes are prefixed with `/api/`
- Examples: `/api/auth/login`, `/api/patients`, `/api/appointments`
- ❌ Never use paths without the `/api/` prefix for backend endpoints

---

## 2. No URL Versioning (Current Policy)

- We do **NOT** use path version segments like `/api/v1/...` or `/api/v2/...`
- All routes use `/api/` only — e.g., `/api/users`, not `/api/v1/users`

> **When to introduce versioning:** If a mobile app or third-party consumer is added that cannot update in lockstep with the backend, introduce versioning at that point. Strategy: keep existing `/api/` routes unchanged and add `/api/v2/` for the new breaking version. Document this decision in `docs/DECISIONS.md`.

---

## 3. Express Backend Mounting

All routes must be mounted under `/api` in the Express app entry point:

```javascript
// apps/api/src/index.ts (or server.ts)
import apiRouter from './routes';
app.use('/api', apiRouter);
```

Individual route files then use relative paths (no `/api` prefix inside them):

```javascript
// apps/api/src/routes/patients.ts
router.get('/', getAllPatients);     // → GET /api/patients
router.post('/', createPatient);    // → POST /api/patients
router.get('/:id', getPatientById); // → GET /api/patients/:id
```

---

## 4. Next.js Proxy — Frontend Never Calls Backend Directly

The browser **never** talks to the Express server directly.

- The browser sends requests to the same origin (e.g., `fetch('/api/patients')`)
- Next.js forwards them to the Express backend via **rewrites in `next.config.js`**

### `next.config.js` Setup

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_BASE_URL}/api/:path*`,
        // Dev example: http://localhost:3003/api/:path*
      },
    ];
  },
};

module.exports = nextConfig;
```

### Environment Variables for the Proxy

```env
# .env.local (frontend)
API_BASE_URL=http://localhost:3003   # dev — Express server port
# In production: set to the deployed Express API URL
```

### Frontend API Client

Use a **relative base URL** so all requests go through the Next.js proxy:

```typescript
// src/lib/api.ts
const API_BASE = '';  // empty string — uses same origin (proxied by Next.js)

export const apiClient = {
  get: (path: string) => fetch(`${API_BASE}${path}`),
  post: (path: string, body: unknown) =>
    fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  // ... patch, delete, etc.
};
```

### Benefits of This Approach
- ✅ Same-origin requests — no browser CORS issues
- ✅ Backend URL is hidden from client
- ✅ Optional server-side auth injection via Next.js middleware later
- ✅ Frontend and backend can be deployed independently without client-side config changes

---

## 5. OpenAPI / Swagger — Mandatory on Every API Change

**Rule:** When you add or change **any** backend endpoint under `/api/...`, you **must** also update the OpenAPI spec.

- **Spec file location:** `apps/api/src/openapi.ts` (or `openapi.yaml`)
- **Swagger UI available at:** `/api/docs` (served by the Express app)
- **Use Swagger UI** for manual endpoint testing during development — not Postman separately

### Workflow

```
1. Write | change Express route handler
2. Update openapi.ts spec for that endpoint
3. Verify Swagger UI at /api/docs shows the change correctly
4. Then write tests
```

### Spec Update Checklist (per endpoint)

- [ ] Method + path documented
- [ ] Request body schema (if POST/PATCH/PUT) with required fields
- [ ] Query parameters documented
- [ ] Response shapes for 200/201 documented
- [ ] Error responses for 400, 401, 403, 404 documented
- [ ] Auth requirement noted (`bearerAuth` or `none`)

---

## 6. Frontend Import Alias

In all Next.js / React code, use the `@` alias for app-relative imports:

```typescript
// ✅ Good
import { AuthContext } from '@/context/AuthContext';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/common/Button';
import type { Patient } from '@/types/patient.types';

// ❌ Bad — relative path hell
import { AuthContext } from '../../../context/AuthContext';
import { Button } from '../../components/common/Button';
```

### `tsconfig.json` Setup

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## 7. API Endpoint Naming Rules

| Rule | Example |
|------|---------|
| Use `kebab-case`, plural nouns | `/api/clinic-records`, `/api/appointment-slots` |
| Resource ID always `:id` | `/api/patients/:id` |
| Nested resources for ownership | `/api/patients/:id/appointments` |
| Actions (non-CRUD) use verb suffix | `/api/appointments/:id/cancel` |
| No trailing slashes | `/api/patients` not `/api/patients/` |

---

## 8. CORS Configuration

Since the browser talks to Next.js (same origin), CORS between browser and Express is not needed.

However, **Express must allow requests from the Next.js server** (server-to-server in production):

```javascript
// apps/api/src/middleware/cors.ts
import cors from 'cors';

const allowedOrigins = [
  process.env.FRONTEND_URL,  // e.g., https://yourapp.com
  'http://localhost:3000',   // dev
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
```

---

## 9. Request/Response Envelope

All API responses must use this shape (defined fully in `docs/SPECS/TECHNICAL_SPEC.md`):

```typescript
// Success
{ success: true, data: T, meta?: { pagination?: {...} } }

// Error
{ success: false, error: { code: string, message: string, details?: unknown } }
```

---

## 10. Rate Limiting

Apply rate limiting at the Express level (not Next.js):

```javascript
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests' } },
});

router.post('/auth/login', authLimiter, loginHandler);
router.post('/auth/register', authLimiter, registerHandler);
```
