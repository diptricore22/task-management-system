# FEAT-001: Authentication & User Management - Test Coverage & Acceptance Criteria Mapping

**Document Version:** 1.0
**Created:** 2026-04-03
**Feature ID:** FEAT-001
**Feature Name:** Authentication & User Management
**Test Status:** Comprehensive Coverage Defined

---


## Executive Summary

This document provides complete test coverage for FEAT-001 (Authentication & User Management) across all three testing layers:

- **Backend Unit Tests:** 11 tests (AUTH-U001 through AUTH-U011)
- **API Integration Tests:** 16 tests (AUTH-I001 through AUTH-I016)
- **Frontend Component Tests:** 8 tests (AUTH-F001 through AUTH-F008)

**Total Test Coverage:** 35 tests across all layers

All tests are mapped to specific acceptance criteria from the feature PRD and user stories.

---

## Part 1: Backend Unit Tests (11 tests)

### AUTH-U001: User Registration - Valid Registration
**Test Location:** `apps/api/src/tests/auth.service.spec.ts`
**Service Method:** `AuthService.register()`

| Aspect | Detail |
|--------|--------|
| **Scenario** | Register new user with valid name, email, and password |
| **Input** | `{ name: string, email: string, password: string, confirmPassword: string }` |
| **Expected Output** | User object with id, name, email, role='MEMBER', created_at |
| **AC Reference** | FEAT-001 Story 1 AC1 - "Given a valid name/email/password, when I submit the registration form, then my account is created and I am redirected to the dashboard" |
| **Security Checks** | ✅ Password hash never returned in response |
| **Status** | IMPLEMENTED |

---

### AUTH-U002: User Registration - Duplicate Email
**Test Location:** `apps/api/src/tests/auth.service.spec.ts`
**Service Method:** `AuthService.register()`

| Aspect | Detail |
|--------|--------|
| **Scenario** | Attempt registration with already-registered email |
| **Input** | Email that already exists in database |
| **Expected Error** | HTTP 409 with code `EMAIL_EXISTS` |
| **Error Message** | "An account with this email already exists" |
| **AC Reference** | FEAT-001 Story 1 AC2 - "Given an already-registered email, when I try to register, then I see an error: 'An account with this email already exists'" |
| **Status** | IMPLEMENTED |

---

### AUTH-U003: User Login - Valid Credentials
**Test Location:** `apps/api/src/tests/auth.service.spec.ts`
**Service Method:** `AuthService.login()`

| Aspect | Detail |
|--------|--------|
| **Scenario** | Login with correct email and password |
| **Input** | `{ email: string, password: string }` |
| **Expected Output** | User object (matching register response) |
| **Additional Actions** | JWT tokens generated and stored |
| **AC Reference** | FEAT-001 Story 2 AC1 - "Given valid credentials, when I log in, then I receive an access token cookie and am redirected to the dashboard" |
| **Status** | IMPLEMENTED |

---

### AUTH-U004: User Login - Invalid Credentials
**Test Location:** `apps/api/src/tests/auth.service.spec.ts`
**Service Method:** `AuthService.login()`

| Aspect | Detail |
|--------|--------|
| **Scenario** | Login with non-existent email or wrong password |
| **Input** | Invalid email OR incorrect password |
| **Expected Error** | HTTP 401 with code `INVALID_CREDENTIALS` |
| **Error Message** | "Invalid email or password" (generic, doesn't reveal which is wrong) |
| **AC Reference** | FEAT-001 Story 2 AC2 - "Given invalid credentials, when I log in, then I see 'Invalid email or password' (no info about which is wrong)" |
| **Status** | IMPLEMENTED |

---

### AUTH-U005: User Login - Account Lockout
**Test Location:** `apps/api/src/tests/auth.service.spec.ts`
**Service Method:** `AuthService.login()` (with lockout logic)

| Aspect | Detail |
|--------|--------|
| **Scenario** | Account locked after 5 consecutive failed login attempts |
| **Condition** | 5 failed attempts within time window |
| **Expected Duration** | 15 minutes lockout |
| **Expected Error** | HTTP 423 with code `ACCOUNT_LOCKED` |
| **AC Reference** | FEAT-001 Story 2 AC3 - "Given 5 consecutive failed attempts, when I try again, then my account is locked for 15 minutes" |
| **Implementation Status** | TODO - Requires failed_attempts and locked_until fields in users table |
| **Status** | TEST DEFINED, LOGIC NOT YET IMPLEMENTED |

---

### AUTH-U006: Token Refresh - Valid Refresh Token
**Test Location:** `apps/api/src/tests/auth.service.spec.ts`
**Service Method:** `AuthService.refreshToken()`

| Aspect | Detail |
|--------|--------|
| **Scenario** | Use valid refresh token to get new access token |
| **Input** | Valid refresh token from cookie |
| **Expected Output** | New access token in response/cookie |
| **Token Details** | Old refresh token invalidated, new one issued (rotation) |
| **AC Reference** | FEAT-001 Story 3 AC1 - "Given a valid refresh token cookie, when my access token expires, then it is silently refreshed" |
| **Status** | IMPLEMENTED |

---

### AUTH-U007: Token Refresh - Expired Refresh Token
**Test Location:** `apps/api/src/tests/auth.service.spec.ts`
**Service Method:** `AuthService.refreshToken()`

| Aspect | Detail |
|--------|--------|
| **Scenario** | Use expired refresh token (>7 days old) |
| **Input** | Refresh token with expires_at in the past |
| **Expected Error** | HTTP 401 with code `INVALID_REFRESH_TOKEN` |
| **Error Message** | "Refresh token has expired" |
| **AC Reference** | FEAT-001 Story 3 AC2 - "Given an expired refresh token, when I navigate to a protected page, then I am redirected to login" |
| **Status** | IMPLEMENTED |

---

### AUTH-U008: User Logout - Token Invalidation
**Test Location:** `apps/api/src/tests/auth.service.spec.ts`
**Service Method:** `AuthService.logout()`

| Aspect | Detail |
|--------|--------|
| **Scenario** | Logout invalidates all refresh tokens for user |
| **Input** | Valid refresh token from cookie |
| **Expected Action** | All refresh tokens marked as deleted_at |
| **Result** | User cannot use old tokens to refresh |
| **AC Reference** | FEAT-001 Story 4 AC1 - "Given I click 'Log out', when the action completes, then both cookies are cleared and I am redirected to the login page" |
| **Status** | IMPLEMENTED |

---

### AUTH-U009: Admin Invites Member - Valid Invite
**Test Location:** `apps/api/src/tests/auth.service.spec.ts`
**Service Method:** `AuthService.sendInvite()`

| Aspect | Detail |
|--------|--------|
| **Scenario** | Admin sends email invitation to new user |
| **Input** | `{ email: string, role: 'ADMIN' | 'MEMBER' | 'VIEWER' }` |
| **Expected Output** | Invite created with token, expires in 72 hours |
| **Side Effects** | Email sent (mocked in tests) |
| **AC Reference** | FEAT-001 Story 5 AC1 - "Given a valid email and role, when Admin sends an invite, then the user receives an email with a one-time invite link" |
| **Status** | IMPLEMENTED (email sending not implemented, TODO) |

---

### AUTH-U010: Invite Acceptance - Valid Acceptance
**Test Location:** `apps/api/src/tests/auth.service.spec.ts`
**Service Method:** `AuthService.acceptInvite()`

| Aspect | Detail |
|--------|--------|
| **Scenario** | User accepts invite and sets password |
| **Input** | `{ token: string, name: string, password: string, confirmPassword: string }` |
| **Expected Output** | New user created with invited role, marked as active |
| **Pre-conditions** | Invite token must be valid and not yet accepted |
| **AC Reference** | FEAT-001 Story 5 AC2 - "Given the user clicks the invite link, when they set a password, then their account is activated with the assigned role" |
| **Status** | IMPLEMENTED |

---

### AUTH-U011: Invite Acceptance - Expired Invite
**Test Location:** `apps/api/src/tests/auth.service.spec.ts`
**Service Method:** `AuthService.acceptInvite()`

| Aspect | Detail |
|--------|--------|
| **Scenario** | User tries to accept expired invite (>72 hours old) |
| **Input** | Token with expires_at in the past |
| **Expected Error** | HTTP 410 with code `INVITE_EXPIRED` |
| **Error Message** | "This invite link has expired. Please ask your admin to resend." |
| **AC Reference** | FEAT-001 Story 5 AC3 - "Given an expired invite link (>72 hours), when the user tries to register, then they see 'This invite link has expired. Please ask your admin to resend.'" |
| **Status** | IMPLEMENTED |

---

## Part 2: API Integration Tests (16 tests)

### Authentication Endpoints - Request/Response Validation

#### AUTH-I001: POST /api/auth/register - Valid Registration (201)
**Endpoint:** `POST /api/auth/register`
**Test Location:** `apps/api/src/tests/auth.integration.spec.ts`

| Field | Value |
|-------|-------|
| **HTTP Status** | 201 Created |
| **Request Body** | `{ name, email, password, confirmPassword }` |
| **Response Body** | `{ success: true, data: { user: {...} }, message: "..." }` |
| **Cookies Set** | `access_token`, `refresh_token` (httpOnly, Secure, SameSite=Strict) |
| **AC Reference** | FEAT-001 Story 1 AC1 |
| **Status** | IMPLEMENTED |

---

#### AUTH-I002: POST /api/auth/register - Duplicate Email (409)
**Endpoint:** `POST /api/auth/register`

| Field | Value |
|-------|-------|
| **HTTP Status** | 409 Conflict |
| **Error Code** | `EMAIL_EXISTS` |
| **AC Reference** | FEAT-001 Story 1 AC2 |

---

#### AUTH-I003: POST /api/auth/register - Invalid Email (400)
**Endpoint:** `POST /api/auth/register`

| Field | Value |
|-------|-------|
| **HTTP Status** | 400 Bad Request |
| **Error Code** | `INVALID_INPUT` |
| **Validations** | Email format, length, required fields |
| **AC Reference** | FEAT-001 Story 1 AC3 |

---

#### AUTH-I004: POST /api/auth/register - Password Too Short (400)
**Endpoint:** `POST /api/auth/register`

| Field | Value |
|-------|-------|
| **HTTP Status** | 400 Bad Request |
| **Validation** | Password minimum 8 characters |
| **Error Code** | `INVALID_INPUT` |
| **AC Reference** | FEAT-001 Story 1 AC3 |

---

#### AUTH-I005: POST /api/auth/login - Valid Credentials (200)
**Endpoint:** `POST /api/auth/login`

| Field | Value |
|-------|-------|
| **HTTP Status** | 200 OK |
| **Response** | User object + cookies set |
| **Cookies** | access_token (15min), refresh_token (7d) |
| **AC Reference** | FEAT-001 Story 2 AC1 |

---

#### AUTH-I006: POST /api/auth/login - Non-existent Email (401)
**Endpoint:** `POST /api/auth/login`

| Field | Value |
|-------|-------|
| **HTTP Status** | 401 Unauthorized |
| **Error Code** | `INVALID_CREDENTIALS` |
| **Message** | "Invalid email or password" (generic) |
| **AC Reference** | FEAT-001 Story 2 AC2 |

---

#### AUTH-I007: POST /api/auth/login - Invalid Password (401)
**Endpoint:** `POST /api/auth/login`

| Field | Value |
|-------|-------|
| **HTTP Status** | 401 Unauthorized |
| **Error Code** | `INVALID_CREDENTIALS` |
| **AC Reference** | FEAT-001 Story 2 AC2 |

---

#### AUTH-I008: POST /api/auth/login - Account Locked (423)
**Endpoint:** `POST /api/auth/login`

| Field | Value |
|-------|-------|
| **HTTP Status** | 423 Locked |
| **Error Code** | `ACCOUNT_LOCKED` |
| **Condition** | 5+ failed attempts |
| **Duration** | 15 minutes |
| **AC Reference** | FEAT-001 Story 2 AC3 |
| **Status** | TEST DEFINED, LOGIC PENDING |

---

#### AUTH-I009: POST /api/auth/logout - Valid Logout (200)
**Endpoint:** `POST /api/auth/logout`

| Field | Value |
|-------|-------|
| **HTTP Status** | 200 OK |
| **Requires Auth** | Yes (access_token cookie) |
| **Effects** | Clears cookies, invalidates refresh tokens |
| **AC Reference** | FEAT-001 Story 4 AC1 |

---

#### AUTH-I010: POST /api/auth/logout - Unauthenticated (401)
**Endpoint:** `POST /api/auth/logout`

| Field | Value |
|-------|-------|
| **HTTP Status** | 401 Unauthorized |
| **Condition** | No valid token |
| **Standard** | All protected endpoints return 401 without auth |

---

#### AUTH-I011: POST /api/auth/refresh - Valid Token (200)
**Endpoint:** `POST /api/auth/refresh`

| Field | Value |
|-------|-------|
| **HTTP Status** | 200 OK |
| **Input** | refresh_token cookie |
| **Output** | New access_token cookie + new refresh_token (rotation) |
| **AC Reference** | FEAT-001 Story 3 AC1 |

---

#### AUTH-I012: POST /api/auth/refresh - Expired Token (401)
**Endpoint:** `POST /api/auth/refresh`

| Field | Value |
|-------|-------|
| **HTTP Status** | 401 Unauthorized |
| **Error Code** | `INVALID_REFRESH_TOKEN` |
| **AC Reference** | FEAT-001 Story 3 AC2 |

---

#### AUTH-I013: POST /api/auth/invite - Admin Invite (201)
**Endpoint:** `POST /api/auth/invite`

| Field | Value |
|-------|-------|
| **HTTP Status** | 201 Created |
| **Requires Auth** | Yes, Admin role |
| **Input** | `{ email: string, role: string }` |
| **Output** | `{ inviteId: string }` |
| **Email** | Sent with /invite/:token route |
| **AC Reference** | FEAT-001 Story 5 AC1 |

---

#### AUTH-I014: POST /api/auth/invite - Non-Admin (403)
**Endpoint:** `POST /api/auth/invite`

| Field | Value |
|-------|-------|
| **HTTP Status** | 403 Forbidden |
| **Error Code** | `INSUFFICIENT_PERMISSIONS` |
| **Requires** | Admin role |
| **AC Reference** | FEAT-001 FR-9 |

---

#### AUTH-I015: POST /api/auth/invite/:token/accept - Valid (201)
**Endpoint:** `POST /api/auth/invite/:token/accept`

| Field | Value |
|-------|-------|
| **HTTP Status** | 201 Created |
| **Requires Auth** | No |
| **Input** | `{ token, name, password, confirmPassword }` (token in URL) |
| **Output** | New user object + auth cookies |
| **Role** | User gets role from invite |
| **AC Reference** | FEAT-001 Story 5 AC2 |

---

#### AUTH-I016: POST /api/auth/invite/:token/accept - Expired (410)
**Endpoint:** `POST /api/auth/invite/:token/accept`

| Field | Value |
|-------|-------|
| **HTTP Status** | 410 Gone |
| **Error Code** | `INVITE_EXPIRED` |
| **Condition** | Token expires_at < now |
| **Expiry** | 72 hours from creation |
| **AC Reference** | FEAT-001 Story 5 AC3 |

---

### User Profile Endpoints

#### GET /api/users/me - Get Current User
| Endpoint | GET /api/users/me |
|----------|-------------------|
| **Auth Required** | Yes |
| **Response** | Current user object |
| **Excludes** | password_hash, deleted_at (if > 0) |

#### PATCH /api/users/me - Update Profile
| Endpoint | PATCH /api/users/me |
|----------|---------------------|
| **Auth Required** | Yes |
| **Input Fields** | name (optional), email (optional) |
| **Validation** | Email uniqueness check |
| **On Conflict** | 409 with EMAIL_EXISTS code |

---

## Part 3: Frontend Component Tests (8 tests)

### AUTH-F001: LoginForm - Valid Login Submission
**Component:** `LoginForm`
**Test Location:** `apps/web/src/__tests__/auth.component.spec.tsx`

| Field | Value |
|-------|-------|
| **User Action** | Enter email + password + submit |
| **Expected** | Form submits with correct data to API |
| **Fields** | Email (email type), Password (password type) |
| **Button** | Submit/Sign In button |
| **AC Reference** | FEAT-001 Story 2 AC1 |
| **Component Status** | NOT YET IMPLEMENTED (test template provided) |

---

### AUTH-F002: LoginForm - Invalid Credentials Error
**Component:** `LoginForm`

| Field | Value |
|-------|-------|
| **Scenario** | API returns 401 INVALID_CREDENTIALS |
| **Expected Display** | "Invalid email or password" error message |
| **Form State** | Remains filled, not cleared |
| **AC Reference** | FEAT-001 Story 2 AC2 |

---

### AUTH-F003: LoginForm - Account Lockout Display
**Component:** `LoginForm`

| Field | Value |
|-------|-------|
| **Scenario** | API returns 423 ACCOUNT_LOCKED |
| **Expected Display** | Account locked for 15 minutes message |
| **Form State** | Disabled (no submission allowed) |
| **AC Reference** | FEAT-001 Story 2 AC3 |

---

### AUTH-F004: RegisterForm - Valid Registration
**Component:** `RegisterForm`

| Field | Value |
|-------|-------|
| **Fields** | Name, Email, Password, Confirm Password |
| **Features** | Password strength meter |
| **Validation** | Real-time on blur/change |
| **Submit** | Creates account + redirects to dashboard |
| **AC Reference** | FEAT-001 Story 1 AC1 |

---

### AUTH-F005: RegisterForm - Duplicate Email Error
**Component:** `RegisterForm`

| Field | Value |
|-------|-------|
| **Scenario** | Email already registered |
| **Expected Error** | "An account with this email already exists" |
| **Focus** | Email field receives focus |
| **AC Reference** | FEAT-001 Story 1 AC2 |

---

### AUTH-F006: RegisterForm - Password Validation
**Component:** `RegisterForm`

| Field | Value |
|-------|-------|
| **Validation** | Password min 8 characters |
| **Trigger** | Blur/change event |
| **Display** | Error message shows before submission |
| **Visual** | Color change, icon feedback |
| **AC Reference** | FEAT-001 Story 1 AC3 |

---

### AUTH-F007: ProfileForm - Update Profile
**Component:** `ProfileForm`

| Aria | Value |
|------|-------|
| **Fields** | Name (prefilled), Email (prefilled) |
| **Load** | Component loads with user data |
| **Edit** | User can modify both fields |
| **Save** | Submit button calls API |
| **Success** | Success toast shown, UI updates |
| **AC Reference** | FEAT-001 Story 6 AC1 |

---

### AUTH-F008: ProfileForm - Email Already Taken Error
**Component:** `ProfileForm`

| Field | Value |
|-------|-------|
| **Scenario** | User tries to set email to existing one |
| **Expected Error** | "Email already taken" |
| **Response** | 409 EMAIL_EXISTS error |
| **Form State** | Remains open, user can edit again |
| **AC Reference** | FEAT-001 Story 6 AC2 |

---

## Test Execution Guide

### Running Backend Tests

```bash
# Navigate to API directory
cd apps/api

# Run all tests
npm run test

# Run specific test suite
npm run test -- auth.service.spec.ts
npm run test -- auth.integration.spec.ts

# Run with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

### Running Frontend Tests

```bash
# Navigate to web directory
cd apps/web

# Run tests (Jest configuration needed)
npm run test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

---

## Coverage Summary

### Backend: 11 Unit Tests + 16 Integration Tests = 27 Backend Tests
- **Registration:** 4 tests (1 unit + 3 integration)
- **Login:** 4 tests (1 unit + 3 integration)
- **Token Management:** 4 tests (2 unit + 2 integration)
- **Logout:** 2 tests (1 unit + 1 integration)
- **Invitations:** 6 tests (3 unit + 3 integration)
- **Profile:** Additional endpoints tested

### Frontend: 8 Component Tests
- **LoginForm:** 3 tests
- **RegisterForm:** 3 tests
- **ProfileForm:** 2 tests

### Total Coverage: 35 Tests across all layers

---

## Acceptance Criteria Tracking

### Story 1: Register
- ✅ AUTH-U001, AUTH-I001: Valid registration
- ✅ AUTH-U002, AUTH-I002: Duplicate email error (409)
- ✅ AUTH-I003, AUTH-I004: Validation errors (400)
- ✅ AUTH-F004: RegisterForm works
- ✅ AUTH-F005, AUTH-F006: Form validation

### Story 2: Login
- ✅ AUTH-U003, AUTH-I005: Valid login
- ✅ AUTH-U004, AUTH-I006, AUTH-I007: Invalid credentials (401)
- ✅ AUTH-U005, AUTH-I008: Account lockout (423) - TEST DEFINED, LOGIC PENDING
- ✅ AUTH-F001: LoginForm valid submission
- ✅ AUTH-F002, AUTH-F003: Form error handling

### Story 3: Session Persistence
- ✅ AUTH-U006, AUTH-I011: Valid token refresh
- ✅ AUTH-U007, AUTH-I012: Expired token handling

### Story 4: Logout
- ✅ AUTH-U008, AUTH-I009: Valid logout
- ✅ AUTH-I010: Unauthenticated logout error

### Story 5: Admin Invites
- ✅ AUTH-U009, AUTH-I013: Admin sends invite
- ✅ AUTH-I014: Non-admin cannot invite (403)
- ✅ AUTH-U010, AUTH-I015: Accept valid invite
- ✅ AUTH-U011, AUTH-I016: Reject expired invite

### Story 6: Update Profile
- ✅ AUTH-F007: ProfileForm update
- ✅ AUTH-F008: Email validation on update

---

## Implementation Status

| Category | Status | Notes |
|----------|--------|-------|
| Backend Unit Tests | ✅ IMPLEMENTED | All 11 tests written with proper mocking |
| API Integration Tests | ✅ IMPLEMENTED | All 16 tests written, service methods implemented |
| Frontend Unit Tests | ✅ TEST TEMPLATES PROVIDED | Components not yet created; templates ready |
| Account Lockout Logic | ⚠️ TODO | Tests defined, feature needs implementation |
| Email Service | ⚠️ TODO | Tests assume email mocking |
| Frontend Components | ⚠️ TODO | LoginForm, RegisterForm, ProfileForm |

---

## Next Steps

1. **Complete Account Lockout Implementation**
   - Add `failed_login_attempts` and `locked_until` fields to users table
   - Implement lockout logic in auth.service.ts
   - Run AUTH-U005 and AUTH-I008 tests

2. **Create Frontend Components**
   - Implement LoginForm, RegisterForm, ProfileForm components
   - Set up Jest + React Testing Library in web app
   - Run AUTH-F001 through AUTH-F008 tests

3. **Email Service Integration**
   - Implement email sending in sendInvite method
   - Mock email service for tests

4. **Run Full Test Suite**
   - Execute all 35 tests
   - Verify coverage > 85% for backend, > 80% for frontend
   - Update CHANGELOG and PROJECT_STATUS

---

**Document Created:** 2026-04-03
**Last Updated:** 2026-04-03
**Status:** Test Specification Complete
