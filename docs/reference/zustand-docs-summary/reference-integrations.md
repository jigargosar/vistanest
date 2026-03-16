# Reference / Integrations

## persisting-store-data.md

### Purpose
The `persist` middleware stores Zustand state in any storage (localStorage, AsyncStorage, IndexedDB, etc.).

### Basic usage
```ts
import { persist, createJSONStorage } from 'zustand/middleware'

const useStore = create(
  persist(
    (set, get) => ({ bears: 0, addBear: () => set({ bears: get().bears + 1 }) }),
    { name: 'food-storage', storage: createJSONStorage(() => sessionStorage) }
  )
)
```

### Key options
1. `name` — unique key in storage (required)
2. `storage` — defaults to localStorage, can use sessionStorage, AsyncStorage, etc.
3. `partialize` — select which state to persist (exclude actions, temp state)
4. `version` — for migrations between schema versions
5. `migrate` — function to transform old state to new schema

### Hydration
Async storages have a hydration delay. Use `onRehydrateStorage` callback or `useHydration` pattern to handle loading states.

### Custom storage
Implement `getItem`, `setItem`, `removeItem` interface. Can sync with URL hash, IndexedDB, etc.

Source: docs/reference/zustand-repo/docs/reference/integrations/persisting-store-data.md

---

## immer-middleware.md

### Purpose
Enables mutable syntax for immutable state updates using Immer.

### Usage
```ts
import { immer } from 'zustand/middleware/immer'

const useStore = create(immer((set) => ({
  count: 0,
  inc: () => set((state) => { state.count++ }),
})))
```

### Benefits
Simplifies deeply nested state updates — mutate directly instead of spread operators.

Source: docs/reference/zustand-repo/docs/reference/integrations/immer-middleware.md

---

## third-party-libraries.md

Lists third-party integrations and utilities for Zustand (not read in detail — reference only).

Source: docs/reference/zustand-repo/docs/reference/integrations/third-party-libraries.md
