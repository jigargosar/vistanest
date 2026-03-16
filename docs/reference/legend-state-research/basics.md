Legend State Basics Research

Researched: 2026-03-16
Version: v3 (latest)
Package: @legendapp/state
Size: ~3KB core
Repo: https://github.com/LegendApp/legend-state
Docs: https://legendapp.com/open-source/state/v3/


# Core Philosophy

Legend State is a signal-based state library for React. The core idea is
"render less, less often." Components render once, and state changes trigger
only the tiniest possible re-renders via fine-grained reactivity.

No boilerplate. No contexts, actions, reducers, dispatchers, sagas, thunks, or
epics. You call get() to read and set() to write. The observable is a proxy
that tracks access automatically.


# Core API Patterns

## Creating Observables

```typescript
import { observable } from "@legendapp/state";

// Primitive
const count$ = observable(0);

// Object (can be a massive tree of all app state)
const state$ = observable({ name: "Test", count: 0 });

// Typed with interface
interface Store {
  todos: Todo[];
  total: number;
}
const store$ = observable<Store>({ todos: [], total: 0 });
```

Convention: suffix observable variables with $ to distinguish them from
raw values.

## get() - Read with tracking

Retrieves the raw value. Inside an observing context (observer component,
observe, computed), it automatically tracks and re-runs when the value changes.

```typescript
const settings$ = observable({ theme: "dark" });
settings$.theme.get(); // "dark"
```

## set() - Write values

Can set directly or with a function relative to previous value. Can set() on
a node that is currently undefined -- it fills in the object tree.

```typescript
state$.text.set("hello there");
state$.text.set((prev) => prev + " there");
state$.otherKey.otherProp.set("hi"); // creates intermediate objects
```

## peek() - Read without tracking

Like get() but does not subscribe. Useful when you need the current value
without causing re-renders.

```typescript
const state$ = observable({ name: "Test user" });
const name = state$.name.peek(); // reads without tracking
```

## assign() - Shallow merge

Shallow operation matching Object.assign. Cannot call on a primitive.

```typescript
state$.assign({ name: "New", count: 5 });
```

## Underscore shorthand (_)

Opt-in shorthand for peek/assign without notifying listeners:

```typescript
import { enable_PeekAssign } from "@legendapp/state/config/enable_PeekAssign";
enable_PeekAssign();

const state$ = observable({ test: "hi", num: 0 });
const val = state$.test._;        // shorthand for peek()
state$.test._ = "hello";          // assign without notifying
state$._ = { test: "hello" };     // assign object without notifying
```


# Computed Observables and Linked State

## Computed (via functions in the observable tree)

Functions placed inside an observable become computed values. They automatically
track any observables accessed during computation and re-run when those change.

```typescript
interface Todo {
  id: number;
  text: string;
  completed?: boolean;
}

interface Store {
  todos: Todo[];
  total: number;
  numCompleted: number;
  addTodo: () => void;
}

let nextId = 0;
const store$ = observable<Store>({
  todos: [],
  // Computed values -- just functions that call .get()
  total: (): number => {
    return store$.todos.length;
  },
  numCompleted: (): number => {
    return store$.todos.get().filter((todo) => todo.completed).length;
  },
  // Actions -- also just functions
  addTodo: () => {
    const todo: Todo = { id: nextId++, text: "" };
    store$.todos.push(todo);
  },
});
```

## linked - Two-way binding

Creates an observable bound to both get and set functions. Returning an
observable from a computed creates a two-way link to the target.

## synced - Lazy remote + persist binding

Creates a lazy computed that activates when you first get() it. Used for
remote data fetching and local persistence.


# Actions and Mutations

There is no formal "action" concept. Functions live alongside state in the
observable tree, or outside it -- Legend State does not care. Mutations are
just calls to set(), push(), assign(), delete(), etc.

```typescript
// Actions as functions in the observable
const store$ = observable({
  todos: [],
  addTodo: () => {
    store$.todos.push({ id: nextId++, text: "" });
  },
});

// Or just standalone functions
function addTodo() {
  store$.todos.push({ id: nextId++, text: "" });
}
```

## Batching

Batch groups multiple set() calls so observers fire only once:

```typescript
import { batch } from "@legendapp/state";

batch(() => {
  state$.name.set("new");
  state$.count.set(5);
  // observers fire once after batch completes
});
```


# React Integration

## observer HOC

Wraps a component so that get() calls inside it automatically track and
trigger re-renders.

```tsx
import { observable } from "@legendapp/state";
import { observer } from "@legendapp/state/react";

const state$ = observable({ value: 0 });

const Component = observer(function Component() {
  const value = state$.value.get();
  // Re-renders when state$.value changes
  return <div>{value}</div>;
});
```

## useObservable - Component-scoped state

Creates an observable tied to component lifetime. Replaces useState for
local state.

```tsx
import { useObservable } from "@legendapp/state/react";

function Counter() {
  const count$ = useObservable(0);
  return <button onClick={() => count$.set((v) => v + 1)}>
    Count: {count$.get()}
  </button>;
}
```

## useObserve - Side effects on observable changes

Replaces useEffect for observable-driven side effects. No dependency array
needed.

```tsx
import { useObserve } from "@legendapp/state/react";

useObserve(() => {
  console.log("Observable changed:", state$.value.get());
});

// With selector + effect split:
useObserve(
  () => state$.value.get(),    // selector (tracked)
  () => { /* side effect */ }  // effect (not tracked)
);
```


# Fine-Grained Reactivity (Render-Once Pattern)

The key differentiator. Components render once; only the specific text/element
that depends on state re-renders.

## Memo - Self-updating text

```tsx
import { observable } from "@legendapp/state";
import { Memo, useObservable } from "@legendapp/state/react";

const count$ = observable(0);

function App() {
  // This component never re-renders after mount
  return (
    <div>
      Count: <Memo>{count$}</Memo>
    </div>
  );
}

// With a selector function:
function App2() {
  return (
    <div>
      <Memo>{() => <div>Count: {count$.get()}</div>}</Memo>
    </div>
  );
}
```

## reactive - Wrap any component for reactive props

Creates a Proxy (not an HOC) that extracts $-prefixed reactive props and
observes them, passing regular props to the wrapped component.

```tsx
import { observable } from "@legendapp/state";
import { reactive } from "@legendapp/state/react";

const isSignedIn$ = observable(false);

const Component = reactive(function Component({ message }) {
  return <div>{message}</div>;
});

function App() {
  return (
    <Component $message={() => isSignedIn$.get() ? "Hello" : "Goodbye"} />
  );
}
```

Works with third-party components too:

```tsx
import { reactive, useObservable } from "@legendapp/state/react";
import { motion } from "framer-motion";

const $MotionDiv = reactive(motion.div);

function Component() {
  const width$ = useObservable(100);
  // Renders only once
  return (
    <$MotionDiv $animate={() => ({ x: width$.get() })}>
      ...
    </$MotionDiv>
  );
}
```

## Control-flow components: Show, For, Switch

Used with the render-once pattern to conditionally render or iterate without
parent re-renders. These are imported from @legendapp/state/react.


# Persistence and Sync

## synced (lazy, inline)

The recommended approach. Creates a lazy binding that activates on first get().

```typescript
import { observable } from "@legendapp/state";
import { synced } from "@legendapp/state/sync";

const state$ = observable(
  synced({
    initial: [],
    persist: { name: "persistKey" },
  })
);
// Changes auto-persist
state$.push({ id: 0 });
```

## synced with remote get/set

```typescript
const state$ = observable(
  synced({
    get: () => fetch("https://url.to.get").then((res) => res.json()),
    set: ({ value }) =>
      fetch("https://url.to.set", {
        method: "POST",
        body: JSON.stringify(value),
      }),
    persist: { name: "test" },
  })
);
```

## syncObservable (imperative, eager)

Starts syncing immediately when called (not lazy).

```typescript
import { observable } from "@legendapp/state";
import { syncObservable } from "@legendapp/state/sync";
import { ObservablePersistMMKV } from "@legendapp/state/persist-plugins/mmkv";

const store$ = observable({ todos: [] });

syncObservable(store$, {
  persist: {
    name: "persistKey",
    plugin: ObservablePersistMMKV,
  },
});
```

## configureSynced - Set defaults

Reduces duplication by setting default persistence plugin, etc.

```typescript
import { configureSynced, syncedCrud } from "@legendapp/state/sync";
import { ObservablePersistLocalStorage } from
  "@legendapp/state/persist-plugins/local-storage";

const syncPlugin = configureSynced(syncedCrud, {
  persist: { plugin: ObservablePersistLocalStorage },
});

const state$ = observable(
  syncPlugin({ persist: { name: "test" } })
);
```

## Built-in persist plugins

+-----+====================================+================================+
| #   | Plugin                             | Platform                       |
+-----+====================================+================================+
| 1   | ObservablePersistLocalStorage      | Browser (localStorage)         |
+-----+------------------------------------+--------------------------------+
| 2   | ObservablePersistMMKV              | React Native (MMKV)            |
+-----+------------------------------------+--------------------------------+

## Built-in sync plugins

syncedFetch, syncedCrud, plus plugins for Keel, Supabase, and TanStack Query.

## syncedFetch example

```typescript
import { observable, observe } from "@legendapp/state";
import { syncedFetch } from "@legendapp/state/sync-plugins/fetch";

const store$ = observable({
  users: syncedFetch({
    initial: [],
    get: "https://reqres.in/api/users",
    set: "https://reqres.in/api/users",
  }),
});

observe(() => {
  const users = store$.users.get(); // activates the fetch
  if (users) processUsers(users);
});

store$.users.push({ id: 0, name: "name" }); // auto-syncs
```


# TypeScript Support

+-----+============================+===========================================+
| #   | Aspect                     | Quality                                   |
+-----+============================+===========================================+
| 1   | Type inference             | Infers from initial value automatically.  |
|     |                            | Can also type with an interface via        |
|     |                            | observable<T>().                           |
+-----+----------------------------+-------------------------------------------+
| 2   | Observable type            | Observable<T> wraps T, making each        |
|     |                            | nested property an observable node.        |
|     |                            | Autocomplete works on nested paths.        |
+-----+----------------------------+-------------------------------------------+
| 3   | Computed typing            | Functions in the observable tree are       |
|     |                            | typed via the Store interface. Return      |
|     |                            | type annotation works.                     |
+-----+----------------------------+-------------------------------------------+
| 4   | get() return type          | Returns the raw T, not Observable<T>.     |
+-----+----------------------------+-------------------------------------------+
| 5   | Overall                    | First-class. Written in TypeScript. Types  |
|     |                            | are accurate and well-maintained.          |
+-----+----------------------------+-------------------------------------------+


# Gotchas and Footguns

+-----+============================+===========================================+
| #   | Gotcha                     | Details                                   |
+-----+============================+===========================================+
| 1   | Do not destructure         | Destructuring breaks the proxy chain.     |
|     | observables                | Always access via dot notation:            |
|     |                            | state$.name.get(), not                     |
|     |                            | const { name } = state$.                  |
+-----+----------------------------+-------------------------------------------+
| 2   | get() vs peek()            | get() tracks, peek() does not. Using      |
|     |                            | get() outside an observing context is      |
|     |                            | harmless but wasteful. Using peek()        |
|     |                            | inside one means you will miss updates.    |
+-----+----------------------------+-------------------------------------------+
| 3   | State not updating         | set() is synchronous on the observable     |
|     | immediately                | but observers/React re-renders are         |
|     |                            | batched. If you set() then immediately     |
|     |                            | read via React state, it may appear        |
|     |                            | stale. Read from the observable instead.   |
+-----+----------------------------+-------------------------------------------+
| 4   | synced is lazy             | synced does not fetch/load until the       |
|     |                            | first get(). If you need eager loading,    |
|     |                            | use syncObservable instead.                |
+-----+----------------------------+-------------------------------------------+
| 5   | Functions in               | Functions placed inside observable() are   |
|     | observables                | treated as computed/actions, not stored    |
|     |                            | as values. Do not store callback           |
|     |                            | functions as observable data.              |
+-----+----------------------------+-------------------------------------------+
| 6   | assign() is shallow        | assign() does not deep merge. For nested   |
|     |                            | updates, set on the specific nested path.  |
+-----+----------------------------+-------------------------------------------+
| 7   | Batch removed              | The "after batch" concept was removed in   |
|     | "after batch"              | v3 because it was unreliable with          |
|     |                            | recursive batches.                         |
+-----+----------------------------+-------------------------------------------+


# Legend State vs Zustand Comparison

+-----+========================+===========================+=================+
| #   | Aspect                 | Legend State              | Zustand         |
+-----+========================+===========================+=================+
| 1   | Reactivity model       | Signal/proxy-based,       | Selector-based, |
|     |                        | fine-grained. Components  | re-renders      |
|     |                        | render once.              | on slice change |
+-----+------------------------+---------------------------+-----------------+
| 2   | Re-render              | Only the specific Memo    | Whole component |
|     | granularity            | or reactive element       | re-renders when |
|     |                        | updates.                  | selected state  |
|     |                        |                           | changes.        |
+-----+------------------------+---------------------------+-----------------+
| 3   | Boilerplate            | Near zero. No providers,  | Low. create()   |
|     |                        | no selectors, no context. | store, hook     |
|     |                        |                           | selectors.      |
+-----+------------------------+---------------------------+-----------------+
| 4   | Persistence            | Built-in (synced,         | Via middleware   |
|     |                        | syncObservable, plugins   | (persist).      |
|     |                        | for localStorage, MMKV,   |                 |
|     |                        | Supabase, etc).           |                 |
+-----+------------------------+---------------------------+-----------------+
| 5   | Remote sync            | Built-in (syncedFetch,    | Not built-in.   |
|     |                        | syncedCrud, Supabase,     | Use TanStack    |
|     |                        | Keel plugins).            | Query, etc.     |
+-----+------------------------+---------------------------+-----------------+
| 6   | Bundle size            | ~3KB core                 | ~1KB core       |
+-----+------------------------+---------------------------+-----------------+
| 7   | Mental model           | Proxy/signal. Must learn  | Flux-like.      |
|     |                        | get/set/peek/observer.    | Familiar to     |
|     |                        | Closer to MobX/Solid.     | Redux users.    |
+-----+------------------------+---------------------------+-----------------+
| 8   | Community /            | Smaller, growing.         | Large, mature   |
|     | ecosystem              | Created by Legend app.     | ecosystem.      |
+-----+------------------------+---------------------------+-----------------+
| 9   | TypeScript             | First-class, written      | First-class,    |
|     |                        | in TypeScript.            | written in      |
|     |                        |                           | TypeScript.     |
+-----+------------------------+---------------------------+-----------------+


# Import Map

```
@legendapp/state              - observable, batch, computed, linked, observe, when
@legendapp/state/react        - observer, Memo, Show, For, Switch, reactive,
                                useObservable, useObserve, useComputed
@legendapp/state/sync         - synced, syncObservable, configureSynced, syncedCrud
@legendapp/state/sync-plugins/fetch - syncedFetch
@legendapp/state/persist-plugins/local-storage - ObservablePersistLocalStorage
@legendapp/state/persist-plugins/mmkv - ObservablePersistMMKV
```


# Sources

- https://github.com/LegendApp/legend-state
- https://legendapp.com/open-source/state/v3/intro/introduction/
- https://legendapp.com/open-source/state/v3/intro/getting-started/
- https://legendapp.com/open-source/state/v3/usage/observable/
- https://legendapp.com/open-source/state/v3/react/fine-grained-reactivity/
- https://legendapp.com/open-source/state/v3/sync/persist-sync/
- https://legendapp.com/open-source/state/v3/react/react-api/
- https://legendapp.com/open-source/state/v3/usage/reactivity/
- https://dev.to/harshmangalam/achieve-fine-grained-reactivity-and-super-fast-ui-updates-in-react-with-legend-state-37ja
- https://blog.logrocket.com/react-state-management-legend-state/
- https://medium.com/@chetanbawankule2000/legend-state-management-42e01a8d21c5
