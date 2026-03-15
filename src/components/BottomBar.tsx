const hints = [
  { keys: ['J', 'K'], label: 'navigate' },
  { keys: ['Enter'], label: 'edit' },
  { keys: ['Tab'], label: 'indent' },
  { keys: ['Space'], label: 'toggle' },
  { keys: ['Ctrl+K'], label: 'command palette' },
] as const

export function BottomBar() {
  return (
    <footer
      className="fixed bottom-0 left-0 right-0 h-9 flex items-center justify-center gap-6 px-6 text-xs z-50"
      style={{
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-subtle)',
        color: 'var(--text-ghost)',
      }}
    >
      {hints.map((hint, i) => (
        <div key={hint.label} className="contents">
          {i > 0 && (
            <div
              className="w-px h-3.5"
              style={{ background: 'var(--border-subtle)' }}
            />
          )}
          <div className="flex items-center gap-1.5">
            {hint.keys.map((k) => (
              <kbd
                key={k}
                style={{
                  height: 18,
                  minWidth: 18,
                  fontSize: 10,
                  padding: '0 4px',
                }}
              >
                {k}
              </kbd>
            ))}
            <span>{hint.label}</span>
          </div>
        </div>
      ))}
    </footer>
  )
}
