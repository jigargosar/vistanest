import { useOutlineStore, selectVisibleItems } from '../store/outline-store'
import { OutlineItem } from './OutlineItem'

export function OutlineTree() {
  const visibleItems = useOutlineStore(selectVisibleItems)
  const items = useOutlineStore((s) => s.items)
  const focusedId = useOutlineStore((s) => s.focusedId)

  const totalItems = items.length
  const completedItems = items.filter((i) => i.done).length

  return (
    <main
      className="px-6 pb-30"
      style={{ marginTop: 'var(--topbar-h)', paddingTop: 40 }}
    >
      <div className="mx-auto" style={{ maxWidth: 'var(--content-width)' }}>
        {/* List header */}
        <div
          className="mb-9 pb-5"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <h1
            className="text-[22px] font-normal mb-1.5"
            style={{
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
            }}
          >
            Product Roadmap Q1
          </h1>
          <div
            className="flex items-center gap-4 text-[13px]"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <span>{totalItems} items</span>
            <span>{completedItems} completed</span>
            <span>Updated 2h ago</span>
          </div>
        </div>

        {/* Outline items */}
        <div>
          {visibleItems.map((visItem, index) => (
            <div
              key={visItem.item.id}
              style={{
                animation: 'fadeInUp 0.3s ease-out both',
                animationDelay: `${index * 0.02}s`,
              }}
            >
              <OutlineItem
                visibleItem={visItem}
                isFocused={visItem.item.id === focusedId}
              />
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
