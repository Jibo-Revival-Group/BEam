# Custom skills and main menu

Open **Store → Skills** in BEacon to install a skill. It becomes the first
button in Jibo's main menu. An installed card offers **Remove**, or **Update**
when the online manifest version differs. Skills launch from the robot menu;
they have no theme Apply step. An open skill must be closed before removal.
Updates take effect on the next launch after leaving that skill.

Store's three-dot menu includes **Upload Skill ZIP** for local testing and
**Edit Main Menu**. The editor is also available under **More → Main Menu**.
Drag buttons to reorder; surrounding buttons slide into their new slots as you
move, and the dragged button settles into place when released. Escape cancels a
drag, and reduced-motion preferences disable sliding. Hover a skill over another for one second to create
a folder. Double-click a folder to widen its button to the right and show its
contents inside the same rounded container on a dark gray background. Neighboring
buttons make room, and folder contents wrap onto additional rows when they do
not fit across the editor.
Drop on a folder's center to move inside; its left and
right edges insert beside the folder. Empty folders are deleted. The Material
folder icon in the top-right corner opens settings for its name, highlight/shadow colors, and
stock icon or uploaded PNG (maximum 2 MB). Uploaded folder icons are scaled down
to fit within 330 × 330 pixels, preserving aspect ratio and transparency. Smaller
icons keep their size. Changes automatically save after five seconds without
another edit, once any active drag or folder dialog finishes. **Save** writes
immediately; failures keep edits available for retry. Jibo uses
it the next time the main menu opens. **Discard changes** reloads the saved
layout. Alt + arrow keys reorder a focused button within its current container;
Enter or Space toggles a focused folder.

## Package format

The store accepts `type: "skill"` alongside themes in both existing storefront
formats and single-repository sources. Bad Apple is the reference package:

```json
{
  "name": "Bad Apple",
  "version": "1.0.0",
  "supported": "3.1.6",
  "type": "skill",
  "buttonColor": "#58586D #282735"
}
```

`buttonColor` is a string containing one or two `#RRGGBB` colors, or an array
with the same values. The first is the highlight, the second the shadow. One
color applies to both; omission uses the default blue pair.

The ZIP contains `manifest.json`, a required `icon.png`, optional `banner.png`
and `README.md`, and the built skill. Its `package.json` may sit beside the
manifest or inside one immediate skill folder, such as `bad-apple/`. A GitHub
ZIP may wrap everything in one enclosing directory. Exactly one package root
is required; dependency packages deeper inside `node_modules/` are supported.

The package must have a unique name `@be/<skill-name>`, `jibo.type` of
`asset-pack`, and a relative JavaScript `main` (default `index.js`) present in
the ZIP. It cannot overwrite built-in skill packages. Ship compiled output,
resources, videos, and any dependencies not supplied by BEam. The installer
never runs npm, build commands, or package lifecycle scripts. Skill JavaScript
runs in the robot process when loaded; this is intentionally executable content.
Theme ZIPs retain their prohibition on executable files.

`supported` remains the minimum installed **jibo-tbd package version**. Equal
and newer versions are accepted; known older versions block installation and
launch. Missing version metadata is shown as unverified. User-facing messages
say "Needs version …" without exposing the internal package name.

Downloads resolve the repository's default branch and use a commit-pinned
archive. GitHub sign-in is required to access the Store, and API errors are
reported without falling back to anonymous Git requests. Repository metadata/stars are
cached for an hour and commits for ten minutes; Store automatically refreshes
hourly. Unavailable stars display `—`. GitHub owners are shown beneath
theme and skill titles. The Skills page displays the requested malware and
official-store review notice; custom sources/uploads are not claimed to be
reviewed by the official store.

## Persistence and failures

Robot data lives outside the BEam distribution:

```
/opt/jibo/Knowledge/beacon/skills/state.json
/opt/jibo/Knowledge/beacon/skills/packages/<revision>/
/opt/jibo/Knowledge/beacon/menu/layout.json
/opt/jibo/Knowledge/beacon/menu/icons/
```

Development checkouts use `/tmp/beam-beacon/` as the base. Sources and cached
catalogs remain in the existing `themes/state.json` so both categories share
storefront management. Removing a source preserves installed packages. Skills
and layouts survive robot restarts and BEam updates and work offline.
Old skill revisions are retained for running instances and cleaned on restart.
Failed ZIP validation/downloads preserve the previous installation, report the
error and release the operation queue for retry. ZIP limits are 32 MB compressed,
64 MB expanded, and 1,024 entries; unsafe paths, duplicate names, links, special
files, checksum errors, and malformed icons/banners are rejected.

Menu layouts store references to installed/built-in buttons, not executable
actions. Folder names, colors, icons, duplicate IDs, nesting and counts are
validated on save. Existing Fun stuff and Personal Report folders seed the
first editor view. New installations are inserted ahead of existing root
items; updates preserve placement, and removal prunes empty folders. Native
MenuView renders all folders, keeping theme styles and either native or smooth
scrolling. Each saved layout/folder has its own view ID to prevent the SDK from
reusing stale menu buttons.

## APIs and validation

- `GET /api/skills` includes built-in and custom inventory.
- `GET /api/skills/custom` returns installed custom packages.
- `POST /api/skills/install` accepts `entryId` and optional `requestId`.
- `GET /api/skills/progress?id=…` returns download progress/errors.
- `PUT /api/skills/upload?name=…` accepts raw ZIP bytes.
- `DELETE /api/skills?id=…` removes a custom skill.
- `GET /api/skills/asset?id=…&name=icon.png` serves icons/banners.
- `GET /api/menu` returns layout, available buttons and stock icons.
- `POST /api/menu` accepts `{ "tree": […] }` and returns the saved layout.
- `GET /api/menu/icon?name=…` serves a validated stock/custom folder icon.
- `PUT /api/menu/icon` accepts raw PNG bytes with both dimensions at most 330 pixels
  and returns an icon identifier. The editor resizes larger images before upload.

Run `node tests/custom-skills.test.js`, `node tests/custom-skills-http.test.js`,
`node tests/custom-skills-node6.test.js`,
`node tests/menu-runtime.test.js`, and `node tests/menu-editor-browser.test.js`
(the browser test requires Playwright/Chromium). Also run the theme regression
tests; the existing theme installer, shared MenuView styling, and store APIs
are reused. Physical robot playback and touch testing remain necessary before
release.
