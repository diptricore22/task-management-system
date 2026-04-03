# FEAT-004 Testing Guide
## Task Assignment & Team Members - Quick Reference

---

## Running Tests

```bash
# From project root
cd apps/api

# Run all tests
npm test

# Run member tests specifically
npm test -- members.unit.test.ts

# Run notification tests specifically
npm test -- notifications.unit.test.ts

# Run with coverage
npm test -- --coverage
```

---

## Manual Testing - cURL Examples

### Authentication Setup

```bash
# Assuming JWT access token in cookie 'accessToken'
export TOKEN="your_jwt_token_here"
export PROJECT_ID="550e8400-e29b-41d4-a716-446655440000"
export USER_ID="660e8400-e29b-41d4-a716-446655440000"
```

---

### Story 1: Add Member to Project

**TC-101: Add new member with MEMBER role**
```bash
curl -X POST http://localhost:3003/api/projects/$PROJECT_ID/members \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=$TOKEN" \
  -d '{
    "user_id": "'"$USER_ID"'",
    "role": "MEMBER"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Member added successfully",
  "data": {
    "member": {
      "id": "member-id",
      "user_id": "660e8400...",
      "project_id": "550e8400...",
      "role": "MEMBER",
      "name": "John Doe",
      "email": "john@example.com",
      "joined_at": "2026-04-03T..."
    }
  }
}
```

**TC-102: Try adding duplicate member**
```bash
# Run same curl request twice
# Second request should return 409 MEMBER_EXISTS
```

---

### Story 2: Remove Member from Project

**TC-201: Remove member and verify tasks unassigned**

1. First, add a member to project
2. Assign open tasks to that member:
   ```bash
   # Via PATCH /api/tasks/:id
   ```
3. Remove the member:
   ```bash
   curl -X DELETE http://localhost:3003/api/projects/$PROJECT_ID/members/$MEMBER_ID \
     -H "Cookie: accessToken=$TOKEN"
   ```
4. Query the tasks to verify they're unassigned:
   ```bash
   curl -X GET "http://localhost:3003/api/projects/$PROJECT_ID/tasks?assignee_id=$MEMBER_ID" \
     -H "Cookie: accessToken=$TOKEN"
   ```

**Expected:** Tasks should have `assignee_id: null`

**TC-202: Attempt to remove last admin**
```bash
# Get member count for project
curl -X GET http://localhost:3003/api/projects/$PROJECT_ID/members \
  -H "Cookie: accessToken=$TOKEN"

# If only one ADMIN role exists, attempt removal returns:
# 409 LAST_ADMIN - "Cannot remove the last admin from a project"
```

---

### Story 3: Assign Task to Member

**TC-301: Assign task to valid project member**
```bash
curl -X PATCH http://localhost:3003/api/tasks/$TASK_ID \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=$TOKEN" \
  -d '{
    "assignee_id": "'"$USER_ID"'"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "task": {
      "id": "task-id",
      "assignee_id": "660e8400...",
      "assignee": {
        "id": "660e8400...",
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  }
}
```

**TC-302: Try assigning to non-member**
```bash
# Use USER_ID who is NOT in the project
curl -X PATCH http://localhost:3003/api/tasks/$TASK_ID \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=$TOKEN" \
  -d '{
    "assignee_id": "invalid-non-member-id"
  }'
```

**Expected Error:**
```json
{
  "success": false,
  "error": "Assignee is not a project member",
  "code": "INVALID_ASSIGNEE"
}
```

**TC-303: Unassign task**
```bash
curl -X PATCH http://localhost:3003/api/tasks/$TASK_ID \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=$TOKEN" \
  -d '{
    "assignee_id": null
  }'
```

**Expected:** Task shows no assignee

---

### Story 4: My Tasks View

**TC-401: Get all tasks assigned to current user**
```bash
curl -X GET "http://localhost:3003/api/users/me/tasks?page=1&limit=20" \
  -H "Cookie: accessToken=$TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": "task-id",
        "title": "Fix login bug",
        "status": "IN_PROGRESS",
        "priority": "HIGH",
        "due_date": "2026-04-10",
        "project": {
          "id": "proj-id",
          "name": "Backend",
          "color": "#3B82F6"
        },
        "created_at": "2026-04-01T..."
      }
    ],
    "grouped_by_project": [
      {
        "project_id": "proj-id",
        "project_name": "Backend",
        "project_color": "#3B82F6",
        "tasks": [...]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

**TC-402: Test pagination**
```bash
# Get page 2 with limit 10
curl -X GET "http://localhost:3003/api/users/me/tasks?page=2&limit=10" \
  -H "Cookie: accessToken=$TOKEN"

# Get with high page number
curl -X GET "http://localhost:3003/api/users/me/tasks?page=100&limit=20" \
  -H "Cookie: accessToken=$TOKEN"
# Expected: Empty tasks array, total shows actual count
```

**TC-403: Empty state**
```bash
# Login as user with no assigned tasks
curl -X GET "http://localhost:3003/api/users/me/tasks" \
  -H "Cookie: accessToken=$TOKEN"
# Expected: Empty tasks array, total: 0
```

---

## Notifications Testing

**TC-501: Get notifications**
```bash
curl -X GET "http://localhost:3003/api/notifications?page=1&limit=20" \
  -H "Cookie: accessToken=$TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif-id",
        "type": "task_assigned",
        "payload": {
          "title": "Task assigned: Fix UI",
          "message": "You have been assigned...",
          "task_id": "task-id",
          "project_id": "proj-id"
        },
        "read_at": null,
        "created_at": "2026-04-03T..."
      }
    ],
    "unread_count": 5,
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 10,
      "pages": 1
    }
  }
}
```

**TC-502: Mark notification as read**
```bash
curl -X PATCH http://localhost:3003/api/notifications/$NOTIF_ID/read \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=$TOKEN" \
  -d '{}'
```

**Expected:** read_at is now set to current timestamp

**TC-503: Mark all as read**
```bash
curl -X PATCH http://localhost:3003/api/notifications/read-all \
  -H "Cookie: accessToken=$TOKEN"
```

---

## Notification Trigger Testing

**TC-601: Verify notification created on task assignment**

1. User A assigns task to User B
2. Check notifications for User B:
   ```bash
   # Using User B's token
   curl -X GET "http://localhost:3003/api/notifications" \
     -H "Cookie: accessToken=$TOKEN_USER_B"
   ```
3. Should see notification with type: "task_assigned"
4. Payload should include assigned task and project info

**TC-602: No notification on reassignment to same user**

1. Create task assigned to User A
2. Update task with same assignee_id
3. Check User A's notifications
4. Notification should already exist from creation, no duplicate

---

## Edge Cases

**TC-701: Access control - Non-admin cannot manage members**
```bash
# Using MEMBER role token (not ADMIN)
curl -X POST http://localhost:3003/api/projects/$PROJECT_ID/members \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=$TOKEN_MEMBER" \
  -d '{"user_id": "user-id", "role": "MEMBER"}'
# Expected: 403 INSUFFICIENT_PERMISSIONS
```

**TC-702: Access control - Viewer cannot view members**
```bash
# Using VIEWER role token
curl -X GET http://localhost:3003/api/projects/$PROJECT_ID/members \
  -H "Cookie: accessToken=$TOKEN_VIEWER"
# Expected: 403 - User is not project member (Viewers aren't added to projects in our schema)
```

**TC-703: Invalid role in update**
```bash
curl -X PATCH http://localhost:3003/api/projects/$PROJECT_ID/members/$MEMBER_ID \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=$TOKEN" \
  -d '{"role": "SUPERUSER"}'
# Expected: 400 INVALID_INPUT - role must be ADMIN, MEMBER, or VIEWER
```

---

## Troubleshooting

| Error | Likely Cause | Solution |
|-------|-------------|----------|
| 404 PROJECT_NOT_FOUND | Project doesn't exist or deleted | Verify project_id is correct |
| 403 INSUFFICIENT_PERMISSIONS | Non-admin attempting operation | Use admin token |
| 400 INVALID_ASSIGNEE | User not project member | Add user to project first |
| 409 MEMBER_EXISTS | User already member | Check with GET /members first |
| 409 LAST_ADMIN | Removing/demoting last admin | Ensure 2+ admins before removal |

---

## Test Results Template

```markdown
# FEAT-004 Test Results
Date: [DATE]
Tester: [NAME]

## Unit Tests
- [ ] members.unit.test.ts: [PASS/FAIL] - 24 tests
- [ ] notifications.unit.test.ts: [PASS/FAIL] - 19 tests

## Integration Tests
- [ ] TC-101 Add Member: [PASS/FAIL]
- [ ] TC-102 Duplicate Member: [PASS/FAIL]
- [ ] TC-201 Remove Member: [PASS/FAIL]
- [ ] TC-202 Last Admin Protection: [PASS/FAIL]
- [ ] TC-301 Assign Task: [PASS/FAIL]
- [ ] TC-302 Invalid Assignee: [PASS/FAIL]
- [ ] TC-303 Unassign Task: [PASS/FAIL]
- [ ] TC-401 My Tasks: [PASS/FAIL]
- [ ] TC-402 My Tasks Pagination: [PASS/FAIL]
- [ ] TC-403 My Tasks Empty: [PASS/FAIL]
- [ ] TC-501 Get Notifications: [PASS/FAIL]
- [ ] TC-502 Mark as Read: [PASS/FAIL]
- [ ] TC-503 Mark All Read: [PASS/FAIL]
- [ ] TC-601 Task Assignment Notification: [PASS/FAIL]

## Overall Status
[PASS/FAIL]

## Notes
[Any issues or observations]
```
