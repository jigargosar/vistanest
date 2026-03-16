# Legend-State: Problems, Footguns, and Developer Experience

Research date: 2026-03-16

## 1. Common Complaints and Issues

### The Observer Footgun (Most Frequently Reported)

Forgetting to wrap components with `observer` (or use `use()` / `useValue`) results in
silently non-reactive components. The component renders once with the initial value and
never updates. There is no warning or error -- it just looks broken.

Multiple users in GitHub Issue #148 confirmed this:
- Many expected `get()` alone to make components reactive.
- Some developers dislike HOCs on principle and resisted `observer`.
- The shift from `observer` to `useValue` in v3 means the "correct" pattern has already
  changed once, and older tutorials / Stack Overflow answers teach the obsolete approach.

### Sync and Persistence Bugs

The sync layer (especially the Supabase plugin) has a pattern of production-breaking bugs:

- **Offline-to-online data loss** (Issue #362): Updates made while offline are lost on
  reconnect. Legend-State does not check network connectivity; manual refresh is required
  but no reliable method exists.
- **DELETE events break state** (Issue #586): Using `changesSince: 'all'` with realtime
  subscriptions causes all records to vanish from the UI when a DELETE event fires.
  Described as "critical" and makes `changesSince: 'all'` unusable in production.
- **Partial data retrieval** (Issue #467): Fetching from Supabase sometimes returns only
  one record instead of the full collection.
- **Auto-sync not triggering** (Issue #500): Observables do not sync automatically despite
  documentation claiming they should. Requires manual `syncState(obs$).sync()` calls.
- **syncedCrud fires after waitFor goes false** (Issue #391): The CRUD plugin hits
  endpoints even after the `waitFor` condition resolves back to falsy.
- **Login state not pulled** (Issue #453): Latest backend state is not fetched after
  Supabase login.

### React Compiler Incompatibility

`observer` is **not compatible with React Compiler**. The Compiler wraps function calls
in `useMemo`, which breaks Legend-State's reactive tracking (each `state$.get()` must
return a different value when state changes; memoizing it defeats that).

The official mitigation is to migrate from `observer` + `get()` to `useValue` hooks
(hooks are not memoized by the Compiler). This means any codebase currently using
`observer` will need a full migration pass before adopting React Compiler.

### Testing Story is Missing

The documentation does not mention testing at all. One developer in Issue #148 stated
they were "considering choosing something more complex, with bigger bundle sizes, just for
this particular reason." There are no official testing utilities, guides, or recommended
patterns.

## 2. Learning Curve

### Steep for Newcomers

- **Mental model mismatch**: Developers coming from Redux/Zustand expect plain values.
  Legend-State's observable proxy model (where every property access returns another
  observable) requires understanding when to call `get()`, `peek()`, `use()`, or
  `useValue()` -- and which one to use where.
- **Configuration placement confusion**: Users asked where initialization functions like
  `enableReactTracking` should be called. The answer ("once at the app entry point") is
  not obvious from the docs.
- **Babel plugin docs deleted accidentally**: The docs referenced a Babel plugin multiple
  times but the actual setup instructions were accidentally removed during a docs
  restructure (Issue #148).
- **No Next.js / RSC guidance**: Multiple users requested Next.js App Router and React
  Server Component examples. These were absent.

### API Surface is Large

Legend-State exposes many ways to do the same thing: `get()`, `use()`, `useValue`,
`useSelector`, `observer`, `Memo`, `Computed`, `Show`, `For`, `useObservable`,
`useComputed`. Knowing which to reach for -- and which are deprecated -- requires reading
the migration guide carefully.

## 3. Community Size and Support Quality

### Community Size (Small)

| Metric               | Legend-State       | Zustand (comparison) |
| -------------------- | ------------------ | -------------------- |
| GitHub stars          | ~3,969             | ~56,405              |
| Weekly npm downloads  | ~26,000            | ~9,150,000           |
| Maintainers          | 1 primary (Jay Meistrich) | Multiple (pmndrs team) |

Legend-State is roughly **350x smaller** than Zustand by npm downloads and **14x smaller**
by GitHub stars. It does not appear in the State of React 2025 survey results as a
notable option.

Reddit discussions about Legend-State are essentially non-existent. Searches for
`"legend-state" site:reddit.com` return zero results.

### Support Quality

- The primary maintainer (Jay Meistrich) is responsive on GitHub issues.
- However, single-maintainer risk is real: if the maintainer steps away, the project has
  no succession plan.
- Stack Overflow coverage is minimal.
- No Discord or dedicated community chat was found.

## 4. Breaking Changes History

### v2 to v3 (Major Rewrite)

The v3 release included significant breaking changes:

| Change                         | Impact                                                                 |
| ------------------------------ | ---------------------------------------------------------------------- |
| `persistObservable` removed    | All persistence code must be rewritten using the new sync system       |
| `usePersistedObservable` removed | Same as above                                                        |
| `lockObservable` removed       | No replacement; readonly computed types are no longer possible         |
| `set()` and `toggle()` return void | Code chaining `.set().somethingElse()` breaks silently              |
| `useObservable` with function is now reactive | Must add `peek()` inside if you want non-reactive initial value |
| Computeds only re-run when observed | Computeds with side effects silently stop firing                  |
| `observer` deprecated in favor of `useValue` | Requires migrating every reactive component                 |
| `enableLegendStateReact` deprecated | Global initialization code must change                          |

The v3 migration is non-trivial and touches nearly every file that uses Legend-State.
Users in Issue #148 asked whether deprecating `enableLegendStateReact` would "be a big
refactor for existing code base."

### Earlier Breaking Changes

- `onChange` callback changed from single value to array of changes (batching fix).
- `useComputed` had a bug where `setValue` was undefined on subsequent runs when
  `useMemo` detected dependency changes (Issue #2).

## 5. Real-World Production Usage Reports

### Known Production Users

- **Legend** (the company behind the library) uses it in their own apps.
- **Bravely** is listed as a production user.
- **Yubi** published a blog post about using it for dynamic state management.

### Production Pain Points Reported

- The Supabase sync plugin has had multiple "critical" bugs that break production apps
  (see Sync and Persistence Bugs above).
- A user in Issue #586 was running a patched fork because the official package had an
  unresolved production-breaking bug.
- No reports of large-scale (>3 developers) production usage were found.

### Expert Recommendation

The FullCtx "Hype Buster" review (July 2023) by a senior frontend developer recommended:

> "Go all in with Legend-State only on low-risk projects -- typically meaning side
> projects, internal tooling, PoCs, or any application that won't be developed by more
> than approximately 3 people for a long time."

The reviewer questioned whether Legend-State's raw speed translates into meaningful
business impact (revenue, core web vitals) for most applications.

## 6. Reasons People Switched Away (or Chose Not to Adopt)

Based on the research, the recurring reasons are:

1. **Single maintainer risk**: Betting a production codebase on one person's open-source
   project is a known risk. No corporate backing beyond Legend (a small company).
2. **Small community**: Hard to hire developers who know it. Hard to find answers on
   Stack Overflow or Reddit. Hard to find third-party integrations.
3. **Sync layer instability**: The persistence/sync plugins (especially Supabase) have
   had critical bugs that force users onto patched forks.
4. **Breaking changes**: The v2-to-v3 migration is significant. Users who adopted v2
   patterns (observer, persistObservable) must rewrite substantial portions.
5. **React Compiler incompatibility**: The `observer` pattern is fundamentally
   incompatible with React Compiler, requiring another migration.
6. **No testing story**: Zero documentation on testing. Developers who value testability
   chose other libraries.
7. **Observable mental model**: Developers familiar with plain-object state (Zustand,
   Redux) find the proxy-based observable model harder to debug and reason about.
8. **Documentation gaps**: Missing Babel plugin docs, no Next.js/RSC guidance, incomplete
   API reference, no testing guide.

## Sources

- [GitHub Issues - LegendApp/legend-state](https://github.com/LegendApp/legend-state/issues)
- [Documentation Improvement Discussion - Issue #148](https://github.com/LegendApp/legend-state/issues/148)
- [Production-Ready Discussion - Issue #21](https://github.com/LegendApp/legend-state/issues/21)
- [Supabase Realtime Sync After Back Online - Issue #362](https://github.com/LegendApp/legend-state/issues/362)
- [DELETE Events Break with changesSince - Issue #586](https://github.com/LegendApp/legend-state/issues/586)
- [Supabase Only Getting One Task - Issue #467](https://github.com/LegendApp/legend-state/issues/467)
- [Can't Get Observables to Sync - Issue #500](https://github.com/LegendApp/legend-state/issues/500)
- [syncedCrud waitFor Issue - Issue #391](https://github.com/LegendApp/legend-state/issues/391)
- [Legend-State v3 Migration Guide](https://legendapp.com/open-source/state/v3/other/migrating/)
- [Hype Buster: Legend State - FullCtx Review](https://www.fullctx.dev/p/legend-state-library-fastest-react-review)
- [Legend-State npm page](https://www.npmjs.com/package/@legendapp/state)
- [Legend-State GitHub Repository](https://github.com/LegendApp/legend-state)
- [State of React 2025: State Management](https://2025.stateofreact.com/en-US/libraries/state-management/)
- [Dynamically Managing State with Legend-State - LogRocket](https://blog.logrocket.com/react-state-management-legend-state/)
