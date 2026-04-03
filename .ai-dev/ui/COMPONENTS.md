# 🧱 Component Library

> **Index of all reusable UI components in this project.**  
> Before creating a new component, check if it already exists here.

---

## Component Status Legend

| Icon | Meaning |
|------|---------|
| ✅ | Done — ready to use |
| 🔄 | In progress |
| 📋 | Planned |
| ⚠️ | Needs update |

---

## Layout Components

| Component | Location | Status | Notes |
|-----------|---------|--------|-------|
| `AppShell` | `components/layout/AppShell` | 📋 | Main layout with sidebar + header |
| `Sidebar` | `components/layout/Sidebar` | 📋 | Navigation sidebar |
| `Header` | `components/layout/Header` | 📋 | Top bar with user menu |
| `PageWrapper` | `components/layout/PageWrapper` | 📋 | Consistent page padding |

---

## Common Components

| Component | Location | Status | Props |
|-----------|---------|--------|-------|
| `Button` | `components/common/Button` | 📋 | `variant, size, disabled, loading, onClick` |
| `Input` | `components/common/Input` | 📋 | `label, error, placeholder, type` |
| `Select` | `components/common/Select` | 📋 | `label, options, value, onChange` |
| `Modal` | `components/common/Modal` | 📋 | `isOpen, onClose, title, children` |
| `Badge` | `components/common/Badge` | 📋 | `variant, label` |
| `Spinner` | `components/common/Spinner` | 📋 | `size, color` |
| `Avatar` | `components/common/Avatar` | 📋 | `src, name, size` |
| `Alert` | `components/common/Alert` | 📋 | `type, message, dismissible` |
| `Table` | `components/common/Table` | 📋 | `columns, data, loading` |
| `Pagination` | `components/common/Pagination` | 📋 | `page, total, limit, onChange` |
| `EmptyState` | `components/common/EmptyState` | 📋 | `icon, title, description, action` |
| `ErrorState` | `components/common/ErrorState` | 📋 | `title, message, retry` |
| `Tooltip` | `components/common/Tooltip` | 📋 | `content, placement` |
| `Dropdown` | `components/common/Dropdown` | 📋 | `label, items, trigger` |

---

## Form Components

| Component | Location | Status | Notes |
|-----------|---------|--------|-------|
| `FormField` | `components/form/FormField` | 📋 | Wraps label + input + error |
| `DatePicker` | `components/form/DatePicker` | 📋 | |
| `FileUpload` | `components/form/FileUpload` | 📋 | |
| `Checkbox` | `components/form/Checkbox` | 📋 | |
| `RadioGroup` | `components/form/RadioGroup` | 📋 | |
| `Textarea` | `components/form/Textarea` | 📋 | |

---

## Feature Components

> Add feature-specific components here as they are built.

| Component | Feature | Location | Status |
|-----------|---------|---------|--------|
| _[ComponentName]_ | _FEAT-XXX_ | _path_ | 📋 |

---

## Component Usage Example

Always document component props and usage:

```tsx
// Button component example
<Button
  variant="primary"    // primary | secondary | ghost | danger
  size="md"            // sm | md | lg
  disabled={false}
  loading={isSubmitting}
  onClick={handleSubmit}
>
  Save Changes
</Button>
```
