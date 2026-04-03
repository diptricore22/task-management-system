# 🔬 Test Cases

> **Detailed test cases for all features. Each test case maps to an acceptance criterion.**

---

## Test Case Format

```
### TC-[ID] — [Test Name]
Feature: [FEAT-XXX]
AC Reference: AC-XXX-YY
Type: Unit | Integration | E2E | Manual
Priority: P0 (blocking) | P1 (high) | P2 (normal)

Preconditions:
- [What must be true before running this test]

Steps:
1. [Step 1]
2. [Step 2]

Expected Result:
[What should happen]

Actual Result: (fill in when tested)
[Pass / Fail / Notes]
```

---

## Auth Test Cases

### TC-AUTH-001 — User Registration with Valid Data
**Feature:** FEAT-001  
**AC Reference:** AC-001-01  
**Type:** Integration  
**Priority:** P0

**Preconditions:**
- User does not exist with this email
- DB is running

**Steps:**
1. Send `POST /api/auth/register` with `{ name, email, password }`
2. Inspect response

**Expected Result:**
- Status: `201`
- Response: `{ success: true, data: { user: {...}, accessToken: "..." } }`
- User exists in DB with hashed password
- `is_email_verified` is `false`

**Actual Result:** ⚫ Not Tested

---

### TC-AUTH-002 — Registration with Existing Email
**Feature:** FEAT-001  
**AC Reference:** AC-001-02  
**Type:** Integration  
**Priority:** P0

**Preconditions:**
- User already exists with email `existing@test.com`

**Steps:**
1. Send `POST /api/auth/register` with email `existing@test.com`
2. Inspect response

**Expected Result:**
- Status: `409`
- Response: `{ success: false, error: { code: "CONFLICT", message: "..." } }`
- No duplicate user created in DB

**Actual Result:** ⚫ Not Tested

---

### TC-AUTH-003 — Login with Valid Credentials
**Feature:** FEAT-001  
**Type:** Integration  
**Priority:** P0

**Preconditions:**
- User exists with `email: test@example.com`, `password: testpass123`

**Steps:**
1. Send `POST /api/auth/login` with valid credentials
2. Inspect response and cookies

**Expected Result:**
- Status: `200`
- `accessToken` returned
- httpOnly cookie set (if using cookies)
- `last_login_at` updated in DB

**Actual Result:** ⚫ Not Tested

---

### TC-AUTH-004 — Login with Wrong Password
**Type:** Integration  
**Priority:** P0

**Steps:**
1. Send `POST /api/auth/login` with correct email, wrong password

**Expected Result:**
- Status: `401`
- Response: generic error message (no indication of which field is wrong)

**Actual Result:** ⚫ Not Tested

---

### TC-AUTH-005 — Access Protected Endpoint Without Token
**Type:** Integration  
**Priority:** P0

**Steps:**
1. Send `GET /api/users/me` without any auth token/cookie

**Expected Result:**
- Status: `401`
- Response: `{ success: false, error: { code: "UNAUTHORIZED" } }`

**Actual Result:** ⚫ Not Tested

---

## [Feature Name] Test Cases

> Add more sections like this per feature as they are built.

### TC-[FEAT]-001 — [Test Name]
**Feature:** FEAT-XXX  
**Type:**  
**Priority:**

**Preconditions:**
-

**Steps:**
1. 

**Expected Result:**

**Actual Result:** ⚫ Not Tested

---

## Test Execution Summary

| TC ID | Test Name | Type | Priority | Status | Notes |
|-------|-----------|------|----------|--------|-------|
| TC-AUTH-001 | User Registration | Integration | P0 | ⚫ | |
| TC-AUTH-002 | Duplicate Email | Integration | P0 | ⚫ | |
| TC-AUTH-003 | Valid Login | Integration | P0 | ⚫ | |
| TC-AUTH-004 | Wrong Password | Integration | P0 | ⚫ | |
| TC-AUTH-005 | No Auth Token | Integration | P0 | ⚫ | |

**Status:** ✅ Pass | ❌ Fail | ⚫ Not Run | 🔄 In Progress
