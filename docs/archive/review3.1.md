# Review 3.1 — Bug Audit of commit 61a14a5 (2026-03-18)

Audit of "Adopt useKeyStroke, useClickOutside, useToggle, useActiveElement — replace manual handlers"
across OutlineItem.tsx, CommandPalette.tsx, ThemeSwitcher.tsx, TopBar.tsx.

Verified by reading library source code in node_modules/@react-hooks-library/core/dist/index.esm.js.

===

## Core Library Flaw: useEventListener registers handler value, not a ref wrapper

useEventListener (library line 227-251) stores handler in a ref but passes `savedListener.current` as a VALUE to addEventListener — not a wrapper that reads from the ref:

```js
const savedListener = useRef(listener)
useEffect(() => { savedListener.current = listener }, [listener])
useEffect(() => {
  el.addEventListener(event, savedListener.current, options)  // value, not wrapper
  // ...
}, [event, target, options])  // listener NOT in deps
```

The second effect only re-runs when [event, target, options] change. If only the handler changes, the ref updates but the DOM listener still points to the old function.

===

## Accidental Mitigation: options object instability

useKeyStroke (library line 546) creates `{ passive }` inline every render:

```js
return useEventListener(target, eventName, listener, { passive })  // new object each render
```

useEventListener's second effect depends on `[event, target, options]`. React uses Object.is for dep comparison — a new object with identical contents fails the check. Result: removeEventListener + addEventListener fires on EVERY render.

This accidentally fixes:
1. Stale closures — re-registration picks up latest savedListener.current
2. Null refs (dialogRef/inputRef) — re-registration retries unRef on each render

Verified: e2e smoke test covers editing + Enter to save and passes, confirming the mitigation works in practice.

Fragility: if anyone memoizes the options object (e.g., useMemo({ passive: false })), all stale closure and null-ref bugs fully manifest. The codebase relies on a library bug for correctness.

===

## Per-File Findings

### OutlineItem.tsx

#### Latent: stale closure on editText in Enter handler (masked by options instability)

useKeyStroke('Enter', ..., { target: inputRef }) at line 35-38. Handler captures `editText` from useState, which changes every keystroke. Without options instability, the DOM listener would hold the initial editText value. Pressing Enter would save the pre-edit text, discarding all keystrokes.

Currently working because { passive: false } forces re-registration every render.

#### Latent: null inputRef when not editing (masked by options instability)

When isEditing=false, the input is not rendered, inputRef.current=null. useEventListener sees null, skips addEventListener. When editing starts and input mounts, the ref OBJECT identity hasn't changed — normally the effect wouldn't re-run. But options instability forces it.

#### No issue: inline click handlers

handleToggle, handleRowClick, handleDoubleClick correctly converted to inline functions. stopPropagation on toggle button works correctly.

#### No issue: onBlur

Kept as inline JSX prop — always has fresh closure. No stale closure concern.

### CommandPalette.tsx

#### Latent: null dialogRef when palette closed (masked by options instability)

useKeyStroke and useClickOutside target dialogRef. On mount, isOpen=false → dialog div not rendered → dialogRef.current=null. The early return `if (!isOpen) return null` is AFTER the hook calls (correct per rules of hooks). Effect runs, sees null, skips. Ref object identity is stable, so effect normally wouldn't re-run when dialog appears. Options instability forces re-registration.

#### Latent: stale closure on filteredCommands and selectedIndex (masked by options instability)

Enter handler captures filteredCommands[selectedIndex]. Both change as user types and navigates. Without options instability, pressing Enter after filtering would execute from the initial unfiltered list.

ArrowDown/ArrowUp partially dodge this — they use setSelectedIndex((i) => ...) functional updater for the index itself. But filteredCommands.length in the ArrowDown bound is still a captured value.

#### Behavioral: useClickOutside replaces backdrop click

Old: onMouseDown on overlay div, checked e.target === e.currentTarget.
New: useClickOutside(dialogRef, close) listens on window with pointerdown (passive).

Functional behavior is equivalent for the overlay case (clicks outside dialog close it). Minor differences: pointerdown vs mousedown event type, global listener active even when palette is closed (handler exits early when dialogRef.current is null).

#### Performance: global pointerdown listener always active

useClickOutside registers on window unconditionally. When palette is closed, handler reads dialogRef.current (null), exits early. Wasteful but not harmful.

### ThemeSwitcher.tsx

#### No issue: useClickOutside on containerRef

Old code excluded clicks on both panelRef and buttonRef. New code puts containerRef on the wrapping div that contains both. useClickOutside checks event.composedPath().includes(el) — clicks on button or panel are inside containerRef, handler does not fire. Toggle button onClick works independently. Correct.

#### No issue: useToggle API

{ bool: open, toggle, setFalse: closePanel } maps correctly. toggle for button click, closePanel (setFalse) for close handlers. setFalse is idempotent — calling when already false is a React no-op.

#### Behavioral regression: Escape always listening globally

Old: addEventListener only when open=true (conditional inside useEffect).
New: useKeyStroke(['Escape'], closePanel) with no target → listens on window at all times.

Every Escape press anywhere in the app calls closePanel. Since setFalse(false) is a React no-op when already false, this is functionally harmless. No Escape handler in the codebase calls stopPropagation, so all handlers fire independently — no interference.

Semantically wrong: the old code was precisely scoped. New code is globally scoped with an idempotent no-op as a safety net.

### TopBar.tsx

#### Performance regression: useActiveElement re-renders on every focus/blur

Library source confirms: useActiveElement listens for focus and blur on window (capture phase). Every focus/blur event anywhere in the document triggers unconditional setState.

blur handler always sets null → every focus change = 2 state transitions (element → null → new element) = 2 potential re-renders. TopBar only needs to know if the search input is focused — global listening is overkill.

observer() from mobx-react-lite does not protect against useState re-renders. It only optimizes for MobX observable access.

Old code: useState + onFocus/onBlur on the input = exactly 2 events (focus in, focus out).
New code: setState on every focus/blur in the entire document.

#### No issue: useKeyStroke('/') guard

Old: useEventListener('keydown', ...) with manual e.key === '/' check.
New: useKeyStroke(['/'], ...) — library filters by key, handler still checks activeElement tagName. Equivalent behavior.

#### No issue: useKeyStroke('Escape', ..., { target: searchRef })

Correctly scoped to the search input. Only fires when input has focus. Equivalent to old onKeyDown prop.

#### Performance: options object instability

Both useKeyStroke calls create { passive: false } inline every render → listener churn on every render. Old code: useEventListener called once (for '/'), useCallback + onKeyDown for Escape. New code: 2x removeEventListener + addEventListener per render.

===

## DOM Listener Churn — Full Count

Every useKeyStroke call = 1x removeEventListener + 1x addEventListener per render.

1. OutlineItem.tsx: 2 calls (Enter, Escape) × N visible items
2. CommandPalette.tsx: 4 calls (Escape, ArrowDown, ArrowUp, Enter)
3. ThemeSwitcher.tsx: 1 call (Escape)
4. TopBar.tsx: 2 calls (/, Escape)

Plus useClickOutside: 1 call each in CommandPalette and ThemeSwitcher.

Total per render cycle: (2 × N) + 4 + 1 + 2 + 2 = 9 + 2N listener re-registrations.
With 20 visible items: 49 removeEventListener + 49 addEventListener per render.

===

## Summary

1. **Options instability (accidental fix)** — all useKeyStroke calls re-register listeners every render due to inline { passive } object. Masks stale closure and null-ref bugs. Fragile.
2. **useActiveElement perf regression** — global focus/blur listening re-renders TopBar on every focus change in the document. Should revert to useState + onFocus/onBlur.
3. **DOM listener churn** — 9 + 2N listener re-registrations per render cycle. Old code had 0 per render (stable callbacks + JSX props).
4. **ThemeSwitcher global Escape** — harmless but semantically wrong regression from conditional listener.
5. **Latent bugs** — stale closures on editText/filteredCommands/selectedIndex, null refs on dialogRef/inputRef. All masked by #1. Would fully manifest if options are memoized.
