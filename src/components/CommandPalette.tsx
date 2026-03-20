import { useState, useRef, useEffect, useMemo } from 'react'
import { observer } from 'mobx-react-lite'
import { useKeyStroke, useClickOutside } from '@react-hooks-library/core'
import { outlineStore } from '../store-mobx/outline-store'
import { themeStore, themes } from '../store-mobx/theme-store'
import { scrollIntoViewRef } from '../lib/hooks'

interface Command {
  id: string
  label: string
  shortcut?: string
  action: () => void
}

export const CommandPalette = observer(function CommandPalette() {
  const isOpen = outlineStore.commandPaletteOpen
  const focusedId = outlineStore.focusedId

  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  const commands = useMemo((): Command[] => {
    const id = focusedId

    const list: Command[] = [
      { id: 'new-item', label: 'New Item', shortcut: 'Enter', action: () => { if (id) outlineStore.createSibling(id) } },
      { id: 'edit', label: 'Edit Item', shortcut: 'ee', action: () => { if (id) outlineStore.startEditing(id) } },
      { id: 'delete', label: 'Delete Item', shortcut: 'Del', action: () => { if (id) outlineStore.deleteItem(id) } },
      { id: 'indent', label: 'Indent', shortcut: 'Tab', action: () => { if (id) outlineStore.indentItem(id) } },
      { id: 'outdent', label: 'Outdent', shortcut: 'Shift+Tab', action: () => { if (id) outlineStore.outdentItem(id) } },
      { id: 'toggle-done', label: 'Toggle Done', shortcut: 'x', action: () => { if (id) outlineStore.toggleDone(id) } },
      { id: 'undo', label: 'Undo', shortcut: 'Ctrl+Z', action: () => outlineStore.undo() },
    ]

    for (const theme of themes) {
      list.push({
        id: 'theme-' + theme.name,
        label: 'Theme: ' + theme.label,
        action: () => themeStore.setTheme(theme.name),
      })
    }

    return list
  }, [focusedId])

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands
    const lower = query.toLowerCase()
    return commands.filter((cmd) => cmd.label.toLowerCase().includes(lower))
  }, [commands, query])

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [isOpen])

  useEffect(() => {
    if (selectedIndex >= filteredCommands.length) {
      setSelectedIndex(Math.max(0, filteredCommands.length - 1))
    }
  }, [filteredCommands.length, selectedIndex])

  const close = () => outlineStore.setCommandPaletteOpen(false)

  const executeCommand = (cmd: Command) => {
    close()
    cmd.action()
  }

  useKeyStroke(['Escape'], (e) => {
    e.preventDefault()
    close()
  }, { target: dialogRef })

  useKeyStroke(['ArrowDown'], (e) => {
    e.preventDefault()
    setSelectedIndex((i) => Math.min(i + 1, filteredCommands.length - 1))
  }, { target: dialogRef })

  useKeyStroke(['ArrowUp'], (e) => {
    e.preventDefault()
    setSelectedIndex((i) => Math.max(i - 1, 0))
  }, { target: dialogRef })

  useKeyStroke(['Enter'], (e) => {
    e.preventDefault()
    const cmd = filteredCommands[selectedIndex]
    if (cmd) executeCommand(cmd)
  }, { target: dialogRef })

  useClickOutside(dialogRef, close)

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center"
      style={{ background: 'rgba(0, 0, 0, 0.4)', paddingTop: 120 }}
    >
      <div
        ref={dialogRef}
        className="rounded-lg overflow-hidden"
        style={{
          width: 440,
          maxHeight: 380,
          background: 'var(--bg-raised)',
          border: '1px solid var(--border-dim)',
          boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
        }}
      >
        <div
          className="flex items-center px-4 gap-3"
          style={{ height: 48, borderBottom: '1px solid var(--border-subtle)' }}
        >
          <SearchIcon />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0) }}
            className="flex-1 outline-none text-[14px]"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-body)',
            }}
          />
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: 330 }}>
          {filteredCommands.length === 0 && (
            <div className="px-4 py-6 text-center text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
              No matching commands
            </div>
          )}
          {filteredCommands.map((cmd, index) => (
            <button
              key={cmd.id}
              ref={index === selectedIndex ? scrollIntoViewRef : undefined}
              className="command-palette-item w-full flex items-center justify-between px-4 border-none cursor-pointer text-left"
              style={{
                height: 38,
                background: index === selectedIndex ? 'var(--bg-hover)' : 'transparent',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-body)',
                fontSize: 13,
              }}
              onMouseEnter={() => setSelectedIndex(index)}
              onMouseDown={(e) => { e.preventDefault(); executeCommand(cmd) }}

            >
              <span>{cmd.label}</span>
              {cmd.shortcut && (
                <kbd style={{ height: 20, minWidth: 20, fontSize: 10, padding: '0 5px' }}>
                  {cmd.shortcut}
                </kbd>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
})

function SearchIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" style={{ color: 'var(--text-tertiary)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  )
}
