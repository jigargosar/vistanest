import { useEffect, useRef, useState, useMemo, type CSSProperties } from 'react'
import { observer } from 'mobx-react-lite'
import { useKeyStroke } from '@react-hooks-library/core'
import type { OutlineItem as OutlineItemType } from '../store-mobx/model'
import { outlineStore } from '../store-mobx/outline-store'
import { renderMarkdown } from '../lib/markdown'

interface OutlineItemProps {
  ref?: React.Ref<HTMLDivElement>
  item: OutlineItemType
  depth: number
  childCount: number
  hasChildren: boolean
  isFocused: boolean
  isEditing: boolean
}

export const OutlineItem = observer(function OutlineItem({
  ref,
  item,
  depth,
  childCount,
  hasChildren,
  isFocused,
  isEditing,
}: OutlineItemProps) {

  const inputRef = useRef<HTMLInputElement>(null)
  const [editText, setEditText] = useState(item.text)

  useEffect(() => {
    if (isEditing) setEditText(item.text)
  }, [isEditing, item.text])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  useKeyStroke(['Enter'], (e) => {
    e.preventDefault()
    outlineStore.updateItemText(item.id, editText)
  }, { target: inputRef })

  useKeyStroke(['Escape'], (e) => {
    e.preventDefault()
    outlineStore.stopEditing()
  }, { target: inputRef })

  const rendered = useMemo(() => renderMarkdown(item.text), [item.text])

  const rowClasses = [
    'outline-item-row',
    'flex items-start gap-1 rounded-md cursor-default relative',
    isFocused && 'is-focused',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      ref={ref}
      className={rowClasses}
      onClick={() => outlineStore.setFocused(item.id)}
      onDoubleClick={() => outlineStore.startEditing(item.id)}
      style={{
        paddingLeft: depth * 28 + 8,
        paddingRight: 8,
        paddingTop: rendered.isHeading ? 12 : 7,
        paddingBottom: rendered.isHeading ? 12 : 7,
      }}
    >
      {/* Chevron toggle */}
      <button
        onClick={hasChildren ? (e) => { e.stopPropagation(); outlineStore.toggleCollapse(item.id) } : undefined}
        className="chevron-toggle w-6 flex items-center justify-center shrink-0 border-none rounded p-0 transition-colors"
        style={{
          height: 28,
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

      {/* Checkbox */}
      <button
        onClick={(e) => { e.stopPropagation(); outlineStore.toggleDone(item.id) }}
        className="item-checkbox shrink-0 flex items-center justify-center border-none rounded-sm p-0 cursor-pointer"
        style={{
          width: 16,
          height: 16,
          marginTop: 6,
          background: item.done ? 'var(--accent)' : 'transparent',
          border: item.done ? 'none' : '1.5px solid var(--text-ghost)',
        }}
      >
        {item.done && (
          <svg
            className="w-2.5 h-2.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--bg-deep)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </button>

      {/* Text content or edit input */}
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={() => outlineStore.updateItemText(item.id, editText)}
          className="flex-1 outline-none rounded px-1"
          style={{
            fontSize: 16,
            lineHeight: 1.75,
            minHeight: 28,
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
            fontSize: 16,
            lineHeight: 1.75,
            minHeight: 28,
            color: item.done ? 'var(--done-text)' : 'var(--text-primary)',
            textDecoration: item.done ? 'line-through' : undefined,
            textDecorationColor: item.done ? 'var(--done-line)' : undefined,
          }}
        >
          {rendered.element}

          {item.tags?.map((tag) => (
            <InlineTag key={tag.label} label={tag.label} type={tag.type} />
          ))}

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
  const styleMap: Record<string, CSSProperties> = {
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
