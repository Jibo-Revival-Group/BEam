# BEacon — BEam's web control panel

BEacon is a small web UI served by the Be host on **port 8123**. Point any browser
on the same network at the robot:

```
http://<jibo-ip>:8123
```

There is no login. Anyone on your LAN who can reach the robot can use it, the same
way the Skills Service Manager on port 8779 is already open.

## What it can do

| Panel | Status |
|-------|--------|
| Status | Version, LAN addresses, resolved paths, uptime |
| Jukebox | Full library management: albums, uploads, covers, rename, delete |
| Jibo eye | Replace the eye texture with your own image, revert to the original |
| Skills | Lists what Be loads and what is on disk; installing is a placeholder |
| Server | Edit jetstream hub and OTA credentials endpoint |

## How it starts

`@be/be/index.html` starts it alongside Be, so BEacon is up whenever Be is:

```js
require('./skills-resolve').install();
require('./beacon').start();
const Be = require("./index");
```

It has no dependencies — only Node's `http`, `fs` and `child_process` — because
`@be/be` ships as a prebuilt browserify bundle and the robot runs Electron 1.4.3
(Node 6). Uploads arrive as raw `PUT` bodies rather than multipart forms, and
images are resized in the browser on a `<canvas>`.

If port 8123 is already taken, BEacon retries once and then gives up quietly;
Be itself is never blocked by it. Set `BEACON_PORT` to use a different port.

## Jukebox

BEacon writes into the same `music/` folder the jukebox skill scans, resolved with
the candidate list from `@be/be/skills/jukebox/src/models/MusicLibrary.ts`:

```
/opt/jibo/Jibo/Skills/@be/Skills/Jukebox/Music               (canonical on robot)
/opt/jibo/Jibo/Skills/@be/be/skills/jukebox/music            (pack-local)
/opt/jibo/Jibo/Skills/@be/skills/jukebox/music               (pre-move legacy)
/opt/jibo/Jibo/Skills/@be/be/node_modules/@be/jukebox/music  (legacy)
/opt/tmp/jukebox-music
<repo>/@be/be/skills/jukebox/music                           (development)
```

Album layout, cover names and accepted audio formats are unchanged: folders are
albums, `Artist/Album/` nests one level, covers are `cover.png` / `cover.jpg` /
`cover.jpeg` / `folder.png` / `folder.jpg`, and tracks are `.mp3`, `.opus`,
`.ogg` or `.oga`. Drop files onto an album card to upload them; the jukebox picks
them up the next time it opens, with no rebuild.

Every path from the browser is resolved inside `music/` and rejected if it tries
to escape, so a malformed request cannot touch the rest of the filesystem.

## Jibo eye

The stock default eye is several byte-identical 720×720 PNGs. jibo.js loads the
first as `DEFAULT_TEXTURES.EYE`; animations address the same look through the
customizer indices and, most often, `White_Eye.png`:

```
res/geometry-config/P1.0/textures/Default_Eye.png            (DEFAULT_TEXTURES.EYE in jibo.js)
res/geometry-config/P1.0/textures/JiBO_eye_customizer_00.png (animation texture DOFs)
res/geometry-config/P1.0/textures/JiBO_eye_customizer_38.png
jibo-anim-db-animations/animations/textures/White_Eye.png   (headtouch / idles / most anims)
(+ a few skill-local White_Eye / white-eye copies of the same image)
```

Applying a custom eye writes your image to **all of those** (upload fails if any
write misses). That is why petting used to snap back to the original eye —
those anims keyframe `White_Eye.png`, which BEacon previously left alone. The
browser centre-crops and redraws whatever you drop at 720×720 first, so any
PNG, JPG, GIF or WebP works. `JiBO_eye_customizer_44.png` is the eye overlay,
not the eye itself, and is left alone. Recipe's distinct `White_Eye.png` is
also left alone.

The eye survives updates and is always revertible:

- Your image is saved to `/opt/tmp/beacon/eye/custom.png`, outside the Skills tree
  that `update-beam.sh` replaces. That directory must be writable by Be;
  `update-beam.sh` and `post-mod.sh` create it with mode `777`. If eye uploads
  fail with `EACCES`, fix it once on the robot:

  ```sh
  mkdir -p /opt/tmp/beacon
  chmod 777 /opt/tmp /opt/tmp/beacon
  ```

- `beacon.start()` ensures the data dir exists, then re-applies a saved custom
  eye on boot when the textures no longer match, which heals the face after an
  update restores the stock PNGs.
- **Revert** copies the pristine PNG from `@be/be/beacon/assets/eye-original/`
  back over all three paths.

PIXI caches the default eye at boot, and animations keep stock White_Eye
textures on KeysData. **Apply to face** (and upload / revert) rewrites the PNGs,
reloads `Default_Eye.png`, hooks `EyeContainer.getTexture` so stock eye paths
always use the live custom texture (so petting/idles cannot snap back), and
updates matching PIXI `BaseTexture`s. If live reload fails, relaunch Be from
the robot (SSM / power cycle) so textures reload from disk.

## Server (jetstream + credentials)

**Jetstream hub** writes `HubClient.override` in
`/usr/local/etc/jibo-jetstream-service.json` (same fields as `point-at-server.sh`),
then kills `jibo-jetstream-service` so it reloads. Presets: `api.openjibo.com:443`,
`api.5x1.com:80`, or any custom host/port.

**OTA credentials** edits only `endpoint` in `/var/jibo/credentials.json`.
`accessKeyId` and `secretAccessKey` are never read into the UI and never
accepted in the request body. If `region` is missing or not `"api"`, it is
forced to `"api"`. Preset: `http://joap.5x1.com:80`.

Robot-only actions refuse to run off-robot.

## Running it off the robot

```bash
node @be/be/beacon/server.js 8123
```

It detects the repo root instead of `/opt/jibo/...`, so the jukebox panel operates
on `@be/be/skills/jukebox/music/` and the eye panel on the textures inside
`@be/be/node_modules/`. Robot-only actions report that they are unavailable
rather than failing.

## HTTP API

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/status` | Versions, addresses, resolved paths |
| GET | `/api/skills` | Registered and on-disk skills |
| POST | `/api/skills/install` | Placeholder, returns 501 |
| GET | `/api/jukebox` | Albums, tracks, ignored folders |
| POST | `/api/jukebox/album` | `{artist, album}` creates a folder |
| PUT | `/api/jukebox/file?album=&name=` | Raw body upload of a track or cover |
| POST | `/api/jukebox/rename` | `{type: album\|track, path, name}` |
| DELETE | `/api/jukebox/album?path=` | Delete a folder and its tracks |
| DELETE | `/api/jukebox/track?path=` | Delete one track |
| GET | `/api/jukebox/cover?path=` | Serve a cover image |
| GET | `/api/jukebox/audio?path=` | Stream a track, supports Range |
| GET | `/api/eye` | Custom-eye state and texture hashes |
| GET | `/api/eye/current.png`, `/api/eye/original.png` | Previews |
| PUT | `/api/eye?name=` | Raw PNG body, applies the eye + live reload |
| POST | `/api/eye/refresh` | Re-write saved eye + reload face textures |
| POST | `/api/eye/revert` | Restore the stock eye + live reload |
| GET | `/api/server` | Jetstream hub state + presets |
| POST | `/api/server` | `{hostname, port}` — write hub override + restart jetstream |
| GET | `/api/credentials` | Credentials endpoint/region (keys never returned) |
| POST | `/api/credentials` | `{endpoint}` only — preserve keys; force region `api` if needed |

## Layout

```text
@be/be/beacon/
  index.js                start()/stop(), called from index.html
  server.js               router; also runnable standalone
  lib/paths.js            robot and repo path resolution
  lib/http-util.js        JSON, raw bodies, static files, traversal guard
  lib/jukebox.js          library operations
  lib/eye.js              apply, revert, self-heal
  lib/skills.js           skill inventory
  lib/system.js           status, hub config, SSM, update runner
  assets/eye-original/    pristine copy of the stock eye
  public/                 the UI (no build step)
```
