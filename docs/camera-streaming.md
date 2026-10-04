# Home Assistant camera streaming

In BEacon's More tab, **Allow camera streaming** enables or disables this mode.
It defaults to enabled. Disabling stops an active stream and rejects new Start
or Toggle requests; Stop remains available if cleanup needs retrying. The
preference survives robot restarts and updates. Changing it takes effect immediately.

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

## On-robot testing

Streaming is enabled for testing without a validation record. Native startup
posts `{"enable":true,"ip":"127.0.0.1","port":"5000"}` to
`/media/streaming/start` at the SDK's registered `media` service address and reads the VP8/WebM TCP feed from
loopback port 5000. Stop posts `{}` to `/media/streaming/control`.

Production MediaService is embedded in LPS on port 8486, which is the fallback
when no runtime registry record is available. Port 7979 belongs to the standalone
test service. A refused start connection restores normal robot operation without
requiring a stop request to the unavailable service. Ambiguous failures such as
timeouts still require native cleanup; errors include its address and cause.

Inspection of the shipped native handler confirms it calls `startStreaming`
with ORIGINAL output. The HTTP GET handler returns an empty `video/webm`
response; it is not the video source. Native capture uses camera 0 and its
original resolution (normally 1280×720); HA decodes and scales to 640×360.
Both bounded and open-ended live WebM Clusters are supported.

Optional `camera-stream-validation.json` beside BEacon's persisted
`homeassistant.json` can select another local TCP port:

```json
{"camera": 0, "port": 5000}
```

An existing record with `validated: false` does not block startup. Measurements
and acceptance flags are informational; they are not prerequisites for testing.
A malformed configuration still reports a configuration error. Camera 0 is the
native handler's supported capture source; video capture is not a snapshot loop.

On a robot, test frame rate, orientation, green indicators, camera emoji, both
local stop controls, HA buttons, multiple viewers, and restoration of normal
camera skills. Check runtime and robot restart cleanup, native-service failures,
Wi-Fi loss, and HA reload. Target at least 15 distinct captured frames per
second. Actual performance and the robot's runtime behavior remain to be measured
on hardware. An observed transport error is reported through the control endpoint
and startup attempts restore normal operation when native cleanup succeeds.

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
