import { memo, useCallback, useEffect, useRef, useState } from 'react'
import type { VisibleItem } from '../store/outline-store'
import { useOutlineStore } from '../store/outline-store'

interface OutlineItemProps {
  visibleItem: VisibleItem
  isFocused: boolean
  isEditing: boolean
}

export const OutlineItem = memo(function OutlineItem({
  visibleItem,
  isFocused,
  isEditing,
}: OutlineItemProps) {
  const { item, depth, childCount, hasChildren } = visibleItem
  const toggleCollapse = useOutlineStore((s) => s.toggleCollapse)
  const setFocused = useOutlineStore((s) => s.setFocused)
  const startEditing = useOutlineStore((s) => s.startEditing)
  const stopEditing = useOutlineStore((s) => s.stopEditing)
  const updateItemText = useOutlineStore((s) => s.updateItemText)

  const inputRef = useRef<HTMLInputElement>(null)
  const [editText, setEditText] = useState(item.text)

  // Sync local edit text when entering edit mode
  useEffect(() => {
    if (isEditing) {
      setEditText(item.text)
    }
  }, [isEditing, item.text])

  // Auto-focus the input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

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

  const handleDoubleClick = useCallback(() => {
    startEditing(item.id)
  }, [startEditing, item.id])

  const handleEditKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        updateItemText(item.id, editText)
      } else if (e.key === 'Escape') {
        e.preventDefault()
        stopEditing()
      }
    },
    [item.id, editText, updateItemText, stopEditing],
  )

  const handleEditBlur = useCallback(() => {
    updateItemText(item.id, editText)
  }, [item.id, editText, updateItemText])

  const isTopLevel = depth === 0

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
      onDoubleClick={handleDoubleClick}
      style={{
        paddingLeft: depth * 28 + 8,
        paddingRight: 8,
        paddingTop: isTopLevel ? 12 : 7,
        paddingBottom: isTopLevel ? 12 : 7,
      }}
    >
      {/* Chevron toggle */}
      <button
        onClick={hasChildren ? handleToggle : undefined}
        className="chevron-toggle w-6 flex items-center justify-center shrink-0 border-none rounded p-0 transition-colors"
        style={{
          height: isTopLevel ? 32 : 28,
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

      {/* Text content or edit input */}
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onKeyDown={handleEditKeyDown}
          onBlur={handleEditBlur}
          className="flex-1 outline-none rounded px-1"
          style={{
            fontSize: isTopLevel ? 24 : 16,
            fontWeight: isTopLevel ? 500 : 400,
            lineHeight: isTopLevel ? 1.4 : 1.75,
            letterSpacing: isTopLevel ? '-0.02em' : '-0.008em',
            minHeight: isTopLevel ? 34 : 28,
            fontFamily: 'var(--font-body)',
            color: 'var(--text-primary)',
            background: 'var(--bg-raised)',
            border: '1px solid var(--accent-border)',
          }}
        />
      ) : (
        <span
          className="flex-1 flex items-baseline flex-wrap gap-2"
          style={{
            fontSize: isTopLevel ? 24 : 16,
            fontWeight: isTopLevel ? 500 : 400,
            lineHeight: isTopLevel ? 1.4 : 1.75,
            letterSpacing: isTopLevel ? '-0.02em' : '-0.008em',
            minHeight: isTopLevel ? 34 : 28,
            color: item.done ? 'var(--done-text)' : 'var(--text-primary)',
            textDecoration: item.done ? 'line-through' : undefined,
            textDecorationColor: item.done ? 'var(--done-line)' : undefined,
          }}
        >
          {item.text}

          {/* Kbd badges inline with text */}
          {item.tags?.map((tag) => (
            <InlineTag key={tag.label} label={tag.label} type={tag.type} />
          ))}

          {/* Collapsed child count inline */}
          {item.collapsed && hasChildren && (
            <span
              style={{
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-ghost)',
              }}
            >
              {childCount} items
            </span>
          )}
        </span>
      )}

      {/* Note — below text, not inline */}
      {!isEditing && item.note && (
        <span
          className="text-sm font-light italic"
          style={{ color: 'var(--text-secondary)' }}
        >
          &mdash; {item.note}
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
