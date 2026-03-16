import { useState, useRef, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { themeStore, themes } from '../store-mobx/theme-store'

export const ThemeSwitcher = observer(function ThemeSwitcher() {
  const [open, setOpen] = useState(false)
  const currentTheme = themeStore.currentTheme
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return

    function handleClickOutside(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  useEffect(() => {
    if (!open) return

    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open])

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        title="Theme"
        onClick={() => setOpen(!open)}
        className={`topbar-btn w-8 h-8 flex items-center justify-center rounded-md border-none cursor-pointer transition-colors ${open ? 'is-active' : ''}`}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="13.5" cy="6.5" r="2.5" />
          <path d="M17.5 10.5a8.5 8.5 0 1 1-11 0" />
          <circle cx="6" cy="17" r="1.5" />
          <circle cx="12" cy="19" r="1.5" />
          <circle cx="18" cy="17" r="1.5" />
        </svg>
      </button>

      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 top-10 rounded-lg overflow-hidden z-50"
          style={{
            background: 'var(--bg-raised)',
            border: '1px solid var(--border-dim)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
            width: 180,
          }}
        >
          <div
            className="px-3 py-2 text-[11px] font-medium uppercase tracking-wider"
            style={{
              color: 'var(--text-tertiary)',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            Theme
          </div>
          {themes.map((theme) => (
            <button
              key={theme.name}
              onClick={() => {
                themeStore.setTheme(theme.name)
                setOpen(false)
              }}
              className={`theme-option w-full flex items-center gap-3 px-3 py-2 border-none cursor-pointer transition-colors text-left ${currentTheme === theme.name ? 'is-active' : ''}`}
              style={{
                color: currentTheme === theme.name ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontFamily: 'var(--font-body)',
                fontSize: 13,
              }}
            >
              <span
                className="w-4 h-4 rounded-full shrink-0"
                style={{
                  background: theme.swatch,
                  border: '2px solid var(--border-dim)',
                }}
              />
              <span>{theme.label}</span>
              {currentTheme === theme.name && (
                <svg className="w-3.5 h-3.5 ml-auto" style={{ color: 'var(--accent)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
})
