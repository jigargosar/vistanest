# Zustand Docs Summary Index

Quick reference for all zustand documentation summaries.
Source repo: docs/reference/zustand-repo/docs/

## Learn

### Getting Started
[learn-getting-started.md](learn-getting-started.md)
1. Introduction — create store, bind components, selectors for re-render control
2. Comparison — vs Redux, Valtio, Jotai, Recoil (all recommend selectors)

### Guides
[learn-guides.md](learn-guides.md)
1. **prevent-rerenders-with-use-shallow** — useShallow for computed/derived selectors
2. **practice-with-no-store-actions** — module-level actions vs colocated
3. **flux-inspired-practice** — single store, use set/setState, colocate actions
4. **auto-generating-selectors** — createSelectors utility for `.use.property()` pattern
5. **slices-pattern** — split large stores into composable slices
6. **updating-state** — flat updates, deeply nested (Immer, optics-ts, Ramda)
7. **immutable-state-and-merging** — set() merges one level, replace flag
8. **how-to-reset-state** — getInitialState() pattern
9. **testing** — Jest/Vitest mocks, reset stores per test
10. **beginner-typescript** — typed stores, generics, middlewares with TS
11. **connect-to-state-with-url-hash** — custom storage for URL sync
12. **initialize-state-with-props** — createStore + Context for DI
13. **maps-and-sets-usage** — always create new instances

## Reference

### Hooks
[reference-hooks.md](reference-hooks.md)
1. **useStore** — use vanilla stores in React, selector for re-render control
2. **useShallow** — memoized selector with shallow comparison
3. **useStoreWithEqualityFn** — custom equality function per selector

### Integrations
[reference-integrations.md](reference-integrations.md)
1. **persist middleware** — localStorage/AsyncStorage/IndexedDB persistence
2. **immer middleware** — mutable syntax for immutable updates
3. **third-party-libraries** — community extensions

### Middlewares
[reference-middlewares.md](reference-middlewares.md)
1. **persist** — state persistence across reloads
2. **devtools** — Redux DevTools time-travel debugging
3. **immer** — mutable update syntax
4. **combine** — auto-infer types from initial state
5. **redux** — actions + reducers pattern
6. **subscribeWithSelector** — granular vanilla subscriptions

## Key Patterns for VistaNest

### Re-render optimization
1. Use selectors — `useStore((s) => s.count)` only re-renders when count changes
2. `useShallow` — when selector returns new object/array each time
3. Actions are stable refs — selecting them won't cause re-renders
4. Actions namespace pattern — `{ actions: { ... } }` + single selector

### Store structure
1. Colocate actions with state (recommended default)
2. Or: module-level actions for code splitting
3. Or: actions namespace for grouping (`state.actions`)
4. Slices pattern for large stores
5. persist middleware instead of manual localStorage
