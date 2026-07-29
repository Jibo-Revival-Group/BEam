# Assets and video

How to ship and play media files from Be skills on Jibo.

## Resolving asset URLs

Do not pass raw relative paths like `./video/foo.mp4` directly to `<video src>` in Be — they resolve against the host document, not your skill pack.

Use Jibo’s asset helper (Recipe pattern):

```typescript
const uri = jibo.utils.PathUtils.getAssetUri('video/bad-apple.mp4', this.assetPack);
video.src = uri;
```

Bad Apple also falls back to `file://` + disk path when probing local dev layouts.

In Recipe, `resolveAssetUri()` in `src/index.ts` wraps the same API for all `./video/...` references.

## Video encoding (robot compatibility)

Jibo’s Electron build is old Chromium. **Use H.264 + AAC in MP4**, not AV1 or exotic codecs.

Recommended ffmpeg recipe (Bad Apple on robot):

```bash
ffmpeg -i input.mp4 \
  -c:v libx264 -profile:v baseline -level 3.1 -pix_fmt yuv420p \
  -vf "scale=854:480:force_original_aspect_ratio=decrease,pad=854:480:(ow-iw)/2:(oh-ih)/2" \
  -r 24 -c:a aac -b:a 128k -ac 2 -movflags +faststart \
  video/bad-apple.mp4
```

Guidelines:

- **`-movflags +faststart`** — moov atom at front; playback starts without full download.
- **480p–720p** — balance quality and decode cost on the robot.
- **Baseline profile** — widest hardware/software decode support.
- **Avoid AV1** — fails or stutters on old Electron even if it plays on a dev machine.

Recipe’s existing videos target **1280×720** H.264; see `@be/recipe/ADD.md` Step 1 for the same advice.

## Shipping files

List asset directories in the skill’s `package.json`:

```json
"files": [
  "video",
  "resources",
  "index.*",
  "launch.rule"
]
```

Copy those folders to the robot with the built `index.js`. Videos are **not** inside the browserify bundle.

## Volume

Control playback level on the `HTMLVideoElement`:

```typescript
video.volume = 0.20;  // 0.0 – 1.0
```

Bad Apple sets `0.20` in `BadAppleView.ts` (initial play and tap-to-unmute fallback).

Autoplay policies may require **`muted = true`** first, then unmute on user tap — Bad Apple tries unmuted first and uses tap handlers if `play()` is blocked.

## Third-party media

Ship a **NOTICE** file if the asset is not yours to redistribute (Bad Apple includes Touhou/Alstroemeria attribution and “place your own copy” language).

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `video error code 4` | Wrong path, missing file, or unsupported codec |
| Load hangs | Re-encode with `faststart`; check file size |
| Silent playback | Autoplay block — tap to unmute; check `volume` |
| Works on PC, not robot | Re-encode to H.264 baseline; avoid AV1 |

## Related

- [face-ui.md](face-ui.md)
- [build-and-deploy.md](../build-and-deploy.md)
- [examples/bad-apple.md](../examples/bad-apple.md)
