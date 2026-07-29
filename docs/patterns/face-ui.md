# Face UI patterns

How to show content on Jibo’s **1280×720** face in this repo.

## Two approaches

| Approach | Used by | Best for |
|----------|---------|----------|
| **DOM on `document.body`** | Bad Apple, Doom | Fullscreen video, canvas, simple overlays |
| **PIXI + `jibo.face.views`** | Recipe | Video inside PlayerUI, existing view stack |

## DOM on document.body

Be hosts a WebGL face stack inside `#face`. For some skills, content mounted **inside** `#face` never appeared on the robot. Bad Apple and Doom mount a fixed layer on **`document.body`** instead:

```typescript
const root = document.createElement('div');
root.style.position = 'fixed';
root.style.left = '0';
root.style.top = '0';
root.style.width = '1280px';
root.style.height = '720px';
root.style.zIndex = '99999';
root.style.background = '#000';
document.body.appendChild(root);
```

Put `<video>`, `<canvas>`, or status text inside this root.

**Pros:** Simple, works reliably for fullscreen media, easy status overlays.

**Cons:** Sits outside the PIXI view manager; you manage z-index and cleanup yourself.

### Cleanup

In `close()`:

- Remove event listeners.
- Pause and detach media elements.
- `parentNode.removeChild(root)`.

## PIXI via jibo.face.views (Recipe)

Recipe plays video through:

1. Hidden `HTMLVideoElement` (kept alive for decode/audio).
2. `PIXI.VideoBaseTexture` → `PIXI.Texture` → `PIXI.Sprite` at 1280×720.
3. Sprite added to the skill’s view / PlayerUI movie clip.

**Pros:** Integrates with Recipe’s flows, progress bar, and face view transitions.

**Cons:** More moving parts; overkill for a single looping clip.

## index.html #face

Every skill still ships `index.html` with:

```html
<div id="face"></div>
```

Be expects this shell. DOM-on-body skills use `#face` indirectly (Be/Eye may render beneath your fixed layer).

## Loading overlays

Jukebox and Doom use a **status overlay** on `document.body` before heavy work:

- Show “Loading…” immediately in `open`.
- Defer scan/engine boot with `setTimeout(..., 50)` so the first paint happens.
- Replace overlay with main UI or error text — never silent black.

Bad Apple uses a lighter status div that hides once video `loadeddata` fires.

## Touch

Touch/swipe is handled globally (`screenGesture`), not on individual DOM nodes. Your overlay can use `pointerdown` / `touchstart` for tap-to-unmute (Bad Apple) without blocking swipe-down.

## Recommendations

| Skill type | Recommendation |
|------------|----------------|
| One fullscreen video | DOM + `<video>` (Bad Apple) |
| Interactive 2D UI | DOM or PIXI depending on complexity |
| Multi-step voice + video | PIXI pattern like Recipe |
| Button grid on the face | MenuView JSON — [menu-views.md](menu-views.md) |

## Related

- [menu-views.md](menu-views.md) — MenuView configs, press events, MIM menus
- [assets-and-video.md](assets-and-video.md)
- [examples/bad-apple.md](../examples/bad-apple.md)
- [examples/recipe.md](../examples/recipe.md)
