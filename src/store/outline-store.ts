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
  toggleCollapse: (id: string) => void
  toggleDone: (id: string) => void
  moveFocus: (direction: 'up' | 'down') => void
  setFocused: (id: string) => void
}

// === Sample Data ===

const sampleItems: OutlineItem[] = [
  // Top-level items
  {
    id: '1',
    parentId: null,
    sortOrder: 0,
    text: 'Authentication & User Management',
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
    text: 'Core Editor Experience',
    collapsed: false,
    done: false,
    tags: [{ label: '!1', type: 'priority' }],
  },
  {
    id: '3',
    parentId: null,
    sortOrder: 2,
    text: 'Search & Filtering',
    collapsed: true,
    done: false,
  },
  {
    id: '4',
    parentId: null,
    sortOrder: 3,
    text: 'Data & Sync',
    collapsed: false,
    done: false,
    tags: [{ label: '!2', type: 'priority' }],
  },
  {
    id: '5',
    parentId: null,
    sortOrder: 4,
    text: 'Polish & Launch Prep',
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
    text: 'Role-based access control',
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
    text: 'Keyboard navigation system',
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
  items: sampleItems,
  focusedId: '1-3',

  toggleCollapse: (id: string) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, collapsed: !item.collapsed } : item,
      ),
    })),

  toggleDone: (id: string) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item,
      ),
    })),

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
}))

/** Derive visible items from store state. Use in components as a selector. */
export function selectVisibleItems(state: OutlineState): VisibleItem[] {
  return buildVisibleItems(state.items)
}
