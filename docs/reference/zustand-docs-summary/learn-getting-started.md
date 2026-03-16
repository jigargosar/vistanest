# Learn / Getting Started

## introduction.md

### Installation
Standard npm install: `npm install zustand`

### First create a store
Your store is a hook. Put anything in it: primitives, objects, functions. The `set` function merges state (shallow merge at one level). Uses `create` from zustand.

### Then bind your components
Use the hook anywhere without providers. Select state with a selector function — component re-renders only when that selected state changes. Default comparison is `Object.is` (strict equality).

Key pattern: `const bears = useBear((state) => state.bears)` — this is how you subscribe to specific state slices.

Source: docs/reference/zustand-repo/docs/learn/getting-started/introduction.md

---

## comparison.md

### Redux comparison
Both Zustand and Redux are immutable state model. Key difference: Redux requires context providers, Zustand doesn't. Render optimization is similar — both recommend selectors. Zustand is less boilerplate.

### Valtio comparison
Fundamentally different: Zustand = immutable, Valtio = mutable (proxy-based). Valtio auto-optimizes renders via property access. Zustand requires manual selector optimization.

### Jotai comparison
Zustand = single store. Jotai = primitive atoms that compose. Jotai achieves render optimization through atom dependency. Zustand uses selectors.

### Recoil comparison
Similar to Jotai difference. Recoil uses string keys for atoms, requires context provider.

**Key takeaway across all comparisons**: Zustand always recommends selectors for render optimization. Other libraries (Valtio, Jotai, Recoil) have automatic optimization mechanisms.

Source: docs/reference/zustand-repo/docs/learn/getting-started/comparison.md
