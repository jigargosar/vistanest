# Reference / Middlewares

## persist.md

### Purpose
Persists store state across page reloads using any storage backend.

### Signature
```js
const nextStateCreatorFn = persist(stateCreatorFn, persistOptions)
```

### Key options
1. `name` — storage key (required, must be unique)
2. `storage` — defaults to localStorage, configurable
3. `partialize` — select which state to persist
4. `version` + `migrate` — schema versioning and migration
5. `onRehydrateStorage` — callback for hydration lifecycle

### Relevance to VistaNest
We currently use manual localStorage persistence. The persist middleware would replace our custom `loadItems`/`saveItems` with a standard pattern.

Source: docs/reference/zustand-repo/docs/reference/middlewares/persist.md

---

## devtools.md

### Purpose
Connects store to Redux DevTools Extension for time-travel debugging. Requires `@redux-devtools/extension`.

### Signature
```js
const nextStateCreatorFn = devtools(stateCreatorFn, devtoolsOptions)
```

### Relevance to VistaNest
Would give us free undo/redo visualization and state inspection during development.

Source: docs/reference/zustand-repo/docs/reference/middlewares/devtools.md

---

## immer.md

### Purpose
Enables mutable syntax for immutable updates. Requires `immer` library.

### Signature
```js
const nextStateCreatorFn = immer(stateCreatorFn)
```

### Relevance to VistaNest
Our store does a lot of `.map()` + spread for updates. Immer would simplify indent/outdent/move operations.

Source: docs/reference/zustand-repo/docs/reference/middlewares/immer.md

---

## combine.md

### Purpose
Auto-infers types by merging initial state with a state creator function. Eliminates need for explicit type definitions.

### Signature
```js
const nextStateCreatorFn = combine(initialState, additionalStateCreatorFn)
```

### Relevance to VistaNest
Could simplify our OutlineState type definition — let TypeScript infer it from the store creator.

Source: docs/reference/zustand-repo/docs/reference/middlewares/combine.md

---

## redux.md

### Purpose
Enables Redux-style actions + reducers pattern in Zustand.

### Signature
```js
const nextStateCreatorFn = redux(reducerFn, initialState)
```

### Relevance to VistaNest
Not needed — we use direct `set()` calls, not dispatched actions.

Source: docs/reference/zustand-repo/docs/reference/middlewares/redux.md

---

## subscribe-with-selector.md

### Purpose
Subscribe to specific state slices outside React (in vanilla JS). Enables granular subscriptions with selectors on the `subscribe` method.

### Signature
```js
const nextStateCreatorFn = subscribeWithSelector(stateCreatorFn)
```

### Relevance to VistaNest
Could be useful for non-React side effects (e.g., syncing to localStorage on specific state changes instead of every mutation).

Source: docs/reference/zustand-repo/docs/reference/middlewares/subscribe-with-selector.md
