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
- Top center: `SET TO N` + settings.
- Undo bottom-center; show only active play with history.
- Reset paths:
  - Hold-to-reset 3s in top bar (cancel on pointer cancel/up/leave, score change, settings open, overlay/deadlock).
  - Settings reset with confirm.
- Settings modal pauses scoring.
- Disable context menu/text selection/scroll/overscroll/touch callout.
- Safe-area insets required.

## Winner flow
- Fullscreen winner overlay in team color, winner-first final score.
- Overlay duration 3s.
- Tap during overlay => immediate new set + tapped team gets 1.
- After timeout, next tap starts fresh set + tapped team gets 1.

## Platform
- Fullscreen toggle in settings; detect external exit and show dismissible hint.
- Wake lock: API first, hidden muted looping video fallback, re-request on visibility restore.
- Install hint dismissible (persisted).
- Show `Ready offline` after cache ready.
- SW waiting update => toast + reload action (`SKIP_WAITING` flow).
- Boot timeout fallback screen at 12s if app not mounted.

## Session learnings (2026-05-18)
- `vite-plugin-pwa@1.1.0` peer range excludes Vite 8; pin Vite 7.x with exact versions.
- Keep React Compiler plugin enabled in Vite config.
- Do not close session with failing coverage gates; fill adapter/component branch tests first.
