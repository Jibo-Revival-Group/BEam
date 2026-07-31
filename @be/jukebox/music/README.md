# Jukebox music

Each album or EP is a **folder**. Put a cover image and your audio files inside it.

## Layout

```
music/
  CHASER/
    cover.png
    track-01.mp3
  Some EP/
    cover.jpg
    01 Intro.mp3
    02 Track Two.opus
```

## Rules

- Folder name = album / EP name shown in the cover carousel (underscores become spaces).
- Cover image (optional but recommended): `cover.png`, `cover.jpg`, `cover.jpeg`,
  `folder.png`, or `folder.jpg` (case-insensitive).
- Audio files inside the folder: `.mp3`, `.opus`, `.ogg` / `.oga`.
- Nested `music/Artist/Album/*.opus` also works (each Album is listed).
- Folders with no playable audio files are ignored.
- The skill rescans this directory every time it opens — **no rebuild** to add albums.

## How to load music

1. Add album folders here, commit, and redeploy with `update-beam.sh`, or
2. Copy folders straight onto the robot at
   `/opt/jibo/Jibo/Skills/@be/be/node_modules/@be/jukebox/music/` and relaunch Jukebox.
