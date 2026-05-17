Create a static React PWA volleyball scoreboard.

Requirements:

- Two fullscreen clickable areas:
  - Left half: Red team
  - Right half: Blue team
- Clicking/tapping a side with `pointerdown` adds 1 point to that team.
- Default target points: `12`.
- User can change target points in settings. Minimum allowed value is `3`.
- Winning rule:
  - Team must reach target points.
  - Team must lead by 2 points.
- Show subtle “SET POINT” only when a team can legally win on the next point.
- Maximum score per team: `99`.
- If both teams reach `99`, the set is deadlocked. Show a toast and force-freeze scoring until the user starts a new set.
- If changing target points would make the current scores already satisfy the win condition, show a toast and force-freeze scoring until reset.
- it will suport two language: portgues and english. portuges is default chose
- Be optimized

UI:

- Landscape-first layout.
- Left side always red, right side always blue.
- Huge responsive score numbers.
- Top center: small label showing `SET TO 12`.
- Settings button at top center.
- Undo button as a bottom-center floating button. Only visible during active play (see Undo rules above).
- Reset is inside settings and requires a confirmation modal.
- Settings modal pauses scoring.
- No onboarding screen.
- No team names customization. Only Red and Blue.
- No match/set counters. Only current set score.
- No audio.
- Use haptic vibration only when a valid score change happens.
- Disable context menu, text selection, scrolling, overscroll, and touch callouts.
- Support safe-area CSS for mobile notches and gesture bars.

Winner behavior:

- When a team wins, show fullscreen overlay using the winning team color.
- Overlay text:
  - `RED WINS`
  - or `BLUE WINS`
- Show final score winner-first, for example:
  - `RED WINS`
  - `12 – 8`
  - `BLUE WINS`
  - `12 – 8`
- Include minimalist pure CSS fireworks/confetti.
- Overlay lasts 3 seconds.
- If user taps during the overlay, immediately start a fresh set and give 1 point to the tapped team.
- After overlay disappears, the next tap starts a fresh set and gives 1 point to the tapped team.
- Previous set history does not need to be preserved after a new set starts.

Undo:

- Undo is visible only during active play (history non-empty, no overlay/dialog/settings open). Hidden at 0-0, during settings, winner overlay, or deadlock.
- Undo reverts the last scoring action in the current set.
- Use a history stack.
- Reset clears current scores, winner state, and history, but keeps target points.
- Two reset paths: hold-to-reset (3s, no confirm) in top bar + settings reset with confirm modal.
- Hold-to-reset (3s) cancels if a score changes or settings opens during the hold.

PWA/offline:

- Static site only.
- No backend.
- No bundler.
- Preact + htm loaded from esm.sh CDN.
- Service worker caches app files and CDN Preact files (v2).
- Cache duration target: 1 year.
- First visit requires internet.
- After first successful load, app works offline.
- Show subtle `Ready offline` message after caching completes.
- Show subtle install hint when not installed:
  - `Install this app for fullscreen offline use`
- Install hint is dismissible and dismissal is saved in localStorage.
- PWA manifest should use fullscreen display and landscape orientation.

Fullscreen/wake behavior:

- Add fullscreen option in settings.
- Use Fullscreen API when available.
- Detect when user exits fullscreen (e.g., back gesture); auto-disable the toggle and show a dismissible hint to re-enter or install.
- Fallback:
  - PWA manifest fullscreen
  - CSS `100dvh`
  - no scrolling
  - show hint: `Install app for fullscreen mode`
- Use Wake Lock API to keep screen awake.
- If Wake Lock API is unavailable, use best-effort fallback with hidden looping muted video.
- Re-request wake lock when app becomes visible again.

Update UX:

- Detect a waiting service worker (new version cached) and show a toast with a reload button.
- Show a 12s load timeout fallback: if Preact hasn't mounted, display an error screen with a retry button.

Architecture:

- Keep implementation minimal.
- Files:
  - `index.html` (critical CSS inline, module script in `<head>`)
  - `app.js` (i18n inlined, confetti dynamic import)
  - `confetti.js` (lazy-loaded on winner overlay)
  - `styles.css` (non-critical only, loaded via `media="print"` trick)
  - `service-worker.js`
  - `manifest.webmanifest`
- Preact only for rendering/state.
- No router.
- No global state library.
- No component library.
- Pure CSS animations only.
- Use bold system font stack.

## LCP Optimizations (Session 2026-05-18)
- `<link rel="preconnect" href="https://esm.sh">` + `modulepreload` preact/htm in `<head>`
- Drop unused preloads; move module script to `<head>`
- Inline critical CSS (reset, body, loader, safe-area); external CSS non-blocking
- Inline i18n strings → saves 1 round-trip
- Dynamic `import('./confetti.js')` → removed from critical module graph
- SVG favicon over ICO → 18KB → 635B
- `media="print" onload="this.media='all'"` + `<noscript>` fallback for external CSS
- SW cache bump on structural changes; delete dead files from precache
