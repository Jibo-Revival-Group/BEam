# Creating a skill

End-to-end checklist for adding a new Be skill. Use **`@be/bad-apple`** as the template for a simple skill.

## 1. Create the skill folder

```
@be/be/skills/<your-skill>/
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

Paths below are relative to the skill root unless noted. Packs live under `@be/be/skills/` (not as direct `@be/<name>` children), so system-manager only lists `@be/be` as a launchable host.

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
  /path/to/@be/be/skills/bad-apple
```

Expect: `WROTE .../index.js`. Type-only tsify warnings are normal.

## 8. Register in Be

Edit `@be/be/package.json`:

1. Add `"@be/your-skill"` to **`jibo.lazySkills`** (normal feature skills).
2. Only put it in **`jibo.skills`** if it must run `postInit` at Be boot
   (e.g. clock alarms) or is a role skill (idle / first-contact / restore /
   surprises / settings).

Do **not** add the skill to Be’s npm `dependencies` — Be resolves packs via
`jibo.skillsRoot` → `@be/be/skills/` (see [architecture.md](architecture.md)).

Redeploy **`@be/be/package.json`** with the skill folder, then restart Be once
so the new id is known. After that, rebuild + leave + reopen the skill picks up
code changes without another Be restart. After boot, Be warms lazy skills in
the background, so the first user open is often already warm.

## 9. Main menu (optional)

Add a button in `@be/be/skills/main-menu/resources/views/main-menu-verbal.json` with `"destination": "your-skill"`. See [main-menu.md](main-menu.md).

## 10. Deploy

See [build-and-deploy.md](build-and-deploy.md):

- Copy skill folder + any changed Be/main-menu files.
- `chmod -R a+rX` on deployed paths.
- Restart Be.

## Microphone and camera

`jibo.media.getUserMedia({ audio: true, video: true })` resolves a standard
`MediaStream`, for example for a video call:

```js
jibo.media.getUserMedia({ audio: true, video: true }).then(stream => {
    const pc = new webkitRTCPeerConnection({ iceServers: [] });
    pc.addStream(stream); // Chrome 53: addStream, not addTrack
});
```

- Audio is the live microphone, in real time. Jibo keeps listening for "Hey Jibo" alongside it.
- Video is Jibo's right camera, 640x360 at about 6–7 frames per second (measured through WebRTC), without lens correction. That is the most Chrome 53 on Jibo can push through a canvas while the face animates.
- Ask for `audio` or `video` alone if you only need one.
- Stop with `stream.getTracks().forEach(t => t.stop())`; the camera turns off when the video track stops.
- Privacy mode refuses the camera, and turning it on ends a running video track.

### Smooth 720p video for calls

`jibo.media.getCameraStream(onData)` gives Jibo's camera at 1280x720, about 25
frames per second, straight from his hardware encoder as a VP8 WebM byte
stream (about 1.5 Mbit/s). Jibo doesn't decode or re-encode it, so send the bytes
over a data channel on the call and play them with MediaSource on the other
end. Measured through a call to a desktop browser: 24.6 fps, under 0.3 s
behind live. Keep the mic as a normal audio track from `getUserMedia`.

On Jibo (the answering side):

```js
jibo.media.getUserMedia({ audio: true }).then(mic => pc.addStream(mic));
pc.ondatachannel = e => {
    const channel = e.channel;
    channel.onopen = () => jibo.media.getCameraStream(bytes => {
        for (let i = 0; i < bytes.length; i += 16000) {
            channel.send(new Uint8Array(bytes.slice(i, i + 16000)).buffer); // keep messages small for Chrome 53
        }
    }).then(camera => { channel.onclose = camera.stop; });
};
```

On the other side (the calling side), create the channel before the offer and
play what arrives:

```js
const channel = pc.createDataChannel('camera');
channel.binaryType = 'arraybuffer';
const source = new MediaSource();
video.src = URL.createObjectURL(source);
source.addEventListener('sourceopen', () => {
    const buffer = source.addSourceBuffer('video/webm; codecs="vp8"');
    buffer.mode = 'sequence';
    const queue = [];
    const pump = () => { if (!buffer.updating && queue.length) buffer.appendBuffer(queue.shift()); };
    buffer.addEventListener('updateend', () => {
        const end = video.buffered.length && video.buffered.end(video.buffered.length - 1);
        if (end - video.currentTime > 0.5) video.currentTime = end - 0.1; // stay live
        pump();
    });
    channel.onmessage = e => { queue.push(e.data); pump(); };
});
```

- One camera stream at a time: a second call, or the Home Assistant camera
  stream, is refused with "Camera is in use".
- `stop()` (or privacy mode) ends it; start a new one for each call so the
  other side receives the WebM header first.
- Jibo's Chrome 53 can't parse a modern browser's offer as is. Before handing
  the offer to Jibo, remove `a=extmap-allow-mixed` lines and rewrite the data
  channel to the old form (`m=application 9 DTLS/SCTP 5000` with
  `a=sctpmap:5000 webrtc-datachannel 1024`, dropping `a=sctp-port` and
  `a=max-message-size`). Convert Jibo's answer back to the modern form
  (`UDP/DTLS/SCTP webrtc-datachannel` with `a=sctp-port:5000`). Keep CRLF line
  endings, and use real IP candidates: Chrome 53 can't resolve `.local` ones.
- AirPlay listens on port 5002 because the camera encoder always uses 5000.

## Which example to copy?

| Goal | Start from |
|------|------------|
| Fullscreen video | `@be/bad-apple` — [examples/bad-apple.md](examples/bad-apple.md) |
| Flows + voice + video | `@be/recipe` — [examples/recipe.md](examples/recipe.md) |

Do **not** use `@be/doom` as a template for new skills (paused; see [examples/doom.md](examples/doom.md)).
