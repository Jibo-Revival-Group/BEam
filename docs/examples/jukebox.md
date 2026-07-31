# Example: Jukebox (`@be/jukebox`)

Touchscreen **album player** that scans a local `music/` folder. Good template when your skill reads user Dropped-in files rather than bundled assets.

## What it does

- On open, shows a **loading overlay** while scanning `music/`.
- Expects album folders with cover art + audio files.
- Carousel/touch UI to pick and play albums.
- Swipe down to exit (same pattern as Bad Apple).

## File map

```
@be/jukebox/
  package.json
  launch.rule
  index.html
  index.js
  src/
    index.ts
    models/MusicLibrary.ts
    views/MusicView.ts
    views/StatusOverlay.ts
  music/                 # user content — often empty in repo
  resources/
```

## User music location on robot

```
/opt/jibo/Jibo/Skills/@be/jukebox/music/
```

Users add album subfolders here. **`update-beam.sh`** stashes this directory to `/opt/tmp/jukebox-music` before a full BEam update and restores it afterward so libraries are not wiped.

## Loading overlay pattern

`StatusOverlay` (similar to Doom):

1. `open()` immediately shows “Loading Jukebox…”.
2. Heavy scan deferred with `setTimeout(..., 50)`.
3. Watchdog (~12s) shows error if scan hangs.
4. On success, overlay dismissed and `MusicView` shown.
5. On failure, error stays on screen — no silent black face.

This pattern applies to any skill with slow startup (disk scan, network, large init).

## src/index.ts

- `MusicLibrary.scan(assetPack)` — finds albums under `music/`.
- `MusicView` — touch UI bound to scan results.
- Swipe-down subscribe/unsubscribe in open/close.

## Main menu

Top-level button with `"destination": "jukebox"` in `main-menu-verbal.json`.

## Build

```bash
node @be/be/node_modules/jibo-dev/build-jukebox.js \
  /path/to/@be/jukebox
```

## When to copy Jukebox vs Bad Apple

| Need | Copy |
|------|------|
| One bundled video | Bad Apple |
| User-supplied files on disk | Jukebox scan model |
| Loading screen before slow work | Jukebox `StatusOverlay` |

## Related

- [build-and-deploy.md](../build-and-deploy.md) — jukebox stash in `update-beam.sh`
- [patterns/swipe-to-exit.md](../patterns/swipe-to-exit.md)
- [patterns/face-ui.md](../patterns/face-ui.md)
