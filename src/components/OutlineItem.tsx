import { memo, useCallback } from 'react'
import type { VisibleItem } from '../store/outline-store'
import { useOutlineStore } from '../store/outline-store'

interface OutlineItemProps {
  visibleItem: VisibleItem
  isFocused: boolean
}

export const OutlineItem = memo(function OutlineItem({
  visibleItem,
  isFocused,
}: OutlineItemProps) {
  const { item, depth, childCount, hasChildren } = visibleItem
  const toggleCollapse = useOutlineStore((s) => s.toggleCollapse)
  const setFocused = useOutlineStore((s) => s.setFocused)

  const handleToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      toggleCollapse(item.id)
    },
    [toggleCollapse, item.id],
  )

  const handleRowClick = useCallback(() => {
    setFocused(item.id)
  }, [setFocused, item.id])

  const rowClasses = [
    'outline-item-row',
    'flex items-start gap-1 rounded-md cursor-default transition-colors relative',
    isFocused && 'is-focused',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={rowClasses}
      onClick={handleRowClick}
      style={{
        paddingLeft: depth * 28 + 8,
        paddingRight: 8,
        paddingTop: 7,
        paddingBottom: 7,
      }}
    >
      {/* Chevron toggle */}
      <button
        onClick={hasChildren ? handleToggle : undefined}
        className="chevron-toggle w-6 h-7 flex items-center justify-center shrink-0 border-none rounded p-0 transition-colors"
        style={{
          cursor: hasChildren ? 'pointer' : 'default',
          visibility: hasChildren ? 'visible' : 'hidden',
        }}
      >
        <svg
          className="w-3.5 h-3.5 transition-transform"
          style={{ transform: item.collapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Text content */}
      <span
        className="flex-1 flex items-baseline flex-wrap gap-2"
        style={{
          fontSize: 16,
          lineHeight: 1.75,
          letterSpacing: '-0.008em',
          minHeight: 28,
          color: item.done ? 'var(--done-text)' : 'var(--text-primary)',
          textDecoration: item.done ? 'line-through' : undefined,
          textDecorationColor: item.done ? 'var(--done-line)' : undefined,
        }}
      >
        {item.text}

        {item.note && (
          <span
            className="text-sm font-light italic"
            style={{ color: 'var(--text-secondary)' }}
          >
            &mdash; {item.note}
          </span>
        )}

        {item.tags?.map((tag) => (
          <InlineTag key={tag.label} label={tag.label} type={tag.type} />
        ))}
      </span>

      {/* Child count for collapsed parents */}
      {item.collapsed && hasChildren && (
        <span
          className="shrink-0 pt-0.5"
          style={{
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-ghost)',
          }}
        >
          {childCount} items
        </span>
      )}

      {/* Shortcut hints on focused row */}
      {isFocused && (
        <span className="flex gap-1 items-center shrink-0 ml-auto pl-3">
          <kbd>Enter</kbd>
          <kbd>Space</kbd>
          <kbd>Tab</kbd>
        </span>
      )}
    </div>
  )
})

function InlineTag({ label, type }: { label: string; type: string }) {
  const styleMap: Record<string, React.CSSProperties> = {
    priority: {
      background: 'rgba(192, 84, 79, 0.12)',
      color: 'var(--red-soft)',
      border: '1px solid rgba(192, 84, 79, 0.2)',
    },
    progress: {
      background: 'rgba(90, 158, 111, 0.1)',
      color: 'var(--green-soft)',
      border: '1px solid rgba(90, 158, 111, 0.18)',
    },
    due: {
      background: 'rgba(184, 152, 64, 0.1)',
      color: 'var(--yellow-soft)',
      border: '1px solid rgba(184, 152, 64, 0.18)',
    },
    label: {
      background: 'rgba(91, 138, 240, 0.08)',
      color: 'var(--accent)',
      border: '1px solid var(--accent-border)',
    },
  }

  return (
    <span
      className="whitespace-nowrap"
      style={{
        fontSize: '11.5px',
        fontFamily: 'var(--font-mono)',
        fontWeight: 400,
        padding: '1px 7px',
        borderRadius: 3,
        letterSpacing: 0,
        ...styleMap[type],
      }}
    >
      {label}
    </span>
  )
}
