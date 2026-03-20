# Code Review — Hook Audit (2026-03-18)

Exhaustive cross-reference: every `@react-hooks-library/core` hook vs every React pattern in `src/`.

===

## Matches Found

### 1. useKeyStroke (5 sites)

#### 1a. OutlineItem.tsx:50-61 — handleEditKeyDown

Current: `useCallback` with `if (e.key === 'Enter') ... else if (e.key === 'Escape')` on `onKeyDown` JSX prop.

Replace with:
```ts
useKeyStroke('Enter', (e) => { e.preventDefault(); outlineStore.updateItemText(item.id, editText) }, { target: inputRef })
useKeyStroke('Escape', (e) => { e.preventDefault(); outlineStore.stopEditing() }, { target: inputRef })
```

Null-safe: `useEventListener` (which `useKeyStroke` delegates to) checks `if (!el) return` after `unRef(target)`.

#### 1b. CommandPalette.tsx:77-95 — handleKeyDown

Current: `useCallback` with 4-branch `if/else` chain (Escape, ArrowDown, ArrowUp, Enter) on `onKeyDown` JSX prop.

Replace with 4x `useKeyStroke` calls with `{ target: dialogRef }`. Also collapses `close` and `executeCommand` from `useCallback` to plain functions (no longer needed as deps).

#### 1c. TopBar.tsx:12-21 — useEventListener with manual key check

Current: `useEventListener('keydown', (e) => { if (e.key === '/') ... })`.

Replace with: `useKeyStroke('/', handler)`.

#### 1d. TopBar.tsx:23-32 — handleSearchKeyDown

Current: `useCallback` checking `e.key === 'Escape'` on `onKeyDown` JSX prop.

Replace with: `useKeyStroke('Escape', handler, { target: searchRef })`.

#### 1e. ThemeSwitcher.tsx:25-27 — Escape handler inside useEffect

Current: Manual `document.addEventListener('keydown', handleEscape)` with key check.

Replace with: `useKeyStroke('Escape', () => setOpen(false))`.

### 2. useClickOutside (2 sites)

#### 2a. ThemeSwitcher.tsx:14-22 — manual mousedown listener

Current: `document.addEventListener('mousedown', handleClickOutside)` with `contains()` checks on `panelRef` and `buttonRef`.

Replace with: `useClickOutside(panelRef, () => setOpen(false))`.

Caveat: current code also excludes `buttonRef` clicks. `useClickOutside` only takes one target. Options: wrap both in a container ref, or accept single-target behavior.

#### 2b. CommandPalette.tsx:103-104 — backdrop click to close

Current: `if (e.target === e.currentTarget) close()` on overlay `onMouseDown`.

Replace with: `useClickOutside(dialogRef, close)`.

### 3. useToggle (2 sites)

#### 3a. ThemeSwitcher.tsx:6

Current: `const [open, setOpen] = useState(false)` with `setOpen(false)`, `setOpen(!open)`.

Replace with: `const { bool: open, toggle, setFalse } = useToggle()`.

#### 3b. TopBar.tsx:10

Current: `const [searchFocused, setSearchFocused] = useState(false)` with `setSearchFocused(true)`, `setSearchFocused(false)`.

Replace with: `const { bool: searchFocused, setTrue, setFalse } = useToggle()`.

### 4. useActiveElement (1 site)

#### 4a. TopBar.tsx:15-16

Current: `document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA'`.

Replace with: `const { activeElement } = useActiveElement()` then check `activeElement?.tagName`.

===

## Unnecessary useCallback (native elements)

React doesn't skip re-rendering native elements (div, button, input) based on callback identity. `useCallback` only helps when passed to `React.memo()` children. All handlers below are passed only to native JSX elements.

### OutlineItem.tsx — 5 unnecessary

1. `handleToggle:34` — `onClick` on `<button>`
2. `handleRowClick:42` — `onClick` on `<div>`
3. `handleDoubleClick:46` — `onDoubleClick` on `<div>`
4. `handleEditKeyDown:50` — `onKeyDown` on `<input>` (also replaced by useKeyStroke)
5. `handleEditBlur:63` — `onBlur` on `<input>`

### CommandPalette.tsx — 3 unnecessary (after useKeyStroke adoption)

1. `close:65` — used as dep of other useCallbacks; once handleKeyDown is replaced by useKeyStroke, close becomes a plain function
2. `executeCommand:69` — same chain as close
3. `handleKeyDown:77` — `onKeyDown` on `<div>` (replaced by useKeyStroke)

### TopBar.tsx — 1 unnecessary

1. `handleSearchKeyDown:23` — `onKeyDown` on `<input>` (replaced by useKeyStroke)

### No incorrect usage found

All dependency arrays are correct. No stale closures. No missing deps.

===

## No Match — Library Hooks With No src Target

1. `useAsyncCallback` — no async operations in components
2. `useDebounce` — no debounced values (search filtering is instant)
3. `useEventListener` — already used in TopBar; other uses better served by useKeyStroke/useClickOutside
4. `useFont` — no font loading
5. `useHasMounted` — no SSR
6. `useHover` — CLAUDE.md forbids hover highlights on outline items
7. `useIntersectionObserver` — no intersection patterns
8. `useInterval` — no setInterval patterns
9. `useIsSupported` — no feature detection
10. `useLocalStorage` — store uses localStorage but via MobX reaction(), not in a component
11. `useLocation` — no routing
12. `useMediaQuery` — no media queries
13. `useMediaStream` — no media
14. `useMouse` — no mouse position tracking
15. `useMutationObserver` — no DOM mutation watching
16. `useNetwork` — no network status (future: sync)
17. `useOnline` — no online detection (future: sync)
18. `usePreferredColorScheme` — custom theme system, not system preference
19. `usePrevious` — no previous-value patterns
20. `useScreenShare` — no screen sharing
21. `useScroll` — no scroll tracking
22. `useScrollIntoView` — no scroll-into-view (future: focused item)
23. `useSessionStorage` — no session storage
24. `useStateCompare` — no custom comparison
25. `useStateHistory` — undo is in MobX store, not component state
26. `useTitle` — no document title management
27. `useWindowSize` — no window size tracking
28. `BreakPointHooks` — no breakpoint logic
29. `useMount` / `useMountSync` / `useUnMount` / `useEffectAfterMount` — deprecated, skip

## No Match — src Patterns With No Library Hook

1. `OutlineItem.tsx:23-25` — useEffect syncing editText from prop
2. `OutlineItem.tsx:27-32` — useEffect focus() + select() on input
3. `CommandPalette.tsx:51-57` — useEffect reset state when opened
4. `CommandPalette.tsx:59-63` — useEffect clamp selectedIndex
5. `App.tsx:10` — useEffect setupKeyboard() on mount

===

## Fix Plan

### Step 1: useKeyStroke adoption (5 sites, biggest noise reduction)

1. OutlineItem.tsx — replace handleEditKeyDown with 2x useKeyStroke
2. CommandPalette.tsx — replace handleKeyDown with 4x useKeyStroke, collapse close/executeCommand to plain functions
3. TopBar.tsx:12-21 — replace useEventListener + key check with useKeyStroke
4. TopBar.tsx:23-32 — replace handleSearchKeyDown with useKeyStroke
5. ThemeSwitcher.tsx:25-27 — replace addEventListener Escape with useKeyStroke

### Step 2: useClickOutside adoption (2 sites)

1. ThemeSwitcher.tsx:14-22 — replace manual mousedown listener (decide on buttonRef exclusion approach)
2. CommandPalette.tsx:103-104 — replace backdrop click check

### Step 3: useToggle adoption (2 sites)

1. ThemeSwitcher.tsx:6 — useState(false) to useToggle()
2. TopBar.tsx:10 — useState(false) to useToggle()

### Step 4: useActiveElement adoption (1 site)

1. TopBar.tsx:15-16 — replace document.activeElement checks

### Step 5: Remove remaining unnecessary useCallbacks (after steps 1-4)

1. OutlineItem.tsx — handleToggle, handleRowClick, handleDoubleClick, handleEditBlur to inline functions

## Summary

4 hooks cover 10 sites across 5 files. 9 unnecessary useCallbacks across 3 files.
