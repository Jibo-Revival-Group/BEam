# Build and deploy

How to compile skills on a dev machine and run them on the robot.

## Build (development machine)

Skills ship TypeScript source under `src/` but Be loads the **browserified** `index.js`. You must rebuild after changing source or bundled JSON.

### Build scripts

Located in `@be/be/node_modules/jibo-dev/`:

| Script | Skill |
|--------|--------|
| `build-bad-apple.js` | `@be/bad-apple` |
| `build-jukebox.js` | `@be/jukebox` |
| `build-recipe.js` | `@be/recipe` |
| `build-doom.js` | `@be/doom` |

Usage:

```bash
node @be/be/node_modules/jibo-dev/build-bad-apple.js \
  /absolute/path/to/@be/be/skills/bad-apple
```

Success looks like:

```
WROTE /path/to/@be/be/skills/bad-apple/index.js
```

Type-only tsify warnings do not block the build. **`BUILD ERROR`** means fix and rebuild.

### What gets bundled

- TypeScript under `src/`
- `require()`’d JSON and flow files (Recipe bundles data files; `.mim` files are often read at runtime)

Large binaries (**video**, **music**) are **not** bundled — they stay on disk under paths listed in the skill’s `package.json` `files` array.

## Deploy to the robot

### What to copy

Minimum for a skill update:

- The whole skill folder under `@be/be/skills/<name>/`, especially **`index.js`** and asset dirs (`video/`, `music/`, etc.)

If you changed registration:

- `@be/be/package.json`

If you changed the menu:

- `@be/be/skills/main-menu/resources/views/*.json`
- `@be/be/skills/main-menu/resources/icons/*.png`

Typical robot paths:

```
/opt/jibo/Jibo/Skills/@be/be/          # host only under @be/
/opt/jibo/Jibo/Skills/@be/be/skills/<skill>/  # asset-packs
```

### Permissions

Be’s loader checks that skill files are readable. A common failure mode is **`require('@be/skill')` module not found** when permissions are wrong or `skills-resolve` cannot see the skills-root folder.

After copying:

```bash
chmod -R a+rX /path/to/@be/be/skills/<skill>
```

For broad updates, `update-beam.sh` uses `chmod 777 -R` on the whole Skills tree (heavy-handed but reliable).

### Restart Be

**Lazy feature skills** (`jibo.lazySkills`): after rebuilding `index.js`, leave
the skill and open it again. Be re-`require`s the pack — no process restart.

**Eager / role skills** (`jibo.skills`) or **new skill ids** added to
`package.json`: Be must restart so the host re-reads config and constructs
core packs.

From `@be/be` on the robot (via SSM / local shell), `update-beam.sh` does:

```bash
curl -s -X POST http://localhost:8779/terminate \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data-raw '{"command":"@be/be"}'

sleep 2

curl -s -X POST http://localhost:8779/launch-dev \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data-raw '{"command":"@be/be"}'
```

Relaunching only the skill without restarting Be is not enough when you add a
**new** skill id to `jibo.skills` / `jibo.lazySkills`.

## Full repo update (update-beam.sh)

Root script [`update-beam.sh`](../update-beam.sh):

1. Backs up existing skill dirs to `old-BEer/`.
2. Downloads Beam from GitHub and extracts into `/opt/jibo/Jibo/Skills/`.
3. **Jukebox special case:** stashes `music/` to `/opt/tmp/jukebox-music` before update and restores it after, so user libraries are not wiped.
4. Runs `chmod 777 -R` on Skills.
5. Terminates and relaunches `@be/be`.

Use this for full BEam upgrades; use selective copy + chmod for single-skill dev iterations.

## Verify on robot

Without console access:

- Be shows **skill-load-errors** at the bottom if `require()` failed.
- Skills like Bad Apple show status text on load failure.
- Main menu tap should transition to the skill; swipe down should return to idle/menu.

With console: watch for `[bad-apple]`, `[jukebox]`, etc. log prefixes.

## Troubleshooting

| Symptom | Likely cause |
|---------|----------------|
| Menu tap, nothing happens | Skill not in `jibo.skills` or redirect race (menu `done` before redirect) |
| Red banner, module not found | Missing `index.js`, wrong path, or permissions |
| Black screen | UI mounted wrong layer — see [patterns/face-ui.md](patterns/face-ui.md) |
| Video error / code 4 | Missing file, wrong encode (use H.264 — see [patterns/assets-and-video.md](patterns/assets-and-video.md)) |

## Related

- [creating-a-skill.md](creating-a-skill.md)
- [architecture.md](architecture.md)
