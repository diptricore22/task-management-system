# Coding Standards

> **Language and framework-specific coding standards for this project.**  
> These complement the high-level rules in `DEV_RULES.md`.

---

## Module Architecture Rules

> The project uses a **modular architecture**. Every feature is a self-contained module.
> This enables easy extraction and reuse across other projects.

### What goes inside a module

Each module (`apps/web/src/modules/[feature]/` or `apps/api/src/modules/[feature]/`) is fully self-contained:

**Frontend module structure:**
```
modules/[feature]/
  components/     # UI components used ONLY by this feature
  hooks/          # Custom hooks used ONLY by this feature
  services/       # API call functions for this feature
  store/          # Zustand slice (only if global state needed)
  types.ts        # Types/interfaces for this feature
```

**Backend module structure:**
```
modules/[feature]/
  [feature].routes.ts      # Route registration only — no logic
  [feature].controller.ts  # HTTP layer: parse, validate, call service, respond
  [feature].service.ts     # Business logic — no HTTP/Express imports here
  [feature].validation.ts  # Zod schemas for this feature's request bodies
  [feature].types.ts       # TypeScript types specific to this feature
```

### The module boundary rules

```typescript
// ✅ Good — module uses shared components
import { Button } from '@/components/common/Button';
import { apiClient } from '@/lib/api-client';

// ✅ Good — module uses its own internals
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { LoginForm } from '@/modules/auth/components/LoginForm';

// ❌ Bad — one feature module imports another feature module's components
import { PatientCard } from '@/modules/patients/components/PatientCard'; // inside appointments module
// If shared, move it to components/common/ first

// ❌ Bad — service layer imports from controller or routes
import { Request } from 'express'; // inside auth.service.ts
// Services must be pure business logic — no Express types
```

### The layers must stay separate (backend)

```typescript
// ✅ Good — controller delegates to service
// auth.controller.ts
export const login = async (req: Request, res: Response) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, error: parsed.error });
  const result = await authService.login(parsed.data);   // <-- service call
  return res.json({ success: true, data: result });
};

// ❌ Bad — controller contains business logic
export const login = async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({ where: { email: req.body.email } }); // DB in controller
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!);            // Logic in controller
  return res.json({ token });
};
```

### Shared vs module-specific

| Type | Where it lives |
|---|---|
| Used by 2+ modules | `components/common/` or `lib/` or `utils/` |
| Used by 1 module only | Inside that module |
| API response shape | `packages/types/` (or `src/types/`) |
| Feature-specific type | Inside the module's `types.ts` |
| Cross-app shared component | `packages/ui/` |

### When to use `packages/`

Only use the shared `packages/` directory when:
- You have **multiple frontend apps** that share UI components
- You have **strictly typed API contracts** shared between web and api
- You have shared ESLint/TypeScript config between apps

Do NOT create `packages/` entries for single-app projects — keep it simple.

---

## TypeScript / JavaScript

### Type Safety
```typescript
// ✅ Good — explicit types
const getUserById = async (id: string): Promise<User | null> => { ... }

// ❌ Bad — implicit any
const getUser = async (id) => { ... }

// ✅ Good — type-safe error handling
try {
  ...
} catch (error) {
  const err = error as Error;
  logger.error({ message: err.message, stack: err.stack });
}

// ❌ Bad — swallowing errors
try { ... } catch {}
```

### Async / Await
```typescript
// ✅ Good
const data = await fetchData();

// ❌ Bad — mixing .then() and async/await (unless needed)
fetchData().then((data) => { ... });

// ✅ Good — parallel async calls
const [users, orders] = await Promise.all([getUsers(), getOrders()]);
```

### Interfaces vs Types
```typescript
// ✅ Prefer interface for objects (extendable)
interface User {
  id: string;
  name: string;
}

// ✅ Use type for unions, primitives, computed
type Status = 'active' | 'inactive' | 'pending';
type UserWithRole = User & { role: string };
```

### Null/Undefined Handling
```typescript
// ✅ Use optional chaining
const name = user?.profile?.name;

// ✅ Use nullish coalescing
const displayName = user?.name ?? 'Anonymous';

// ❌ Bad — truthy checks miss empty string and 0
const name = user && user.name;
```

---

## React / Next.js

### Component Structure
```typescript
// ✅ Good — consistent component structure
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

const Button = ({ label, onClick, disabled = false, variant = 'primary' }: ButtonProps) => {
  return (
    <button
      className={`btn btn-${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
};

export default Button;
```

### Hooks
```typescript
// ✅ Good — custom hook encapsulates logic
const useUserProfile = (userId: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getUserById(userId);
        setUser(data);
      } catch (err) {
        setError('Failed to load user');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  return { user, loading, error };
};
```

### State Management
- Prefer `useState` + `useContext` for simple state
- Use Zustand for complex global state
- Server state (API data) → use React Query / SWR
- Never store derived state — compute it from existing state

---

## CSS / Styling

```css
/* ✅ Good — BEM naming for vanilla CSS */
.card { }
.card__header { }
.card__body { }
.card--featured { }

/* ❌ Bad — vague single-word classes */
.header { }
.big { }
```

```css
/* ✅ Good — CSS variables for tokens */
:root {
  --color-primary: hsl(220 90% 56%);
  --space-md: 1rem;
  --radius-sm: 0.375rem;
}

/* ❌ Bad — hardcoded values spread across CSS */
.button { background: #2563eb; padding: 16px; border-radius: 6px; }
```

---

## API / Backend (Node.js / Express / Next.js API)

```typescript
// ✅ Good — structured route handler
export async function POST(req: Request) {
  // 1. Parse and validate input
  const body = await req.json();
  const parsed = CreateUserSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: parsed.error.flatten() } },
      { status: 400 }
    );
  }

  // 2. Call service layer
  try {
    const user = await userService.createUser(parsed.data);
    return Response.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    logger.error({ error, context: 'POST /api/users' });
    return Response.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } },
      { status: 500 }
    );
  }
}
```

---

## Database (Prisma)

```typescript
// ✅ Good — always filter soft-deleted records
const users = await prisma.user.findMany({
  where: { deletedAt: null }
});

// ✅ Good — transaction for multi-table writes
const result = await prisma.$transaction(async (tx) => {
  const order = await tx.order.create({ data: orderData });
  await tx.inventory.update({ where: { id: itemId }, data: { quantity: { decrement: 1 } } });
  return order;
});

// ❌ Bad — no soft-delete filter
const users = await prisma.user.findMany();
```

---

## Testing

```typescript
// ✅ Good — descriptive test structure
describe('UserService', () => {
  describe('createUser', () => {
    it('should create a user with hashed password', async () => {
      // Arrange
      const input = { email: 'test@example.com', password: 'password123', name: 'Test' };
      
      // Act
      const user = await userService.createUser(input);
      
      // Assert
      expect(user.email).toBe(input.email);
      expect(user.passwordHash).not.toBe(input.password);
      expect(user.id).toBeDefined();
    });

    it('should throw ConflictError if email already exists', async () => {
      await expect(userService.createUser(existingUser)).rejects.toThrow(ConflictError);
    });
  });
});
```

---

## Commit Message Format (Conventional Commits)

```
<type>(<scope>): <short summary>

[optional body]

[optional footer]
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `hotfix`

**Examples:**
```
feat(auth): add JWT refresh token flow
fix(api): return 404 when user not found
docs(prd): update FEAT-003 acceptance criteria
refactor(users): extract email validation to utility
test(auth): add unit tests for login service
chore(deps): update prisma to 5.8.0
```
