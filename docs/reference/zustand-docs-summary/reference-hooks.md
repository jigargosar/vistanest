# Reference / Hooks

## use-store.md

### Signature
```ts
useStore<StoreApi<T>, U = T>(store: StoreApi<T>, selectorFn?: (state: T) => U)
```

### Purpose
Use a vanilla store (created with `createStore`) inside React components. Takes a store instance and a selector function.

### Key patterns
1. **Global vanilla store** — create once at module level, use in any component
2. **Dynamic stores** — factory function creates stores on demand (e.g., per tab)
3. **Scoped stores** — use React Context to provide store instances to subtrees
4. **Dynamic scoped stores** — Context + factory for per-instance stores

### Re-render behavior
Without a selector, subscribes to entire state (re-renders on every change). With a selector, only re-renders when selected value changes (via `Object.is`).

Source: docs/reference/zustand-repo/docs/reference/hooks/use-store.md

---

## use-shallow.md

### Signature
```ts
useShallow<T, U = T>(selectorFn: (state: T) => U): (state: T) => U
```

### Purpose
Returns a memoized version of a selector using **shallow comparison**. Prevents re-renders when the selector output is structurally the same but a different reference.

### How shallow comparison works
Compares each top-level key of the returned object (or each element of a returned array) using `Object.is`. If all match, the previous result is returned (same reference), preventing re-render.

### When to use
1. Selector returns a new object: `(state) => ({ a: state.a, b: state.b })`
2. Selector returns a derived array: `(state) => Object.keys(state)`
3. Any computed/transformed output that creates new references

### When NOT needed
1. Selecting a single primitive: `(state) => state.count`
2. Selecting a single stable reference: `(state) => state.actions`

Source: docs/reference/zustand-repo/docs/reference/hooks/use-shallow.md

---

## use-store-with-equality-fn.md

### Signature
```ts
useStoreWithEqualityFn<T, U = T>(store: StoreApi<T>, selectorFn: (state: T) => U, equalityFn?: (a: T, b: T) => boolean): U
```

### Purpose
Like `useStore` but with a custom equality function for re-render control. Requires `use-sync-external-store` as peer dependency. Import from `zustand/traditional`.

### Key difference from useStore
The third parameter `equalityFn` lets you define custom comparison logic (e.g., `shallow` from `zustand/shallow`). Default is `Object.is`.

### Usage patterns
Same as useStore (global, dynamic, scoped, dynamic scoped) but with added equality function parameter.

Source: docs/reference/zustand-repo/docs/reference/hooks/use-store-with-equality-fn.md
