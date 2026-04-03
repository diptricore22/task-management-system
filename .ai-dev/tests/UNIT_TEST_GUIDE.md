# 🧩 Unit Testing Guide

> **Conventions and patterns for writing unit tests in this project.**

---

## Testing Framework

- **Framework:** _[Vitest / Jest]_
- **Assertion library:** _[Vitest built-in / Jest expect]_
- **Mocking:** _[Vitest vi.mock / Jest jest.mock]_
- **API mocking:** _[MSW (Mock Service Worker)]_

---

## File Structure

```
src/
└── services/
    ├── user.service.ts
    └── user.service.test.ts   ← Always co-locate tests
```

---

## Test Naming Convention

```typescript
describe('[Module/Class Name]', () => {
  describe('[method/function name]', () => {
    it('should [expected behavior] when [condition]', () => { ... });
    it('should throw [error] when [invalid condition]', () => { ... });
  });
});
```

---

## Test Structure — Arrange / Act / Assert

```typescript
it('should hash the password before saving', async () => {
  // Arrange — set up test data and mocks
  const input = { email: 'test@test.com', name: 'Test', password: 'plain123' };
  mockDb.user.create.mockResolvedValue({ id: 'uuid-1', ...input, passwordHash: 'hashed' });

  // Act — call the function being tested
  const user = await userService.createUser(input);

  // Assert — verify expectations
  expect(user.passwordHash).not.toBe(input.password);
  expect(mockDb.user.create).toHaveBeenCalledTimes(1);
});
```

---

## Mocking Patterns

### Mock Database (Prisma)
```typescript
// src/__mocks__/prisma.ts
import { vi } from 'vitest';

export const prisma = {
  user: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
  },
};
```

### Mock External Services
```typescript
vi.mock('../lib/email', () => ({
  sendEmail: vi.fn().mockResolvedValue({ success: true }),
}));
```

### Mock Environment Variables
```typescript
beforeEach(() => {
  vi.stubEnv('JWT_SECRET', 'test-secret');
});
afterEach(() => {
  vi.unstubAllEnvs();
});
```

---

## What TO Unit Test

✅ Service layer business logic  
✅ Data transformation functions  
✅ Validation functions  
✅ Error handling paths  
✅ Edge cases and boundary values  
✅ Utility / helper functions  

---

## What NOT to Unit Test

❌ Framework internals (Next.js routing, Prisma itself)  
❌ Third-party library behavior  
❌ Simple getters/setters with no logic  
❌ UI rendering (use component tests or E2E)  

---

## Test Setup File

```typescript
// vitest.setup.ts
import { vi, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Clean up after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Global test utilities
global.testUser = {
  id: 'test-uuid-1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'user',
};
```

---

## Coverage Configuration

```typescript
// vitest.config.ts
export default {
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/services/**', 'src/lib/**', 'src/utils/**'],
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
      thresholds: {
        lines: 80,
        functions: 80,
      },
    },
  },
};
```

---

## Common Assertions

```typescript
// Value checks
expect(result).toBe('exact value');           // strict equality
expect(result).toEqual({ id: 1 });            // deep equality
expect(result).toBeNull();
expect(result).toBeDefined();
expect(result).toBeTruthy();

// Array checks
expect(arr).toHaveLength(3);
expect(arr).toContain('item');
expect(arr).toEqual(expect.arrayContaining(['a', 'b']));

// Object checks
expect(obj).toHaveProperty('key', 'value');
expect(obj).toMatchObject({ name: 'Test' });  // partial match

// Error checks
await expect(fn()).rejects.toThrow('error message');
await expect(fn()).rejects.toThrow(CustomError);

// Mock checks
expect(mock).toHaveBeenCalled();
expect(mock).toHaveBeenCalledWith({ id: '1' });
expect(mock).toHaveBeenCalledTimes(2);
```
