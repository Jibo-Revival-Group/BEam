# Example: Jukebox (`@be/jukebox`)

Touchscreen **album player** that scans a local `music/` folder and browses with
native Jibo **MenuViews**. Good template when your skill reads user-dropped files
and should still feel like built-in Jibo UI.

## What it does

- On open, shows a **loading overlay** while scanning `music/`.
- Expects album folders with cover art + audio files.
- **Album MenuView** → **Track MenuView** → **now-playing** chrome (cover left, details right).
- Swipe down: player → tracks → albums → exit.

## File map

```
@be/be/skills/jukebox/
  package.json
  launch.rule
  index.html
  index.js
  src/
    index.ts
    models/MusicLibrary.ts
    views/JukeboxMenus.ts
    views/PlayerOverlay.ts
    views/StatusOverlay.ts
    audio/AudioSupport.ts
  music/                 # user content — often empty in repo
```

## User music location on robot

Canonical path (survives Skills / `@be/be` OTA):

```
/opt/jibo/Knowledge/jukebox/music/
```

If that folder is empty, BEacon and Jukebox migrate a populated legacy location
(e.g. Skills-tree paths or `/opt/tmp/jukebox-music`) into Knowledge once.
Official `@be/be` OTA (`update-beam.sh` / BEacon Update) only replaces
`/opt/jibo/Jibo/Skills/@be/be`, so Knowledge music is left alone.

## UI flow

1. `StatusOverlay` — immediate paint while `MusicLibrary.scan()` runs.
2. `JukeboxMenus.showAlbums()` — dynamic `MenuView` (SkillButtons, purple like the main-menu tile).
3. Tap album → `showTracks()` — ActionBigButtons; optional **Now playing** when audio is active.
4. Tap track → `PlayerOverlay.play()` — left side keeps the **album cover** until usable lyrics are found on lrclib.net (instrumental / missing lyrics stay on cover); with lyrics, synced lines show by default (tap to toggle cover). Right side has track / album / artist + transport + seek.
5. Swipe-down navigates back through the stack; from albums, exits the skill.

Nested `music/Artist/Album/` folders fill in **artist** + **albumTitle** for the player.

## Loading overlay pattern

`StatusOverlay` (similar to Doom):

1. `open()` immediately shows “Loading Jukebox…”.
2. Heavy scan deferred with `setTimeout(..., 50)`.
3. Watchdog (~12s) shows error if scan hangs.
4. On success, overlay dismissed and album MenuView shown.
5. On failure, error stays on screen — no silent black face.

## Main menu

Top-level button with `"destination": "jukebox"` in `main-menu-verbal.json`.

## Build

```bash
node @be/be/node_modules/jibo-dev/build-jukebox.js \
  /path/to/@be/be/skills/jukebox
```

## When to copy Jukebox vs Bad Apple

| Need | Copy |
|------|------|
| One bundled video | Bad Apple |
| User-supplied files on disk | Jukebox scan model |
| Native MenuView browsing + media | Jukebox menus + player |
| Loading screen before slow work | Jukebox `StatusOverlay` |

## Related

- [build-and-deploy.md](../build-and-deploy.md) — jukebox stash in `update-beam.sh`
- [patterns/menu-views.md](../patterns/menu-views.md) — MenuView JSON / dynamic configs
- [patterns/swipe-to-exit.md](../patterns/swipe-to-exit.md)
- [patterns/face-ui.md](../patterns/face-ui.md)
