# Architecture

How **Be** loads and runs skills in this repository.

## Overview

**Be** (`@be/be`) is the host application. At startup it reads its own `package.json`, iterates `jibo.skills`, and constructs each skill. The main menu and voice launch rules then redirect into those skills.

```mermaid
flowchart LR
  BePackage["@be/be package.json jibo.skills"]
  Require["require('@be/skill-id')"]
  Construct["new Skill({ assetPack, rootPath })"]
  Registry["be.skills['@be/skill-id']"]
  Menu["main-menu redirectToSkill"]
  Open["skill.open()"]

  BePackage --> Require --> Construct --> Registry
  Menu --> Open
```

## Skill identity

- Skill IDs are **npm package names**, e.g. `@be/bad-apple`, `@be/recipe`.
- Each skill is an **asset-pack**: a folder with `index.html`, bundled `index.js`, assets, and a `launch.rule` for voice.
- On disk, skills live at `@be/be/node_modules/@be/<name>/`.

## Registration (required)

A skill must appear in **both** places in `@be/be/package.json`:

1. **`jibo.skills`** — Be loads these at startup via `require(id)`.
2. **`dependencies`** — ensures the package exists under `node_modules`.

Example:

```json
"jibo": {
  "skills": [
    "@be/bad-apple"
  ]
},
"dependencies": {
  "@be/bad-apple": "^0.1.0"
}
```

If a skill is missing from `jibo.skills`, the menu may redirect to it but Be will not have constructed it. If it is missing from `dependencies`, `require('@be/...')` fails at load time.

## Boot sequence

From `@be/be/index.js`:

1. Read `@be/be/package.json` via `jibo.utils.PathUtils.findRoot()`.
2. For each entry in `jibo.skills`:
   - `require(id)` — loads the skill’s bundled `index.js`.
   - Instantiate `new Skill({ assetPack: id, rootPath: ... })`.
   - Validate it is a `BeSkill` and store in `be.skills[id]`.
3. Wire lifecycle, redirects, and default skills (`@be/idle`, etc.).

Load failures are logged and also surfaced in an on-screen **skill-load-errors** banner (useful when the robot has no console access). Common causes:

- Missing or unreadable `index.js` (forgot to build).
- **`chmod`** — Be checks that `package.json` and `index.js` are readable; use `chmod -R a+rX` on deployed skill folders.

## Entry point

Each skill’s `package.json` declares:

```json
"jibo": {
  "main": "index.html",
  "type": "asset-pack",
  "launchRule": "launch.rule",
  "display-name": "bad-apple"
}
```

`index.html` provides a 1280×720 `#face` div and loads the bundle:

```html
<div id="face"></div>
<script>
  const Skill = require('./index');
  const skill = new Skill();
</script>
```

The bundled `index.js` exports a class extending **`BeSkill`** from `@be/be-framework`.

## Lifecycle hooks

Skills in this repo typically implement:

| Hook | Purpose |
|------|---------|
| `postInit(done)` | Early setup; usually calls `done()` immediately |
| `preload(done)` | Install speech delegate if needed; preload assets |
| `open(result?)` | Skill becomes active — mount UI, start playback |
| `close(done)` | Tear down UI, remove listeners, call `done()` |
| `exit()` | Leave the skill (often triggered by swipe-down) |

Pattern used by Bad Apple, Jukebox, and Doom:

- **`open`**: subscribe swipe-down, defer heavy work with `setTimeout(..., 50)` so the first frame can paint.
- **`close`**: unsubscribe gestures, cleanup views, null references.

## Launch paths

Skills can be opened in two ways:

1. **Main menu** — button `destination` → `@be/<name>` via `redirectToSkill()` (see [main-menu.md](main-menu.md)).
2. **Voice** — `launch.rule` maps utterances to `{skill='\@be/<name>'}`.

Both paths end in the same `open()` on the registered skill instance.

## Face resolution

The display target is **1280×720**. Layout and video should assume this size (scale with CSS `object-fit: contain` or PIXI sprite dimensions as needed).

## Related docs

- [creating-a-skill.md](creating-a-skill.md) — step-by-step new skill
- [main-menu.md](main-menu.md) — menu integration
- [build-and-deploy.md](build-and-deploy.md) — build and robot deploy
