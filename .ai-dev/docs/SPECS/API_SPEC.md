# Team Task Management System - REST API Specification

## API Overview

### Base Configuration
- **Base URL:** `/api/`
- **Authentication:** JWT via httpOnly cookie (`accessToken` + `refreshToken`)
- **No URL versioning** (frontend and backend deploy together)
- **Standard Response Format:**
  - Success: `{ success: true, data: {...}, message: "..." }`
  - Error: `{ success: false, error: "...", code: "ERROR_CODE" }`
- **Pagination:** All list endpoints support `?page=1&limit=20&sort=field&order=asc|desc`
- **Soft Delete Policy:** All records use `deleted_at` field; deleted records never returned unless admin requests explicitly
- **Rate Limiting:** Auth endpoints limited to 10 req/15min per IP

### Security Notes
- All protected endpoints require valid JWT in httpOnly cookie
- Access token expires in 15 minutes; refresh token expires in 7 days
- Account locked for 15 minutes after 5 consecutive failed login attempts
- Passwords hashed with bcrypt (≥12 rounds)

---

## AUTHENTICATION ENDPOINTS

### POST /api/auth/register
**Description:** Register a new user account
**Auth:** Not required
**Roles:** N/A
**Request:**
- Headers: None
- Body:

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| name | string | Yes | 1-100 chars | User's full name |
| email | string | Yes | Valid email format | Unique email address |
| password | string | Yes | Min 8 chars | Plain text password |

**Response 201:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "MEMBER"
    }
  },
  "message": "Account created successfully"
}
```

**Error responses:**

| Status | Code | When |
|--------|------|------|
| 409 | EMAIL_EXISTS | Email already registered |
| 400 | INVALID_INPUT | Validation failed |

### POST /api/auth/login
**Description:** Login with email and password
**Auth:** Not required
**Roles:** N/A
**Request:**
- Headers: None
- Body:

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| email | string | Yes | Valid email | User's email |
| password | string | Yes | Min 1 char | User's password |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "MEMBER"
    }
  },
  "message": "Login successful"
}
```

**Error responses:**

| Status | Code | When |
|--------|------|------|
| 401 | INVALID_CREDENTIALS | Wrong email or password |
| 423 | ACCOUNT_LOCKED | Too many failed attempts |

### POST /api/auth/refresh
**Description:** Refresh access token using refresh token
**Auth:** Valid refresh token cookie required
**Roles:** N/A
**Request:**
- Headers: Cookie with refreshToken
- Body: None

**Response 200:**
```json
{
  "success": true,
  "data": null,
  "message": "Token refreshed"
}
```

**Error responses:**

| Status | Code | When |
|--------|------|------|
| 401 | INVALID_REFRESH_TOKEN | Refresh token expired/invalid |

### POST /api/auth/logout
**Description:** Logout and invalidate tokens
**Auth:** Valid access token cookie required
**Roles:** All authenticated users
**Request:**
- Headers: Cookie with accessToken
- Body: None

**Response 200:**
```json
{
  "success": true,
  "data": null,
  "message": "Logged out successfully"
}
```

### POST /api/auth/invite
**Description:** Admin sends invitation to new user
**Auth:** Required
**Roles:** Admin only
**Request:**
- Headers: Cookie with accessToken
- Body:

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| email | string | Yes | Valid email | Invitee email |
| role | string | Yes | Enum: ADMIN, MEMBER, VIEWER | Assigned role |

**Response 201:**
```json
{
  "success": true,
  "data": {
    "inviteId": "uuid"
  },
  "message": "Invitation sent successfully"
}
```

**Error responses:**

| Status | Code | When |
|--------|------|------|
| 403 | INSUFFICIENT_PERMISSIONS | Non-admin user |
| 409 | USER_EXISTS | Email already registered |

### POST /api/auth/invite/:token/accept
**Description:** Accept invitation and set password
**Auth:** Not required (token in URL)
**Roles:** N/A
**Request:**
- Headers: None
- Body:

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| password | string | Yes | Min 8 chars | New password |
| name | string | Yes | 1-100 chars | User's full name |

**Response 201:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "MEMBER"
    }
  },
  "message": "Account activated successfully"
}
```

**Error responses:**

| Status | Code | When |
|--------|------|------|
| 410 | INVITE_EXPIRED | Token expired (>72 hours) |
| 404 | INVITE_NOT_FOUND | Invalid token |

---

## USER MANAGEMENT

### GET /api/users/me
**Description:** Get current user profile
**Auth:** Required
**Roles:** All authenticated users
**Request:**
- Headers: Cookie with accessToken
- Query params: None

**Response 200:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "MEMBER",
      "created_at": "2026-03-15T10:30:00Z"
    }
  }
}
```

### PATCH /api/users/me
**Description:** Update current user profile
**Auth:** Required
**Roles:** All authenticated users
**Request:**
- Headers: Cookie with accessToken
- Body:

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| name | string | No | 1-100 chars | User's name |
| email | string | No | Valid email | User's email |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Smith",
      "email": "johnsmith@example.com",
      "role": "MEMBER",
      "updated_at": "2026-03-15T11:30:00Z"
    }
  },
  "message": "Profile updated successfully"
}
```

**Error responses:**

| Status | Code | When |
|--------|------|------|
| 409 | EMAIL_EXISTS | Email already taken |

### GET /api/users/me/tasks
**Description:** Get all tasks assigned to current user across all projects
**Auth:** Required
**Roles:** All authenticated users
**Request:**
- Headers: Cookie with accessToken
- Query params:

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": "uuid",
        "title": "Implement user authentication",
        "status": "IN_PROGRESS",
        "priority": "HIGH",
        "due_date": "2026-03-20",
        "project": {
          "id": "uuid",
          "name": "Auth System",
          "color": "#3B82F6"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "totalPages": 1
    }
  }
}
```

---

## PROJECT MANAGEMENT

### POST /api/projects
**Description:** Create a new project
**Auth:** Required
**Roles:** Admin only
**Request:**
- Headers: Cookie with accessToken
- Body:

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| name | string | Yes | 1-100 chars | Project name |
| description | string | No | 1-1000 chars | Project description |
| color | string | Yes | 7-char hex (#RRGGBB) | Project color |

**Response 201:**
```json
{
  "success": true,
  "data": {
    "project": {
      "id": "uuid",
      "name": "Mobile App",
      "description": "iOS and Android application",
      "color": "#10B981",
      "status": "ACTIVE",
      "created_by": "uuid",
      "created_at": "2026-03-15T10:30:00Z"
    }
  },
  "message": "Project created successfully"
}
```

**Error responses:**

| Status | Code | When |
|--------|------|------|
| 403 | INSUFFICIENT_PERMISSIONS | Non-admin user |

### GET /api/projects
**Description:** List all projects for current user
**Auth:** Required
**Roles:** All authenticated users
**Request:**
- Headers: Cookie with accessToken
- Query params:

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page |
| status | string | all | active, archived, all |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "uuid",
        "name": "Mobile App",
        "description": "iOS and Android application",
        "color": "#10B981",
        "status": "ACTIVE",
        "member_count": 5,
        "task_stats": {
          "total": 25,
          "todo": 8,
          "in_progress": 7,
          "done": 10
        },
        "updated_at": "2026-03-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 3,
      "totalPages": 1
    }
  }
}
```

### GET /api/projects/:id
**Description:** Get project details
**Auth:** Required
**Roles:** Project members (Admin sees all, Member/Viewer see only their projects)
**Request:**
- Headers: Cookie with accessToken
- Query params: None

**Response 200:**
```json
{
  "success": true,
  "data": {
    "project": {
      "id": "uuid",
      "name": "Mobile App",
      "description": "iOS and Android application",
      "color": "#10B981",
      "status": "ACTIVE",
      "created_by": "uuid",
      "members": [
        {
          "id": "uuid",
          "name": "John Doe",
          "email": "john@example.com",
          "role": "ADMIN",
          "joined_at": "2026-03-15T10:30:00Z"
        }
      ],
      "task_stats": {
        "total": 25,
        "todo": 8,
        "in_progress": 7,
        "in_review": 0,
        "blocked": 0,
        "done": 10
      },
      "created_at": "2026-03-15T10:30:00Z",
      "updated_at": "2026-03-15T10:30:00Z"
    }
  }
}
```

**Error responses:**

| Status | Code | When |
|--------|------|------|
| 403 | INSUFFICIENT_PERMISSIONS | User not project member |
| 404 | PROJECT_NOT_FOUND | Project doesn't exist |

### PATCH /api/projects/:id
**Description:** Update project details
**Auth:** Required
**Roles:** Admin only
**Request:**
- Headers: Cookie with accessToken
- Body:

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| name | string | No | 1-100 chars | Project name |
| description | string | No | 1-1000 chars | Project description |
| color | string | No | 7-char hex | Project color |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "project": {
      "id": "uuid",
      "name": "Mobile Application",
      "description": "Updated description",
      "color": "#10B981",
      "status": "ACTIVE",
      "updated_at": "2026-03-15T11:30:00Z"
    }
  },
  "message": "Project updated successfully"
}
```

### PATCH /api/projects/:id/archive
**Description:** Archive or restore project
**Auth:** Required
**Roles:** Admin only
**Request:**
- Headers: Cookie with accessToken
- Body:

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| archived | boolean | Yes | true/false | Archive (true) or restore (false) |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "project": {
      "id": "uuid",
      "name": "Mobile App",
      "status": "ARCHIVED",
      "updated_at": "2026-03-15T11:30:00Z"
    }
  },
  "message": "Project archived successfully"
}
```

### DELETE /api/projects/:id
**Description:** Soft-delete project
**Auth:** Required
**Roles:** Admin only
**Request:**
- Headers: Cookie with accessToken
- Body: None

**Response 200:**
```json
{
  "success": true,
  "data": null,
  "message": "Project deleted successfully"
}
```

---

## PROJECT MEMBERS

### GET /api/projects/:id/members
**Description:** List project members
**Auth:** Required
**Roles:** Project members
**Request:**
- Headers: Cookie with accessToken
- Query params: None

**Response 200:**
```json
{
  "success": true,
  "data": {
    "members": [
      {
        "id": "uuid",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "ADMIN",
        "joined_at": "2026-03-15T10:30:00Z"
      }
    ]
  }
}
```

### POST /api/projects/:id/members
**Description:** Add user to project
**Auth:** Required
**Roles:** Admin only
**Request:**
- Headers: Cookie with accessToken
- Body:

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| user_id | string | Yes | Valid UUID | User to add |
| role | string | Yes | ADMIN, MEMBER, VIEWER | Member role |

**Response 201:**
```json
{
  "success": true,
  "data": {
    "member": {
      "id": "uuid",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "MEMBER",
      "joined_at": "2026-03-15T11:30:00Z"
    }
  },
  "message": "Member added successfully"
}
```

**Error responses:**

| Status | Code | When |
|--------|------|------|
| 409 | MEMBER_EXISTS | User already in project |
| 404 | USER_NOT_FOUND | User ID doesn't exist |

### PATCH /api/projects/:id/members/:userId
**Description:** Update member role
**Auth:** Required
**Roles:** Admin only
**Request:**
- Headers: Cookie with accessToken
- Body:

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| role | string | Yes | ADMIN, MEMBER, VIEWER | New role |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "member": {
      "id": "uuid",
      "name": "Jane Smith",
      "role": "ADMIN",
      "updated_at": "2026-03-15T12:00:00Z"
    }
  },
  "message": "Member role updated successfully"
}
```

### DELETE /api/projects/:id/members/:userId
**Description:** Remove member from project
**Auth:** Required
**Roles:** Admin only
**Request:**
- Headers: Cookie with accessToken
- Body: None

**Response 200:**
```json
{
  "success": true,
  "data": null,
  "message": "Member removed successfully"
}
```

**Error responses:**

| Status | Code | When |
|--------|------|------|
| 409 | LAST_ADMIN | Cannot remove last admin |

---

## TASK MANAGEMENT

### POST /api/projects/:projectId/tasks
**Description:** Create task in project
**Auth:** Required
**Roles:** Project members (Member and Admin roles)
**Request:**
- Headers: Cookie with accessToken
- Body:

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| title | string | Yes | 1-255 chars | Task title |
| description | string | No | 1-5000 chars | Task description |
| priority | string | No | LOW, MEDIUM, HIGH, CRITICAL | Task priority (default: MEDIUM) |
| due_date | string | No | YYYY-MM-DD format | Due date |
| assignee_id | string | No | Valid UUID | Assigned user (must be project member) |

**Response 201:**
```json
{
  "success": true,
  "data": {
    "task": {
      "id": "uuid",
      "title": "Implement API endpoint",
      "description": "Create user authentication endpoint",
      "status": "TODO",
      "priority": "HIGH",
      "due_date": "2026-03-20",
      "assignee": {
        "id": "uuid",
        "name": "John Doe"
      },
      "created_by": "uuid",
      "created_at": "2026-03-15T10:30:00Z"
    }
  },
  "message": "Task created successfully"
}
```

**Error responses:**

| Status | Code | When |
|--------|------|------|
| 403 | INSUFFICIENT_PERMISSIONS | Viewer role or non-member |
| 400 | INVALID_ASSIGNEE | Assignee not project member |

### GET /api/projects/:projectId/tasks
**Description:** List tasks in project with filtering and pagination
**Auth:** Required
**Roles:** Project members
**Request:**
- Headers: Cookie with accessToken
- Query params:

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page (max 100) |
| status | string | all | Filter by status: TODO, IN_PROGRESS, IN_REVIEW, BLOCKED, DONE |
| priority | string | all | Filter by priority: LOW, MEDIUM, HIGH, CRITICAL |
| assignee_id | string | all | Filter by assignee |
| sort | string | created_at_desc | Sort: created_at_desc, due_date_asc, priority_desc |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": "uuid",
        "title": "Implement API endpoint",
        "description": "Create user authentication endpoint",
        "status": "IN_PROGRESS",
        "priority": "HIGH",
        "due_date": "2026-03-20",
        "assignee": {
          "id": "uuid",
          "name": "John Doe",
          "email": "john@example.com"
        },
        "creator": {
          "id": "uuid",
          "name": "Jane Smith"
        },
        "labels": [
          {
            "id": "uuid",
            "name": "Backend",
            "color": "#EF4444"
          }
        ],
        "created_at": "2026-03-15T10:30:00Z",
        "updated_at": "2026-03-15T11:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

### GET /api/tasks/:id
**Description:** Get single task details
**Auth:** Required
**Roles:** Project members
**Request:**
- Headers: Cookie with accessToken
- Query params: None

**Response 200:**
```json
{
  "success": true,
  "data": {
    "task": {
      "id": "uuid",
      "title": "Implement API endpoint",
      "description": "Create user authentication endpoint with JWT token generation",
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "due_date": "2026-03-20",
      "assignee": {
        "id": "uuid",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "creator": {
        "id": "uuid",
        "name": "Jane Smith"
      },
      "project": {
        "id": "uuid",
        "name": "Auth System"
      },
      "labels": [
        {
          "id": "uuid",
          "name": "Backend",
          "color": "#EF4444"
        }
      ],
      "created_at": "2026-03-15T10:30:00Z",
      "updated_at": "2026-03-15T11:00:00Z"
    }
  }
}
```

**Error responses:**

| Status | Code | When |
|--------|------|------|
| 403 | INSUFFICIENT_PERMISSIONS | User not project member |
| 404 | TASK_NOT_FOUND | Task doesn't exist |

### PATCH /api/tasks/:id
**Description:** Update task
**Auth:** Required
**Roles:** Project members (Member and Admin roles)
**Request:**
- Headers: Cookie with accessToken
- Body (all fields optional):

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| title | string | No | 1-255 chars | Task title |
| description | string | No | 1-5000 chars | Task description |
| status | string | No | TODO, IN_PROGRESS, IN_REVIEW, BLOCKED, DONE | Task status |
| priority | string | No | LOW, MEDIUM, HIGH, CRITICAL | Task priority |
| due_date | string | No | YYYY-MM-DD or null | Due date |
| assignee_id | string | No | Valid UUID or null | Assigned user |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "task": {
      "id": "uuid",
      "title": "Implement API endpoint",
      "status": "IN_REVIEW",
      "priority": "HIGH",
      "updated_at": "2026-03-15T12:00:00Z"
    }
  },
  "message": "Task updated successfully"
}
```

**Error responses:**

| Status | Code | When |
|--------|------|------|
| 403 | INSUFFICIENT_PERMISSIONS | Viewer role |
| 400 | INVALID_ASSIGNEE | Assignee not project member |

### DELETE /api/tasks/:id
**Description:** Soft-delete task
**Auth:** Required
**Roles:** Task creator or Admin only
**Request:**
- Headers: Cookie with accessToken
- Body: None

**Response 200:**
```json
{
  "success": true,
  "data": null,
  "message": "Task deleted successfully"
}
```

**Error responses:**

| Status | Code | When |
|--------|------|------|
| 403 | INSUFFICIENT_PERMISSIONS | Not task creator and not admin |

---

## COMMENTS & ACTIVITY

### GET /api/tasks/:id/comments
**Description:** Get comments and activity log for task
**Auth:** Required
**Roles:** Project members
**Request:**
- Headers: Cookie with accessToken
- Query params:

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "entries": [
      {
        "type": "comment",
        "id": "uuid",
        "body": "This looks good to me",
        "author": {
          "id": "uuid",
          "name": "John Doe"
        },
        "edited_at": null,
        "created_at": "2026-03-15T14:30:00Z"
      },
      {
        "type": "activity",
        "id": "uuid",
        "action": "status_changed",
        "payload": {
          "from": "TODO",
          "to": "IN_PROGRESS"
        },
        "actor": {
          "id": "uuid",
          "name": "Jane Smith"
        },
        "created_at": "2026-03-15T12:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 8,
      "totalPages": 1
    }
  }
}
```

### POST /api/tasks/:id/comments
**Description:** Post a comment on task
**Auth:** Required
**Roles:** Project members (Member and Admin roles)
**Request:**
- Headers: Cookie with accessToken
- Body:

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| body | string | Yes | 1-5000 chars | Comment text |

**Response 201:**
```json
{
  "success": true,
  "data": {
    "comment": {
      "id": "uuid",
      "body": "This looks good to me",
      "author": {
        "id": "uuid",
        "name": "John Doe"
      },
      "edited_at": null,
      "created_at": "2026-03-15T14:30:00Z"
    }
  },
  "message": "Comment posted successfully"
}
```

**Error responses:**

| Status | Code | When |
|--------|------|------|
| 403 | INSUFFICIENT_PERMISSIONS | Viewer role |

### PATCH /api/comments/:id
**Description:** Edit comment (15-minute window)
**Auth:** Required
**Roles:** Comment author only
**Request:**
- Headers: Cookie with accessToken
- Body:

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| body | string | Yes | 1-5000 chars | Updated comment text |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "comment": {
      "id": "uuid",
      "body": "This looks really good to me",
      "edited_at": "2026-03-15T14:45:00Z",
      "updated_at": "2026-03-15T14:45:00Z"
    }
  },
  "message": "Comment updated successfully"
}
```

**Error responses:**

| Status | Code | When |
|--------|------|------|
| 403 | EDIT_WINDOW_EXPIRED | More than 15 minutes passed |
| 403 | INSUFFICIENT_PERMISSIONS | Not comment author |

### DELETE /api/comments/:id
**Description:** Soft-delete comment
**Auth:** Required
**Roles:** Comment author or Admin
**Request:**
- Headers: Cookie with accessToken
- Body: None

**Response 200:**
```json
{
  "success": true,
  "data": null,
  "message": "Comment deleted successfully"
}
```

**Error responses:**

| Status | Code | When |
|--------|------|------|
| 403 | INSUFFICIENT_PERMISSIONS | Not author and not admin |

---

## LABELS & FILTERING

### GET /api/projects/:id/labels
**Description:** Get all labels for project
**Auth:** Required
**Roles:** Project members
**Request:**
- Headers: Cookie with accessToken
- Query params: None

**Response 200:**
```json
{
  "success": true,
  "data": {
    "labels": [
      {
        "id": "uuid",
        "name": "Bug",
        "color": "#EF4444",
        "created_at": "2026-03-15T10:30:00Z"
      },
      {
        "id": "uuid",
        "name": "Feature",
        "color": "#10B981",
        "created_at": "2026-03-15T10:35:00Z"
      }
    ]
  }
}
```

### POST /api/projects/:id/labels
**Description:** Create label
**Auth:** Required
**Roles:** Admin only
**Request:**
- Headers: Cookie with accessToken
- Body:

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| name | string | Yes | 1-50 chars | Label name |
| color | string | Yes | 7-char hex (#RRGGBB) | Label color |

**Response 201:**
```json
{
  "success": true,
  "data": {
    "label": {
      "id": "uuid",
      "name": "Urgent",
      "color": "#F59E0B",
      "created_at": "2026-03-15T15:30:00Z"
    }
  },
  "message": "Label created successfully"
}
```

**Error responses:**

| Status | Code | When |
|--------|------|------|
| 409 | LABEL_EXISTS | Label name already exists in project |

### PATCH /api/labels/:id
**Description:** Update label
**Auth:** Required
**Roles:** Admin only
**Request:**
- Headers: Cookie with accessToken
- Body:

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| name | string | No | 1-50 chars | Label name |
| color | string | No | 7-char hex | Label color |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "label": {
      "id": "uuid",
      "name": "Critical",
      "color": "#DC2626",
      "updated_at": "2026-03-15T16:00:00Z"
    }
  },
  "message": "Label updated successfully"
}
```

### DELETE /api/labels/:id
**Description:** Delete label (removes from all tasks)
**Auth:** Required
**Roles:** Admin only
**Request:**
- Headers: Cookie with accessToken
- Body: None

**Response 200:**
```json
{
  "success": true,
  "data": null,
  "message": "Label deleted successfully"
}
```

### POST /api/tasks/:id/labels
**Description:** Add label to task
**Auth:** Required
**Roles:** Project members (Member and Admin roles)
**Request:**
- Headers: Cookie with accessToken
- Body:

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| label_id | string | Yes | Valid UUID | Label to add |

**Response 201:**
```json
{
  "success": true,
  "data": null,
  "message": "Label added to task"
}
```

**Error responses:**

| Status | Code | When |
|--------|------|------|
| 409 | LABEL_ALREADY_ASSIGNED | Label already on task |
| 400 | INVALID_LABEL | Label not in same project |

### DELETE /api/tasks/:id/labels/:labelId
**Description:** Remove label from task
**Auth:** Required
**Roles:** Project members (Member and Admin roles)
**Request:**
- Headers: Cookie with accessToken
- Body: None

**Response 200:**
```json
{
  "success": true,
  "data": null,
  "message": "Label removed from task"
}
```

---

## DASHBOARD & ANALYTICS

### GET /api/dashboard/summary
**Description:** Personal task summary for current user
**Auth:** Required
**Roles:** All authenticated users
**Request:**
- Headers: Cookie with accessToken
- Query params: None

**Response 200:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "due_today": 3,
      "overdue": 1,
      "in_progress": 5,
      "total_assigned": 12
    }
  }
}
```

### GET /api/dashboard/projects
**Description:** Project cards with task statistics
**Auth:** Required
**Roles:** All authenticated users
**Request:**
- Headers: Cookie with accessToken
- Query params: None

**Response 200:**
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "uuid",
        "name": "Mobile App",
        "color": "#10B981",
        "task_stats": {
          "total": 25,
          "todo": 8,
          "in_progress": 7,
          "in_review": 2,
          "blocked": 0,
          "done": 8
        },
        "completion_percentage": 32,
        "updated_at": "2026-03-15T14:30:00Z"
      }
    ]
  }
}
```

### GET /api/dashboard/activity
**Description:** Activity feed across user's projects
**Auth:** Required
**Roles:** All authenticated users
**Request:**
- Headers: Cookie with accessToken
- Query params:

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": "uuid",
        "action": "task_created",
        "actor": {
          "id": "uuid",
          "name": "John Doe"
        },
        "project": {
          "id": "uuid",
          "name": "Mobile App"
        },
        "task": {
          "id": "uuid",
          "title": "Add push notifications"
        },
        "created_at": "2026-03-15T14:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

### GET /api/dashboard/admin/overview
**Description:** Admin-only project health overview
**Auth:** Required
**Roles:** Admin only
**Request:**
- Headers: Cookie with accessToken
- Query params: None

**Response 200:**
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "uuid",
        "name": "Mobile App",
        "total_tasks": 25,
        "done_tasks": 8,
        "in_progress_tasks": 7,
        "blocked_tasks": 0,
        "overdue_tasks": 2,
        "health_indicator": "green"
      }
    ]
  }
}
```

**Error responses:**

| Status | Code | When |
|--------|------|------|
| 403 | INSUFFICIENT_PERMISSIONS | Non-admin user |

---

## NOTIFICATIONS

### GET /api/notifications
**Description:** Get user's notifications
**Auth:** Required
**Roles:** All authenticated users
**Request:**
- Headers: Cookie with accessToken
- Query params:

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page |
| read | boolean | all | Filter by read status: true, false, all |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "uuid",
        "type": "task_assigned",
        "payload": {
          "task": {
            "id": "uuid",
            "title": "Implement API endpoint"
          },
          "project": {
            "id": "uuid",
            "name": "Auth System"
          },
          "assigner": {
            "name": "Jane Smith"
          }
        },
        "read_at": null,
        "created_at": "2026-03-15T14:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "totalPages": 1
    },
    "unread_count": 3
  }
}
```

### PATCH /api/notifications/read-all
**Description:** Mark all notifications as read
**Auth:** Required
**Roles:** All authenticated users
**Request:**
- Headers: Cookie with accessToken
- Body: None

**Response 200:**
```json
{
  "success": true,
  "data": null,
  "message": "All notifications marked as read"
}
```

### PATCH /api/notifications/:id/read
**Description:** Mark single notification as read
**Auth:** Required
**Roles:** All authenticated users (own notifications only)
**Request:**
- Headers: Cookie with accessToken
- Body: None

**Response 200:**
```json
{
  "success": true,
  "data": {
    "notification": {
      "id": "uuid",
      "read_at": "2026-03-15T15:00:00Z"
    }
  },
  "message": "Notification marked as read"
}
```

### GET /api/users/me/notification-preferences
**Description:** Get notification preferences
**Auth:** Required
**Roles:** All authenticated users
**Request:**
- Headers: Cookie with accessToken
- Query params: None

**Response 200:**
```json
{
  "success": true,
  "data": {
    "preferences": {
      "email_due_tomorrow": true,
      "email_overdue": true,
      "email_assigned": true,
      "email_commented": false
    }
  }
}
```

### PATCH /api/users/me/notification-preferences
**Description:** Update notification preferences
**Auth:** Required
**Roles:** All authenticated users
**Request:**
- Headers: Cookie with accessToken
- Body:

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| email_due_tomorrow | boolean | No | true/false | Email for tasks due tomorrow |
| email_overdue | boolean | No | true/false | Email for overdue tasks |
| email_assigned | boolean | No | true/false | Email when task assigned |
| email_commented | boolean | No | true/false | Email when task commented |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "preferences": {
      "email_due_tomorrow": false,
      "email_overdue": true,
      "email_assigned": true,
      "email_commented": false
    }
  },
  "message": "Notification preferences updated"
}
```

---

## ADMIN REPORTS

### GET /api/reports/completion-trend
**Description:** Weekly task completion trend
**Auth:** Required
**Roles:** Admin only
**Request:**
- Headers: Cookie with accessToken
- Query params:

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| projectId | string | all | Filter by project ID |
| from | string | -12 weeks | Start date (YYYY-MM-DD) |
| to | string | today | End date (YYYY-MM-DD) |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "trend": [
      {
        "week": "2026-01-06",
        "completed_tasks": 12
      },
      {
        "week": "2026-01-13",
        "completed_tasks": 8
      }
    ]
  }
}
```

### GET /api/reports/status-distribution
**Description:** Task distribution by status
**Auth:** Required
**Roles:** Admin only
**Request:**
- Headers: Cookie with accessToken
- Query params:

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| projectId | string | all | Filter by project ID |
| from | string | -4 weeks | Start date |
| to | string | today | End date |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "distribution": [
      {
        "status": "TODO",
        "count": 25,
        "percentage": 35.2
      },
      {
        "status": "IN_PROGRESS",
        "count": 18,
        "percentage": 25.4
      },
      {
        "status": "DONE",
        "count": 28,
        "percentage": 39.4
      }
    ]
  }
}
```

### GET /api/reports/member-workload
**Description:** Member workload analysis
**Auth:** Required
**Roles:** Admin only
**Request:**
- Headers: Cookie with accessToken
- Query params:

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| projectId | string | all | Filter by project ID |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "workload": [
      {
        "user": {
          "id": "uuid",
          "name": "John Doe"
        },
        "open_tasks": 8,
        "overdue_tasks": 2,
        "completion_rate": 85.5
      }
    ]
  }
}
```

**Error responses for all report endpoints:**

| Status | Code | When |
|--------|------|------|
| 403 | INSUFFICIENT_PERMISSIONS | Non-admin user |

---

## COMMON ERROR CODES

| Code | HTTP Status | Meaning |
|------|-------------|---------|
| UNAUTHORIZED | 401 | Authentication required or invalid token |
| INSUFFICIENT_PERMISSIONS | 403 | User role lacks required permissions |
| NOT_FOUND | 404 | Resource doesn't exist |
| EMAIL_EXISTS | 409 | Email already registered |
| USER_EXISTS | 409 | User already exists |
| MEMBER_EXISTS | 409 | User already project member |
| LABEL_EXISTS | 409 | Label name already taken in project |
| LABEL_ALREADY_ASSIGNED | 409 | Label already on task |
| LAST_ADMIN | 409 | Cannot remove last admin |
| ACCOUNT_LOCKED | 423 | Too many failed login attempts |
| INVALID_CREDENTIALS | 401 | Wrong email/password |
| INVALID_REFRESH_TOKEN | 401 | Refresh token expired/invalid |
| INVALID_INPUT | 400 | Request validation failed |
| INVALID_ASSIGNEE | 400 | Assignee not project member |
| INVALID_LABEL | 400 | Label not in same project |
| EDIT_WINDOW_EXPIRED | 403 | Comment edit window (15min) expired |
| INVITE_EXPIRED | 410 | Invitation token expired |
| INVITE_NOT_FOUND | 404 | Invalid invitation token |
| PROJECT_NOT_FOUND | 404 | Project doesn't exist |
| TASK_NOT_FOUND | 404 | Task doesn't exist |
| USER_NOT_FOUND | 404 | User doesn't exist |
| INTERNAL_ERROR | 500 | Server error |
| RATE_LIMITED | 429 | Too many requests |

---

## Business Rules Applied

All endpoints implement the business rules from the project brief:

1. **Task-Project Relationship:** Tasks belong to exactly one project (enforced via foreign key)
2. **Assignment Validation:** Users can only be assigned tasks in projects they're members of
3. **Admin Permissions:** Only Admins can create/delete projects, manage members, access reports
4. **Member Permissions:** Members can create/edit tasks, cannot delete others' tasks
5. **Viewer Restrictions:** Viewers have read-only access, cannot create/edit/delete
6. **Soft Delete:** All delete operations set `deleted_at` timestamp
7. **Password Security:** Passwords hashed with bcrypt ≥12 rounds
8. **Token Management:** JWT access tokens (15min) + refresh tokens (7 days)
9. **Account Security:** Account lockout after 5 failed attempts
10. **Admin Protection:** Last admin cannot be removed from project

---

*Last updated: 2026-04-01*
*For implementation details, see DATABASE_SPEC.md and individual Feature PRDs*