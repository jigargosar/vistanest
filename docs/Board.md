Board

# Urgent

# InBasket

# Ready

1. Verify rendering fix — measure React render time after spread-props fix
2. Create docs/mobx-rules.md — document MobX observability rules
3. Audit MobX observability — moveFocus() and deleteItem() wrapper pattern

# In Progress

1. v1 roadmap execution — see docs/v1-roadmap.md
2. Enable persistence (roadmap item 1)
3. Capture perf notes to bench/perf-notes.md, clean timing logs from code

# Done

1. ThemeSwitcher — merged two useEffects into one
2. Removed vitest, puppeteer, and zustand devDependencies
3. Fix getAncestorIds O(N) lookup — items.find() → Map.get(), 145ms → 0.7ms
4. Fix OutlineItem props — pass observable item directly
5. Created v1-roadmap.md
6. Created blind-spots skill
7. Updated global CLAUDE.md with developer profile

# Backlog

1. Icon component consolidation
2. CommandPalette repeated if (id) guard extraction
3. OutlineItem 9 hooks/callbacks wall
4. Extract domain types to shared model file
5. Extract model helpers as pure functions
6. Evaluate Map lookup rule documentation
7. Remove useMemo(renderMarkdown) if unnecessary
8. Investigate toJS() in pushUndo
9. getSiblings O(N) pattern — defer unless perf issue
