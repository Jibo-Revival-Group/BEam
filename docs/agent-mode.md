# Agent Mode

Open **BEacon → Etc → Agent Mode**, choose a provider, enter credentials if required,
load models (or enter a model ID), and save. Free uses the fixed `gemma3:4b`
model and needs no personal API key or endpoint.
Settings apply to the next conversation.

Say **“Hey Jibo, let's chat,” “let's have a conversation,” “AI mode,”** or
**“agent mode.”** Jibo speaks with his existing voice and automatically listens
again after each complete reply. His system prompt asks for short replies,
preferably one or two sentences. Agent Mode does not execute Jibo skills or
device commands; phrases such as “play a song” become conversation text.

The ring glows green while waiting or speaking. While listening, the ring and
eye turn blue. While a provider generates an answer, Jibo plays his native
`Thinking_Eye_Loop_01` animation. It stops before speech and when the session
exits, including privacy takeover. A green dot remains at the bottom right throughout the session.
Say “stop,” “stop chatting,” “exit AI mode,” “end conversation,” “cancel,” or
“goodbye” during a listening turn to exit. Swiping down, enabling privacy,
switching skills, or 60 seconds without speech also exits. Speech interruption
is not supported; wait until Jibo finishes his reply.

## Providers

### Free (hosted through BEefy)

Choose **Free** and save. The robot sends its recent text conversation to the
fixed `https://api.5x1.com` Free endpoint over verified HTTPS, without robot credentials or enrollment.
BEefy relays the request over its existing authenticated outbound BEefyER worker
connection. The worker calls **`http://localhost:11434/api/chat` on the BEefyER
machine**, using **`gemma3:4b`**. This localhost is not Jibo and not necessarily
the BEefy host. The robot cannot override the worker URL/model or obtain its secret.

The backend must have Free enabled and a worker advertising Free-chat support.
Absent workers,
busy capacity, or unavailable models produce an error, not another provider or
paid fallback. Older BEefy/BEefyER versions do not support this route. Operators
must install the model themselves; the application does not pull models or
start Ollama automatically.

**Only Free** has the hosted quota: **50 requests per rolling 30 minutes per self-reported robot ID
and 200 per hour per client IP**, checked independently at BEefy. Robot IDs are
not authenticated and can be spoofed. Either exhausted quota blocks
a request. This does not limit native Jibo commands, transcription, Hermes, or
any user-configured provider. Shared public IPs share the IP quota. The server
returns HTTP 429 and Retry-After; the robot speaks a short explanation.

### Hermes Agent

Choose **Hermes Agent**, enter the API server base URL reachable from Jibo
(for example `http://hermes-server:8642/v1`), and its **API server key**.
The default model is `hermes-agent`; Load models can list configured profile
aliases. This connects to Hermes Agent, not merely a model named Hermes.
Use the official Hermes API server setup instructions and enable authenticated
access. Do not expose an unauthenticated tool-enabled agent to the Internet.

The adapter uses `/chat/completions`, forwards the full bounded text history,
and sends only final answer text to TTS. Each Jibo conversation gets an isolated
random scope; identical opening questions cannot merge separate sessions.
Hermes may execute its configured tools and retain its own history/memory.
Its permissions and data handling are controlled on the Hermes server.
Closing Jibo's conversation cancels the local HTTP request and suppresses late
speech; it does not undo remote tool actions or promise deletion of Hermes data.

### Other providers

OpenAI, Claude, Gemini, and OpenRouter use their official API endpoints and
require an API key. The configured model must support text conversations.
Model discovery reflects the provider's catalog; selecting a model does not
guarantee that the account has access or sufficient quota.

For the endpoint options, use a hostname or LAN address reachable **from Jibo**.
`localhost` refers to the robot itself.

| Provider | Base URL example | Model selection |
| --- | --- | --- |
| Ollama | `http://192.168.1.20:11434` | Installed model, such as `model:tag`; native `/api/chat` and `/api/tags` |
| OpenClaw | `http://192.168.1.20:18789/v1` | Agent target, such as `openclaw/default` |
| Hermes Agent | `http://192.168.1.20:8642/v1` | Agent/profile alias, default `hermes-agent`; API server key required |
| Custom | `http://192.168.1.20:8080/v1` | Model ID accepted by the service |

Keys are optional for Ollama, OpenClaw, and Custom; Hermes requires its API server key. Supply a bearer token when another server
requires one. OpenClaw must have its OpenAI-compatible chat-completions HTTP
endpoint enabled. Its model list contains agent targets, not raw backend model
IDs. Configure the target agent's LLM in OpenClaw. Custom endpoints must provide
OpenAI-compatible `/chat/completions`; `/models` is optional when entering an ID
manually. Include any required API base path in the URL.

## Data flow and storage

BEefy transcribes audio and returns the transcript under the dedicated
`agent/conversation` listening rule. It bypasses ordinary command routing,
correction, classification, and cloud responses for these turns. The robot
sends the transcript and recent session context directly to a user-configured
provider, or through BEefy/BEefyER for Free, waits for a complete reply, then speaks it. There is no automatic
retry of a provider request.

Credentials are stored only in Jibo's
`/opt/jibo/Knowledge/beacon/agent.json`, with file mode `0600`, outside the OTA
Skills directory. BEacon sends entered credentials directly to the robot and
does not persist them in browser storage. Settings responses contain only
`hasApiKey`; saved personal provider keys never go to BEefy or appear in provider error messages.
Free sends a self-reported robot ID from the local Loop roster, not native
credentials, a personal provider key, or the BEefyER shared secret.
Changing the provider or endpoint does not reuse the previous endpoint's key.
HTTPS uses the shipped CA bundle with certificate verification enabled.

Conversation history stays in robot RAM, limited to recent exchanges, and is
cleared when the skill exits. The external service can have its own retention,
agent tools, and memory settings, especially for OpenClaw and Hermes.
The Free relay does not persist conversation history; its backend quota requires
expiring in-memory robot/IP counters. Operator logging and provider configuration
still need to be reviewed separately from these source-code guarantees.

## Verification and rollout

Run `node tests/agent.test.js`, `node tests/agent-runtime.test.js`, and
`node tests/agent-ui.test.js` from BEam.
BEefy tests include `AgentModeTests` and the agent buffered-audio cases in
`ModelEndpointingFinalizationTests`. Deploy BEam before BEefy so the launch
target exists. Verify real audio, outbound provider access, listening colors,
the green indicator, swipe exit, and privacy handoff on hardware.
