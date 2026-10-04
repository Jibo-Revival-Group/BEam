# Home Assistant camera streaming

Native BE/BEacon pairing adds a Camera entity and three buttons to the existing
Jibo device: Start Camera Stream, Stop Camera Stream, Toggle Camera Stream.
Home Assistant connects locally to BEacon on port 8123. Existing remote access
to HA can show the camera; camera traffic never travels through BEefy.

Viewing a camera card never starts capture. Use Start or Toggle explicitly.
The inactive image is a crossed-out camera, with no previous camera frame.
While streaming, Jibo holds a dedicated skill with no idle animations, blocks
normal skill switches and listening, displays his existing camera emoji, and
pulses his screen indicator and LED green. Tap Stop streaming or touch his head
to stop locally. HA Stop and Toggle also stop. Closing a viewer leaves the
session active. Entering privacy stops capture first; starting from privacy is
refused. A failed native stop keeps Jibo in the restricted state with a retryable
Stop command rather than claiming capture has stopped.

## Hardware acceptance gate — currently unvalidated

There was no Jibo available during implementation. This feature is **not yet
accepted for production streaming**. In particular, native request bodies,
capture ownership, actual frame rate, image orientation, and resource cleanup
have not been tested on a robot. Start fails before changing Jibo's current
skill until a hardware acceptance record exists.

Static inspection of the shipped `libJiboMediaService.so` establishes these
native handlers:

- `/media/streaming/start`, including GET and POST handlers, and
  `/media/streaming/control` for stopping.
- A `video/webm` response and an `appsrc ! queue ! omxvp8enc ! webmmux
  streamable=true ! tcpserversink` pipeline.

These findings establish a candidate transport, **not** a verified API contract.
The adapter assumes POST start, GET WebM, POST stop on the loopback media service
at port 7979. If hardware contradicts that contract, update the adapter and its
tests before creating an acceptance record. Do not put a validation record in
an OTA or enable it based only on mocked tests.

On a robot, verify all of the following:

1. Discover the actual native start/stop request bodies using its media service
   and service registry. Keep any native destination on loopback. Verify the
   GET handler returns the one active pipeline's WebM stream. Verify the native
   TCP stream binds loopback and cannot bypass BEacon authentication from LAN.
2. Measure at least 15 distinct captured frames per second at 640×360 for ten
   minutes; duplicated output frames do not count. Verify CPU, memory, temperature,
   and normal camera operation after repeated sessions.
3. Verify video-only VP8 with video track 1, bounded EBML Cluster lengths,
   SimpleBlock keyframes, and keyframe intervals no longer than two seconds.
   The bounded WebM parser intentionally rejects unsupported framing.
4. Verify orientation matches what Jibo sees, with no upside-down or mirrored
   image. Verify a single in-memory PREVIEW photo can coexist with streaming
   without interrupting capture, and its native JPEG endpoint works.
5. Verify all stop paths release the pipeline, stop delivering frames, and
   restore listening, remote interactions, attention, and photo-taking.
6. Test several viewers joining at different times, viewers disconnecting,
   slow viewers, native-service interruption, Wi-Fi loss, HA reload, and robot
   restart. Check physical motion stops, the camera emoji remains visible, and
   both local stop controls work. Confirm startup failure restores idle.
7. Verify the native media service does not retain capture across a BE runtime
   crash/restart. If it does, add native owner-death cleanup before acceptance.

Only after passing these checks, create `camera-stream-validation.json` beside
the robot's persisted BEacon `homeassistant.json`. The following is a deliberately
disabled template. Replace `start` and `stop` with the bodies actually tested,
record the firmware and test date, and enter the measured results:

```json
{
  "validated": false,
  "robotFirmware": "",
  "testedAt": "",
  "camera": 0,
  "width": 640,
  "height": 360,
  "measuredFps": 0,
  "maxKeyframeIntervalSeconds": 0,
  "videoOnly": true,
  "videoTrack": 1,
  "boundedClusters": true,
  "orientationVerified": false,
  "cleanupVerified": false,
  "restartVerified": false,
  "loopbackOnlyVerified": false,
  "stillCaptureVerified": false,
  "start": {},
  "stop": {}
}
```

The validation record configures native request bodies, never HA credentials,
public endpoints, or automatic startup. Each process starts with streaming off.

## Local interface

All endpoints require `Authorization: Bearer <existing HA pairing password>`.
Credentials are never query parameters. Responses use `Cache-Control: no-store`.

| Endpoint | Behavior |
| --- | --- |
| `GET /api/camera-stream/status` | `state`, `streaming`, `width`, `height`, `targetFps`, `error` |
| `POST /api/camera-stream/control` | JSON `{"action":"start"}` (also `stop` or `toggle`); serializes commands and returns status |
| `GET /api/camera-stream/video` | Video-only WebM while streaming; never starts capture |
| `GET /api/camera-stream/image` | One in-memory native JPEG while streaming; never starts a session |

Inactive video/image requests return 409. Missing/incorrect pairing credentials
return 401. The video endpoint supports eight concurrent viewers sharing one
capture pipeline. Each joins on the next keyframe with WebM initialization;
slow viewers are disconnected rather than buffering unbounded footage.

HA uses its configured ffmpeg binary to decode WebM into MJPEG for live viewing
and PNG for stills. The authenticated HTTP connection feeds ffmpeg through stdin,
so the robot password is absent from process arguments. Camera status polls every
five seconds; explicit HA commands update state immediately. IP announcements
are followed automatically, closing old viewers when the address changes.
Integration unload closes viewers and decoders without starting or stopping a
robot session. No audio, recording, cloud relay, or additional sensor entities
are provided.

## Offline checks

```sh
cd BEam
node tests/camera-stream.test.js
node tests/homeassistant-native.test.js
FFMPEG_BINARY=/path/to/ffmpeg node tests/camera-stream-webm-fixture.test.js
```

Run the HA integration tests from `openjibo-haint` with aiohttp installed:

```sh
python -m unittest discover -s tests
FFMPEG_BINARY=/path/to/ffmpeg python -m unittest discover -s tests
```

Offline tests cover lifecycle, authentication, WebM boundaries, shared viewers,
HA requests and entity behavior. They do not establish hardware acceptance or
replace a test on a real Home Assistant installation.
