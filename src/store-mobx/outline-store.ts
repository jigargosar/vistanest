import { makeAutoObservable, reaction, toJS } from 'mobx'
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

// === Model helpers (pure functions) ===

function getSiblings(items: OutlineItem[], parentId: string | null): OutlineItem[] {
  return items
    .filter((i) => i.parentId === parentId)
    .sort((a, b) => (a.sortKey < b.sortKey ? -1 : a.sortKey > b.sortKey ? 1 : 0))
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

function getAncestorIds(items: OutlineItem[], itemId: string): Set<string> {
  const ancestors = new Set<string>()
  let current = items.find((i) => i.id === itemId)
  while (current?.parentId) {
    ancestors.add(current.parentId)
    current = items.find((i) => i.id === current!.parentId)
  }
  return ancestors
}

function buildVisibleItems(items: OutlineItem[]): VisibleItem[] {
  const childrenMap = new Map<string | null, OutlineItem[]>()
  for (const item of items) {
    const siblings = childrenMap.get(item.parentId) ?? []
    siblings.push(item)
    childrenMap.set(item.parentId, siblings)
  }

  for (const siblings of childrenMap.values()) {
    siblings.sort((a, b) => (a.sortKey < b.sortKey ? -1 : a.sortKey > b.sortKey ? 1 : 0))
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
    siblings.sort((a, b) => (a.sortKey < b.sortKey ? -1 : a.sortKey > b.sortKey ? 1 : 0))
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

function sortKeyBetween(before: string | null, after: string | null): string {
  return generateKeyBetween(before, after)
}

function sortKeyAfterLast(siblings: OutlineItem[]): string {
  const last = siblings.length > 0 ? siblings[siblings.length - 1].sortKey : null
  return generateKeyBetween(last, null)
}

// === Sample data ===

const sampleItems: OutlineItem[] = [
  { id: '1', parentId: null, sortKey: 'a0', text: '## Authentication & User Management', collapsed: false, done: false, tags: [{ label: '!1', type: 'priority' }, { label: 'in progress', type: 'progress' }] },
  { id: '2', parentId: null, sortKey: 'a1', text: '## Core Editor Experience', collapsed: false, done: false, tags: [{ label: '!1', type: 'priority' }] },
  { id: '3', parentId: null, sortKey: 'a2', text: '## Search & Filtering', collapsed: true, done: false },
  { id: '4', parentId: null, sortKey: 'a3', text: '## Data & Sync', collapsed: false, done: false, tags: [{ label: '!2', type: 'priority' }] },
  { id: '5', parentId: null, sortKey: 'a4', text: '## Polish & Launch Prep', collapsed: false, done: false },
  { id: '1-1', parentId: '1', sortKey: 'a0', text: 'OAuth2 integration with Google & GitHub', collapsed: false, done: true },
  { id: '1-2', parentId: '1', sortKey: 'a1', text: 'Session management and token refresh', collapsed: false, done: true },
  { id: '1-3', parentId: '1', sortKey: 'a2', text: '**Role-based access control**', collapsed: false, done: false, tags: [{ label: 'backend', type: 'label' }] },
  { id: '1-4', parentId: '1', sortKey: 'a3', text: 'Password reset flow', collapsed: false, done: false, note: 'blocked on email service' },
  { id: '1-3-1', parentId: '1-3', sortKey: 'a0', text: 'Define permission matrix for admin, editor, viewer', collapsed: false, done: false },
  { id: '1-3-2', parentId: '1-3', sortKey: 'a1', text: 'Middleware guards for API routes', collapsed: false, done: false },
  { id: '1-3-3', parentId: '1-3', sortKey: 'a2', text: 'UI permission checks in components', collapsed: false, done: false },
  { id: '2-1', parentId: '2', sortKey: 'a0', text: '**Keyboard navigation system**', collapsed: false, done: false, tags: [{ label: 'in progress', type: 'progress' }] },
  { id: '2-2', parentId: '2', sortKey: 'a1', text: 'Inline editing with markdown support', collapsed: false, done: false },
  { id: '2-3', parentId: '2', sortKey: 'a2', text: 'Drag-and-drop reordering', collapsed: false, done: false, tags: [{ label: 'Mar 20', type: 'due' }] },
  { id: '2-4', parentId: '2', sortKey: 'a3', text: 'Multi-select with Shift+Click', collapsed: false, done: false },
  { id: '2-1-1', parentId: '2-1', sortKey: 'a0', text: 'J/K movement between siblings', collapsed: false, done: true },
  { id: '2-1-2', parentId: '2-1', sortKey: 'a1', text: 'Tab/Shift+Tab for indent/outdent', collapsed: false, done: false },
  { id: '2-1-3', parentId: '2-1', sortKey: 'a2', text: 'Ctrl+Up/Down to move items', collapsed: false, done: false },
  { id: '3-1', parentId: '3', sortKey: 'a0', text: 'Full-text search across all lists', collapsed: false, done: false },
  { id: '3-2', parentId: '3', sortKey: 'a1', text: 'Tag-based filtering', collapsed: false, done: false },
  { id: '3-3', parentId: '3', sortKey: 'a2', text: 'Saved search queries', collapsed: false, done: false },
  { id: '4-1', parentId: '4', sortKey: 'a0', text: 'Real-time collaboration via WebSocket', collapsed: false, done: false, tags: [{ label: 'Apr 1', type: 'due' }] },
  { id: '4-2', parentId: '4', sortKey: 'a1', text: 'Offline mode with service worker', collapsed: false, done: false },
  { id: '4-3', parentId: '4', sortKey: 'a2', text: 'Import from Checkvist, WorkFlowy, OPML', collapsed: false, done: true },
  { id: '4-4', parentId: '4', sortKey: 'a3', text: 'Export to Markdown, JSON, OPML', collapsed: false, done: true },
  { id: '5-1', parentId: '5', sortKey: 'a0', text: 'Onboarding tutorial overlay', collapsed: false, done: false },
  { id: '5-2', parentId: '5', sortKey: 'a1', text: 'Keyboard shortcut cheat sheet modal', collapsed: false, done: true },
  { id: '5-3', parentId: '5', sortKey: 'a2', text: 'Performance audit \u2014 target <100ms interactions', collapsed: false, done: false, tags: [{ label: 'perf', type: 'label' }] },
]

// === LocalStorage ===

const STORAGE_KEY = 'vistanest-items-mobx'

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
    // Fall through
  }
  return sampleItems
}

// === Undo ===

const MAX_UNDO = 50
const undoStack: OutlineItem[][] = []

// === Store ===

export const outlineStore = makeAutoObservable({
  items: loadItems() as OutlineItem[],
  focusedId: '1-3' as string | null,
  editingId: null as string | null,
  filterQuery: '',
  commandPaletteOpen: false,

  get visibleItems(): VisibleItem[] {
    if (this.filterQuery.trim()) {
      return buildFilteredVisibleItems(this.items, this.filterQuery.trim())
    }
    return buildVisibleItems(this.items)
  },

  get completedCount(): number {
    return this.items.filter((i) => i.done).length
  },

  pushUndo() {
    undoStack.push(toJS(this.items))
    if (undoStack.length > MAX_UNDO) undoStack.shift()
  },

  undo() {
    const prev = undoStack.pop()
    if (prev) {
      this.items = prev
      this.editingId = null
    }
  },

  toggleCollapse(id: string) {
    const item = this.items.find((i) => i.id === id)
    if (item) item.collapsed = !item.collapsed
  },

  toggleDone(id: string) {
    this.pushUndo()
    const item = this.items.find((i) => i.id === id)
    if (item) item.done = !item.done
  },

  moveFocus(direction: 'up' | 'down') {
    const visible = this.visibleItems
    const idx = visible.findIndex((v) => v.item.id === this.focusedId)
    let next: number

    if (idx === -1) next = 0
    else if (direction === 'down') next = Math.min(idx + 1, visible.length - 1)
    else next = Math.max(idx - 1, 0)

    const nextItem = visible[next]
    if (nextItem) this.focusedId = nextItem.item.id
  },

  setFocused(id: string) { this.focusedId = id },
  startEditing(id: string) { this.editingId = id; this.focusedId = id },
  stopEditing() { this.editingId = null },
  setFilterQuery(query: string) { this.filterQuery = query },
  setCommandPaletteOpen(open: boolean) { this.commandPaletteOpen = open },

  updateItemText(id: string, text: string) {
    this.pushUndo()
    const item = this.items.find((i) => i.id === id)
    if (item) item.text = text
    this.editingId = null
  },

  createSibling(afterId: string) {
    const current = this.items.find((i) => i.id === afterId)
    if (!current) return

    this.pushUndo()

    const siblings = getSiblings(this.items, current.parentId)
    const idx = siblings.findIndex((s) => s.id === afterId)
    const after = siblings[idx]?.sortKey ?? null
    const before = siblings[idx + 1]?.sortKey ?? null

    const newId = crypto.randomUUID()
    this.items.push({
      id: newId,
      parentId: current.parentId,
      sortKey: sortKeyBetween(after, before),
      text: '',
      collapsed: false,
      done: false,
    })
    this.focusedId = newId
    this.editingId = newId
  },

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
      sortKey: sortKeyAfterLast(children),
      text: '',
      collapsed: false,
      done: false,
    })
    this.focusedId = newId
    this.editingId = newId
  },

  deleteItem(id: string) {
    const current = this.items.find((i) => i.id === id)
    if (!current) return

    this.pushUndo()

    const visible = this.visibleItems
    const visIdx = visible.findIndex((v) => v.item.id === id)
    const prev = visIdx > 0 ? visible[visIdx - 1] : visible[visIdx + 1]
    this.focusedId = prev ? prev.item.id : null

    const idsToDelete = new Set([id, ...getDescendantIds(this.items, id)])
    this.items = this.items.filter((i) => !idsToDelete.has(i.id))
  },

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
    current.sortKey = sortKeyAfterLast(newParentChildren)
    newParent.collapsed = false
  },

  outdentItem(id: string) {
    const current = this.items.find((i) => i.id === id)
    if (!current || current.parentId === null) return

    const parent = this.items.find((i) => i.id === current.parentId)
    if (!parent) return

    this.pushUndo()

    const grandparentId = parent.parentId
    const parentSiblings = getSiblings(this.items, grandparentId)
    const parentIdx = parentSiblings.findIndex((s) => s.id === parent.id)
    const afterParent = parentSiblings[parentIdx]?.sortKey ?? null
    const beforeNext = parentSiblings[parentIdx + 1]?.sortKey ?? null

    current.parentId = grandparentId
    current.sortKey = sortKeyBetween(afterParent, beforeNext)
  },

  moveItem(id: string, direction: 'up' | 'down') {
    const current = this.items.find((i) => i.id === id)
    if (!current) return

    const siblings = getSiblings(this.items, current.parentId)
    const idx = siblings.findIndex((s) => s.id === id)

    if (direction === 'up' && idx <= 0) return
    if (direction === 'down' && idx >= siblings.length - 1) return

    this.pushUndo()

    // Swap sortKeys
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    const swapItem = siblings[swapIdx]
    const tempKey = current.sortKey
    current.sortKey = swapItem.sortKey
    swapItem.sortKey = tempKey
  },
})

// Auto-persist items on change
reaction(
  () => JSON.stringify(outlineStore.items),
  (json) => localStorage.setItem(STORAGE_KEY, json),
)
