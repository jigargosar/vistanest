import { type ReactNode } from 'react'
import { observer } from 'mobx-react-lite'
import { outlineStore } from '../store-mobx/outline-store'
import { OutlineItem } from './OutlineItem'
import { scrollIntoViewRef } from '../lib/utils'

export const OutlineTree = observer(function OutlineTree() {
  const visibleItems = outlineStore.visibleItems
  const focusedId = outlineStore.focusedId
  const editingId = outlineStore.editingId
  const totalItems = outlineStore.items.length
  const completedItems = outlineStore.completedCount
  const hideCompleted = outlineStore.hideCompleted

  return (
    <main
      className="flex-1 overflow-y-auto scroll-p-4 pt-10 pb-30"
    >
      <div className="mx-auto px-8" style={{ maxWidth: 'calc(var(--content-width) + 64px)' }}>
        {/* List header */}
        <div
          className="mb-9 pb-5"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <div className="flex items-start justify-between">
            <h1
              className="text-[22px] font-normal mb-1.5"
              style={{
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
              }}
            >
              Product Roadmap Q1
            </h1>
            <div className="flex items-center gap-1 shrink-0 mt-1">
              <TitleAction title="More options">
                <circle cx="5" cy="12" r="1.5" fill="currentColor" />
                <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                <circle cx="19" cy="12" r="1.5" fill="currentColor" />
              </TitleAction>
              <TitleAction title="Settings">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </TitleAction>
              <TitleAction title="Info">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </TitleAction>
            </div>
          </div>
          <div
            className="flex items-center gap-4 text-[13px]"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <span>{totalItems} items</span>
            <span>{completedItems} completed</span>
            {hideCompleted && completedItems > 0 && (
              <span
                className="cursor-pointer"
                style={{ color: 'var(--accent)' }}
                onClick={() => outlineStore.toggleHideCompleted()}
              >
                {completedItems} hidden — show
              </span>
            )}
            <span>Updated 2h ago</span>
          </div>
        </div>

        {/* Outline items */}
        <div className="flex flex-col gap-px">
          {visibleItems.map((visItem) => (
            <OutlineItem
              key={visItem.item.id}
              ref={visItem.item.id === focusedId ? scrollIntoViewRef : undefined}
              item={visItem.item}
              depth={visItem.depth}
              childCount={visItem.childCount}
              hasChildren={visItem.hasChildren}
              isFocused={visItem.item.id === focusedId}
              isEditing={visItem.item.id === editingId}
            />
          ))}
        </div>
      </div>
    </main>
  )
})

function TitleAction({ title, children }: { title: string; children: ReactNode }) {
  return (
    <button
      title={title}
      className="topbar-btn w-7 h-7 flex items-center justify-center rounded-md border-none cursor-pointer transition-colors"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </svg>
    </button>
  )
}
