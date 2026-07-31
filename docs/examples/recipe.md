# Example: Recipe (`@be/recipe`)

The **largest** skill added in this repo: voice-driven cooking with category menus, **MP4 playback**, and guided steps synced to video timestamps.

Use Recipe when you need **flows, mims, and NLU** — not for a simple fullscreen clip.

## What it does

- Category menus (Chicken, Beef, Dessert, etc.).
- Recipe detail with ingredients and “Play Video”.
- **PIXI + HTMLVideoElement** playback at 1280×720 with scrubber markers at step timestamps.
- Guided steps read aloud; “play this step” seeks video.
- Swipe down exits (or goes back on some list screens).

## Architecture (high level)

```
src/index.ts          BeSkill — showVideo, resolveAssetUri, swipe exit
src/views/            VideoView, PlayerUI, menus, step screens
src/flows/            .flow graphs (jibo-flow)
src/models/RecipeModel.ts   merges source + curated JSON
data/source/          full recipe records
data/curated/         videoURL + step timestamps (overrides source)
video/*.mp4           bundled cooking videos
mims/, rules/         voice / behavior assets
```

Recipe uses **`jibo.face.views.addView`** and PIXI sprites — see [patterns/face-ui.md](../patterns/face-ui.md).

## Adding a new recipe (content only)

Do **not** duplicate the full procedure here. The skill ships an authoritative guide:

**[@be/recipe/ADD.md](../../@be/recipe/ADD.md)**

Summary of that process:

1. Add MP4 to `video/` (H.264, 1280×720, faststart).
2. Create matching `data/source/...` and `data/curated/...` JSON with the same `recipeID`.
3. Register both files in `RecipeModel.ts` `SOURCE` / `CURATED` arrays.
4. Make the recipe discoverable (title/keywords vs category filters).
5. **Rebuild** — JSON is bundled into `index.js`.
6. Verify on robot (video URL, markers, guided steps).

## Build

```bash
node @be/be/node_modules/jibo-dev/build-recipe.js \
  /path/to/@be/recipe
```

Recipe’s original toolchain (`jibo-dev watch`) targets older jibo 5.x; this repo uses the **gulp-free browserify script** above with jibo 14 / be-framework 11.

## Main menu

**Cooking** button — `"destination": "recipe"` in `main-menu-verbal.json`.

## Video URL resolution

Recipe never uses raw `./video/...` in the DOM. `resolveAssetUri()` calls:

```typescript
jibo.utils.PathUtils.getAssetUri(relPath, this.assetPack)
```

See [patterns/assets-and-video.md](../patterns/assets-and-video.md).

## When to copy Recipe

| Need | Copy |
|------|------|
| Menu + voice + multi-screen app | Recipe flows |
| Single video loop | Bad Apple |
| Add another cooking video | Follow ADD.md only |

## Related

- [ADD.md](../../@be/recipe/ADD.md) — add recipes
- [patterns/face-ui.md](../patterns/face-ui.md) — PIXI video path
- [patterns/assets-and-video.md](../patterns/assets-and-video.md)
