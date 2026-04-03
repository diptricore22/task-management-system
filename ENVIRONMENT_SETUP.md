# 🔐 Environment Configuration Guide

This project uses **separate environment files** for Frontend and Backend for security and clarity.

## 📁 File Structure

```
team-task-management-system/
├── .env.example                    # Overall reference (this file)
├── apps/
│   ├── web/
│   │   └── .env.example           # Frontend-only variables
│   │   └── .env                   # (created after copying)
│   └── api/
│       └── .env.example           # Backend-only variables
│       └── .env                   # (created after copying)
```

## 🚀 Setup Instructions

### 1️⃣ Frontend Environment (`apps/web/.env`)

```bash
# Copy template
cp apps/web/.env.example apps/web/.env
```

**Variables in `apps/web/.env`:**
```bash
NEXT_PUBLIC_API_URL="http://localhost:3003"          # Backend URL
NEXT_PUBLIC_WEB_URL="http://localhost:3000"          # Frontend URL
NEXT_PUBLIC_ENABLE_EMAIL_NOTIFICATIONS="true"        # Feature flag
NEXT_PUBLIC_ENABLE_REGISTRATION="false"              # Feature flag
NEXT_PUBLIC_GA_ID=""                                 # Optional: Google Analytics
NEXT_PUBLIC_SENTRY_DSN=""                            # Optional: Error monitoring
```

**Important:** Variables prefixed with `NEXT_PUBLIC_` are exposed in the browser. **Never put secrets here.**

### 2️⃣ Backend Environment (`apps/api/.env`)

```bash
# Copy template
cp apps/api/.env.example apps/api/.env
```

**Variables in `apps/api/.env`:**

| Category | Variables | Notes |
|----------|-----------|-------|
| **Database** | `DATABASE_URL`, `DIRECT_URL` | PostgreSQL connection string |
| **JWT** | `JWT_SECRET`, `JWT_REFRESH_SECRET` | Min 32 characters each |
| **Email** | `RESEND_API_KEY`, `EMAIL_FROM`, `SMTP_*` | Optional for dev |
| **App** | `NODE_ENV`, `API_PORT`, `API_BASE_URL`, etc. | Server configuration |
| **Security** | `BCRYPT_ROUNDS`, `RATE_LIMIT_*` | Password & rate limiting |
| **Features** | `ENABLE_EMAIL_NOTIFICATIONS`, `ENABLE_REGISTRATION` | Feature flags |

## ✅ Validation

Both apps validate their environment variables at startup:

### Frontend Validation
- File: `apps/web/src/lib/env.ts`
- Uses Zod schema to validate `NEXT_PUBLIC_*` variables
- Fails gracefully in production if invalid

### Backend Validation
- File: `apps/api/src/config/env.ts`
- Uses Zod schema to validate all server variables
- Required fields: `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`
- Exits with error in production if validation fails

## 🔒 Security Best Practices

1. **Never commit actual `.env` files** to version control
2. **Only commit `.env.example`** files
3. **Frontend variables only**: Use `NEXT_PUBLIC_` prefix (visible in browser)
4. **Backend secrets**: Store in `.env` (not version controlled)
5. **Generate strong secrets**: Use at least 32 random characters
   ```bash
   openssl rand -base64 32
   ```

## 📝 Example Setup

```bash
# 1. Copy both env files
cp apps/web/.env.example apps/web/.env
cp apps/api/.env.example apps/api/.env

# 2. Edit frontend env (apps/web/.env)
# Only needs API URL - usually doesn't change
NEXT_PUBLIC_API_URL="http://localhost:3003"

# 3. Edit backend env (apps/api/.env)
# Update with your actual values:
DATABASE_URL="postgresql://user:password@localhost:5432/task_management_db"
JWT_SECRET="$(openssl rand -base64 32)"
JWT_REFRESH_SECRET="$(openssl rand -base64 32)"

# 4. Verify startup
npm run dev  # Both apps should start without env errors
```

## 🧪 Development Mode

For local development, you can use default values:

```bash
# Frontend (.env)
NEXT_PUBLIC_API_URL="http://localhost:3003"
NEXT_PUBLIC_WEB_URL="http://localhost:3000"

# Backend (.env)
NODE_ENV="development"
API_PORT="3003"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/task_management_db"
# (generate random secrets)
JWT_SECRET="[generated secret]"
JWT_REFRESH_SECRET="[generated secret]"
```

## 🚨 Troubleshooting

**Error: `DATABASE_URL is required`**
- Check: `DATABASE_URL` is set in `apps/api/.env`

**Error: `JWT_SECRET must be at least 32 characters`**
- Check: Both JWT secrets >= 32 characters
- Generate: `openssl rand -base64 32`

**Frontend can't reach API**
- Check: `NEXT_PUBLIC_API_URL` points to correct backend URL
- Check: Backend is running on the configured port

**Environment variables not loading**
- Ensure `.env` files are in the root of each app:
  - `apps/web/.env` (not in src/)
  - `apps/api/.env` (not in src/)

## 📚 References

- `.env.example` - Root reference file (this guide)
- `apps/web/.env.example` - Frontend variables only
- `apps/api/.env.example` - Backend variables only
- `apps/api/src/config/env.ts` - Backend validation schema
- `apps/web/src/lib/env.ts` - Frontend validation schema
