import { create } from 'zustand'

// === Types ===

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

interface OutlineState {
  items: OutlineItem[]
  focusedId: string | null
  editingId: string | null
  toggleCollapse: (id: string) => void
  toggleDone: (id: string) => void
  moveFocus: (direction: 'up' | 'down') => void
  setFocused: (id: string) => void
  startEditing: (id: string) => void
  stopEditing: () => void
  updateItemText: (id: string, text: string) => void
  createSibling: (afterId: string) => void
  createChild: (parentId: string) => void
  deleteItem: (id: string) => void
  indentItem: (id: string) => void
  outdentItem: (id: string) => void
  moveItem: (id: string, direction: 'up' | 'down') => void
}

// === Sample Data ===

const sampleItems: OutlineItem[] = [
  // Top-level items
  {
    id: '1',
    parentId: null,
    sortOrder: 0,
    text: '## Authentication & User Management',
    collapsed: false,
    done: false,
    tags: [
      { label: '!1', type: 'priority' },
      { label: 'in progress', type: 'progress' },
    ],
  },
  {
    id: '2',
    parentId: null,
    sortOrder: 1,
    text: '## Core Editor Experience',
    collapsed: false,
    done: false,
    tags: [{ label: '!1', type: 'priority' }],
  },
  {
    id: '3',
    parentId: null,
    sortOrder: 2,
    text: '## Search & Filtering',
    collapsed: true,
    done: false,
  },
  {
    id: '4',
    parentId: null,
    sortOrder: 3,
    text: '## Data & Sync',
    collapsed: false,
    done: false,
    tags: [{ label: '!2', type: 'priority' }],
  },
  {
    id: '5',
    parentId: null,
    sortOrder: 4,
    text: '## Polish & Launch Prep',
    collapsed: false,
    done: false,
  },

  // Auth children
  {
    id: '1-1',
    parentId: '1',
    sortOrder: 0,
    text: 'OAuth2 integration with Google & GitHub',
    collapsed: false,
    done: true,
  },
  {
    id: '1-2',
    parentId: '1',
    sortOrder: 1,
    text: 'Session management and token refresh',
    collapsed: false,
    done: true,
  },
  {
    id: '1-3',
    parentId: '1',
    sortOrder: 2,
    text: '**Role-based access control**',
    collapsed: false,
    done: false,
    tags: [{ label: 'backend', type: 'label' }],
  },
  {
    id: '1-4',
    parentId: '1',
    sortOrder: 3,
    text: 'Password reset flow',
    collapsed: false,
    done: false,
    note: 'blocked on email service',
  },

  // RBAC children (depth 3)
  {
    id: '1-3-1',
    parentId: '1-3',
    sortOrder: 0,
    text: 'Define permission matrix for admin, editor, viewer',
    collapsed: false,
    done: false,
  },
  {
    id: '1-3-2',
    parentId: '1-3',
    sortOrder: 1,
    text: 'Middleware guards for API routes',
    collapsed: false,
    done: false,
  },
  {
    id: '1-3-3',
    parentId: '1-3',
    sortOrder: 2,
    text: 'UI permission checks in components',
    collapsed: false,
    done: false,
  },

  // Editor children
  {
    id: '2-1',
    parentId: '2',
    sortOrder: 0,
    text: '**Keyboard navigation system**',
    collapsed: false,
    done: false,
    tags: [{ label: 'in progress', type: 'progress' }],
  },
  {
    id: '2-2',
    parentId: '2',
    sortOrder: 1,
    text: 'Inline editing with markdown support',
    collapsed: false,
    done: false,
  },
  {
    id: '2-3',
    parentId: '2',
    sortOrder: 2,
    text: 'Drag-and-drop reordering',
    collapsed: false,
    done: false,
    tags: [{ label: 'Mar 20', type: 'due' }],
  },
  {
    id: '2-4',
    parentId: '2',
    sortOrder: 3,
    text: 'Multi-select with Shift+Click',
    collapsed: false,
    done: false,
  },

  // Keyboard nav children (depth 3)
  {
    id: '2-1-1',
    parentId: '2-1',
    sortOrder: 0,
    text: 'J/K movement between siblings',
    collapsed: false,
    done: true,
  },
  {
    id: '2-1-2',
    parentId: '2-1',
    sortOrder: 1,
    text: 'Tab/Shift+Tab for indent/outdent',
    collapsed: false,
    done: false,
  },
  {
    id: '2-1-3',
    parentId: '2-1',
    sortOrder: 2,
    text: 'Ctrl+Up/Down to move items',
    collapsed: false,
    done: false,
  },

  // Search children
  {
    id: '3-1',
    parentId: '3',
    sortOrder: 0,
    text: 'Full-text search across all lists',
    collapsed: false,
    done: false,
  },
  {
    id: '3-2',
    parentId: '3',
    sortOrder: 1,
    text: 'Tag-based filtering',
    collapsed: false,
    done: false,
  },
  {
    id: '3-3',
    parentId: '3',
    sortOrder: 2,
    text: 'Saved search queries',
    collapsed: false,
    done: false,
  },

  // Data & Sync children
  {
    id: '4-1',
    parentId: '4',
    sortOrder: 0,
    text: 'Real-time collaboration via WebSocket',
    collapsed: false,
    done: false,
    tags: [{ label: 'Apr 1', type: 'due' }],
  },
  {
    id: '4-2',
    parentId: '4',
    sortOrder: 1,
    text: 'Offline mode with service worker',
    collapsed: false,
    done: false,
  },
  {
    id: '4-3',
    parentId: '4',
    sortOrder: 2,
    text: 'Import from Checkvist, WorkFlowy, OPML',
    collapsed: false,
    done: true,
  },
  {
    id: '4-4',
    parentId: '4',
    sortOrder: 3,
    text: 'Export to Markdown, JSON, OPML',
    collapsed: false,
    done: true,
  },

  // Polish children
  {
    id: '5-1',
    parentId: '5',
    sortOrder: 0,
    text: 'Onboarding tutorial overlay',
    collapsed: false,
    done: false,
  },
  {
    id: '5-2',
    parentId: '5',
    sortOrder: 1,
    text: 'Keyboard shortcut cheat sheet modal',
    collapsed: false,
    done: true,
  },
  {
    id: '5-3',
    parentId: '5',
    sortOrder: 2,
    text: 'Performance audit \u2014 target <100ms interactions',
    collapsed: false,
    done: false,
    tags: [{ label: 'perf', type: 'label' }],
  },
]

// === LocalStorage persistence ===

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

function saveItems(items: OutlineItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

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

function renumberSiblings(items: OutlineItem[], parentId: string | null): OutlineItem[] {
  const siblings = getSiblings(items, parentId)
  return items.map((item) => {
    if (item.parentId !== parentId) return item
    const index = siblings.findIndex((s) => s.id === item.id)
    if (index === -1 || item.sortOrder === index) return item
    return { ...item, sortOrder: index }
  })
}

// === Helper: build visible item list from flat data ===

function buildVisibleItems(items: OutlineItem[]): VisibleItem[] {
  const childrenMap = new Map<string | null, OutlineItem[]>()
  for (const item of items) {
    const siblings = childrenMap.get(item.parentId) ?? []
    siblings.push(item)
    childrenMap.set(item.parentId, siblings)
  }

  // Sort each group by sortOrder
  for (const siblings of childrenMap.values()) {
    siblings.sort((a, b) => a.sortOrder - b.sortOrder)
  }

  const result: VisibleItem[] = []

  function walk(parentId: string | null, depth: number) {
    const children = childrenMap.get(parentId) ?? []
    for (const item of children) {
      const itemChildren = childrenMap.get(item.id) ?? []
      const hasChildren = itemChildren.length > 0
      result.push({
        item,
        depth,
        childCount: itemChildren.length,
        hasChildren,
      })
      if (hasChildren && !item.collapsed) {
        walk(item.id, depth + 1)
      }
    }
  }

  walk(null, 0)
  return result
}

// === Store ===

export const useOutlineStore = create<OutlineState>((set, get) => ({
  items: loadItems(),
  focusedId: '1-3',
  editingId: null,

  toggleCollapse: (id: string) =>
    set((state) => {
      const items = state.items.map((item) =>
        item.id === id ? { ...item, collapsed: !item.collapsed } : item,
      )
      saveItems(items)
      return { items }
    }),

  toggleDone: (id: string) =>
    set((state) => {
      const items = state.items.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item,
      )
      saveItems(items)
      return { items }
    }),

  moveFocus: (direction: 'up' | 'down') => {
    const state = get()
    const visible = buildVisibleItems(state.items)
    const currentIndex = visible.findIndex((v) => v.item.id === state.focusedId)
    let nextIndex: number

    if (currentIndex === -1) {
      nextIndex = 0
    } else if (direction === 'down') {
      nextIndex = Math.min(currentIndex + 1, visible.length - 1)
    } else {
      nextIndex = Math.max(currentIndex - 1, 0)
    }

    const nextItem = visible[nextIndex]
    if (nextItem) {
      set({ focusedId: nextItem.item.id })
    }
  },

  setFocused: (id: string) => set({ focusedId: id }),

  startEditing: (id: string) => set({ editingId: id, focusedId: id }),

  stopEditing: () => set({ editingId: null }),

  updateItemText: (id: string, text: string) =>
    set((state) => {
      const items = state.items.map((item) =>
        item.id === id ? { ...item, text } : item,
      )
      saveItems(items)
      return { items, editingId: null }
    }),

  createSibling: (afterId: string) => {
    const state = get()
    const current = state.items.find((item) => item.id === afterId)
    if (!current) return

    const siblings = getSiblings(state.items, current.parentId)
    const currentIndex = siblings.findIndex((s) => s.id === afterId)
    const newSortOrder = currentIndex + 1

    const newId = crypto.randomUUID()
    const newItem: OutlineItem = {
      id: newId,
      parentId: current.parentId,
      sortOrder: newSortOrder,
      text: '',
      collapsed: false,
      done: false,
    }

    // Bump sortOrder for siblings that come after the new item
    let items = state.items.map((item) => {
      if (item.parentId === current.parentId && item.sortOrder >= newSortOrder) {
        return { ...item, sortOrder: item.sortOrder + 1 }
      }
      return item
    })
    items = [...items, newItem]

    saveItems(items)
    set({ items, focusedId: newId, editingId: newId })
  },

  createChild: (parentId: string) => {
    const state = get()
    const parent = state.items.find((item) => item.id === parentId)
    if (!parent) return

    const children = getSiblings(state.items, parentId)
    const newSortOrder = children.length

    const newId = crypto.randomUUID()
    const newItem: OutlineItem = {
      id: newId,
      parentId,
      sortOrder: newSortOrder,
      text: '',
      collapsed: false,
      done: false,
    }

    // Expand parent so the new child is visible
    let items = state.items.map((item) =>
      item.id === parentId ? { ...item, collapsed: false } : item,
    )
    items = [...items, newItem]

    saveItems(items)
    set({ items, focusedId: newId, editingId: newId })
  },

  deleteItem: (id: string) => {
    const state = get()
    const current = state.items.find((item) => item.id === id)
    if (!current) return

    // Find previous visible item to focus after deletion
    const visible = buildVisibleItems(state.items)
    const visibleIndex = visible.findIndex((v) => v.item.id === id)
    const prevVisible = visibleIndex > 0 ? visible[visibleIndex - 1] : visible[visibleIndex + 1]
    const nextFocusId = prevVisible ? prevVisible.item.id : null

    // Collect all descendant IDs to delete
    const descendantIds = getDescendantIds(state.items, id)
    const idsToDelete = new Set([id, ...descendantIds])

    let items = state.items.filter((item) => !idsToDelete.has(item.id))
    items = renumberSiblings(items, current.parentId)

    saveItems(items)
    set({ items, focusedId: nextFocusId })
  },

  indentItem: (id: string) => {
    const state = get()
    const current = state.items.find((item) => item.id === id)
    if (!current) return

    const siblings = getSiblings(state.items, current.parentId)
    const currentIndex = siblings.findIndex((s) => s.id === id)

    // Can't indent if there's no previous sibling
    if (currentIndex <= 0) return

    const newParent = siblings[currentIndex - 1]
    const newParentChildren = getSiblings(state.items, newParent.id)
    const newSortOrder = newParentChildren.length

    let items = state.items.map((item) => {
      if (item.id === id) {
        return { ...item, parentId: newParent.id, sortOrder: newSortOrder }
      }
      return item
    })

    // Renumber old siblings after removal
    items = renumberSiblings(items, current.parentId)

    // Expand new parent so the indented item is visible
    items = items.map((item) =>
      item.id === newParent.id ? { ...item, collapsed: false } : item,
    )

    saveItems(items)
    set({ items })
  },

  outdentItem: (id: string) => {
    const state = get()
    const current = state.items.find((item) => item.id === id)
    if (!current || current.parentId === null) return

    const parent = state.items.find((item) => item.id === current.parentId)
    if (!parent) return

    // New parent is the grandparent
    const grandparentId = parent.parentId
    const parentSiblings = getSiblings(state.items, grandparentId)
    const parentIndex = parentSiblings.findIndex((s) => s.id === parent.id)
    const newSortOrder = parentIndex + 1

    // Bump sortOrder for items after the parent in the grandparent's children
    let items = state.items.map((item) => {
      if (item.parentId === grandparentId && item.sortOrder >= newSortOrder) {
        return { ...item, sortOrder: item.sortOrder + 1 }
      }
      return item
    })

    // Move the item to be a sibling of its parent
    items = items.map((item) => {
      if (item.id === id) {
        return { ...item, parentId: grandparentId, sortOrder: newSortOrder }
      }
      return item
    })

    // Renumber old siblings after removal
    items = renumberSiblings(items, parent.id)

    saveItems(items)
    set({ items })
  },

  moveItem: (id: string, direction: 'up' | 'down') => {
    const state = get()
    const current = state.items.find((item) => item.id === id)
    if (!current) return

    const siblings = getSiblings(state.items, current.parentId)
    const currentIndex = siblings.findIndex((s) => s.id === id)

    if (direction === 'up' && currentIndex <= 0) return
    if (direction === 'down' && currentIndex >= siblings.length - 1) return

    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    const swapItem = siblings[swapIndex]

    const items = state.items.map((item) => {
      if (item.id === id) {
        return { ...item, sortOrder: swapItem.sortOrder }
      }
      if (item.id === swapItem.id) {
        return { ...item, sortOrder: current.sortOrder }
      }
      return item
    })

    saveItems(items)
    set({ items })
  },
}))

/** Derive visible items from items array. Use with useMemo in components. */
export function selectVisibleItems(state: Pick<OutlineState, 'items'>): VisibleItem[] {
  return buildVisibleItems(state.items)
}
