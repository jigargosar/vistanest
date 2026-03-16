Board

# Backlog

1. Icon component consolidation — OutlineTree and TopBar duplicate SVG icons
2. CommandPalette — repeated `if (id)` guard on every command, extract helper
3. OutlineItem — 9 hooks/callbacks wall before JSX, consider grouping or extracting
4. Extract domain types (`OutlineItem`, `VisibleItem`) to shared model file
5. Extract model helpers (getSiblings, buildVisibleItems) as pure functions in model file

# In Progress

# Done

1. ThemeSwitcher — merged two useEffects into one
2. Removed `vitest`, `puppeteer`, and `zustand` devDependencies
