# Example: Bad Apple (`@be/bad-apple`)

The simplest full skill in this repo: **looping fullscreen video** with swipe-down exit. Use this as the default template for new media skills.

## What it does

- Plays `video/bad-apple.mp4` full face (1280×720 layout, video scaled with `object-fit: contain`).
- Loops until the user swipes down.
- Volume set to **0.20**; tap screen if autoplay blocks audio.
- Launch via main menu **Bad Apple** or voice (“bad apple”, “play bad apple”).

## File map

```
@be/bad-apple/
  package.json
  launch.rule
  index.html
  index.js              # built — deploy this
  src/
    index.ts            # BeSkill shell
    views/
      BadAppleView.ts   # video + DOM mount
  video/
    bad-apple.mp4       # H.264 + AAC (~13MB)
  resources/icons/
    bad-apple.png
  NOTICE
```

## src/index.ts

Thin `BeSkill`:

- `open()` — subscribe swipe-down, defer `BadAppleView.start()` by 50ms.
- `close()` — unsubscribe, `view.cleanup()`.
- Removes menu redirect diagnostic banner if present.

No flows, no mims, no blackboard.

## BadAppleView.ts

Key behaviors:

1. **Mount** fixed 1280×720 root on `document.body` (see [patterns/face-ui.md](../patterns/face-ui.md)).
2. **Resolve video** via `PathUtils.getAssetUri('video/bad-apple.mp4', assetPack)`.
3. **Create** `<video playsinline loop>` at full size.
4. **Play** on `loadeddata`; show errors on `error`.
5. **Tap** handlers to retry unmute/play if blocked.

## launch.rule

```
TopRule = $* (
    (bad apple) |
    (play bad apple) |
    badapple |
    (play badapple)
) $* {skill='\@be/bad-apple'};
```

## Registration

In `@be/be/package.json`:

- `jibo.skills` includes `"@be/bad-apple"`.
- `dependencies` includes `"@be/bad-apple": "^0.1.0"`.

## Main menu

`main-menu-verbal.json` — button id `bad-apple`, `"destination": "bad-apple"`, icon `resources/icons/bad-apple.png`.

## Build

```bash
node @be/be/node_modules/jibo-dev/build-bad-apple.js \
  /path/to/@be/be/node_modules/@be/bad-apple
```

## Deploy checklist

1. `@be/bad-apple/index.js`
2. `@be/bad-apple/video/bad-apple.mp4`
3. `@be/be/package.json` (if first install)
4. Main-menu JSON + icon (if not already on robot)
5. `chmod -R a+rX` and restart Be

## Replace the video

Drop a new MP4 at `video/bad-apple.mp4`. Re-encode for Jibo — see [patterns/assets-and-video.md](../patterns/assets-and-video.md). No rebuild required unless you change TypeScript.

## Related

- [creating-a-skill.md](../creating-a-skill.md)
- [patterns/swipe-to-exit.md](../patterns/swipe-to-exit.md)
