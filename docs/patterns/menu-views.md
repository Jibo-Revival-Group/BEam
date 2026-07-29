# MenuView patterns

How to show **standard Jibo menu buttons** on the face — the same grid style used by Settings, Clock, and the main menu.

The face is **1280×720**. MenuViews are PIXI views managed by `jibo.face.views`, not DOM overlays.

## MenuView vs main menu

Both use the same underlying **`MenuView`** component, but they serve different roles:

| | Main menu | In-skill MenuView |
|---|-----------|-------------------|
| **Owner** | `@be/main-menu` | Any skill |
| **Config location** | `@be/main-menu/resources/views/*.json` | Your skill’s `assets/` or `resources/views/` |
| **Purpose** | Launch skills from the home grid | Choices inside a skill (settings sub-pages, pause menu, level select, etc.) |
| **Docs** | [main-menu.md](../main-menu.md) | This document |

The main menu is just a large MenuView wired to `redirectToSkill()`. The patterns below apply to **any** MenuView JSON.

## MenuView vs MIM `Menu` GUI

There is a second, related mechanism: **MIM files** can declare a simpler menu in their `gui` block:

```json
"gui": {
  "type": "Menu",
  "data": {
    "title": "Play again?",
    "buttons": [
      { "label": "No", "color": "cancel", "icon": "jibo://resources/actionIcons/cancel.png", "utterance": "no" },
      { "label": "Yes", "color": "confirm", "icon": "jibo://resources/actionIcons/ok.png", "utterance": "yes" }
    ]
  },
  "pause": true
}
```

| | MenuView JSON | MIM `Menu` GUI |
|---|---------------|----------------|
| **When** | You control the view stack in code or flows | A `Mim.Question` / `Mim.Announcement` is running |
| **Buttons** | Full `list` with icons, colors, per-item actions | Compact yes/no or short button rows |
| **Example** | `@be/settings/assets/menu/menu.json` | `@be/circuit-saver/mims/en-us/CS_PlayAgain.mim` |

Use **MenuView JSON** when you need a skill-owned screen you show and hide yourself. Use **MIM Menu GUI** for quick touch targets during a spoken prompt.

## View config shape

Menu configs are JSON files with a top-level `viewConfig` object:

```json
{
  "viewConfig": {
    "type": "MenuView",
    "id": "myMenu",
    "title": "Choose one",
    "listDefault": {
      "menuButtonType": "SkillButton",
      "colors": ["0x00B078", "0x015241"]
    },
    "list": [
      {
        "id": "optionA",
        "label": "Option A",
        "iconSrc": "assets/icons/option-a.png",
        "action": {
          "type": "event",
          "data": {
            "event": "press",
            "intent": "optionA"
          }
        }
      }
    ]
  }
}
```

### Common fields

| Field | Purpose |
|-------|---------|
| `type` | Must be `"MenuView"`. |
| `id` | View id (used by `currentView.id` checks). |
| `title` | Heading above the button grid. |
| `listDefault` | Defaults for every button (`menuButtonType`, `colors`). |
| `list` | Array of button entries. |
| `pause` | When `true`, pauses underlying face content (see Exercise pause menu). |
| `soundSet` | Optional button sound set (e.g. `"main"`). |

### Per-button fields

| Field | Purpose |
|-------|---------|
| `id` | Stable id for the button. |
| `label` | Text on the button. |
| `colors` | Gradient pair `["0xRRGGBB", "0xRRGGBB"]`, or a preset like `"cancel"` / `"confirm"`. |
| `iconSrc` | Icon path relative to the skill, or a core URL (see below). |
| `action` | What happens on tap (see Actions). |

Some menus use `actions` (array) instead of a single `action`, and may include non-button entries like `{ "type": "Label" }` for spacing — see `@be/who-am-i/resources/views/looperYesNo.json`.

### Button types

- **`SkillButton`** — large skill-style tiles (main menu, settings, clock). Default for most grids.
- **`ActionButton`** — smaller action buttons (yes/no layouts).

Set via `listDefault.menuButtonType` or per item.

## Actions

Each button’s `action` (or `actions[]`) tells MenuView what to fire on tap.

### `event` — handle in your code

Best when the skill listens for a custom event:

```json
"action": {
  "type": "event",
  "data": {
    "event": "press",
    "intent": "volumeQuery"
  }
}
```

In TypeScript/JavaScript:

```javascript
const menu = jibo.face.views.createView('MenuView', 'assets/menu/menu.json');
menu.once('press', (event) => {
  // event.intent === 'volumeQuery'
});
jibo.face.views.changeView({ addView: menu });
```

Settings uses this pattern: tap → `event.intent` → `redirect('@be/settings', { nlu: { intent: event.intent } })`.

Exercise’s pause menu fires named events directly (`resumeExercise`, `stopExercise`) without an `intent` field.

### `utterance` — route through NLU

Best when tap should match voice routing:

```json
"action": {
  "type": "utterance",
  "data": {
    "utterance": {
      "intent": "loadMenu",
      "entities": { "destination": "circuit-saver" }
    }
  }
}
```

Main menu buttons and Clock menu items use this so touch and voice share the same intent path.

## Showing and hiding

Create the view, then push it on the face stack:

```javascript
const menu = jibo.face.views.createView('MenuView', 'assets/menu/menu.json', false);

jibo.face.views.changeView({
  addView: menu,
  transitionOpen: jibo.face.views.IN   // optional fade/slide
}, onOpen, onError);
```

Remove when done:

```javascript
jibo.face.views.changeView({ remove: true }, onClosed);
```

### Reusing an already-open menu

If the same menu id is already `currentView`, reuse it instead of creating a second instance:

```javascript
let menu;
if (jibo.face.views.currentView?.id === 'settingsMenu') {
  menu = jibo.face.views.currentView;
} else {
  menu = jibo.face.views.createView('MenuView', 'assets/menu/menu.json');
  jibo.face.views.changeView({ addView: menu });
}
```

See `@be/settings/index.js` (`SettingsMenu`).

### Swipe down to exit

Attach back/close behavior on the view:

```javascript
menu.swipeDownActions = [
  new jibo.face.views.ActionData(jibo.face.views.ActionData.EVENT, {
    event: jibo.face.views.View.BACK
  }),
  new jibo.face.views.ActionData(jibo.face.views.ActionData.MIM_END),
  new jibo.face.views.ActionData(jibo.face.views.ActionData.CLOSE_VIEW)
];
menu.once('closed', () => { /* cleanup */ });
```

## Icons

Paths are relative to the **skill package root**, unless using a core URL:

| Prefix | Example |
|--------|---------|
| Skill asset | `"assets/menu/icons/volume.png"` |
| Main-menu icon | `"resources/icons/circuit-saver.png"` (under `@be/main-menu`) |
| Built-in | `"jibo://resources/actionIcons/ok.png"` |
| Core alias | `"core://resources/actionIcons/cancel.png"` |

Built-in action icons include `ok`, `cancel`, `play`, `pause`, `edit`, `delete`, `time`, `default`, etc. (see `jibo/resources/actionIcons/` on the robot).

## Camera / viewfinder

Face calibration and some skills enable the **camera viewfinder** (`jibo.media.setViewfinder(true, …)`), which draws the live camera feed on the face.

If a MenuView is shown **while the viewfinder is active**, the camera layer can cover or obscure the menu.

**Rule of thumb:** show MenuViews **before** enabling the viewfinder, or **after** disabling it. Level selection, settings navigation, and yes/no prompts should not compete with the camera feed.

## Examples in this repo

| Skill | File | Pattern |
|-------|------|---------|
| `@be/main-menu` | `resources/views/main-menu-verbal.json` | Top-level skill launcher grid |
| `@be/main-menu` | `resources/views/fun-stuff-verbal.json` | Submenu |
| `@be/settings` | `assets/menu/menu.json` | In-skill hub; `press` → redirect by intent |
| `@be/clock` | `resources/views/menu.json` | `utterance` actions for time/date/timer |
| `@be/exercise` | `resources/views/pause_menu.json` | Pause overlay; custom event names |
| `@be/who-am-i` | `resources/views/looperYesNo.json` | Yes/no with `ActionButton` |
| `@be/circuit-saver` | `mims/en-us/CS_PlayAgain.mim` | MIM `Menu` GUI (not MenuView JSON) |
| `@be/radio` | `assets/genreMenus/*/playerMenu.json` | Nested player menus |

**Good templates to copy:**

- **Hub menu with icons** → `@be/settings/assets/menu/menu.json` + settings menu handler in `@be/settings/index.js`.
- **Skill submenu** → `@be/main-menu/resources/views/fun-stuff-verbal.json`.
- **Simple yes/no** → MIM `gui.type: "Menu"` in any `mims/en-us/*.mim` file.

## Minimal checklist

1. Add `assets/.../my-menu.json` with `viewConfig.type: "MenuView"`.
2. Ship the JSON in the skill’s `package.json` `files` list.
3. `createView('MenuView', path)` and `changeView({ addView: menu })`.
4. Listen for `press` (event actions) or rely on NLU (utterance actions).
5. `changeView({ remove: true })` when the user is done.
6. If face calibration follows, show the menu **before** `setViewfinder(true)`.

## Related

- [main-menu.md](../main-menu.md) — top-level menu and `destination` redirects
- [face-ui.md](face-ui.md) — DOM vs PIXI on the face
- [creating-a-skill.md](../creating-a-skill.md) — skill scaffolding
