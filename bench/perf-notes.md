# Perf Notes

Raw findings. Not polished. Consult before adding timing code to production.

## getAncestorIds: items.find() vs Map.get()

Source: Board.md, bench/bench-filter.ts

items.find() in getAncestorIds was O(N) per ancestor hop. With deep chains (N=2000, M=N), ancestor collection phase took 145ms. Switching to Map.get() dropped it to 0.7ms.

Fix: buildItemByIdMap() creates Map<string, OutlineItem> once, getAncestorIds takes the map.

bench-filter.ts methodology: chain tree (each item is child of previous), M=N (all items match), median of 3 runs after warmup. Sizes tested: 100, 500, 1000, 2000.

## buildFilteredVisibleItems timing breakdown

Source: model.ts console.log (now removed)

Format was:
  filter q="<query>" M=<matchCount> | match:<ms> ancestors:<ms> childrenMap:<ms> walk:<ms> total:<ms>

Phases:
1. match — linear scan, item.text.toLowerCase().includes(query)
2. ancestors — Map-based ancestor collection (post-fix)
3. childrenMap — buildSortedChildrenByParentMap on filtered items
4. walk — depth-first tree walk to build VisibleItem[]

No specific numbers captured from production runs. The timing code existed for diagnosis, not benchmarking.

## OutlineItem render cost: spread-props fix

Source: Board.md

OutlineItem was receiving a VisibleItem wrapper (plain object wrapping the observable). MobX couldn't track fine-grained changes through the wrapper. Fix: pass the observable OutlineItem directly as a prop. Expected improvement from 320ms baseline — exact post-fix measurement not captured (Board.md item "Verify rendering fix" still in Ready).

## DOM listener churn: @react-hooks-library/core

Source: docs/review3.1.md

useKeyStroke creates { passive } inline every render. useEventListener depends on [event, target, options]. New object each render fails Object.is check, forcing removeEventListener + addEventListener on every render.

Total per render cycle: (2 x N) + 4 + 1 + 2 + 2 = 9 + 2N listener re-registrations.
With 20 visible items: 49 remove + 49 add per render.

This is accidental — but it masks stale closure and null-ref bugs. If anyone memoizes the options object, all latent bugs manifest. See review3.1 for full analysis.

## getSiblings O(N) pattern

Source: Board.md backlog

getSiblings called 5x in store mutations, each doing items.filter(). Could use a shared childrenByParent map. Not a problem at current scale (< 2000 items). Defer unless perf regresses.

## useActiveElement perf regression

Source: review3.1

TopBar uses useActiveElement which listens for focus/blur on window (capture phase). Every focus/blur anywhere triggers setState. Old code: 2 events (focus in, focus out). New code: setState on every focus change in the document. observer() from mobx-react-lite does not protect against useState re-renders.
