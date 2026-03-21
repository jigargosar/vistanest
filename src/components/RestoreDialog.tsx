import { useRef, useEffect, useState, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import { outlineStore } from '../store-mobx/outline-store'
import { buildVisibleItems } from '../store-mobx/model'

export const RestoreDialog = observer(function RestoreDialog() {
  const isOpen = outlineStore.restoreDialogOpen
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const deletedItems = outlineStore.deletedItems
  const tree = deletedItems.length > 0 ? buildVisibleItems(deletedItems) : []

  const close = useCallback(() => {
    dialogRef.current?.close()
    outlineStore.restoreDialogOpen = false
  }, [])

  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(0)
      dialogRef.current?.showModal()
    } else {
      dialogRef.current?.close()
    }
  }, [isOpen])

  useEffect(() => {
    if (selectedIndex >= tree.length) {
      setSelectedIndex(Math.max(0, tree.length - 1))
    }
  }, [tree.length, selectedIndex])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog || !isOpen) return
    const stop = (e: KeyboardEvent) => e.stopPropagation()
    dialog.addEventListener('keydown', stop)
    return () => dialog.removeEventListener('keydown', stop)
  }, [isOpen])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, tree.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const vi = tree[selectedIndex]
      if (vi) outlineStore.restoreItem(vi.item.id)
    }
  }

  const onBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) close()
  }

  return (
    <dialog
      ref={dialogRef}
      className="rounded-lg overflow-hidden p-0 m-auto backdrop:bg-black/40"
      style={{
        width: 440,
        maxHeight: 380,
        background: 'var(--bg-raised)',
        border: '1px solid var(--border-dim)',
        boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
        color: 'var(--text-primary)',
      }}
      onKeyDown={onKeyDown}
      onClick={onBackdropClick}
      onClose={() => { outlineStore.restoreDialogOpen = false }}
    >
      <div
        className="flex items-center px-4"
        style={{
          height: 48,
          borderBottom: '1px solid var(--border-subtle)',
          fontFamily: 'var(--font-body)',
          fontSize: 14,
        }}
      >
        Restore deleted items
      </div>

      <div className="overflow-y-auto" style={{ maxHeight: 330 }}>
        {tree.length === 0 && (
          <div
            className="px-4 py-6 text-center text-[13px]"
            style={{ color: 'var(--text-tertiary)' }}
          >
            No deleted items
          </div>
        )}
        {tree.map((vi, index) => (
          <button
            key={vi.item.id}
            className="w-full flex items-center border-none cursor-pointer text-left"
            style={{
              height: 36,
              paddingLeft: 16 + vi.depth * 20,
              paddingRight: 16,
              background: index === selectedIndex ? 'var(--bg-hover)' : 'transparent',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-body)',
              fontSize: 13,
            }}
            onMouseDown={(e) => {
              e.preventDefault()
              outlineStore.restoreItem(vi.item.id)
            }}
          >
            <span className="truncate">{vi.item.text || '(empty)'}</span>
          </button>
        ))}
      </div>
    </dialog>
  )
})
