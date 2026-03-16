# Legend-State: Persistence, Undo/History, and Sync Research

Research date: 2026-03-16

## 1. Persistence

### API Overview (v3)

Legend-State v3 uses `syncObservable` (renamed from v2's `persistObservable`) to attach
persistence to any observable. The `persist` option configures local storage.

```ts
import { observable } from "@legendapp/state";
import { syncObservable } from "@legendapp/state/sync";
import { ObservablePersistLocalStorage } from "@legendapp/state/persist-plugins/local-storage";

const store$ = observable({ todos: [] });

syncObservable(store$, {
  persist: {
    name: "persistKey", // storage key
    plugin: ObservablePersistLocalStorage,
  },
});
```

### Built-in Persistence Plugins

| Plugin | Import | Platform | Async |
| --- | --- | --- | --- |
| `ObservablePersistLocalStorage` | `@legendapp/state/persist-plugins/local-storage` | Web | No |
| `ObservablePersistIndexedDB` | `@legendapp/state/persist-plugins/indexeddb` | Web | Yes |
| `ObservablePersistMMKV` | `@legendapp/state/persist-plugins/mmkv` | React Native | No |
| `ObservablePersistAsyncStorage` | `@legendapp/state/persist-plugins/async-storage` | React Native | Yes |

### Persist Options

- **`name`** -- Storage key string.
- **`plugin`** -- The persistence plugin class.
- **`retrySync`** -- Retry pending sync operations after reload (offline-first).

### IndexedDB Configuration

IndexedDB requires extra setup: database name, version (increment when tables change),
and table names.

```ts
import { configureObservableSync } from "@legendapp/state/sync";
import { ObservablePersistIndexedDB } from "@legendapp/state/persist-plugins/indexeddb";

configureObservableSync({
  persist: {
    plugin: ObservablePersistIndexedDB,
    indexedDB: {
      databaseName: "MyApp",
      version: 1,
      tableNames: ["todos", "settings"],
    },
  },
});
```

Two storage modes:
1. **Dictionary mode** -- Each value in a dict gets its own row (keyed by `id` field).
2. **itemID mode** -- Multiple observables each get their own row via an `itemID` option.

### Async Loading (IndexedDB, AsyncStorage)

Async plugins don't load instantly. Use `syncState` to track loading:

```ts
import { syncState } from "@legendapp/state/sync";

const syncState$ = syncState(store$);
await when(syncState$.isPersistLoaded);
// store$ is now hydrated from IndexedDB
```

### Global Configuration

Use `configureObservableSync` to set defaults for all observables, or `configureSynced`
to create reusable synced presets:

```ts
import { configureObservableSync } from "@legendapp/state/sync";

configureObservableSync({
  persist: {
    plugin: ObservablePersistLocalStorage,
  },
});

// Now all syncObservable calls default to localStorage
syncObservable(store$, { persist: { name: "store" } });
```

### Data Migration / Versioning

Legend-State supports migrating persisted data by checking version and renaming fields
in the persisted object. This is handled at the application level by inspecting the
loaded data shape after persistence loads.

---

## 2. Undo / History

Legend-State has **built-in** undo/history support via two helper functions.

### trackHistory

Tracks all changes to an observable, recording previous values with timestamps.

```ts
import { observable } from "@legendapp/state";
import { trackHistory } from "@legendapp/state/helpers/trackHistory";

const state$ = observable({ profile: { name: "Hello" } });
const history = trackHistory(state$);

state$.profile.name.set("Annyong");
// history: { 1666593133018: { profile: { name: "Hello" } } }
```

Returns an observable whose keys are timestamps and values are the previous state
snapshots at each change.

### undoRedo

A higher-level helper built on top of `trackHistory`. Provides `undo()`, `redo()`,
and reactive observables for UI binding.

```ts
import { observable } from "@legendapp/state";
import { undoRedo } from "@legendapp/state/helpers/undoRedo";

const state$ = observable({ todos: ["Get milk"] });
const { undo, redo, undoable$, redoable$, getHistory } = undoRedo(state$.todos, {
  limit: 100,
});

state$.todos.push("Pick up bread");
// todos: ["Get milk", "Pick up bread"]

undo();
// todos: ["Get milk"]

redo();
// todos: ["Get milk", "Pick up bread"]
```

### Returned Properties

| Property | Type | Description |
| --- | --- | --- |
| `undo` | `() => void` | Reverts to previous state |
| `redo` | `() => void` | Re-applies undone change |
| `undoable$` | `Observable<boolean>` | Reactive flag -- true when undo is available |
| `redoable$` | `Observable<boolean>` | Reactive flag -- true when redo is available |
| `getHistory` | `() => HistoryEntry[]` | Returns the full history stack |

### Options

- **`limit`** -- Max number of history entries to keep (e.g., `{ limit: 100 }`).

### Behavior Notes

- Undo n times, then redo n times is supported.
- If state changes after undo (without redo), the redo stack is discarded.
- Without a `limit`, the implementation is unbounded and saves deep copies of every
  state change -- set a limit for production use.
- Can be attached to any observable or sub-observable (e.g., `state$.todos` only).

---

## 3. Sync (Cloud Backends)

### Architecture

Legend-State's sync system is layered:

1. **`synced`** -- Low-level primitive for custom get/set sync logic.
2. **`syncedCrud`** -- Mid-level plugin with CRUD semantics (list, get, create, update, delete).
3. **Backend plugins** -- High-level plugins built on `syncedCrud` (Supabase, Keel, Firebase planned).

### syncedCrud

For any CRUD-based backend. Supports two patterns:

**List pattern** (collections):

```ts
import { syncedCrud } from "@legendapp/state/sync-plugins/crud";

const todos$ = observable(
  syncedCrud({
    list: () => fetch("/api/todos").then((r) => r.json()),
    create: (todo) => fetch("/api/todos", { method: "POST", body: JSON.stringify(todo) }),
    update: (todo) => fetch("/api/todos/" + todo.id, { method: "PUT", body: JSON.stringify(todo) }),
    delete: (id) => fetch("/api/todos/" + id, { method: "DELETE" }),
  })
);
```

**Get pattern** (single object):

```ts
const settings$ = observable(
  syncedCrud({
    get: () => fetch("/api/settings").then((r) => r.json()),
    update: (data) => fetch("/api/settings", { method: "PUT", body: JSON.stringify(data) }),
  })
);
```

### Supabase Plugin

Built on top of `syncedCrud`. Provides:

```ts
import { syncedSupabase } from "@legendapp/state/sync-plugins/supabase";

const todos$ = observable(
  syncedSupabase({
    supabase: supabaseClient,
    collection: "todos",
    select: (from) => from.select("id, text, completed"),
    filter: (query) => query.eq("user_id", userId),
    realtime: true, // or { schema: "public", filter: "..." }
    actions: ["read", "create", "update", "delete"],
    changesSince: "last-sync",
    fieldCreatedAt: "created_at",
    fieldUpdatedAt: "updated_at",
    fieldDeleted: "deleted", // enables soft delete
    persist: {
      name: "todos",
      plugin: ObservablePersistIndexedDB,
    },
  })
);
```

Key Supabase features:
- **Realtime** -- Enable with `realtime: true` or configure with schema/filter.
- **Incremental sync** -- `changesSince: "last-sync"` with `fieldCreatedAt`/`fieldUpdatedAt`.
- **Soft delete** -- `fieldDeleted` column name for soft-delete support.
- **Local persistence** -- Combine with any persist plugin for offline-first.

### Firebase

Firebase RTDB plugin documentation is listed as "under construction" in v3 docs.
A plugin is planned but not yet released as a first-party integration. Custom Firebase
sync can be built using `syncedCrud` or the low-level `synced` primitive.

### Offline-First Design

- Changes made offline are persisted locally and retried when connectivity returns.
- `retrySync` option on persist ensures pending changes survive app restarts.
- `syncState` observable exposes `isPersistLoaded`, `isLoaded`, `error` for UI state.

---

## 4. Comparison with Zustand's Persist Middleware

| Feature | Legend-State | Zustand `persist` middleware |
| --- | --- | --- |
| **Local storage** | Plugin-based: localStorage, IndexedDB, MMKV, AsyncStorage | `createJSONStorage()` adapter: localStorage, sessionStorage, AsyncStorage |
| **Configuration** | `syncObservable(obs, { persist: { name, plugin } })` | `persist(fn, { name, storage })` in store creation |
| **Async storage** | Supported (IndexedDB, AsyncStorage) with `syncState` loading | Supported with `skipHydration` / `onRehydrateStorage` |
| **Data migration** | Application-level check after load | Built-in `version` + `migrate(state, version)` function |
| **Partial persist** | Persist any sub-observable independently | `partialize` option to select fields |
| **Cloud sync** | Built-in sync engine (syncedCrud, Supabase, Keel) | No built-in cloud sync -- requires external solution |
| **Offline-first** | First-class: retry queue, pending changes persist across restarts | Not built-in |
| **Undo/redo** | Built-in `undoRedo` / `trackHistory` helpers | Not built-in -- requires `zundo` middleware |
| **Realtime** | Supabase realtime built into plugin | Not built-in |
| **Global defaults** | `configureObservableSync` sets defaults for all observables | Must configure per-store |

### Key Advantages of Legend-State Persistence

1. Sync engine is integrated -- persistence and cloud sync share the same pipeline.
2. Offline-first retry with `retrySync` is built-in.
3. IndexedDB support out of the box (Zustand needs a custom storage adapter).
4. Undo/redo is a first-party helper, not a third-party middleware.

### Key Advantages of Zustand Persist

1. Simpler API for basic localStorage use cases.
2. Built-in `version` + `migrate()` for schema migrations.
3. `partialize` for selecting which fields to persist is more explicit.
4. Larger ecosystem of community middleware.

---

## 5. Migration Path from Zustand

There is no official Zustand-to-Legend-State migration guide. Key considerations:

### Store Structure

```ts
// Zustand
const useStore = create(
  persist(
    (set) => ({ count: 0, inc: () => set((s) => ({ count: s.count + 1 })) }),
    { name: "my-store" }
  )
);

// Legend-State equivalent
const store$ = observable({ count: 0 });
syncObservable(store$, {
  persist: { name: "my-store", plugin: ObservablePersistLocalStorage },
});
// Actions are just direct mutations: store$.count.set(store$.count.get() + 1)
```

### Migration Steps

1. **Replace store creation** -- `create(persist(...))` becomes `observable()` + `syncObservable()`.
2. **Replace selectors** -- `useStore(s => s.count)` becomes `use$(store$.count)` or `observer()` HOC.
3. **Replace actions** -- Zustand `set()` becomes direct `.set()` on observables.
4. **Replace `partialize`** -- Attach `syncObservable` to specific sub-observables instead.
5. **Replace `migrate`** -- Check data shape after `syncState$.isPersistLoaded` resolves.
6. **Replace `zundo`** -- Use built-in `undoRedo()` helper.
7. **Storage key compatibility** -- If reusing the same localStorage key, verify the serialization format matches. Legend-State and Zustand both use JSON, but the wrapper structure may differ.

### Gotchas

- Zustand persist wraps state in `{ state: {...}, version: N }`. Legend-State stores the
  raw observable value. Existing persisted data will need a one-time migration or key change.
- Legend-State observables are proxies -- direct property access returns an observable node,
  not the raw value. Use `.get()` to read values.
- Zustand's `subscribe` with selector has no direct equivalent; use Legend-State's
  `observe()` or `when()` instead.

---

## Sources

- [Legend-State v3: Persist and Sync](https://legendapp.com/open-source/state/v3/sync/persist-sync/)
- [Legend-State v3: Helper Functions (trackHistory, undoRedo)](https://legendapp.com/open-source/state/v3/usage/helper-functions/)
- [Legend-State v3: Supabase Plugin](https://legendapp.com/open-source/state/v3/sync/supabase/)
- [Legend-State v3: CRUD Plugin](https://legendapp.com/open-source/state/v3/sync/crud/)
- [Legend-State v3: Migration Guide](https://legendapp.com/open-source/state/v3/other/migrating/)
- [Legend-State GitHub Repository](https://github.com/LegendApp/legend-state)
- [Undo/Redo in Legend State (Gist)](https://gist.github.com/jamonholmgren/60e11208e44c38f39813048584208382)
- [Offline-First Apps with Expo & Legend State](https://expo.dev/blog/offline-first-apps-with-expo-and-legend-state)
- [Local-First Realtime Apps with Expo and Legend-State (Supabase Blog)](https://supabase.com/blog/local-first-expo-legend-state)
- [Legend-State history.ts source](https://github.com/LegendApp/legend-state/blob/main/history.ts)
