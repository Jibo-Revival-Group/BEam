# Agent Mode

Open **BEacon → Etc → Agent Mode**, choose a provider, enter its credentials,
load models (or enter a model ID), and save. Model selection is required.
Settings apply to the next conversation.

Say **“Hey Jibo, let's chat,” “let's have a conversation,” “AI mode,”** or
**“agent mode.”** Jibo speaks with his existing voice and automatically listens
again after each complete reply. His system prompt asks for short replies,
preferably one or two sentences. Agent Mode does not execute Jibo skills or
device commands; phrases such as “play a song” become conversation text.

The ring glows green while waiting or speaking. While listening, the ring and
eye turn blue. A green dot remains at the bottom right throughout the session.
Say “stop,” “stop chatting,” “exit AI mode,” “end conversation,” “cancel,” or
“goodbye” during a listening turn to exit. Swiping down, enabling privacy,
switching skills, or 60 seconds without speech also exits. Speech interruption
is not supported; wait until Jibo finishes his reply.

## Providers

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
| Custom | `http://192.168.1.20:8080/v1` | Model ID accepted by the service |

Keys are optional in these three forms; supply a bearer token when the server
requires one. OpenClaw must have its OpenAI-compatible chat-completions HTTP
endpoint enabled. Its model list contains agent targets, not raw backend model
IDs. Configure the target agent's LLM in OpenClaw. Custom endpoints must provide
OpenAI-compatible `/chat/completions`; `/models` is optional when entering an ID
manually. Include any required API base path in the URL.

## Data flow and storage

BEefy transcribes audio and returns the transcript under the dedicated
`agent/conversation` listening rule. It bypasses ordinary command routing,
correction, classification, and cloud responses for these turns. The robot
sends the transcript and recent session context directly to the configured
provider, waits for a complete reply, then speaks it. There is no automatic
retry of a provider request.

Credentials are stored only in Jibo's
`/opt/jibo/Knowledge/beacon/agent.json`, with file mode `0600`, outside the OTA
Skills directory. BEacon sends entered credentials directly to the robot and
does not persist them in browser storage. Settings responses contain only
`hasApiKey`; saved keys never go to BEefy or appear in provider error messages.
Changing the provider or endpoint does not reuse the previous endpoint's key.
HTTPS uses the shipped CA bundle with certificate verification enabled.

Conversation history stays in robot RAM, limited to recent exchanges, and is
cleared when the skill exits. The external service can have its own retention,
agent tools, and memory settings, especially for OpenClaw.

## Verification and rollout

Run `node tests/agent.test.js`, `node tests/agent-runtime.test.js`, and
`node tests/agent-ui.test.js` from BEam.
BEefy tests include `AgentModeTests` and the agent buffered-audio cases in
`ModelEndpointingFinalizationTests`. Deploy BEam before BEefy so the launch
target exists. Verify real audio, outbound provider access, listening colors,
the green indicator, swipe exit, and privacy handoff on hardware.
