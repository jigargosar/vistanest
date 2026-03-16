# Learn / Guides

## prevent-rerenders-with-use-shallow.md

### Core problem
When a selector returns a new object/array each time (e.g., `Object.keys(state)`), the component re-renders on ANY state change — even if the output is the same — because `Object.is` sees a new reference.

### Solution: useShallow
Wrap selector with `useShallow` from `zustand/react/shallow`. It does a shallow comparison of the output, preventing re-renders when the values haven't actually changed.

```js
const names = useStore(useShallow((state) => Object.keys(state)))
```

**When to use**: Whenever your selector returns a derived object, array, or computed value (not a direct primitive/reference from the store).

**When NOT needed**: When selecting a single primitive or a stable reference (like an action function).

Source: docs/reference/zustand-repo/docs/learn/guides/prevent-rerenders-with-use-shallow.md

---

## practice-with-no-store-actions.md

### Recommended: colocate actions with state
Default pattern — actions and state in the same `create()` call. Encapsulated.

### Alternative: module-level actions
Define actions outside the store as standalone functions using `store.setState()`.

```js
export const useBoundStore = create(() => ({
  count: 0,
  text: 'hello',
}))

export const inc = () =>
  useBoundStore.setState((state) => ({ count: state.count + 1 }))
```

**Advantages**:
1. No hook needed to call actions (can call from anywhere)
2. Facilitates code splitting

**No downsides** mentioned — just preference for encapsulation vs. separation.

Source: docs/reference/zustand-repo/docs/learn/guides/practice-with-no-store-actions.md

---

## flux-inspired-practice.md

### Recommended patterns
1. **Single store** — one Zustand store per app (use slices for large apps)
2. **Use set/setState** for all updates (ensures correct merge + listener notification)
3. **Colocate store actions** — put update functions in the store

### Redux-like patterns
Can add a `dispatch` function with a reducer if desired. Also supports `zustand/middleware/redux`.

Source: docs/reference/zustand-repo/docs/learn/guides/flux-inspired-practice.md

---

## auto-generating-selectors.md

### Problem
Writing individual selectors is tedious: `const bears = useStore((s) => s.bears)`

### Solution: createSelectors utility
Wraps a store with auto-generated `.use.propertyName()` hooks for every property.

```ts
const useBearStore = createSelectors(useBearStoreBase)

const bears = useBearStore.use.bears()       // state
const increment = useBearStore.use.increment() // action
```

Works for both React stores (`create`) and vanilla stores (`createStore`).

Source: docs/reference/zustand-repo/docs/learn/guides/auto-generating-selectors.md

---

## slices-pattern.md

### Splitting stores
Create individual "slice" functions that each return part of the state. Combine with spread operator:

```js
export const useBoundStore = create((...a) => ({
  ...createBearSlice(...a),
  ...createFishSlice(...a),
}))
```

Slices can access each other's state via `get()`. Middlewares should only be applied to the combined store, not individual slices.

Source: docs/reference/zustand-repo/docs/learn/guides/slices-pattern.md

---

## updating-state.md

### Flat updates
`set` merges state shallowly — no need to spread `...state`.

### Deeply nested objects
Must manually spread each level, or use Immer, optics-ts, or Ramda for convenience.

Source: docs/reference/zustand-repo/docs/learn/guides/updating-state.md

---

## immutable-state-and-merging.md

### Key rule
State must be updated immutably (like React useState).

### set() behavior
`set` merges at ONE level only. Nested objects need manual spread.

### Replace flag
`set(newState, true)` replaces entire state instead of merging.

Source: docs/reference/zustand-repo/docs/learn/guides/immutable-state-and-merging.md

---

## how-to-reset-state.md

### Reset pattern
Use `store.getInitialState()` inside a reset action:
```ts
reset: () => set(store.getInitialState())
```

### Reset multiple stores
Create a registry of reset functions, call them all at once.

Source: docs/reference/zustand-repo/docs/learn/guides/how-to-reset-state.md

---

## testing.md

### Setup
Mock zustand's `create` and `createStore` to auto-reset stores after each test. Separate mocks for Jest and Vitest (Jest uses `jest.requireActual`, Vitest uses `vi.importActual`).

### Testing components
Use React Testing Library. Access store state via `useStore.getState()` in assertions.

### Testing with context
Pass a custom store via Context provider wrapper in `render()`.

Source: docs/reference/zustand-repo/docs/learn/guides/testing.md

---

## beginner-typescript.md

### Covers
Creating typed stores, using generics with `create<State>()`, reset patterns, multiple stores, middlewares with TS, async actions, `createWithEqualityFn`.

Source: docs/reference/zustand-repo/docs/learn/guides/beginner-typescript.md

---

## connect-to-state-with-url-hash.md

Custom hash storage using persist middleware to sync state with URL hash.

Source: docs/reference/zustand-repo/docs/learn/guides/connect-to-state-with-url-hash.md

---

## initialize-state-with-props.md

Use `createStore` (vanilla) + React Context for dependency injection / prop-initialized stores.

Source: docs/reference/zustand-repo/docs/learn/guides/initialize-state-with-props.md

---

## maps-and-sets-usage.md

Map and Set are mutable — always create new instances when updating in Zustand.

Source: docs/reference/zustand-repo/docs/learn/guides/maps-and-sets-usage.md
