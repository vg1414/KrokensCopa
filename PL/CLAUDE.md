# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Upload Workflow
1. Open index.html locally in browser
2. Ask if it looks good
3. If OK: rename existing index.html on GitHub to index_old.html
4. Push new index.html
5. Link to GitHub Pages: https://vg1414.github.io/KrokensCopa/

## Project Overview
Krokens Copa – Premier League tipping game for a group of friends. Swedish-language UI. Single `index.html` with all CSS and JS embedded. No build system – open directly in browser.

## Architecture
**Single-file app** (`index.html`, ~2835 lines). No framework, no bundler.

**Firebase Realtime Database** (hardcoded config in file) with these data paths:
- `matches` – array of match objects (`id`, `homeTeam`, `awayTeam`, `league`, `date`, `actualOutcome`, `actualScore`, `apiMatchId`)
- `predictions` – `{matchId: {player: "1"|"X"|"2"}}`
- `exactPredictions` – `{matchId: {player: "homeGoals-awayGoals"}}`
- `passwords` – `{player: sha256hash}`
- `activityLog` – array of log entries (max 100)
- `seasonHistory` – array of archived seasons (name, date, standings with points)
- `players` – array of active player names (dynamic, managed by admin)

**Firebase security rules:** open (`".read": true, ".write": true`). Deployed via `npx firebase-tools deploy --only database` from the `pl/` folder.

**API integrations:**
- `football-data.org` (free tier) – loads PL and CL fixtures and fetches results; requires CORS proxy (`corsproxy.io`) since called client-side. API key hardcoded in the file.
- `v1.hockey.api-sports.io` – legacy function `fetchAPIFootball()` that is unused/dead code from a previous version.

**Performance patterns:**
- `scheduleRender()` – debounced rendering via `requestAnimationFrame`. Firebase listeners call this instead of individual render functions, so multiple data updates in the same frame only trigger one DOM update.
- `pointsCache` / `getCachedPoints(matchId, player)` – points are calculated once per render cycle in `rebuildPointsCache()`, then read from cache. Never call `calculatePoints()` directly in render loops.
- `getStandings()` – shared function for calculating sorted player standings. Used by both `renderLeaderboard()` and `saveSeasonToHistory()`.
- `activateSession(player)` – shared login activation (hides login screen, shows app, sets admin tab, starts auto-fetch). Used by all three login paths.
- `fetchResults()` groups API calls by date+competition (one call per group instead of one per match) and saves all results in a single Firebase write.

**Competition support:**
- PL (Premier League) – matchday-based grouping
- CL (Champions League) – stage-based grouping with Swedish stage labels (`CL_STAGE_LABELS`)
- VM (World Cup) – added for future use
- Admin can select PL / CL / VM / BOTH (PL+CL) and configure separate round counts per competition

**Scoring logic** (`calculatePoints`): Points are awarded inversely by how many players got the same correct prediction, using a dynamic formula based on player count:
```
points = Math.round(100 * (totalPlayers - samePredCount) / (totalPlayers - 1))
```
- Examples with 6 players: 1 correct = 100p, 2 = 80p, 3 = 60p, 4 = 40p, 5 = 20p, 0 if wrong
- +50 bonus if exact score also correct (awarded regardless of whether 1X2 was correct)
- Postponed matches = 0p for everyone

**Tipping deadline**: Tipping locks for ALL matches once the first match in the current batch has started (`isFirstMatchStarted()`). Players cannot change predictions after this.

**Admin** (Hefner only):
- Load PL/CL/VM rounds via API
- Reset predictions/results
- Set match results manually via modal
- View activity log
- Toggle auto-fetch (runs every 15 min via `setInterval`)
- Save season to history (archives current standings to `seasonHistory`)
- Manage players (add/remove players dynamically via Firebase `players` path)

**Sessions**: 10-minute auto-login via `localStorage` (`krokens_session`). Passwords stored as SHA-256 hashes in Firebase. Login is guarded by `passwordsLoaded` flag to prevent race condition.

**Season history**: Completed seasons can be saved to the `Historik` tab by admin. Each season stores: name, date, and full standings (player, points, wins). Season wins are displayed in the leaderboard as 🏆 icons (5 trophies = ⭐ star).

## Key Global State Variables
- `matches`, `predictions`, `exactPredictions`, `passwords`, `activityLog`, `seasonHistory` – synced from Firebase via `onValue` listeners
- `PLAYERS` – dynamic array synced from Firebase `players` path (let, not const)
- `currentUser` – logged-in player name (string)
- `autoFetchInterval` – auto-result fetch state
- `passwordsLoaded` – flag to prevent login race condition
- `pointsCache` – cached points per match/player, rebuilt each render cycle
- `renderScheduled` – debounce flag for `scheduleRender()`

## Players
Dynamic list managed via Firebase `players` path. Default: `['Hefner', 'Majscht', 'Olle', 'Dawod', 'Ante', 'Lennart']`. Hefner is the only admin.

## Important Patterns
- All functions called from `onclick` HTML attributes must be assigned to `window.functionName` (because the script uses `type="module"`)
- Use `push()` for new Firebase entries, `set()` for overwriting
- `renderAdminPlayers()` is called both from the `players` onValue listener and from `handleTab()` when admin tab is opened
- Firebase listeners should call `scheduleRender()` instead of individual render functions
- Use `getCachedPoints()` instead of `calculatePoints()` in render/display code
- Admin panel CSS uses `.admin-section`, `.admin-terminal`, `.admin-select`, `.admin-flex-row` etc. instead of inline styles
