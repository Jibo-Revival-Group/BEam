# BEam

This is a collection of system-skills. It is intended to work well in 2026, while still staying true to the 2016 design.

These skills are based off Jibo 1.9.2

Here are a few things these skills change:

- Versions are now 2.x.x
- Added a few Be Skills
- Changed 2d eye to 3d eye
- `@be/*` skill packs live under `@be/skills/` (not under `node_modules`); Be resolves them via `jibo.skillsRoot`

## Layout

```text
@be/
  be/                # host only (what SSM lists / launches)
  skills/            # idle, main-menu, jukebox, be-framework, …
    idle/
    main-menu/
    …
```

Be resolves `@be/<name>` from `jibo.skillsRoot` → `@be/skills/`. Packs are not direct children of `@be/` (only `be` and the `skills/` folder), so system-manager does not treat packs as separate launchable skills.

## New Be Skills

- Recipe (aka Cooking): Cooking Videos inside Jibo
- Jukebox: Loads music from local disk
- Bad Apple: Bad Apple!! PV fullscreen on the face; swipe down to exit
- Doom: (paused) Playable shareware DOOM — not currently on the menu

## Documentation

See [docs/README.md](docs/README.md) for how to create, build, and deploy Be skills.
