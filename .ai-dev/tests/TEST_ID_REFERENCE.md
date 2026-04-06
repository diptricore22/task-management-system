# FEAT-001 Test ID Quick Reference

## Test File Locations

```
Project Root
├── apps/api/src/tests/
│   ├── auth.service.spec.ts          (Backend Unit Tests: AUTH-U001 to AUTH-U011)
│   └── auth.integration.spec.ts      (API Integration Tests: AUTH-I001 to AUTH-I016)
└── apps/web/src/__tests__/
    └── auth.component.spec.tsx       (Frontend Unit Tests: AUTH-F001 to AUTH-F008)
```

---

## Backend Unit Tests (AUTH-U)

### Location: `apps/api/src/tests/auth.service.spec.ts`

```
AUTH-U001  │ User Registration - Valid Registration
AUTH-U002  │ User Registration - Duplicate Email (409)
AUTH-U003  │ User Login - Valid Credentials
AUTH-U004  │ User Login - Invalid Credentials (401)
AUTH-U005  │ User Login - Account Lockout (5 failed attempts)
AUTH-U006  │ Token Refresh - Valid Refresh Token
AUTH-U007  │ Token Refresh - Expired Refresh Token (401)
AUTH-U008  │ User Logout - Token Invalidation
AUTH-U009  │ Admin Invites Member - Valid Invite
AUTH-U010  │ Invite Acceptance - Valid Acceptance with Role
AUTH-U011  │ Invite Acceptance - Expired Invite (410)
```

**Test Method Mapping:**
- AUTH-U001, U002 → `AuthService.register()`
- AUTH-U003, U004, U005 → `AuthService.login()`
- AUTH-U006, U007 → `AuthService.refreshToken()`
- AUTH-U008 → `AuthService.logout()`
- AUTH-U009 → `AuthService.sendInvite()`
- AUTH-U010, U011 → `AuthService.acceptInvite()`

---

## API Integration Tests (AUTH-I)

### Location: `apps/api/src/tests/auth.integration.spec.ts`

```
AUTH-I001  │ POST /api/auth/register           │ Valid Registration (201)
AUTH-I002  │ POST /api/auth/register           │ Duplicate Email (409)
AUTH-I003  │ POST /api/auth/register           │ Invalid Email (400)
AUTH-I004  │ POST /api/auth/register           │ Password Too Short (400)
AUTH-I005  │ POST /api/auth/login              │ Valid Login (200)
AUTH-I006  │ POST /api/auth/login              │ Non-existent Email (401)
AUTH-I007  │ POST /api/auth/login              │ Invalid Password (401)
AUTH-I008  │ POST /api/auth/login              │ Account Locked (423)
AUTH-I009  │ POST /api/auth/logout             │ Valid Logout (200)
AUTH-I010  │ POST /api/auth/logout             │ Unauthenticated (401)
AUTH-I011  │ POST /api/auth/refresh            │ Valid Token (200)
AUTH-I012  │ POST /api/auth/refresh            │ Expired Token (401)
AUTH-I013  │ POST /api/auth/invite             │ Admin Invite (201)
AUTH-I014  │ POST /api/auth/invite             │ Non-Admin (403)
AUTH-I015  │ POST /api/auth/invite/:token/accept │ Valid (201)
AUTH-I016  │ POST /api/auth/invite/:token/accept │ Expired (410)
```

**Endpoint Coverage:**
- `/api/auth/register` → AUTH-I001, I002, I003, I004
- `/api/auth/login` → AUTH-I005, I006, I007, I008
- `/api/auth/logout` → AUTH-I009, I010
- `/api/auth/refresh` → AUTH-I011, I012
- `/api/auth/invite` → AUTH-I013, I014
- `/api/auth/invite/:token/accept` → AUTH-I015, I016

---

## Frontend Component Tests (AUTH-F)

### Location: `apps/web/src/__tests__/auth.component.spec.tsx`

```
AUTH-F001  │ LoginForm              │ Valid Submission
AUTH-F002  │ LoginForm              │ Invalid Credentials Error
AUTH-F003  │ LoginForm              │ Account Lockout Display
AUTH-F004  │ RegisterForm           │ Valid Registration
AUTH-F005  │ RegisterForm           │ Duplicate Email Error
AUTH-F006  │ RegisterForm           │ Password Validation
AUTH-F007  │ ProfileForm            │ Update Profile
AUTH-F008  │ ProfileForm            │ Email Already Taken Error
```

**Component Mapping:**
- LoginForm → AUTH-F001, F002, F003
- RegisterForm → AUTH-F004, F005, F006
- ProfileForm → AUTH-F007, F008

---

## Test Execution Commands

### Run All Backend Unit Tests
```bash
cd apps/api
npm run test -- auth.service.spec.ts
```

### Run Specific Backend Unit Test
```bash
cd apps/api
npm run test -- auth.service.spec.ts -t "AUTH-U001"
```

### Run All API Integration Tests
```bash
cd apps/api
npm run test -- auth.integration.spec.ts
```

### Run Specific API Integration Test
```bash
cd apps/api
npm run test -- auth.integration.spec.ts -t "AUTH-I005"
```

### Run All Frontend Tests
```bash
cd apps/web
npm run test -- auth.component.spec.tsx
```

### Run Specific Frontend Test
```bash
cd apps/web
npm run test -- auth.component.spec.tsx -t "AUTH-F001"
```

### Run All Tests with Coverage
```bash
# Backend
cd apps/api
npm run test:coverage -- auth.service.spec.ts auth.integration.spec.ts

# Frontend
cd apps/web
npm run test:coverage -- auth.component.spec.tsx
```

---

## Story-to-Test Mapping

### Story 1: Register
**AC1:** User registration → AUTH-U001, AUTH-I001, AUTH-F004
**AC2:** Duplicate email error → AUTH-U002, AUTH-I002, AUTH-F005
**AC3:** Password validation → AUTH-I003, AUTH-I004, AUTH-F006

### Story 2: Login
**AC1:** Valid login → AUTH-U003, AUTH-I005, AUTH-F001
**AC2:** Invalid credentials → AUTH-U004, AUTH-I006, AUTH-I007, AUTH-F002
**AC3:** Account lockout → AUTH-U005, AUTH-I008, AUTH-F003

### Story 3: Session Persistence
**AC1:** Auto-refresh on expiry → AUTH-U006, AUTH-I011
**AC2:** Expired token redirect → AUTH-U007, AUTH-I012

### Story 4: Logout
**AC1:** Logout clears cookies → AUTH-U008, AUTH-I009, AUTH-I010

### Story 5: Admin Invites
**AC1:** Send invite → AUTH-U009, AUTH-I013, AUTH-I014
**AC2:** Accept invite → AUTH-U010, AUTH-I015
**AC3:** Expired invite → AUTH-U011, AUTH-I016

### Story 6: Update Profile
**AC1:** Update profile → AUTH-F007
**AC2:** Email validation → AUTH-F008

---

## Error Code Reference

| Error Code | HTTP Status | Tests |
|-----------|---------|-------|
| EMAIL_EXISTS | 409 | AUTH-U002, AUTH-I002, AUTH-F005 |
| INVALID_CREDENTIALS | 401 | AUTH-U004, AUTH-I006, AUTH-I007, AUTH-F002 |
| ACCOUNT_LOCKED | 423 | AUTH-U005, AUTH-I008, AUTH-F003 |
| INVALID_REFRESH_TOKEN | 401 | AUTH-U007, AUTH-I012 |
| INVITE_EXPIRED | 410 | AUTH-U011, AUTH-I016 |
| INSUFFICIENT_PERMISSIONS | 403 | AUTH-I014 |
| UNAUTHORIZED | 401 | AUTH-I010 |

---

## Test Status Summary

| Category | Total | Status | Notes |
|----------|-------|--------|-------|
| Backend Unit | 11 | ✅ READY | All implemented with mocks |
| API Integration | 16 | ✅ READY | All endpoints covered |
| Frontend | 8 | ⚠️ TEMPLATES | Components need creation |
| **TOTAL** | **35** | **✅ 27/35** | 3 features pending implementation |

---

## Quick Debug Guide

### Finding Test by Test ID
```
# Search for test by ID
grep -r "AUTH-U001" apps/api/src/tests/
grep -r "AUTH-I005" apps/api/src/tests/
grep -r "AUTH-F001" apps/web/src/__tests__/
```

### Understanding Test Structure
Each test follows this pattern:
```javascript
describe('TEST_FAMILY', () => {
  describe('TEST_ID: Description', () => {
    it('Should do X when Y with Z', async () => {
      // Test logic here
    });
  });
});
```

### Running in Watch Mode
```bash
# Watch for changes and rerun tests
npm run test:watch -- --testNamePattern="AUTH-U001"
```

---

Document Version: 1.0
Last Updated: 2026-04-03
Status: Complete
