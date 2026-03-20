Board

# Urgent

# InBasket

# Ready

1. Fix styling inconsistencies — see docs/refactoring-plan-fix-styling-inconsistencies.md
2. Verify rendering fix — measure React render time after spread-props fix
3. Create docs/mobx-rules.md — document MobX observability rules
4. Audit MobX observability — moveFocus() and deleteItem() wrapper pattern

# In Progress

1. v1 roadmap execution — see docs/v1-roadmap.md

# Done

- Styling audit + refactoring plan, tailwind-review.md superseded
- Scroll-into-view on focused item + flex layout (remove fixed header/footer)
- Enable persistence + clean test data (roadmap item 1)
- Capture perf notes to bench/perf-notes.md, clean timing logs from code
- ThemeSwitcher — merged two useEffects into one
- Removed vitest, puppeteer, and zustand devDependencies
- Fix getAncestorIds O(N) lookup — items.find() → Map.get(), 145ms → 0.7ms
- Fix OutlineItem props — pass observable item directly
- Created v1-roadmap.md
- Created blind-spots skill
- Updated global CLAUDE.md with developer profile

# Backlog

1. CommandPalette repeated if (id) guard extraction
3. OutlineItem 9 hooks/callbacks wall
4. Extract domain types to shared model file
5. Extract model helpers as pure functions
6. Evaluate Map lookup rule documentation
7. Remove useMemo(renderMarkdown) if unnecessary
8. Investigate toJS() in pushUndo
9. getSiblings O(N) pattern — defer unless perf issue
10. List header scrolls away — move it outside the scroll container (Checkvist keeps header above, only items scroll)
11. Move keyboard.ts out of lib/ — business logic, not a utility
12. Replace @react-hooks-library/core with custom hooks in src/lib/hooks.ts — unmaintained, stale handler bug masked by accidental re-registration
