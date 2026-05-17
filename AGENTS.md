Create a static React PWA volleyball scoreboard.

Requirements:

- Two fullscreen clickable areas:
  - Left half: Red team
  - Right half: Blue team
- Clicking/tapping a side with `pointerdown` adds 1 point to that team.
- Default target points: `12`.
- User can change target points in settings.
- Winning rule:
  - Team must reach target points.
  - Team must lead by 2 points.
- Show subtle “SET POINT” only when a team can legally win on the next point.
- Maximum score per team: `99`.
- it will suport two language: portgues and english. portuges is default chose
- Be optimized

UI:

- Landscape-first layout.
- Left side always red, right side always blue.
- Huge responsive score numbers.
- Top center: small label showing `SET TO 12`.
- Settings button at top center.
- Undo button always visible as a bottom-center floating button.
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

- Undo is visible during play.
- Undo reverts the last scoring action in the current set.
- Use a history stack.
- Reset clears current scores, winner state, and history, but keeps target points.

PWA/offline:

- Static site only.
- No backend.
- No bundler.
- React loaded from CDN.
- Service worker caches app files and CDN React files.
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
- Fallback:
  - PWA manifest fullscreen
  - CSS `100dvh`
  - no scrolling
  - show hint: `Install app for fullscreen mode`
- Use Wake Lock API to keep screen awake.
- If Wake Lock API is unavailable, use best-effort fallback with hidden looping muted video.
- Re-request wake lock when app becomes visible again.

Architecture:

- Keep implementation minimal.
- Suggested files:
  - `index.html`
  - `app.js`
  - `styles.css`
  - `service-worker.js`
  - `manifest.webmanifest`
- React only for rendering/state.
- No router.
- No global state library.
- No component library.
- Pure CSS animations only.
- Use bold system font stack.
