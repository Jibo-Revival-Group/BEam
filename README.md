# BEam

This is a collection of system-skills. It is intended to work well in 2026, while still staying true to the 2016 design.

These skills are based off Jibo 1.9.2

Here are a few things these skills change:

- Versions are now 2.x.x
- Added a few Be Skills
- Changed 2d eye to 3d eye
- `@be/*` skill packs live under `@be/be/skills/` (not under `node_modules`); Be resolves them via `jibo.skillsRoot`

## Layout

```text
@be/
  be/                # host only (what SSM lists / launches)
  skills/            # idle, main-menu, jukebox, be-framework, …
    idle/
    main-menu/
    …
```

Be resolves `@be/<name>` from `jibo.skillsRoot` → `@be/be/skills/`. Packs live
inside the Be host pack (not as siblings of `be` under `@be/`), so system-manager
only lists `@be/be` as a launchable skill and OTA of `@be/be` ships the packs.

## New Be Skills

- Recipe (aka Cooking): Cooking Videos inside Jibo
- Jukebox: Loads music from local disk
- Bad Apple: Bad Apple!! PV fullscreen on the face; swipe down to exit
- Doom: (paused) Playable shareware DOOM — not currently on the menu

## BEacon

Be starts a web control panel on **port 8123**. Open `http://<jibo-ip>:8123` from
any device on your network to manage the jukebox library, swap Jibo's eye for your
own image (and put the original back), see what skills are loaded, and update BEam.

See [docs/beacon.md](docs/beacon.md).

## Documentation

See [docs/README.md](docs/README.md) for how to create, build, and deploy Be skills.
