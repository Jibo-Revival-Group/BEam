# How to add a recipe

This guide describes every step required to add a new recipe to the `@be/recipe`
skill so it shows up in the categories, plays its video, and walks through guided
steps. Paths below are relative to the skill root
(`@be/be/skills/recipe/`).

A recipe is made of three pieces that must all agree on the same `recipeID`:

1. A **source** data file – the full recipe (title, ingredients, steps, video
   object, ratings, etc.).
2. A **curated** data file – a small override layer that supplies the on-device
   `videoURL` and the step text paired with `videoTimestamp`s.
3. A **video file** that the curated `videoURL` points at.

At load time `RecipeModel` does `Object.assign(source, curated)` (curated wins on
matching top-level keys), then builds a `Recipe` from the result. So anything you
put in curated overrides source.

---

## Step 1 – Add the video

Put the MP4 in `video/`, e.g. `video/ChocolateCake_1.mp4`.

Recommended encoding (matches the existing videos):

- Container `.mp4`, video `h264`, audio `aac`
- 1280x720, ~24fps
- **faststart** (moov atom at the front) so it starts without downloading the
  whole file:

```bash
ffmpeg -i input.mp4 -c:v libx264 -c:a aac -vf scale=1280:720 -movflags +faststart video/ChocolateCake_1.mp4
```

Note the total duration (in seconds) — you need it for the step timestamps.

## Step 2 – Create the source data file

Create `data/source/<category>/<name>.json`, where `<category>` is one of the
existing folders: `beef`, `chicken`, `fish`, `vegetarian`, `dessert`. The folder
is only for organization; discovery is by text (see Step 5).

Copy an existing source file (e.g. `data/source/dessert/tiramisuII.json`) and edit
it. The `Recipe` entity (`src/entities/Recipe.ts`) reads these fields:

- `recipeID` (number, **must be unique**), `sourceID`, `title`, `description`,
  `type`, `isSponsored`
- `servings`, `prepMinutes`, `cookMinutes`, `readyInMinutes`
- `ratingAverage`, `ratingCount`, `reviewCount`
- `directions` – array of `{ ordinal, displayValue, videoTimestamp }`
- `ingredients` – array of `{ displayValue, ... }`
- `nutrition`, `topReviews`, `footnotes`, `submitter`, `photo`,
  `similarRecipes`, `adUnit`, `links`
- `video` – object `{ videoID, sourceID, photos }` (its presence is what makes
  `hasVideo()` true and shows the Play Video button)

Keep `directions` and their `videoTimestamp`s consistent with what you put in the
curated file (Step 3). The simplest approach is to make the source `directions`
identical to the curated `directions`.

## Step 3 – Create the curated data file

Create `data/curated/<category>/<name>.json`. This is small. Use
`data/curated/dessert/tiramisuII.json` as the template:

```json
{
  "recipeID": 21412,
  "videoURL": "./video/ChocolateCake_1.mp4",
  "directions": [
    { "ordinal": 1, "displayValue": "Preheat the oven to 350 degrees.", "videoTimestamp": 15000 },
    { "ordinal": 2, "displayValue": "Mix the dry ingredients.", "videoTimestamp": 48000 }
  ]
}
```

Rules:

- `recipeID` **must exactly match** the source file, or the merge is skipped and
  a warning is logged.
- `videoURL` is a path relative to the skill root, always `./video/<file>.mp4`.
  (The skill resolves this to an absolute asset-pack URL at runtime; do not
  hard-code an absolute path.)
- `videoTimestamp` is in **milliseconds** and must be **≤ the video duration**.
  Each entry is where that step begins in the video; they must be strictly
  increasing.
- Do **not** use `<tts ...>` markup in `displayValue` — jibo 14 does not process
  it and it will be read/printed literally.

## Step 4 – Register the recipe in RecipeModel

Open `src/models/RecipeModel.ts` and add a `require` for **both** files, in the
`SOURCE` and `CURATED` arrays. The two arrays are matched by `recipeID`, not by
position, but keep them in the same order for readability:

```ts
const SOURCE = [
  // ...existing entries...
  require('../../data/source/dessert/chocolatecake.json')
];
const CURATED = [
  // ...existing entries...
  require('../../data/curated/dessert/chocolatecake.json')
];
```

A recipe that is not in these arrays will never load.

## Step 5 – Make it discoverable in a category

The category menu buttons (Chicken, Beef, Fish, Dessert, Veggie) filter recipes
by **text search over the title and ingredients**, plus a small keyword map in
`src/utils/Helper.ts` (`CATEGORIES`). To make a recipe show up:

- Easiest: include the category word in the `title` or an ingredient
  `displayValue` (e.g. a beef recipe whose title contains "Beef", a chicken
  recipe containing "Chicken", etc.).
- For `vegetarian` the mapped keywords are `spinach`/`kale`; for `dessert` they
  are `crepes`/`tiramisu`. If your new recipe does not naturally contain one of
  these words, add a keyword to the relevant list in `CATEGORIES` in
  `src/utils/Helper.ts` so it is matched.

"Surprise Me" (recommendations) and "Favorites" do not need any of this.

## Step 6 – Rebuild the bundle

The `.flow` files and all TypeScript/`require`d JSON are compiled into `index.js`.
`.mim` files are read from disk at runtime, but data files are bundled, so **you
must rebuild after adding a recipe**:

```bash
cd @be/be/node_modules/jibo-dev
node build-recipe.js /home/zane/BEast-Skills/@be/recipe
```

Look for `WROTE .../index.js` and no `BUILD ERROR`. (Type-only warnings are
expected and do not block the build.) Then redeploy to the robot.

## Step 7 – Verify

- The recipe appears under its category (or via Surprise Me).
- Play Video shows the picture with working controls, and the scrubber markers
  line up with your `videoTimestamp`s.
- Guided steps read each `displayValue`, and "play this step" jumps the video to
  the matching timestamp.

### Troubleshooting

Open the robot console and watch for `[recipe] ...` logs:

- `video src = ...` – the resolved video URL. If it 404s you'll see
  `video error code=4` (src not supported/missing) — check the filename/case and
  that the file is in `video/`.
- `video load timeout ...` – the video never became playable within 12s (often a
  too-large/slow file or a bad encode); re-encode with the Step 1 command.
- `Curated data id does not match the source data id` – the `recipeID`s differ
  between your source and curated files (Step 3).
