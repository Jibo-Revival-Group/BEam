# BEacon — BEam's web control panel

**Etc → Agent Mode** configures private robot-side LLM conversations with
OpenAI, Claude, Gemini, OpenRouter, Ollama, OpenClaw, or a custom endpoint.
See [Agent Mode setup and behavior](agent-mode.md).

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
| Status | Version, network address, uptime; Advanced for folders |
| Screen | Live view of Jibo's 1280×720 face; tap/drag to touch; swipe down to leave a skill |
| Music | Full library management: albums, uploads, covers, rename, delete |
| Photos | View saved robot photos, download originals, delete local copies |
| People | Manage the household Loop: add, rename, remove, profile photos; enrollment badges |
| Store | Browse and manage themes and skills, restore None, upload ZIPs, and manage storefronts via the three-dot menu |
| Setup | First-boot household and BEam/BEnch update after BEetle (API only; UI removed) |
| More | Bright/System/Dark appearance, weather units and home location |
| Server | Edit jetstream hub and OTA credentials endpoint (API only; UI removed) |
| Update | Check / download / apply `@be/be` via jibo OTA tools (API only; UI removed) |

The More (Etc) panel has **Bright / System / Dark** appearance options. System is
the default and follows the viewing device's light/dark preference, including
changes while BEacon is open. Manual choices are saved in that browser and
restored before the page draws. Appearance and weather units use the same
sliding selector as the Store; weather units still use Save to update Jibo.

The WebUI uses rounded cards, consistent form spacing, and a floating navigation
bar. Status and photos use responsive grids; narrow screens stack controls while
all navigation buttons fit without scrolling. Keyboard focus is visible, and reduced-motion
preferences disable decorative transitions.

## How it starts

`@be/be/index.html` starts it alongside Be, so BEacon is up whenever Be is.
If `/var/jibo/beetle-setup.json` has `pending: true`, the same page covers the eye
and shows `Go to http://<lan-ip>:8123 to setup` until the setup marker is cleared and the robot reboots.

```js
require('./skills-resolve').install();
if (require('./setup-screen').isPending()) {
  require('./setup-screen').show();
}
require('./beacon').start();
const Be = require("./index");
```

It has no dependencies — only Node's `http`, `fs` and `child_process` — because
`@be/be` ships as a prebuilt browserify bundle and the robot runs Electron 1.4.3
(Node 6). Uploads arrive as raw `PUT` bodies rather than multipart forms, and
images are resized in the browser on a `<canvas>`.

If port 8123 is already taken, BEacon retries once and then gives up quietly;
Be itself is never blocked by it. Set `BEACON_PORT` to use a different port.

## Screen

The **Screen** panel shows Jibo's face in the browser and lets you touch it
from another device on the LAN. Open BEacon while Be is running on the robot
(standalone `node @be/be/beacon/server.js` cannot see the face).

The live picture is copied from Jibo's face renderer after each paint, then
sent as a 640×360 JPEG a few dozen times per second while the Screen tab is
open and the browser tab is visible.

Tap or drag the picture to send mouse/touch events at 1280×720 face coordinates.
A flick is also recognized as a swipe (including swipe-down to leave a skill).
**Swipe down** fires the same `swipedown` gesture skills use to go back.

## Jukebox

BEacon writes into the same `music/` folder the jukebox skill scans. Canonical
store on the robot is under **Knowledge** so Skills / `@be/be` OTA cannot wipe
albums:

```
/opt/jibo/Knowledge/jukebox/music                            (canonical on robot)
/opt/jibo/Jibo/Skills/@be/Skills/Jukebox/Music               (legacy — migrated once)
/opt/jibo/Jibo/Skills/@be/be/skills/jukebox/music            (pack-local)
/opt/jibo/Jibo/Skills/@be/skills/jukebox/music               (pre-move legacy)
/opt/jibo/Jibo/Skills/@be/be/node_modules/@be/jukebox/music  (legacy)
/opt/tmp/jukebox-music
<repo>/@be/be/skills/jukebox/music                           (development)
```

If Knowledge is empty but a legacy path has albums, BEacon and Jukebox migrate
that library into Knowledge once (rename, else copy).

Album layout, cover names and accepted audio formats are unchanged: folders are
albums, `Artist/Album/` nests one level, covers are `cover.png` / `cover.jpg` /
`cover.jpeg` / `folder.png` / `folder.jpg`, and tracks are `.mp3`, `.opus`,
`.ogg` or `.oga`. Drop files onto an album card to upload them; the jukebox picks
them up the next time it opens, with no rebuild.

Every path from the browser is resolved inside `music/` and rejected if it tries
to escape, so a malformed request cannot touch the rest of the filesystem.

## Photos

The **Photos** panel reads saved image entries from `jibo.kb.media` and serves
their full-size JPEGs from the media service's local store:

```
/opt/jibo/Photos/<photo-uuid>.jpg
/opt/jibo/Photos/cache/<photo-uuid>.jpg
/opt/jibo/Photos/upload/<photo-uuid>.jpg
```

BEacon checks the store root and one immediate subdirectory, including the
media service's `cache/` and `upload/` directories. If the Knowledge Base
media list has not populated its root edges yet, BEacon falls back to those
JPEG files and excludes the standard 330×330 and 720×405 generated thumbnails.

Generated thumbnails are omitted from the list. **Download** retrieves the
original JPEG. **Delete** uses the same behavior as the robot Gallery:
`jibo.media.deletePhoto()` removes the local media and its Knowledge Base
entry; BEacon does not request cloud deletion.

## People

The **People** panel manages the robot's local Loop roster in
`/opt/jibo/Knowledge/jibo/loop`. Add, rename, or remove household members and
upload a 384×384 JPEG profile photo (centre-cropped in the browser). Owner and
robot members cannot be removed; the robot row is hidden from editors. Use
**Make owner** to transfer local ownership (updates `data.type` and the root
`owner` edge). Restart Be if Who-am-I still names the previous owner.

**Cloud loop sync is disabled** in BEnch SSM (`LoopManager` constructed with
`enableCloud: false`). OpenJibo only seeds owner + robot; applying that list
used to wipe BEacon-added people. After deploying that SSM build, re-add any
lost household members here and re-run Introductions for face/voice enrollment.
Holiday / robot / media sync managers stay enabled.

Introductions hides the robot the same way BEacon does (`isJibo`, missing
first name, or `type === 'robot'`), so a named “Jibo Robot” row is not offered
for enrollment.

Face and voice enrollment still happen on-device (Introductions / Who am I).
BEefy recognizes people from `runtime.loop.users` on each speech turn — it no
longer owns household CRUD. Phonetic-name edits still go through SSM so cloud
enrollment stays aligned.

Each person card can hold a private iCal URL for that person's personal report.
BEacon signs the save with `/var/jibo/credentials.json` and sends it to BEefy as
`Loop_20160324.SetCalendarFeed`. The saved URL is not shown again; the card
shows the host, whether the feed is enabled, and the last error. A Google
secret ICS address is a normal https link. If the credentials file is missing,
the calendar controls are hidden; local Loop editing remains available.

## Themes and Store

Storefronts automatically refresh once an hour. Attempt timestamps persist across
restarts, including failed refreshes; cached entries remain available. The
**Refresh** action still lets you request an immediate refresh.

GitHub sign-in is required to use the Store, including cached browsing, source
management, refreshes, and downloads. Choose **Sign in with GitHub** on the Store's
sign-in screen (or in **⋮ → Manage Storefronts**). Open the displayed GitHub link, enter the device code, and
authorize BEacon. Sign-in uses OAuth client ID `Ov23liRcugb5gNBIZj7z` and requests
no additional scopes for public repositories. BEacon respects GitHub's polling
interval and slow-down responses; expired or declined codes can be retried.
**Disconnect GitHub** cancels a pending sign-in or removes the local credential.

The token stays on the robot in
`/opt/jibo/Knowledge/beacon/github/auth.json` (file mode `0600`, directory mode
`0700`), surviving restarts and BEam updates. It is never returned to the browser
and is sent only to HTTPS requests on `api.github.com`, including checks across
redirects. Missing or revoked credentials lock the Store until you sign in again;
GitHub API requests never retry anonymously. Installed themes and skills continue
working on Jibo independently of Store sign-in.

The Store starts with `https://store.5x1.com/manifest.json`. Add another manifest
URL or a single GitHub repository such as `https://github.com/ZaneThePython/Astra`.
Repositories use the default branch and downloads are pinned to the resolved
commit. Storefront refresh failures preserve cached entries. Removing a source
preserves its installed themes and skills. Custom skill installation, ZIP testing,
and the saved menu editor are documented in [Custom skills](custom-skills.md).

The Store's Themes section shows installed packages and **None**, the stock
appearance, alongside available themes. Installed packages remain visible after
their source is removed or when uploaded as ZIPs. **None** uses the cancel icon
and restores the stock face and menus. Use **Upload Theme ZIP** in the three-dot
menu to test a package. The separate Themes and Skills navigation tabs are gone;
Skills has install, update, and removal controls in the Store. For themes, install
or upload first, then select **Apply**. Updates and replacement ZIPs are explicit
and leave the current appearance running until Apply. Removing the active theme
first restores None. Details displays the full README as safe Markdown; store
cards show the first non-heading paragraph in two lines.

Theme state and packages live in `/opt/jibo/Knowledge/beacon/themes`, outside the
Skills tree replaced by OTA. No network access is needed to use installed themes.
Startup waits for the live face renderer and restores the selected revision.
Standalone BEacon saves selections for the next renderer start.

The prior custom-eye feature and `/api/eye` endpoints have been removed. The
first startup restores previously overwritten stock eye aliases from the shipped
pristine image. Old uploads remain as inactive data; they no longer self-heal.

See [themes.md](themes.md) for authoring, ZIP validation, storefront formats,
minimum **jibo-tbd** versions, and device acceptance checks.

## Setup (BEetle first boot)

After [BEetle](../../BEetle/README.md) writes an out-of-box robot, Be hides the eye
and the face tells you to open BEacon while `/var/jibo/beetle-setup.json` is pending.
There is no Setup tab. The same work is available over HTTP:

1. `GET /api/setup` reports whether setup is pending, the robot name, hub `api.5x1.com:443`, and endpoint `http://joap.5x1.com:80`.
2. Household members are added through the People APIs.
3. `POST /api/setup/update` checks every Skills pack plus the BEnch `services` subsystem and applies whatever is offered. A factory-old services version with no published offer is reported as-is. This path does not flash a separate OS or body-board package.
4. `POST /api/setup/finish` clears the pending marker and reboots. The next boot shows the normal eye.

## Server (jetstream + credentials)

**Jetstream hub** writes `HubClient.override` in
`/usr/local/etc/jibo-jetstream-service.json` (same fields as `point-at-server.sh`),
then kills `jibo-jetstream-service` so it reloads. Presets: `api.openjibo.com:443`,
`api.5x1.com:80`, or any custom host/port.

**OTA credentials** edits only `endpoint` in `/var/jibo/credentials.json`.
`accessKeyId` and `secretAccessKey` are never read into the UI and never
accepted in the request body. If `region` is missing or not `"api"`, it is
forced to `"api"`. Public preset: `http://joap.5x1.com:80`.

## Etc

The **Etc** panel (More → Location) can set Jibo's home location two ways:

1. **Find my location** asks `http://ip-api.com/json/` for the public internet
   connection's approximate location. BEacon makes that request on the robot
   and shows the result before changing anything.
2. **Town or city** is a plain text field that writes `home.city` into the
   existing `/jibo/location` Knowledge Base slice. It does not look the name
   up; coordinates and timezone stay as already saved (typically from IP
   detect). If no coordinates exist yet, use Find my location first.

**Use this location** (after IP detect) writes the full location and timezone
into `/jibo/location`; the town Save button only patches the city name. Neither
path uses a Loop server or cloud account.

IP geolocation is approximate: it identifies the network connection, not the
robot's actual physical position. Edit the town name when the IP guess's city
label is wrong (VPN, CGNAT, wrong region). The free ip-api endpoint is
HTTP-only and subject to its usage limits (`BEACON_IP_API_URL` to override).
A running skill may retain the old location until Be is restarted.

## Update (OTA)

The OTA API (and root [`update-beam.sh`](../update-beam.sh)) drives the
same robot tools as a manual OTA for every Skills-root pack it finds
(`@be/be`, `fin-goods-test`, `jibo-diagnostics`, `jibo-tbd`, …):

1. `jibo-mount --rw`
2. `jibo-get-update --credentials /var/jibo/credentials.json --subsystem <name> --version <installed> --filter fcs`
3. On offer: `jibo-download-update` → `/opt/ota/<name>.tar` (verifies `shaHash`)
4. `jibo-apply-update` → that pack’s Skills path

If the service returns `UPDATE_NOT_FOUND` / “Update not found”, that pack is
already current — shown as up to date, not as an error.

Music and custom eyes under `/opt/jibo/Knowledge/` are not part of `@be/be`
apply destinations, so they survive. After applying an update, reboot the robot
to finish.

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
| GET | `/api/store` | Cached theme catalog, source statuses, compatibility |
| GET | `/api/store/details?id=` | Theme metadata and README (catalog or installed ID) |
| POST | `/api/store/refresh` | `{id?, automatic?}` refreshes sources; automatic requests respect the hourly interval |
| GET | `/api/github/auth` | GitHub connection status and pending public device code; no token |
| POST | `/api/github/auth` | Start GitHub device sign-in |
| POST | `/api/github/auth/poll` | Check device authorization, respecting GitHub's polling interval |
| DELETE | `/api/github/auth` | Cancel sign-in and remove the locally saved token |
| GET | `/api/store/sources` | Configured storefronts |
| POST | `/api/store/sources` | `{url}` adds and refreshes a manifest/repository |
| DELETE | `/api/store/sources?id=` | Remove a source, preserve installations |
| GET | `/api/themes` | Installed packages, active/pending revision, renderer status |
| POST | `/api/themes/install` | `{entryId}` installs from the catalog; `{themeId}` updates an installation |
| PUT | `/api/themes/upload?name=` | Raw ZIP upload, install without applying |
| POST | `/api/themes/apply` | `{id}` applies a theme; `{id:null}` selects None |
| DELETE | `/api/themes?id=` | Remove a theme, restoring None if active |
| GET | `/api/themes/asset?id=&name=` | Serve a validated installed PNG |
| GET | `/api/skills` | Registered and on-disk skills |
| POST | `/api/skills/install` | Install or update a custom skill from a storefront |
| GET | `/api/jukebox` | Albums, tracks, ignored folders |
| POST | `/api/jukebox/album` | `{artist, album}` creates a folder |
| PUT | `/api/jukebox/file?album=&name=` | Raw body upload of a track or cover |
| POST | `/api/jukebox/rename` | `{type: album\|track, path, name}` |
| DELETE | `/api/jukebox/album?path=` | Delete a folder and its tracks |
| DELETE | `/api/jukebox/track?path=` | Delete one track |
| GET | `/api/jukebox/cover?path=` | Serve a cover image |
| GET | `/api/jukebox/audio?path=` | Stream a track, supports Range |
| GET | `/api/photos` | List saved full-size robot photos |
| GET | `/api/photos/file?id=` | Serve a photo JPEG; `download=1` downloads it |
| DELETE | `/api/photos?id=` | Delete a photo from the local robot gallery |
| GET | `/api/screen` | `{available, width, height, method, control}` |
| GET | `/api/screen.jpg` | Latest JPEG of the face (`?q=` 20–90) |
| GET | `/api/screen/stream` | MJPEG stream of the face |
| POST | `/api/screen/input` | `{type: pointer\|tap\|swipe, phase?, x?, y?, direction?}` |
| GET | `/api/orchestra` | `{now}` — this robot's clock, in unix milliseconds |
| POST | `/api/orchestra` | Turn to global home (0 degrees), freeze attention, then play `assets/orchestra/Symphony.wav` with an oscilloscope. Attention is released when the clip ends. `{"prepare":true}` gets ready without starting; `{"startAt":<unix ms>}` on a ready robot is the shared downbeat. `{"stop":true}` stops playback, clears the oscilloscope, and releases the hold, including when nothing is playing. Replace that wav to use a different clip. |
| GET | `/api/server` | Jetstream hub state + presets |
| POST | `/api/server` | `{hostname, port}` — write hub override; kill jetstream; reboot to apply |
| GET | `/api/credentials` | Credentials endpoint/region (keys never returned) |
| POST | `/api/credentials` | `{endpoint}` only — preserve keys; force region `api` if needed |
| GET | `/api/location` | Current local `/jibo/location` home and timezone |
| POST | `/api/location/detect` | Detect approximate location through ip-api |
| POST | `/api/location` | `{location}` — save full home/timezone, or `{city}` only to patch the town name |
| GET | `/api/ota` | Discovered Skills-root packs, tool availability |
| POST | `/api/ota/check` | `{subsystem?}` or all — offers / up-to-date / errors |
| POST | `/api/ota/apply` | `{offer}` — NDJSON progress of download + apply |
| GET | `/api/people` | Local loop roster + sync diagnostics + calendar status (no saved URLs) |
| POST | `/api/people` | `{firstName, lastName?, gender?}` — add a member |
| POST | `/api/people/owner` | `{id}` — make that member the local Loop owner |
| PUT | `/api/people` | `{id, firstName?, lastName?, gender?, phoneticName?}` — update |
| DELETE | `/api/people?id=` | Remove a member (not owner/robot) |
| GET | `/api/people/photo?id=` | Serve a local profile photo |
| PUT | `/api/people/photo?id=` | Raw JPEG body — set profile photo |
| DELETE | `/api/people/photo?id=` | Clear profile photo |
| POST | `/api/people/phonetic-name` | `{id, phoneticName}` — spoken name via SSM |
| PUT | `/api/people/calendar` | `{id, icalUrl, isEnabled}` — save that person's personal-report iCal feed |
| DELETE | `/api/people/calendar?id=` | Clear that person's calendar feed |
| POST | `/api/people/calendar/test` | `{id, icalUrl?}` — probe the feed; a blank URL tests the saved one |

## Layout

```text
@be/be/beacon/
  index.js                start()/stop(), called from index.html
  server.js               router; also runnable standalone
  lib/paths.js            robot and repo path resolution
  lib/http-util.js        JSON, raw bodies, static files, traversal guard
  lib/jukebox.js          library operations
  lib/photos.js           saved robot photo listing and deletion
  lib/people.js           local loop roster CRUD and profile photos
  lib/calendars.js        personal-report iCal feeds via signed cloud calls
  lib/screen.js           remote face view and touch input
  lib/themes.js           persistent theme inventory, sources, installation and activation
  lib/theme-package.js    bounded ZIP/PNG and config validation
  lib/theme-store.js      manifest and GitHub resolution
  lib/theme-runtime.js    live eye, background and standard menu adapter
  lib/skills.js           skill inventory
  lib/location.js         local home location, ip-api detection, timezone persistence
  lib/system.js           status, hub config, credentials
  lib/ota.js              jibo-get/download/apply-update
  lib/orchestra.js        play the bundled wav and draw a face oscilloscope
  assets/eye-original/    pristine copy of the stock eye
  assets/orchestra/       Symphony.wav placeholder; replace to change the clip
  public/                 the UI (no build step)
```

BEacon uses Google Material Icons bundled in `public/icons/material/`, with their Apache 2.0 license and attribution. Icons inherit the UI colors in bright and dark modes and require no external font or network connection.
