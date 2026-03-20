# Code Review 2 — Hook Usage Audit (2026-03-18)

Audit of standard React hook overuse and `@react-hooks-library/core` underuse across `src/`.

===

## useEventListener Stale Closure Bug (verified from source)

`useEventListener` stores the handler in a ref and updates it when handler changes, BUT registers `savedListener.current` (the value) with `addEventListener`, not a wrapper that reads from the ref. The second effect only re-runs when `[event, target, options]` change — `listener` is NOT in deps.

Result: if only the handler changes, the ref updates but the DOM listener still points to the old function.

Safe when: handler captures only stable values (e.g. `item.id` that never changes).
Unsafe when: handler captures changing state (e.g. `editText` from `useState`).

`useKeyStroke` and `useClickOutside` are built on `useEventListener` — same bug applies.

===

## Overused — useCallback on native DOM elements

React doesn't skip re-rendering native elements (div, button, input) based on callback identity. `useCallback` only helps when passed to `React.memo()` children. All handlers below are passed only to native JSX elements — `useCallback` is unnecessary ceremony.

### OutlineItem.tsx — 5 instances

1. `handleToggle:34` — `onClick` on `<button>`, deps `[item.id]`
2. `handleRowClick:42` — `onClick` on `<div>`, deps `[item.id]`
3. `handleDoubleClick:46` — `onDoubleClick` on `<div>`, deps `[item.id]`
4. `handleEditKeyDown:50` — `onKeyDown` on `<input>`, deps `[item.id, editText]`
5. `handleEditBlur:63` — `onBlur` on `<input>`, deps `[item.id, editText]`

Fix: inline arrow functions on JSX props.

### CommandPalette.tsx — 3 instances

1. `close:65` — deps `[]`
2. `executeCommand:69` — deps `[close]`
3. `handleKeyDown:77` — deps `[close, filteredCommands, selectedIndex, executeCommand]`

Fix: inline arrow functions. `close` and `executeCommand` become plain local functions.

### TopBar.tsx — 1 instance

1. `handleSearchKeyDown:23` — `onKeyDown` on `<input>`, deps `[]`

Fix: inline arrow function.

===

## Underused — library hooks replacing manual code

### ThemeSwitcher.tsx — manual addEventListener (lines 11-34)

Current: `useEffect` that conditionally adds/removes `document.addEventListener` for mousedown (click outside) and keydown (Escape). 18 lines of manual listener management.

Replace with:

1. `useClickOutside(containerRef, () => setOpen(false))`
   Put ref on the wrapping `<div className="relative">` — covers both button and panel, solving the two-ref exclusion problem.

2. `useKeyStroke('Escape', () => setOpen(false))`
   `setOpen(false)` is idempotent when already closed — safe to always listen.

Eliminates the entire `useEffect` block.

### ThemeSwitcher.tsx — useState for boolean toggle (line 6)

Current: `const [open, setOpen] = useState(false)` with `setOpen(!open)` and `setOpen(false)`.

Replace with: `const { bool: open, toggle, setFalse } = useToggle()`

Verified API: `useToggle()` returns `{ bool, toggle, setTrue, setFalse }`.

### TopBar.tsx — useState + onFocus/onBlur for focus tracking (lines 10, 74-75)

Current:
```tsx
const [searchFocused, setSearchFocused] = useState(false)
// ...
onFocus={() => setSearchFocused(true)}
onBlur={() => setSearchFocused(false)}
// ...
const isFocused = searchFocused || filterQuery.length > 0
```

Replace with:
```tsx
const { activeElement } = useActiveElement()
const isFocused = activeElement === searchRef.current || filterQuery.length > 0
```

Eliminates: `useState`, `onFocus` prop, `onBlur` prop.

Verified API: `useActiveElement()` returns `{ activeElement: Element | null }`, reactively tracks `document.activeElement`.

### App.tsx — useEffect for mount (line 10)

Current: `useEffect(() => setupKeyboard(), [])`

Replace with: `useMount(() => setupKeyboard())`

Clearer intent, same behavior.

Verified API: `useMount(callback: Fn): void`.

===

## Key Insight

Library hooks shine for:
1. Window/document-level listeners (useKeyStroke, useEventListener)
2. Replacing manual addEventListener/removeEventListener (useClickOutside, useKeyStroke)
3. Reactive browser state (useActiveElement)

Library hooks do NOT help for:
1. JSX event props on rendered elements — inline functions are simpler and always have fresh closures
2. Handlers that capture changing state — stale closure bug in useEventListener

===

## Summary

9 unnecessary `useCallback` wrappers across 3 files — replace with inline functions.
5 library hook opportunities across 3 files — useClickOutside, useKeyStroke, useToggle, useActiveElement, useMount.
