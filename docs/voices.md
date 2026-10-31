# Custom voices

A voice pack changes how Jibo's own text-to-speech sounds. Install one from
**Store › Voices**, with **Upload ZIP**, or from a theme that links its voice.
Choose **Use** to switch; the **Jibo** card restores his normal voice. Jibo says a
short line in the new voice when you switch.

## Package

A ZIP (or a GitHub repository with a published release, like skills) with:

- `manifest.json` (required)
- `breath.mp3` (optional): plays after every sentence Jibo says
- `README.md`, `banner.png` (optional, shown in the Store)

```json
{
  "name": "Robo",
  "version": "1.0.0",
  "type": "voice",
  "voice": {
    "pitch": -2,
    "speed": 0.95,
    "volume": 1,
    "vibrato": 0.5,
    "vibratoSpeed": 6,
    "formants": -0.3
  }
}
```

Every effect is optional; the defaults are Jibo's normal voice.

- `pitch`: semitones, -12 to 12 (default 0)
- `speed`: 0.5 to 2, where 2 is twice as fast (default 1)
- `volume`: 0 to 2 times Jibo's speech volume (default 1)
- `vibrato`: how far the pitch wobbles up and down, in semitones, 0 to 2 (default 0)
- `vibratoSpeed`: wobbles per second, 0.5 to 12 (default 5)
- `formants`: -1 to 1; positive sounds smaller/brighter, negative bigger/darker (default 0)

## Themes

A theme's `manifest.json` may add `"voice": "https://github.com/owner/repo"`.
After the theme is applied, BEacon asks whether to download and use that voice.
If no storefront lists it yet, it is added to the Store under **Added by themes**.

## How it works

- `beacon/lib/voice-tts.js` wraps `jibo.tts.speak` and `getWordTimings`, which every
  speech path uses. Pitch and speed become Jibo TTS markup (`<pitch halftone>`,
  `<duration stretch>`); formants set the engine's all-pass constant (`allPass`,
  normally 0.76). With a breath, each sentence is spoken separately and the
  timing text gets a matching `<break>`, so embodied speech stays in sync.
- Vibrato and volume are applied to the audio by the `jibo_voicefx` ALSA plugin in
  BEnch (`/usr/local/share/ttsservice/alsa`), which reads
  `/opt/jibo/Knowledge/beacon/voices/fx.txt` (`<vibrato> <vibratoSpeed> <volume>`).
  Robots without that BEnch update still get pitch, speed, formants and breath.
- Installed voices live in `/opt/jibo/Knowledge/beacon/voices` and survive BEam updates.
