import { generateKeyBetween } from 'fractional-indexing'
import type { OutlineItem } from '../src/store-mobx/model.ts'

function makeChain(n: number): OutlineItem[] {
  const items: OutlineItem[] = []
  let prevKey: string | null = null
  let prevId: string | null = null

  for (let i = 0; i < n; i++) {
    const sortKey = generateKeyBetween(prevKey, null)
    const id = 'item-' + i
    items.push({
      id,
      parentId: prevId,
      sortKey,
      text: 'test item ' + i,
      collapsed: false,
      done: false,
    })
    prevKey = sortKey
    prevId = id
  }
  return items
}

// Simulate getAncestorIds with items.find() — current approach
function ancestorsViaFind(items: OutlineItem[], itemId: string): Set<string> {
  const ancestors = new Set<string>()
  let current = items.find((i) => i.id === itemId)
  while (current?.parentId) {
    ancestors.add(current.parentId)
    current = items.find((i) => i.id === current!.parentId)
  }
  return ancestors
}

// Simulate getAncestorIds with Map.get() — proposed approach
function ancestorsViaMap(itemMap: Map<string, OutlineItem>, itemId: string): Set<string> {
  const ancestors = new Set<string>()
  let current = itemMap.get(itemId)
  while (current?.parentId) {
    ancestors.add(current.parentId)
    current = itemMap.get(current.parentId)
  }
  return ancestors
}

function buildItemMap(items: OutlineItem[]): Map<string, OutlineItem> {
  const map = new Map<string, OutlineItem>()
  for (const item of items) {
    map.set(item.id, item)
  }
  return map
}

// Simulate buildFilteredVisibleItems ancestor-collection phase
// M items matched, each walks ancestors
// @ts-ignore
function benchFind(items: OutlineItem[], matchIds: string[]): number {
  const start = performance.now()
  const visibleIds = new Set<string>()
  for (const id of matchIds) {
    for (const ancestorId of ancestorsViaFind(items, id)) {
      visibleIds.add(ancestorId)
    }
  }
  const end = performance.now()
  return end - start
}

function benchMap(items: OutlineItem[], matchIds: string[]): number {
  const start = performance.now()
  const itemMap = buildItemMap(items) // included in timing — real cost
  const visibleIds = new Set<string>()
  for (const id of matchIds) {
    for (const ancestorId of ancestorsViaMap(itemMap, id)) {
      visibleIds.add(ancestorId)
    }
  }
  const end = performance.now()
  return end - start
}

const sizes = [100, 500, 1000, 2000]

console.log('=== Map approach (chain tree, M=N) ===')
console.log('')

for (const n of sizes) {
  const items = makeChain(n)
  const matchIds = items.map((i) => i.id)

  // warmup
  benchMap(items, matchIds)

  // 3 runs, take median
  const times = [benchMap(items, matchIds), benchMap(items, matchIds), benchMap(items, matchIds)]
  times.sort((a, b) => a - b)

  console.log('N=' + n + ' → ' + times[1].toFixed(2) + 'ms')
}
