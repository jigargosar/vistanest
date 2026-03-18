import { useRef } from 'react'
import { observer } from 'mobx-react-lite'
import { useKeyStroke, useActiveElement } from '@react-hooks-library/core'
import { ThemeSwitcher } from './ThemeSwitcher'
import { outlineStore } from '../store-mobx/outline-store'

export const TopBar = observer(function TopBar() {
  const filterQuery = outlineStore.filterQuery
  const searchRef = useRef<HTMLInputElement>(null)
  const { activeElement } = useActiveElement()

  useKeyStroke(['/'], (e) => {
    if (
      document.activeElement?.tagName !== 'INPUT' &&
      document.activeElement?.tagName !== 'TEXTAREA'
    ) {
      e.preventDefault()
      searchRef.current?.focus()
    }
  })

  useKeyStroke(['Escape'], (e) => {
    e.preventDefault()
    outlineStore.setFilterQuery('')
    searchRef.current?.blur()
  }, { target: searchRef })

  const isFocused = activeElement === searchRef.current || filterQuery.length > 0

  return (
    <header
      className="fixed top-0 left-0 right-0 flex items-center gap-4 px-6 z-50"
      style={{
        height: 'var(--topbar-h)',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div
        className="shrink-0 select-none text-[15px] font-medium tracking-tight"
        style={{ color: 'var(--text-secondary)' }}
      >
        <span style={{ color: 'var(--accent)' }}>Vista</span>Nest
      </div>

      <nav
        className="flex items-center gap-1.5 shrink-0 ml-2 text-[13px]"
        style={{ color: 'var(--text-tertiary)' }}
      >
        <span className="opacity-40 text-[11px]">/</span>
        <span className="cursor-pointer transition-colors hover:text-[var(--text-secondary)]">
          Lists
        </span>
        <span className="opacity-40 text-[11px]">/</span>
        <span style={{ color: 'var(--text-secondary)' }}>Product Roadmap Q1</span>
      </nav>

      <div className="flex-1" />

      <div className="relative w-[260px] shrink-0">
        <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" />
        <input
          ref={searchRef}
          type="text"
          placeholder="Search items..."
          value={filterQuery}
          onChange={(e) => outlineStore.setFilterQuery(e.target.value)}
          className="w-full h-8 rounded-md pl-8 pr-10 text-[13px] outline-none"
          style={{
            background: isFocused ? 'var(--bg-focus)' : 'var(--bg-raised)',
            border: `1px solid ${isFocused ? 'var(--accent-border)' : 'var(--border-subtle)'}`,
            fontFamily: 'var(--font-body)',
            color: 'var(--text-primary)',
          }}
        />
        <kbd className="absolute right-2 top-1/2 -translate-y-1/2">/</kbd>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <ThemeSwitcher />
        <button className="topbar-btn w-8 h-8 flex items-center justify-center rounded-md border-none cursor-pointer transition-colors" title="Settings">
          <SettingsIcon />
        </button>
      </div>
    </header>
  )
})

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} style={{ color: 'var(--text-tertiary)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  )
}
