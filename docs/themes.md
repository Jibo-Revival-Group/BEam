# Authoring themes and storefronts

A theme is declarative JSON and imagery (PNG, plus SVG for icons). It never executes JavaScript or
installs a skill. ZIP uploads and storefront downloads share validation.

Store and theme HTTPS downloads use a bundled Mozilla CA list because Jibo's
Electron 1.4.3 built-in certificates are outdated. Certificate and hostname
verification remain enabled. The bundle ships inside BEam's `beacon/certs`
directory; maintainers should refresh it when publishing BEam releases (see
that directory's README for provenance and checksum verification).

## Package layout

```text
manifest.json
README.md                 optional store description/details
banner.png                optional storefront card banner (16:9 recommended)
face/
  face.json               optional color and eye scale
  eye.png                 optional open eye
  eyeClosed.png           optional closed eye, deformed like the open eye
  eyeListening.png        optional listening eye, displayed in its original colors
  background.png          optional face background
menu/
  menu.json               optional standard menu layout
  button.png              optional button artwork
icons/                    optional icon overrides (PNG or static SVG)
atex/                     optional animation texture overrides (PNG)
asfx/                     optional animation sound overrides
```

Place the manifest at the ZIP root or within one enclosing directory. GitHub
generated ZIPs work. Notes and other inert repository files are ignored; only
the files above, including supported assets in `icons/`, `atex/` and `asfx/`, are installed. ZIPs are limited to 32 MB compressed, 64 MB
expanded, and 1024 entries. Links, unsafe/duplicate paths, executable files,
invalid checksums, encrypted archives and ZIP64 are rejected.

```json
{
  "name": "Astra",
  "version": "1.0.0",
  "supported": "3.1.6",
  "type": "theme"
}
```

`supported` is optional and means the minimum installed **jibo-tbd** package
version. It is never compared with the Be host or services version. Known older
versions block installation and activation; unknown versions are marked
unverified. Installed package names identify themes across versions. Installing
the same name replaces its installed revision; replacing a theme from another
store URL requires removing the old installation first. ZIP uploads can replace
an installation with the same name for local testing.

Install/upload does not apply. If a theme is active while a new revision is
installed, the previous revision stays active until Apply. Installed themes
work offline and survive BEam updates. Store Update downloads the latest published stable release;
ZIP themes are updated by uploading another ZIP. None restores stock appearance.

## Face configuration

```json
{ "backgroundColor": "#000000", "eyeSize": 100 }
```

`eyeSize` is a percentage of the stock eye: 50 is half size and 300 is triple.
PNG dimensions are independent of displayed size (maximum 4096×4096 and 64 MB
decoded). The eye's normal geometry and movements continue to animate. The
closed texture fades in as the geometry compresses vertically, including
blinking, petting and sleeping; both images undergo the same deformation. A
missing closed-eye image uses the open eye. Square eye images give the intended
1:1 mapping. Background images stretch to fill 1280×720 over the configured
color. Omitted face files use stock appearance; omitted eye images use the
stock eye while retaining the supplied scale/background.

`face/eyeListening.png` replaces the normal eye during the native blue listening
mode. Its colors bypass the eye tint, lighting and glow filters. Eye movement,
scaling and closed-eye blending still animate; the closed texture also retains
its original colors while listening. When listening ends, the normal eye and
filters return. Without this file, listening keeps the normal blue appearance.
Animation-specific eye textures remain unchanged.

## Menu configuration

```json
{
  "menuType": "native",
  "buttonColors": false,
  "buttonSize": 95,
  "iconSize": 90,
  "iconPlacement": "x0 y0",
  "textSize": 15,
  "textPlacement": "x0 y45",
  "backgroundColor": "#000000"
}
```

Buttons take `buttonSize` percent of the screen's 720-pixel height. Artwork
preserves aspect ratio. Icons and text use `iconSize` and `textSize` percent of
button height. Placement is relative to the button center: +X moves right, +Y
moves up. Values range from −50 to 50, where 50 reaches the corresponding edge.
Sizes must be finite numbers greater than zero and at most 1000; colors use
`#RRGGBB`. Unknown configuration fields are rejected.

Set `"buttonColors": true` in `menu/menu.json` to color-shift `menu/button.png`
using each MenuView button's existing `colors` pair (including main-menu colors
and native default/confirm/cancel palettes). Artwork luminance maps between the
second color for shadows and the first color for highlights, preserving shading
and transparency. Neutral grayscale artwork gives predictable results; colored
artwork is converted using its luminance. Icons and labels keep their original
colors. Color changes update live, and both native and dynamic menus support
this option. The default is `false`, which preserves the PNG's original colors.
Without `button.png`, the stock artwork retains its native color behavior.

`menuType` is optional and accepts `"native"` (the default) or `"dynamic"`.
Native keeps Jibo's existing page-based swipe behavior. Dynamic lays buttons
out in one continuous horizontal row with 30-pixel gaps: drag to slide the row,
release to coast gently, and stop at any position without snapping to a page.
Buttons may be partially visible at the screen edges. Scrolling stops at the
first and last buttons; short rows are centered. Button labels, touch targets
and actions move together. Page indicators are hidden in dynamic mode.
Changing themes updates open standard menus; None restores native paging.

For example, add `"menuType": "dynamic"` to `menu/menu.json` and upload the
theme ZIP again, then Apply it to test continuous scrolling.

Missing values default to a black background, eye size 100, button size 42,
icon size 70, text size 15, centered icons and `x0 y-40` text placement. An
entirely absent menu section leaves standard menus unchanged. Menu styling
covers shared MenuView buttons, including skill menus; custom skill interfaces
retain their own layout. The adapter fits buttons per horizontal page and
updates swipe spacing and touch bounds. Titles are hidden while themed to give
large buttons the requested screen space. Existing button labels are preserved; icons use matching theme overrides when supplied.

## Icon overrides

Add an optional `icons/` folder with the filenames you want to replace:

```text
icons/clock.png
icons/bad-apple.png
icons/radio.svg
```

Icons match the requested filename across main-menu buttons, shared skill menus,
and PIXI sprites in custom skill interfaces. Paths and URL query strings do not
change the match. PNG and SVG are interchangeable: `icons/radio.svg` replaces
requests for `radio.png` or `radio.svg`. Include only one format for each name.
Custom skills' main-menu `icon.png` also matches their package name, so
`@be/bad-apple` uses `icons/bad-apple.png` (or `.svg`). This package-name match
takes priority over a generic `icons/icon.png` override.

No installed-skill or stock-icon catalog is required. An unused
`icons/bad-apple.png` is accepted and stays available until a skill requests it.
Missing overrides retain the original icon. Icons work without `menu/menu.json`.
Switching themes or selecting None updates open menus and sprites, and custom
skills with `"themes": false` retain their own icons while running.

SVG icons support static shapes, paths, text, gradients, masks, clipping and local
`#id` references. Scripts, event handlers, external resources, foreign markup,
DTD/entities and animation are rejected. Supply positive `width` and `height`
(pixel values), or a `viewBox`; dimensions are limited to 4096×4096. SVG files
are limited to 1 MB and rasterized before renderer upload, with a minimum
330-pixel longest edge. Larger artwork keeps its resolution. Rasterization
preserves aspect ratio and logical display size. PNG icons follow the
normal image limits; both formats count toward the decoded image budget.
SVG support applies to `icons/`; face, button and animation images remain PNG.

ZIP and GitHub packages include `icons/` automatically. For individual-file
storefronts, list required files in the theme manifest:

```json
{
  "name": "Example", "version": "1.0.0", "type": "theme",
  "icons": ["clock.png", "bad-apple.png", "radio.svg"]
}
```

## Animation textures and sounds

Themes can include sparse `atex/` and `asfx/` folders. `atex/` overrides PNGs
from `@be/be/node_modules/jibo-anim-db-animations/animations/textures`, and
`asfx/` overrides audio from that package's `audio` folder. Include only files
you want to replace; omitted assets retain stock behavior. For example:

```text
atex/blackeye_blur1.png
atex/bg/black.png
asfx/ds_bloop_01.mp3
asfx/device/ds_completion_01.m4a
```

Use the exact stock filename. A flat filename such as `ds_bloop_01.mp3` resolves
to its unique stock location. If more than one stock asset has that filename,
include its relative subfolder. Unknown targets and multiple overrides for the
same stock target are rejected. Texture overrides take priority over stock-eye
alias resolution; assets from other skills/packages remain unchanged.

Supported audio extensions are `.wav`, `.mp3`, `.m4a`, `.ogg`, `.oga`, and `.aif`.
Files must match their image/audio format; audio files are limited to 16 MB each.
Activation preloads textures and decodes sounds before changing appearance.
Undecodable audio or more than 64 MB of decoded sound retains the prior theme.
Decoded images together are limited to 256 MB of RGBA pixels, independently of
the 64 MB archive extraction limit and per-image decoding limit. Larger sets of
animation textures can therefore install even when their combined pixel memory
exceeds 64 MB. Errors above the limit identify the image crossing the budget;
reduce dimensions or remove unused textures. PNG, archive path, symlink,
duplicate and extraction limits still apply.

Overrides live in the installed theme's Knowledge package. Stock SDK files are
never overwritten. Switching themes, selecting None, or removing the active
theme restores stock assets for subsequent animation frames and sound playback,
including cached sounds. Sounds already playing finish with their original
buffer. Overrides survive restarts and BEam updates alongside the theme.

ZIPs and GitHub repository downloads automatically include these folders. For
a storefront serving individual files instead of a ZIP, list the files in the
root `manifest.json` so BEacon can discover them without directory browsing:

```json
{
  "name": "Example", "version": "1.0.0", "type": "theme",
  "atex": ["blackeye_blur1.png", "bg/black.png"],
  "asfx": ["device/ds_completion_01.m4a"]
}
```

Listed files are required downloads; missing files report an error. You can
also use the existing manifest `download` ZIP URL to include these folders.

## Storefront formats

The preferred manifest is:

```json
{
  "themes": [{ "name": "Astra", "url": "https://github.com/ZaneThePython/Astra" }],
  "skills": [{ "name": "Example", "url": "https://github.com/owner/skill" }]
}
```

The example's alternating format also works:

```json
{
  "themes": ["Astra", { "url": "https://github.com/ZaneThePython/Astra" },
             "None", { "url": "." }],
  "skills": ["Placeholder note", "Example", { "url": "https://github.com/owner/skill" }]
}
```

Skills are installable through Store → Skills; see [Custom skills](custom-skills.md).
None is a built-in theme and needs
no download. Relative URLs resolve against the storefront manifest. A source
may also point directly at a theme's manifest or its GitHub repository. GitHub
metadata uses the latest published stable release. Manifest, README, and banner
are read from its tag. Downloads prefer an attached ZIP; when several ZIPs
are attached, name the installable ZIP `<repository>.zip`. With no attached
ZIP, the release tag's source archive is used. The archive manifest must match
the published manifest. Repositories without a release report an error;
there is no fallback to the default branch. Drafts and prereleases are excluded.
GitHub sign-in is required. Rate-limit or
network failures appear on the source; previously cached entries remain usable.

For non-GitHub hosting, link entries to a theme's `manifest.json`. The installer
fetches the standard optional files beside it, or downloads a ZIP specified by
an optional `download` URL in the manifest. Only HTTP/HTTPS without URL credentials
is accepted. A source supports up to 100 entries per section and 20 configured
storefronts.

Store cards use the first non-heading README paragraph, visually limited to two
lines, beneath the optional root `banner.png`. A 16:9 image is recommended;
cards crop it to fill the banner area. Store previews are limited to 2 MB and
use the same PNG validation as installed themes. GitHub banners are fetched
from the release tag and cached in Knowledge for offline browsing; the
banner cache is bounded to 64 MB. Missing banners show a fallback. ZIP installs
also preserve and validate `banner.png`, which never loads into the robot's face
renderer. The Store switch selects Themes or installable custom Skills.
The Store fills the available width and refreshes every one hour after it
has been opened. Installed themes show Remove when the catalog version matches,
and Update when it differs, plus Apply/Active controls on the same cards. ZIP
uploads and installed themes from removed sources stay in this grid. None is
always the first card and restores stock appearance. Separate Themes and Skills
navigation tabs have been merged into the Store. Use the three-dot menu beside
the switch to select Upload Theme ZIP or open Manage Storefronts.
Both management and theme details close on a backdrop click,
Escape, or Close. User-facing compatibility notices say "Needs version …";
the underlying minimum-version check still reads the installed `jibo-tbd` package.

Details renders headings, paragraphs, lists, fenced code, emphasis, HTTP/HTTPS
links and Markdown images using DOM nodes; raw HTML and executable link schemes
cannot run. For example: `![Theme preview](https://example.com/preview.png)`.
Images fit the popup width while preserving their proportions. Relative image
URLs resolve against the README location (at the release tag for GitHub
themes), including after installation. ZIP READMEs can reference packaged theme
images such as `![Eye](face/eye.png)` or `![Banner](banner.png)`; external images
need an absolute HTTP/HTTPS URL. Invalid image URLs render their description,
and image loading failures do not block theme actions.

Failed uploads, downloads and theme actions display an error and release their
controls so they can be retried without restarting BEacon. Downloads and
storefront refreshes and package installations have a two-minute deadline;
texture preparation and other local theme operations are also bounded. Archive
and PNG decoding abort after 30 seconds without output progress, rather than
rejecting a decoder that is still making progress. Decode stall errors identify
the affected file. Downloads run separately from local theme
changes, so a slow storefront does not prevent applying an installed theme or
selecting None. Only one package download runs at a time to bound robot memory.
Interrupted transfers are rejected, cached storefront entries remain available
when refresh fails, and late responses from timed-out operations cannot install
or activate a theme. A browser connection failure can occur after a successful
commit; reopen or refresh the Store to see the current state before retrying.

Theme cards show a progress bar during download, validation and installation.
Archive downloads show a percentage when the server supplies a file size;
otherwise they show an indeterminate bar and downloaded bytes. Storefronts
serving individual files report progress across those files. Progress survives
Store refreshes; failures show an error and allow retry. The read-only
`GET /api/themes/progress?id=<requestId>` endpoint reports the download initiated
with that `requestId` in `POST /api/themes/install`.

## Validation and device acceptance

Run `node tests/themes.test.js`, `node tests/theme-runtime.test.js`,
`node tests/theme-ui.test.js`, `node tests/theme-http.test.js`,
`node tests/theme-animation-assets.test.js`, `node tests/theme-icons.test.js`, `node tests/theme-decoding.test.js`,
`node tests/theme-recovery.test.js`, and
`node tests/theme-node6.test.js`. The last
script also runs under Node 6 to exercise the target runtime's ZIP/PNG decoder.

For device acceptance, use a robot/simulator with jibo-tbd 3.1.6 or newer:

1. Add Astra's repository, install it, and verify appearance stays stock until Apply.
2. Apply and verify its artwork, normal movement, blink/petting/sleep blending,
   main-menu and skill-menu layouts, icons, labels, swipes and taps.
3. Upload another Astra ZIP; confirm the active revision remains unchanged until Apply.
4. Switch to None and verify stock face, menu layout and actions return.
5. Restart Be and apply a BEam update; confirm installed themes, sources and the
   selected appearance survive without network access.
6. Start with a prior custom eye and verify its aliases restore to stock and its
   upload remains inactive. `/api/eye` must return 404.

## Skill theme opt-out

Custom skills may set `"themes": false` in their root `manifest.json`. While
that skill is running, the active theme applies only to the eye. Button art, icons,
menu geometry, backgrounds, `atex` animation artwork, and `asfx` sounds use
their stock or skill-authored assets. Eye size, blink/closed-eye art, and
listening-eye art remain themed. Missing `themes` or `"themes": true` keeps
the default behavior. Theme selection persists normally and resumes in full
after the skill closes; changing themes during the game still respects the
skill's opt-out.
