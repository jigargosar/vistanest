# Legend-State Performance Research

Research date: 2026-03-16

## 1. How Fine-Grained Reactivity Works at Property Level

Legend-State uses ES6 Proxies to wrap observables. The Proxy does not modify the
underlying data -- it intercepts property access to build a tracking graph.

**Core mechanism:**

- Accessing `obs.user.name` via Proxy creates lazy tracking nodes at each level
  (`user`, then `name`). Only accessed properties are tracked.
- `get()` returns raw data AND registers the caller as a listener on that path.
- `peek()` returns raw data WITHOUT tracking -- useful to read without subscribing.
- `set()` writes at any depth and notifies only listeners subscribed to that path
  or any ancestor.
- Listeners at any level in the hierarchy are notified by changes in children.
  Example: listening to `obs.user` fires when `obs.user.name` changes.

**Re-render isolation components:**

| Component    | Parent changes re-render children? | Child changes re-render parent? |
| ------------ | ---------------------------------- | ------------------------------- |
| `Computed`   | Yes                                | No                              |
| `Memo`       | No                                 | No                              |

- `Computed`: Extracts children into a separate tracking context. Parent re-renders
  still propagate down, but child observable changes do NOT bubble up to parent.
- `Memo`: Fully isolated. Re-renders only when its own observables change, never
  from parent re-renders.
- `reactive()`: Wraps external components via Proxy, extracting reactive props into
  a tiny wrapper component that re-renders independently of the outer component.

**Observable primitives rendered directly** become self-updating text nodes -- the
parent component never re-renders for their changes.

## 2. Benchmark Numbers

Legend-State participates in the **krausest/js-framework-benchmark**, the de-facto
standard for measuring DOM operation performance.

**Headline claims (from Legend-State docs and independent reviews):**

- Beats every other React state library on "just about every metric."
- On "swap rows" (swap 2 rows in a 1,000-row table): **beats vanilla JS**.
- On "replace all rows" (replace entire 1,000-row dataset): **beats vanilla JS**.
- Fastest TTI (time to interactive) among React state libraries because it does
  minimal processing up front.
- Bundle size: ~4 KB.

**vs specific libraries (qualitative, from multiple sources):**

| Library  | Comparison                                                                       |
| -------- | -------------------------------------------------------------------------------- |
| Zustand  | Legend-State is faster on array ops; Zustand re-renders at selector granularity   |
| Jotai    | Both support fine-grained updates; Legend-State avoids per-atom boilerplate       |
| Valtio   | Both use Proxy; Legend-State is more optimized for arrays and has smaller bundle  |
| MobX     | Similar reactivity model; Legend-State has less boilerplate and smaller footprint |

No published side-by-side microsecond-level benchmarks comparing Legend-State
directly to Zustand/Jotai/Valtio were found. The benchmark claims come from the
krausest framework benchmark where Legend-State runs as a standalone React
implementation, not head-to-head with other state libraries in the same app.

**Source:** [Hype Buster: Legend State](https://www.fullctx.dev/p/legend-state-library-fastest-react-review)
-- independent review confirming the benchmark claims but noting they come from the
framework-level benchmark, not a state-library-specific micro-benchmark.

## 3. How It Handles Large Lists (100+ Items)

**The `For` component:**

```tsx
<For each={state$.items} item={ItemRow} optimized />
```

- Renders each array element in its own tracking context.
- Does NOT re-render the parent when individual items change.
- In `optimized` mode: if array length stays the same, updates elements in-place
  instead of re-rendering the whole list. This covers swap, sort, and partial
  replace scenarios.

**How array tracking works internally:**

- Each Proxy node references an index in the array.
- When elements rearrange (sort, splice), existing Proxy nodes update to point to
  new indices.
- Only changed/moved elements re-render; unchanged elements are skipped entirely.
- Requires a unique `id` or `key` field on each object in the array.

**Legend List (companion library for React Native):**

- `@legendapp/list` -- drop-in replacement for FlatList/FlashList.
- Supports dynamically sized items without performance penalty.
- `recycleItems` prop reuses item components for optimal memory usage.
- Designed for media-heavy content, real-time updates, social feeds.

## 4. Re-render Behavior

**What triggers re-renders:**

- Calling `.get()` on an observable inside a component subscribes that component.
  When the value changes, the component re-renders.
- Parent component re-renders propagate to children as normal in React, unless
  children are wrapped in `Memo`.
- Array length changes re-render the `For` component (new items need mounting).

**What does NOT trigger re-renders:**

- Changing a property that no component has called `.get()` on.
- Using `.peek()` to read a value (no subscription created).
- Changing a sibling property when a component only subscribes to a specific leaf.
  Example: changing `obs.user.age` does NOT re-render a component that only called
  `obs.user.name.get()`.
- In `For` optimized mode: swapping, sorting, or replacing elements in an array of
  the same length does NOT re-render the parent -- elements update in place.
- Observable primitives rendered directly in JSX update their own text node without
  re-rendering the host component.

## 5. Performance Caveats

1. **Proxy creation on iteration:** Using `forEach` on an observable array creates
   Proxy wrappers for every element. Use `.get()` first to get the raw array, then
   iterate on plain data when you don't need tracking.

2. **Batching is manual for bulk updates:** Multiple rapid `.set()` calls can cause
   multiple re-renders. Wrap bulk operations in `batch()` to coalesce into a single
   render and a single persistence write. Example: pushing to an array 1,000 times
   without batching could trigger 1,000 storage writes.

3. **Optimized `For` upfront cost:** Setting up per-row listeners in optimized mode
   has a small upfront cost. Even so, Legend-State remains among the fastest on the
   "create many rows" benchmark. The trade-off is worthwhile for lists that update
   frequently.

4. **Unique ID requirement for arrays:** The `For` component requires each object in
   the array to have a unique `id` or `key`. Without it, optimized array diffing
   cannot function correctly.

5. **Animation/DOM conflicts:** The `For` component's optimized mode may behave
   unexpectedly with certain animation libraries or external DOM modifications, since
   it reuses and repositions elements in place.

6. **Accidental tracking:** Accessing observable properties in callbacks or effects
   without `peek()` can create unintended subscriptions, causing extra re-renders.
   Use `peek()` deliberately when reading without intent to subscribe.

7. **No independent micro-benchmarks:** The benchmark claims are based on the
   krausest/js-framework-benchmark, which tests full framework rendering, not
   state-library-level operations in isolation. There are no published benchmarks
   comparing Legend-State's `useObservable` vs Zustand's `useStore` vs Jotai's
   `useAtom` in the same application.

## Sources

- [Legend-State official docs -- Performance guide](https://legendapp.com/open-source/state/v3/guides/performance/)
- [Legend-State official docs -- Fine-Grained Reactivity](https://legendapp.com/open-source/state/v3/react/fine-grained-reactivity/)
- [Legend-State official docs -- Fast](https://legendapp.com/open-source/state/v2/intro/fast/)
- [Legend-State official docs -- Observable](https://legendapp.com/open-source/state/v3/usage/observable/)
- [Legend-State GitHub](https://github.com/LegendApp/legend-state)
- [Hype Buster: Legend State (fullctx.dev)](https://www.fullctx.dev/p/legend-state-library-fastest-react-review)
- [Fine-grained reactivity with Legend-State (dev.to)](https://dev.to/harshmangalam/achieve-fine-grained-reactivity-and-super-fast-ui-updates-in-react-with-legend-state-37ja)
- [Dynamically managing state with Legend-State (LogRocket)](https://blog.logrocket.com/react-state-management-legend-state/)
- [krausest/js-framework-benchmark](https://github.com/krausest/js-framework-benchmark)
- [Legend List GitHub](https://github.com/LegendApp/legend-list)
- [Large list comparison: FlatList vs FlashList vs Legend List (Medium)](https://medium.com/@rosingh3342/rendering-large-lists-in-react-native-flatlist-vs-flashlist-vs-legendapp-list-14e752159c8a)
