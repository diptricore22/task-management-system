# 📜 Changelog

> All notable changes to this project are documented here.  
> Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).  
> Versioning follows [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`

---

## Versioning Guide

| Type | When to bump |
|------|-------------|
| **MAJOR** (1.0.0) | Breaking changes, full feature revamp |
| **MINOR** (0.1.0) | New features, non-breaking |
| **PATCH** (0.0.1) | Bug fixes, small improvements |

---

## Change Types

- **Added** — New features
- **Changed** — Changes in existing functionality
- **Deprecated** — Features that will be removed in a future release
- **Removed** — Features removed in this release
- **Fixed** — Bug fixes
- **Security** — Security vulnerability fixes
- **Refactor** — Code restructuring without behavior change
- **Docs** — Documentation changes only

---

## [Unreleased]

### Added

## [0.1.0] — 2026-04-03

### Added
- **FEAT-001: Authentication & User Management** - Complete authentication system with JWT tokens, role-based access control, and user management
  - User registration and login with bcrypt password hashing
  - JWT access tokens (15 min expiry) and refresh tokens (7 day expiry) with rotation
  - Secure httpOnly cookies with SameSite=Strict protection
  - Role-based access control (ADMIN, MEMBER, VIEWER)
  - Admin-only user invitations with 72-hour token expiry
  - User profile management (GET/PATCH endpoints)
  - Rate limiting on auth endpoints (10/15min login, 5/hour register)
  - Database schema with 12 models including User, RefreshToken, InviteToken
  - Comprehensive input validation using Zod schemas
  - Seed data with 4 test accounts and sample projects

---

<!--
TEMPLATE FOR NEW ENTRY:

## [X.Y.Z] — YYYY-MM-DD

### Added
-

### Changed
-

### Fixed
-

### Security
-

### Removed
-
-->
