# Example: Doom (`@be/doom`) — paused

**Do not use Doom as a template for new skills.** It remains in the repo for reference and possible future hardware, but it was **removed from the main menu** after bad performance on Jibo’s Electron (no native WebAssembly, asm.js fallback, ~1–4 FPS).

Bad Apple replaced the menu slot that previously launched Doom.

## What it was

- Shareware **DOOM** (Chocolate Doom lineage) on the face.
- Touch zones mapped to arrow keys + fire.
- Swipe down to exit.
- Heavy engine: `websockets-doom.js` glue + `websockets-doom.wasm2js.js` (~13MB asm.js on robot).

## Why it stalled

| Issue | Detail |
|-------|--------|
| No WASM | Robot Electron lacks WebAssembly; falls back to wasm2js asm.js |
| CPU bound | Software renderer dominated frame time; blit was not the bottleneck |
| Memory / stability | Large asm source + `abort()` throws risked Be restarts |
| Menu removed | Not viable as a face skill on current hardware |

## Useful patterns (still apply elsewhere)

Doom contributed debugging and UX patterns reused in other skills:

1. **On-screen diagnostics** — FPS/blit HUD when console is unavailable.
2. **`document.body` mount** — same fixed 1280×720 layer as Bad Apple when `#face` hid content.
3. **Swipe-down exit** — shared with Jukebox/Bad Apple/Recipe.
4. **Loading overlay** — `StatusOverlay` on body until first real frame.
5. **Permissions** — `chmod -R a+rX` required for `@be/doom` to load.
6. **Menu redirect race** — main-menu must not `done('')` before async `redirect()` (fixed for Doom launch path).
7. **Block `process.exit`** — Electron has both `window` and `process`; force `ENVIRONMENT_IS_NODE = false` in glue.

## Registration

Doom is still listed in `@be/be/package.json` `jibo.skills` for voice launch (`launch.rule`) but has **no main-menu button**.

## Build

```bash
node @be/be/node_modules/jibo-dev/build-doom.js \
  /path/to/@be/doom
```

Deploy requires both `index.js` and `resources/engine/websockets-doom.wasm2js.js` if experimenting locally.

## Recommendation

For new face media or games on Jibo today:

- **Video / animation** → `@be/bad-apple`
- **Touch + local files** → `@be/jukebox`
- **Voice multi-step** → `@be/recipe`

## Related

- [patterns/face-ui.md](../patterns/face-ui.md)
- [build-and-deploy.md](../build-and-deploy.md)
- [main-menu.md](../main-menu.md) — Bad Apple replaced Doom slot
