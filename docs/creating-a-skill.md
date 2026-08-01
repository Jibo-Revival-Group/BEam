# Creating a skill

End-to-end checklist for adding a new Be skill. Use **`@be/bad-apple`** as the template for a simple skill.

## 1. Create the skill folder

```
@be/skills/<your-skill>/
  package.json
  launch.rule
  index.html
  src/
    index.ts
    views/          # optional
  typings-local/
    index.d.ts
  resources/        # optional icons, etc.
```

Paths below are relative to the skill root unless noted. Packs live under `@be/skills/` (not as direct `@be/<name>` children), so system-manager only lists `@be/be` as a launchable host.

## 2. package.json

Minimal `jibo` block (from Bad Apple):

```json
{
  "name": "@be/bad-apple",
  "version": "0.1.0",
  "main": "index.js",
  "config": { "standalone": true },
  "jibo": {
    "main": "index.html",
    "type": "asset-pack",
    "launchRule": "launch.rule",
    "prompt": "Bad Apple",
    "display-name": "bad-apple"
  },
  "files": [
    "resources",
    "video",
    "index.*",
    "launch.rule",
    "NOTICE"
  ],
  "devDependencies": {
    "@be/be-framework": "^11.0.0",
    "jibo": "^14.0.0"
  },
  "syncDependencies": ["jibo", "@be/be-framework"]
}
```

- **`display-name`** — short name used in menu `destination` (e.g. `bad-apple`).
- **`files`** — list every directory shipped to the robot (videos, music, etc.).

## 3. launch.rule

Voice routing to your skill:

```
TopRule = $* (
    (bad apple) |
    (play bad apple)
) $* {skill='\@be/bad-apple'};
```

Escape the `@` as `\@` in the rule file.

## 4. index.html

Standard face shell:

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Skill</title>
  <style>
    html, body { margin: 0; overflow: hidden; background: #000; }
    #face { width: 1280px; height: 720px; overflow: hidden; }
  </style>
</head>
<body>
  <div id="face"></div>
  <script>
    const Skill = require('./index');
    const skill = new Skill();
  </script>
</body>
</html>
```

## 5. src/index.ts

Extend `BeSkill`:

```typescript
import { BeSkill } from '@be/be-framework';
import jibo = require('jibo');

class MySkill extends BeSkill {
  constructor (assetPack?: any) {
    super(assetPack);
  }

  public postInit (done: () => any): void { done(); }

  public preload (done: (err?: any) => void): void {
    const es: any = (jibo as any).embodied?.speech;
    if (es?.installDelegate) { es.installDelegate(this.assetPack); }
    done();
  }

  public open (result?: any): void {
    // Mount UI, start logic — see patterns/swipe-to-exit.md
  }

  public close (done: () => void): void {
    // Cleanup listeners and DOM
    done();
  }
}

export = MySkill;
```

Add swipe-down exit for fullscreen skills — see [patterns/swipe-to-exit.md](patterns/swipe-to-exit.md).

## 6. typings-local/index.d.ts

Jibo 14 does not ship TypeScript definitions. Use a stub:

```typescript
// Local ambient typings placeholder.
```

## 7. Build script

Add `@be/be/node_modules/jibo-dev/build-<your-skill>.js` (copy from `build-bad-apple.js`) and wire `"build"` in the skill’s `package.json`.

Build:

```bash
node @be/be/node_modules/jibo-dev/build-bad-apple.js \
  /path/to/@be/skills/bad-apple
```

Expect: `WROTE .../index.js`. Type-only tsify warnings are normal.

## 8. Register in Be

Edit `@be/be/package.json`:

1. Add `"@be/your-skill"` to `jibo.skills`.

Do **not** add the skill to Be’s npm `dependencies` — Be resolves packs via `jibo.skillsRoot` → `@be/skills/` (see [architecture.md](architecture.md)).

Redeploy **`@be/be/package.json`** with the skill folder.

## 9. Main menu (optional)

Add a button in `@be/skills/main-menu/resources/views/main-menu-verbal.json` with `"destination": "your-skill"`. See [main-menu.md](main-menu.md).

## 10. Deploy

See [build-and-deploy.md](build-and-deploy.md):

- Copy skill folder + any changed Be/main-menu files.
- `chmod -R a+rX` on deployed paths.
- Restart Be.

## Which example to copy?

| Goal | Start from |
|------|------------|
| Fullscreen video | `@be/bad-apple` — [examples/bad-apple.md](examples/bad-apple.md) |
| Local files + touch UI | `@be/jukebox` — [examples/jukebox.md](examples/jukebox.md) |
| Flows + voice + video | `@be/recipe` — [examples/recipe.md](examples/recipe.md) |

Do **not** use `@be/doom` as a template for new skills (paused; see [examples/doom.md](examples/doom.md)).
