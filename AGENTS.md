# Volei Score Agent Profile

## Stack (locked)
- React 19 + TypeScript (strict) + Vite + Tailwind + vite-plugin-pwa.
- Static PWA only. No backend.
- Unit tests only (no integration tests).

## Core gameplay
- Two full-screen tap zones: left=red, right=blue.
- Score on `pointerdown` only.
- Target default `12`; clamp target `3..99`.
- Win: reach target and lead by 2.
- Set point label only if legal next-point win.
- Team cap `99`; `99-99` => deadlock lock + toast + freeze until new set/reset.
- If target change makes current score already winning => invalid-target lock + toast + freeze until reset/new set.

## UI/behavior
- Landscape-first; red left, blue right; huge responsive scores.
- Top bar: full-width dark bar showing `VENCE EM N PONTOS` + settings.
- Undo center; hold ~700ms to undo; show only active play with history.
- Reset paths:
  - Manual reset via Settings with confirm.
  - Deadlock dialog: `Novo set` (direct).
  - Winner overlay: tap to start a new set (direct).
- Settings modal pauses scoring.
- Disable context menu/text selection/scroll/overscroll/touch callout.
- Safe-area insets required.

## Winner flow
- Fullscreen winner overlay in team color, winner-first final score.
- Confetti loops until user tap.
- Tap anywhere on overlay dismisses + resets set to `0-0`.

## Platform
- Fullscreen toggle in settings; detect external exit and show dismissible hint.
- Wake lock: API first, hidden muted looping video fallback, re-request on visibility restore.
- Install hint dismissible (persisted).
- Show `Ready offline` after cache ready.
- SW waiting update => toast + reload action (`SKIP_WAITING` flow).
- Boot timeout fallback screen at 12s if app not mounted.

## Session learnings (2026-05-20)
- Run `scripts/verify.sh` before finishing code changes.
- Extract repeated JSX blocks in same file into separate components in `src/components/`.
- When refactoring: create new component file first, update import in original, then simplify original.
- Keep React Compiler plugin enabled in Vite config.
- `vite preview` uses `command=serve`; base-path logic must key off `mode==='production'`, not `command==='build'`.
- Don’t preload optional chunks (eg confetti) in App; lazy-load from the winner overlay to avoid Lighthouse critical-chain noise.
- If transforming `index.html` (SEO+CSP), hash after any HTML reordering/rewrites so CSP hashes match final inline content.
- Coverage policy: adapters are browser API wrappers; mock adapters in unit tests.
- Coverage gate excludes `src/adapters/**`; enforce coverage on app/components.
- Coverage recovery pattern: add per-component render/interaction tests for `src/components/**` (not only reducer tests).
- Deterministic hold-to-reset tests require mocking `performance.now` + `requestAnimationFrame`.
- For modal overlay behavior, test both backdrop close and inner `stopPropagation` paths.
- TSX + V8 branch coverage can report synthetic JSX branches (eg inline style/handler); use `/* c8 ignore next */` for non-semantic branches before excluding files.
- If branch mapping remains noisy, test `@vitest/coverage-istanbul` as alternate provider and compare signal.
