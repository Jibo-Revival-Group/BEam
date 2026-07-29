# BEast-Skills documentation

This folder documents how to create, build, register, and deploy **Be skills** on Jibo using this repository.

BEast-Skills is a collection of system skills for **Be** (`@be/be`), the host app that loads and runs `@be/*` asset-pack skills. Skill packages live under:

```
@be/be/node_modules/@be/<skill-name>/
```

The robot face is **1280×720** pixels.

## Guides

| Document | What it covers |
|----------|----------------|
| [architecture.md](architecture.md) | How Be loads skills, lifecycle, registration |
| [creating-a-skill.md](creating-a-skill.md) | End-to-end checklist for a new skill |
| [main-menu.md](main-menu.md) | Menu buttons and redirect to skills |
| [build-and-deploy.md](build-and-deploy.md) | Browserify builds, permissions, restart |

## Patterns

| Document | What it covers |
|----------|----------------|
| [patterns/swipe-to-exit.md](patterns/swipe-to-exit.md) | Swipe down to leave a skill |
| [patterns/face-ui.md](patterns/face-ui.md) | DOM vs PIXI on the face |
| [patterns/menu-views.md](patterns/menu-views.md) | MenuView JSON, in-skill menus, MIM menus |
| [patterns/assets-and-video.md](patterns/assets-and-video.md) | Asset URLs, MP4 encoding, volume |

## Examples in this repo

| Document | Skill | When to copy |
|----------|-------|--------------|
| [examples/bad-apple.md](examples/bad-apple.md) | `@be/bad-apple` | Fullscreen video, minimal UI |
| [examples/jukebox.md](examples/jukebox.md) | `@be/jukebox` | Touch UI + local files |
| [examples/recipe.md](examples/recipe.md) | `@be/recipe` | Voice flows + guided steps |
| [examples/doom.md](examples/doom.md) | `@be/doom` | Paused; reference only |

## Quick start

1. Copy the structure of `@be/bad-apple` for a simple skill.
2. Build with `node @be/be/node_modules/jibo-dev/build-bad-apple.js <skill-dir>`.
3. Register in `@be/be/package.json` (`jibo.skills` + `dependencies`).
4. Optionally add a main-menu button (see [main-menu.md](main-menu.md)).
5. Deploy to the robot, `chmod -R a+rX`, restart Be (see [build-and-deploy.md](build-and-deploy.md)).
