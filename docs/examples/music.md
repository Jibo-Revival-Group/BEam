# Built-in music (`@be/music`)

Say “Hey Jibo, play Yes I'm A Mess” or “play Yes I'm A Mess by AJR.”
BEefy sends `playSong` with `nlu.entities.query` and optional `artist` to the
bundled BEam skill. The player searches online and plays the strongest verified
music match. JiboTube and a local Jukebox library are not required. Matching
normalizes punctuation, optional leading articles, small title spelling errors,
and spoken artist initials such as “A J R.” Short titles must match the entire
song title, so “Bang!” does not accidentally select “Bang Bang.”

Music videos and visualizers play above title and artist details. Static images
switch to a square album layout after 12 seconds of low frame change. Sustained
motion restores video. Lyric labels select an audio/album layout, with artwork
matched through MusicBrainz and Cover Art Archive. Missing artwork uses a music
placeholder. Format recognition is heuristic and has no OCR or AI dependency.

The player checks up to five unique candidates per search, then tries one refined
search. Unrelated videos, reactions, reviews, and interviews are rejected. It
speaks “I couldn't find that song” when the search is exhausted. Network and
provider failures have separate on-screen messages. It plays one song without
recommendation autoplay.

When the streaming response omits its music category, the helper checks the
video's watch-page genre metadata with a bounded, cached request. Missing metadata
is not treated as evidence of non-music. Explicit non-music categories still reject
the candidate; verification failures remain provider errors rather than false
“song not found” results. The refined search omits a potentially mistranscribed
artist from the search words, while still checking the artist against each result.

Touch controls provide pause/play, replay, seek ±15 seconds, volume, and stop.
Swipe down or say “Hey Jibo” to interrupt and exit. A new request replaces the
previous player. Artwork and network callbacks are fenced by the active launch;
closing releases decoding, images, requests, timers, listeners, and the helper.

The authenticated helper binds only to localhost on port **18701**. Its token and
cache live under `/opt/jibo/Knowledge/music/`, outside the OTA-replaced skill tree.
It starts only on demand and exits if its parent pipe closes. Search, streaming,
and playback code were ported from this workspace's JiboTube media modules and are
maintained inside BEam; there are no imports from the optional skill. The vendored
regenerator runtime retains its license under `helper/vendor/`.

## Validation and rollout

```bash
node BEam/@be/be/skills/music/tests/run.js
node BEam/@be/be/skills/music/tests/helper.js
node BEam/@be/be/skills/music/tests/helper.js --online
```

The online smoke test resolves the AJR examples, including “The Big Goodbye,”
“Bang!,” and artist-initial transcription variants, and prepares AVC/AAC streams;
it does not play audio. `BE_MUSIC_DATA_DIR` can override the persistent directory
for development. The test helper uses and removes its own temporary directory.

Ship the full `skills/music/` folder and updated host package registration through
the normal BEam update. Update BEam before deploying BEefy's new music route.
BEefy does not gate this launch on the firmware label: `general.release` comes
from `jibo-tbd`, independently of the installed BEam pack. Numeric and missing
release labels therefore cannot prove that the music skill is absent. The
updated BEam pack still needs to be installed before this route is deployed.

Before fleet rollout, verify actual audio/video decoding, round-screen controls,
album/video transitions, lyrics with and without artwork, interruption, repeated
requests, and memory cleanup on robot hardware. Online source availability and
the provider's response format can change; no full-catalog guarantee is made.
