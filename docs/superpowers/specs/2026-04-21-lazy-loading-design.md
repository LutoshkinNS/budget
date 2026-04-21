# Lazy Loading: makeLazy utility

**Date:** 2026-04-21  
**Goal:** Reduce initial JS bundle size by code-splitting components via a reusable `makeLazy` factory.

## Context

TanStack Router with `autoCodeSplitting: true` already splits routes into separate chunks. Within the main route chunk, `ExpensesByDays` is currently bundled alongside `CreateExpense`. The goal is to move `ExpensesByDays` (and its unique dependencies) into a separate async chunk.

## Solution

### 1. `shared/ui/makeLazy.tsx` (new file)

A generic factory that wraps `React.lazy` + `Suspense`:

```tsx
export function makeLazy<M, P extends object>(
  factory: () => Promise<M>,
  exportName?: keyof M
) {
  const Component = lazy(() =>
    factory().then((m) => ({
      default: (exportName ? m[exportName] : m) as ComponentType<P>,
    }))
  );

  return function LazyWrapper(props: P) {
    return (
      <Suspense fallback={<Loader />}>
        <Component {...props} />
      </Suspense>
    );
  };
}
```

- No second argument → assumes default export
- String key as second argument → picks named export, `.then()` is handled internally
- `<Loader />` is the shared fallback (from `@/common/ui/loader/Loader`)

### 2. `pages/main/Main.tsx` (updated)

Replace static import with `makeLazy`:

```tsx
import { CreateExpense } from "@/modules/expenses";
import { makeLazy } from "@/shared/ui/makeLazy";

const ExpensesByDays = makeLazy(
  () => import("@/modules/expenses/ui/ExpensesByDays"),
  "ExpensesByDays"
);

export function Main() {
  return (
    <>
      <CreateExpense />
      <ExpensesByDays />
    </>
  );
}
```

The `<Suspense>` wrapper is removed from `Main.tsx` — it moves inside `makeLazy`.

### 3. `modules/expenses/index.ts` (no change)

The existing `ExpensesByDays` export stays. `makeLazy` imports directly from the implementation file to ensure Vite can split the chunk.

## Result

Vite creates a separate async chunk for `ExpensesByDays` and its unique dependencies (`ExpenseDayGroup`, CSS module). The main page chunk becomes smaller, reducing the critical-path JS on first load.

## Usage pattern for future components

```tsx
// Named export
const MyComponent = makeLazy(() => import("./MyComponent"), "MyComponent");

// Default export
const MyComponent = makeLazy(() => import("./MyComponent"));
```
