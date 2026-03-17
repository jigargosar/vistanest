import { generateKeyBetween } from 'fractional-indexing'

// === Types ===

export interface OutlineItem {
  id: string
  parentId: string | null
  sortKey: string
  text: string
  collapsed: boolean
  done: boolean
  note?: string
  tags?: ReadonlyArray<{ label: string; type: 'priority' | 'progress' | 'due' | 'label' }>
}

export interface VisibleItem {
  item: OutlineItem
  depth: number
  childCount: number
  hasChildren: boolean
}

// === Pure functions ===

export function getSiblings(items: OutlineItem[], parentId: string | null): OutlineItem[] {
  return items
    .filter((i) => i.parentId === parentId)
    .sort((a, b) => (a.sortKey < b.sortKey ? -1 : a.sortKey > b.sortKey ? 1 : 0))
}

export function getDescendantIds(items: OutlineItem[], rootId: string): string[] {
  const ids: string[] = []
  function collect(parentId: string) {
    for (const item of items) {
      if (item.parentId === parentId) {
        ids.push(item.id)
        collect(item.id)
      }
    }
  }
  collect(rootId)
  return ids
}

export function getAncestorIds(items: OutlineItem[], itemId: string): Set<string> {
  const ancestors = new Set<string>()
  let current = items.find((i) => i.id === itemId)
  while (current?.parentId) {
    ancestors.add(current.parentId)
    current = items.find((i) => i.id === current!.parentId)
  }
  return ancestors
}

export function buildSortedChildrenByParentMap(items: OutlineItem[]): Map<string | null, OutlineItem[]> {
  const childrenMap = new Map<string | null, OutlineItem[]>()
  for (const item of items) {
    const siblings = childrenMap.get(item.parentId) ?? []
    siblings.push(item)
    childrenMap.set(item.parentId, siblings)
  }
  for (const siblings of childrenMap.values()) {
    siblings.sort((a, b) => (a.sortKey < b.sortKey ? -1 : a.sortKey > b.sortKey ? 1 : 0))
  }
  return childrenMap
}

export function buildVisibleItems(items: OutlineItem[]): VisibleItem[] {
  const childrenMap = buildSortedChildrenByParentMap(items)
  const result: VisibleItem[] = []

  function walk(parentId: string | null, depth: number) {
    const children = childrenMap.get(parentId) ?? []
    for (const item of children) {
      const itemChildren = childrenMap.get(item.id) ?? []
      result.push({ item, depth, childCount: itemChildren.length, hasChildren: itemChildren.length > 0 })
      if (itemChildren.length > 0 && !item.collapsed) {
        walk(item.id, depth + 1)
      }
    }
  }

  walk(null, 0)
  return result
}

export function buildFilteredVisibleItems(items: OutlineItem[], query: string): VisibleItem[] {
  const lowerQuery = query.toLowerCase()

  const matchingIds = new Set<string>()
  for (const item of items) {
    if (item.text.toLowerCase().includes(lowerQuery)) {
      matchingIds.add(item.id)
    }
  }

  const visibleIds = new Set(matchingIds)
  for (const id of matchingIds) {
    for (const ancestorId of getAncestorIds(items, id)) {
      visibleIds.add(ancestorId)
    }
  }

  const childrenMap = buildSortedChildrenByParentMap(items.filter((i) => visibleIds.has(i.id)))
  const result: VisibleItem[] = []

  function walk(parentId: string | null, depth: number) {
    const children = childrenMap.get(parentId) ?? []
    for (const item of children) {
      const itemChildren = childrenMap.get(item.id) ?? []
      result.push({ item, depth, childCount: itemChildren.length, hasChildren: itemChildren.length > 0 })
      if (itemChildren.length > 0) walk(item.id, depth + 1)
    }
  }

  walk(null, 0)
  return result
}

export function sortKeyBetween(before: string | null, after: string | null): string {
  return generateKeyBetween(before, after)
}

export function sortKeyAfterLast(siblings: OutlineItem[]): string {
  const last = siblings.length > 0 ? siblings[siblings.length - 1].sortKey : null
  return generateKeyBetween(last, null)
}
