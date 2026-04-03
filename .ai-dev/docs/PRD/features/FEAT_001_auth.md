# 📋 Feature PRD — [FEAT-001: Authentication & User Management]

---

## Metadata

| Field | Value |
|-------|-------|
| **Feature ID** | FEAT-001 |
| **Feature Name** | Authentication & User Management |
| **Priority** | P0 |
| **Phase** | Phase 1 |
| **Author** | Dev Team |
| **Created** | 2026-04-01 |
| **Last Updated** | 2026-04-01 |
| **Status** | Approved |

---

## Overview

### Problem Statement
> Without authentication, anyone can access team data. Without role-based access control, team members can accidentally (or maliciously) modify each other's work or access sensitive admin features. The system needs a secure, session-persistent identity layer from day one.

### Proposed Solution
> Implement a JWT-based authentication system with httpOnly cookie token storage. Support email/password registration and login. Enforce three roles: **Admin**, **Member**, and **Viewer**. Admins can invite members via email. Provide a profile page for users to update their details.

### Success Criteria
> How do we know this feature is done and working?
- [ ] User can register with name, email, and password
- [ ] Duplicate email registration returns a `409` error
- [ ] User can log in and receive a JWT stored in an httpOnly cookie
- [ ] Protected routes return `401` if accessed without a valid token
- [ ] User can log out and the cookie is cleared
- [ ] Access token auto-refreshes using the refresh token
- [ ] Admin can invite a new user by email
- [ ] Role-based middleware blocks unauthorized access (e.g., Member cannot access admin routes)
- [ ] User can update their name and email from the profile page

---

## In Scope / Out of Scope

| In Scope | Out of Scope |
|----------|-------------|
| Email + password auth | OAuth / social login (Google, GitHub) |
| JWT access + refresh token pattern | Magic link / passwordless login |
| Three roles: Admin, Member, Viewer | Custom role creation |
| Admin invite via email | Self-registration with public signup |
| Profile update (name, email) | Profile photo upload (Phase 2) |
| Account lockout after N failed attempts | MFA / 2FA (Phase 2) |
| Soft-delete account (admin only) | Full account deletion |

---

## User Stories

### Story 1 — Register
**As a** new team member,  
**I want to** register with my email and a secure password,  
**So that** I can access the team task management system.

**Acceptance Criteria:**
- [ ] Given a valid name/email/password, when I submit the registration form, then my account is created and I am redirected to the dashboard
- [ ] Given an already-registered email, when I try to register, then I see an error: "An account with this email already exists"
- [ ] Given a password shorter than 8 characters, when I submit, then I see a validation error before the request is sent

---

### Story 2 — Login
**As a** registered user,  
**I want to** log in with my email and password,  
**So that** I can access my tasks and projects.

**Acceptance Criteria:**
- [ ] Given valid credentials, when I log in, then I receive an access token cookie and am redirected to the dashboard
- [ ] Given invalid credentials, when I log in, then I see "Invalid email or password" (no info about which is wrong)
- [ ] Given 5 consecutive failed attempts, when I try again, then my account is locked for 15 minutes

---

### Story 3 — Session Persistence
**As a** logged-in user,  
**I want to** stay logged in across browser sessions,  
**So that** I don't have to log in every time I open the app.

**Acceptance Criteria:**
- [ ] Given a valid refresh token cookie, when my access token expires, then it is silently refreshed
- [ ] Given an expired refresh token, when I navigate to a protected page, then I am redirected to login

---

### Story 4 — Logout
**As a** logged-in user,  
**I want to** log out of the system,  
**So that** my session is terminated and the device is no longer authenticated.

**Acceptance Criteria:**
- [ ] Given I click "Log out", when the action completes, then both cookies are cleared and I am redirected to the login page
- [ ] Given I am logged out, when I navigate to `/dashboard`, then I am redirected to `/login`

---

### Story 5 — Admin Invites Member
**As an** Admin,  
**I want to** invite a user to the workspace by email,  
**So that** they can join the team without self-registering publicly.

**Acceptance Criteria:**
- [ ] Given a valid email and role, when Admin sends an invite, then the user receives an email with a one-time invite link
- [ ] Given the user clicks the invite link, when they set a password, then their account is activated with the assigned role
- [ ] Given an expired invite link (>72 hours), when the user tries to register, then they see "This invite link has expired. Please ask your admin to resend."

---

### Story 6 — Update Profile
**As a** Member,  
**I want to** update my name and email,  
**So that** my profile stays accurate.

**Acceptance Criteria:**
- [ ] Given a valid new name, when I save, then my name is updated immediately in the UI
- [ ] Given a new email already in use by another user, when I save, then I see "Email already taken"

---

## Functional Requirements

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| FR-1 | System must support email + password registration | Must | |
| FR-2 | Passwords must be hashed with bcrypt (min 12 rounds) | Must | |
| FR-3 | JWT access token expires in 15 minutes | Must | |
| FR-4 | JWT refresh token expires in 7 days | Must | |
| FR-5 | Both tokens stored as httpOnly, Secure, SameSite=Strict cookies | Must | |
| FR-6 | Account locked for 15 min after 5 consecutive failed logins | Must | |
| FR-7 | Three roles: `admin`, `member`, `viewer` | Must | |
| FR-8 | Role is checked server-side on every protected request | Must | |
| FR-9 | Admin can invite users by email with a 72-hour expiring link | Should | |
| FR-10 | User can update their name and email | Should | |
| FR-11 | Logout clears both cookies and invalidates the refresh token in DB | Must | |

---

## Non-Functional Requirements

| Category | Requirement |
|----------|------------|
| **Performance** | Login API response < 500ms |
| **Security** | Passwords never logged; bcrypt min 12 rounds; tokens in httpOnly cookies only |
| **Accessibility** | Login and register forms must be keyboard-navigable and screen-reader compatible |
| **Scalability** | Auth middleware must add < 10ms per request |
| **Browser Support** | Chrome 90+, Firefox 90+, Safari 15+, Edge 90+ |

---

## UI / UX Requirements

### Reference Pages
- `apps/web/src/app/login/page.tsx` — Login form
- `apps/web/src/app/register/page.tsx` — Registration form
- `apps/web/src/app/profile/page.tsx` — Profile edit page
- `apps/web/src/app/invite/[token]/page.tsx` — Invite acceptance page

### User Flow
```
[/login] → submit credentials → [POST /api/auth/login] → success → [/dashboard]
                                                        → failure → show error inline

[Admin: Settings > Members] → Enter email + role → [POST /api/auth/invite] 
→ Email sent to invitee → [/invite/:token] → Set password → [/dashboard]
```

### UI Components Needed
- `LoginForm` — email + password + submit, inline validation errors
- `RegisterForm` — name + email + password + confirm password
- `ProfileForm` — name + email + save, success toast on update
- `InviteModal` — admin-only, email input + role selector
- `InvitePage` — password set form for invited users

### Design Notes
- Use dark mode-first design with accent color from design system
- Show password strength meter on registration
- Lock icon next to protected nav items for Viewers

---

## API Requirements

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login + set cookies |
| POST | `/api/auth/logout` | Clear cookies + invalidate refresh |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/invite` | Admin sends invite (role required: admin) |
| POST | `/api/auth/invite/:token/accept` | Accept invite + set password |
| GET | `/api/users/me` | Get current user profile |
| PATCH | `/api/users/me` | Update name/email |

---

## Data Requirements

**Tables affected:**
- `users` — create record on register/invite acceptance
- `refresh_tokens` — store hashed refresh tokens for invalidation on logout
- `invite_tokens` — store pending invite records with expiry

**New tables needed:**
- `refresh_tokens` — `id`, `user_id`, `token_hash`, `expires_at`, `created_at`
- `invite_tokens` — `id`, `email`, `role`, `token_hash`, `expires_at`, `accepted_at`, `created_at`

---

## Security Considerations

- [ ] Input validation required for: `name`, `email`, `password`, `role`
- [ ] Authorization check: invite endpoint restricted to `admin` role only
- [ ] Data sensitivity: passwords (never stored plain), JWT secrets (env vars only)
- [ ] Rate limit login to 10 req / 15 min per IP
- [ ] Refresh token stored as bcrypt hash in DB — raw token only sent in cookie
- [ ] Invite tokens are one-time use — mark `accepted_at` on use

---

## Dependencies

| Dependency | Type | Notes |
|-----------|------|-------|
| bcrypt | npm library | Password hashing |
| jsonwebtoken | npm library | JWT sign/verify |
| Nodemailer or Resend | Email service | Invite emails |
| Prisma | ORM | DB access |

---

## Open Questions

| # | Question | Owner | Resolution |
|---|---------|-------|------------|
| 1 | Should viewers be able to self-register, or admin-invite only? | Product | Pending |
| 2 | Should refresh tokens rotate on every use (rotation = more secure)? | Tech | Pending |

---

## Implementation Notes

- Use `auth.middleware.ts` to verify JWT on every protected route
- Role guard: `requireRole('admin')` middleware wraps admin-only routes
- Never return `password_hash` in any API response — use explicit Prisma `select`
- Refresh token is stored hashed in `refresh_tokens` table; raw sent in secure cookie
- Use `crypto.randomBytes(32).toString('hex')` for invite tokens; store hash only

---

## Test Requirements

- [ ] Unit tests for: `auth.service.ts` — register, login, refresh, logout, invite logic
- [ ] Unit tests for: password hashing + JWT sign/verify utilities
- [ ] Integration tests for: `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/refresh`
- [ ] E2E tests for: full login flow, session persistence, logout, invite acceptance

---

## Checklist

- [x] PRD reviewed and approved
- [x] Acceptance criteria defined
- [ ] UI pages referenced / created
- [ ] API spec updated
- [ ] DB spec updated
- [x] Security requirements reviewed
- [ ] Test cases written
- [ ] Implementation complete
- [ ] Tests passing
- [ ] CHANGELOG updated
