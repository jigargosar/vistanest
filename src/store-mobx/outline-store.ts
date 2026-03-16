import { makeAutoObservable, reaction, toJS } from 'mobx'

// === Types (shared with Zustand version) ===

export interface OutlineItem {
  id: string
  parentId: string | null
  sortOrder: number
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

// === Sample Data ===

import { sampleItems } from '../data/sample-items'

// === Helpers ===

function getSiblings(items: OutlineItem[], parentId: string | null): OutlineItem[] {
  return items
    .filter((item) => item.parentId === parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

function getDescendantIds(items: OutlineItem[], rootId: string): string[] {
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

function renumberSiblings(items: OutlineItem[], parentId: string | null) {
  const siblings = getSiblings(items, parentId)
  for (const item of items) {
    if (item.parentId !== parentId) continue
    const index = siblings.findIndex((s) => s.id === item.id)
    if (index !== -1) item.sortOrder = index
  }
}

function buildVisibleItems(items: OutlineItem[]): VisibleItem[] {
  const childrenMap = new Map<string | null, OutlineItem[]>()
  for (const item of items) {
    const siblings = childrenMap.get(item.parentId) ?? []
    siblings.push(item)
    childrenMap.set(item.parentId, siblings)
  }

  for (const siblings of childrenMap.values()) {
    siblings.sort((a, b) => a.sortOrder - b.sortOrder)
  }

  const result: VisibleItem[] = []

  function walk(parentId: string | null, depth: number) {
    const children = childrenMap.get(parentId) ?? []
    for (const item of children) {
      const itemChildren = childrenMap.get(item.id) ?? []
      result.push({
        item,
        depth,
        childCount: itemChildren.length,
        hasChildren: itemChildren.length > 0,
      })
      if (itemChildren.length > 0 && !item.collapsed) {
        walk(item.id, depth + 1)
      }
    }
  }

  walk(null, 0)
  return result
}

function getAncestorIds(items: OutlineItem[], itemId: string): Set<string> {
  const ancestors = new Set<string>()
  let current = items.find((i) => i.id === itemId)
  while (current?.parentId) {
    ancestors.add(current.parentId)
    current = items.find((i) => i.id === current!.parentId)
  }
  return ancestors
}

function buildFilteredVisibleItems(items: OutlineItem[], query: string): VisibleItem[] {
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

  const childrenMap = new Map<string | null, OutlineItem[]>()
  for (const item of items) {
    if (!visibleIds.has(item.id)) continue
    const siblings = childrenMap.get(item.parentId) ?? []
    siblings.push(item)
    childrenMap.set(item.parentId, siblings)
  }

  for (const siblings of childrenMap.values()) {
    siblings.sort((a, b) => a.sortOrder - b.sortOrder)
  }

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

// === LocalStorage ===

const STORAGE_KEY = 'vistanest-items'

function loadItems(): OutlineItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as OutlineItem[]
      }
    }
  } catch {
    // Fall through to sample data
  }
  return sampleItems
}

// === Store ===

const MAX_UNDO = 50

// Undo history lives outside the store — not reactive, not persisted
const undoStack: OutlineItem[][] = []

class OutlineStore {
  items: OutlineItem[] = loadItems()
  focusedId: string | null = '1-3'
  editingId: string | null = null
  filterQuery = ''
  commandPaletteOpen = false

  constructor() {
    makeAutoObservable(this)

    // Auto-persist items on change
    reaction(
      () => JSON.stringify(this.items),
      (json) => localStorage.setItem(STORAGE_KEY, json),
    )
  }

  // === Computed ===

  get visibleItems(): VisibleItem[] {
    if (this.filterQuery.trim()) {
      return buildFilteredVisibleItems(this.items, this.filterQuery.trim())
    }
    return buildVisibleItems(this.items)
  }

  get completedCount(): number {
    return this.items.filter((i) => i.done).length
  }

  // === Undo ===

  private pushUndo() {
    undoStack.push(toJS(this.items))
    if (undoStack.length > MAX_UNDO) undoStack.shift()
  }

  undo() {
    const prev = undoStack.pop()
    if (prev) {
      this.items = prev
      this.editingId = null
    }
  }

  // === Actions ===

  toggleCollapse(id: string) {
    const item = this.items.find((i) => i.id === id)
    if (item) item.collapsed = !item.collapsed
  }

  toggleDone(id: string) {
    this.pushUndo()
    const item = this.items.find((i) => i.id === id)
    if (item) item.done = !item.done
  }

  moveFocus(direction: 'up' | 'down') {
    const visible = this.visibleItems
    const idx = visible.findIndex((v) => v.item.id === this.focusedId)
    let next: number

    if (idx === -1) {
      next = 0
    } else if (direction === 'down') {
      next = Math.min(idx + 1, visible.length - 1)
    } else {
      next = Math.max(idx - 1, 0)
    }

    const nextItem = visible[next]
    if (nextItem) this.focusedId = nextItem.item.id
  }

  setFocused(id: string) { this.focusedId = id }
  startEditing(id: string) { this.editingId = id; this.focusedId = id }
  stopEditing() { this.editingId = null }
  setFilterQuery(query: string) { this.filterQuery = query }
  setCommandPaletteOpen(open: boolean) { this.commandPaletteOpen = open }

  updateItemText(id: string, text: string) {
    this.pushUndo()
    const item = this.items.find((i) => i.id === id)
    if (item) item.text = text
    this.editingId = null
  }

  createSibling(afterId: string) {
    const current = this.items.find((i) => i.id === afterId)
    if (!current) return

    this.pushUndo()

    const siblings = getSiblings(this.items, current.parentId)
    const idx = siblings.findIndex((s) => s.id === afterId)
    const newSortOrder = idx + 1

    // Bump siblings after insertion point
    for (const item of this.items) {
      if (item.parentId === current.parentId && item.sortOrder >= newSortOrder) {
        item.sortOrder++
      }
    }

    const newId = crypto.randomUUID()
    this.items.push({
      id: newId,
      parentId: current.parentId,
      sortOrder: newSortOrder,
      text: '',
      collapsed: false,
      done: false,
    })
    this.focusedId = newId
    this.editingId = newId
  }

  createChild(parentId: string) {
    const parent = this.items.find((i) => i.id === parentId)
    if (!parent) return

    this.pushUndo()

    const children = getSiblings(this.items, parentId)
    const newId = crypto.randomUUID()

    parent.collapsed = false
    this.items.push({
      id: newId,
      parentId,
      sortOrder: children.length,
      text: '',
      collapsed: false,
      done: false,
    })
    this.focusedId = newId
    this.editingId = newId
  }

  deleteItem(id: string) {
    const current = this.items.find((i) => i.id === id)
    if (!current) return

    this.pushUndo()

    // Find next focus target
    const visible = this.visibleItems
    const visIdx = visible.findIndex((v) => v.item.id === id)
    const prev = visIdx > 0 ? visible[visIdx - 1] : visible[visIdx + 1]
    this.focusedId = prev ? prev.item.id : null

    // Remove item and descendants
    const idsToDelete = new Set([id, ...getDescendantIds(this.items, id)])
    this.items = this.items.filter((i) => !idsToDelete.has(i.id))
    renumberSiblings(this.items, current.parentId)
  }

  indentItem(id: string) {
    const current = this.items.find((i) => i.id === id)
    if (!current) return

    const siblings = getSiblings(this.items, current.parentId)
    const idx = siblings.findIndex((s) => s.id === id)
    if (idx <= 0) return

    this.pushUndo()

    const newParent = siblings[idx - 1]
    const newParentChildren = getSiblings(this.items, newParent.id)

    current.parentId = newParent.id
    current.sortOrder = newParentChildren.length
    renumberSiblings(this.items, current.parentId)
    newParent.collapsed = false
  }

  outdentItem(id: string) {
    const current = this.items.find((i) => i.id === id)
    if (!current || current.parentId === null) return

    const parent = this.items.find((i) => i.id === current.parentId)
    if (!parent) return

    this.pushUndo()

    const grandparentId = parent.parentId
    const parentSiblings = getSiblings(this.items, grandparentId)
    const parentIdx = parentSiblings.findIndex((s) => s.id === parent.id)
    const newSortOrder = parentIdx + 1

    // Bump siblings after parent
    for (const item of this.items) {
      if (item.parentId === grandparentId && item.sortOrder >= newSortOrder) {
        item.sortOrder++
      }
    }

    const oldParentId = current.parentId
    current.parentId = grandparentId
    current.sortOrder = newSortOrder
    renumberSiblings(this.items, oldParentId)
  }

  moveItem(id: string, direction: 'up' | 'down') {
    const current = this.items.find((i) => i.id === id)
    if (!current) return

    const siblings = getSiblings(this.items, current.parentId)
    const idx = siblings.findIndex((s) => s.id === id)

    if (direction === 'up' && idx <= 0) return
    if (direction === 'down' && idx >= siblings.length - 1) return

    this.pushUndo()

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    const swapItem = siblings[swapIdx]
    const tempSort = current.sortOrder
    current.sortOrder = swapItem.sortOrder
    swapItem.sortOrder = tempSort
  }
}

export const outlineStore = new OutlineStore()
