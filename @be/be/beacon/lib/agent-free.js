'use strict';
// Free AI uses the public BEefy endpoint. Ollama's loopback address exists
// only on the BEefyER worker; neither its secret nor endpoint belongs on Jibo.
const https = require('https'), fs = require('fs'), crypto = require('crypto'), path = require('path'), url = require('url');
const people = require('./people'), settings = require('./agent-settings');
const ENDPOINT = 'https://api.5x1.com/api/agent/free/chat';
function fail(message) { return settings.fail(message); }
function prepare(history, robotId) {
    if (!Array.isArray(history) || !history.length || history.length > 21 || history.length % 2 !== 1) throw fail('Free conversation history is invalid. Start a new conversation.');
    const messages = history.map((message, index) => {
        if (!message || message.role !== (index % 2 ? 'assistant' : 'user') || typeof message.content !== 'string' || !message.content.trim() || message.content.length > 12000) throw fail('Free conversation history is invalid. Start a new conversation.');
        return { role: message.role, content: message.content };
    });
    const requestId = crypto.randomBytes(16).toString('hex'), body = JSON.stringify({ requestId: requestId, messages: messages, robotId: robotId });
    if (Buffer.byteLength(body, 'utf8') > 30000) throw fail('Free conversation history is too long. Start a new conversation.');
    const options = url.parse(ENDPOINT);
    const headers = { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body, 'utf8'), Accept: 'application/json' };
    options.method = 'POST'; options.headers = headers;
    options.rejectUnauthorized = true;
    options.ca = fs.readFileSync(path.join(__dirname, '../certs/mozilla-ca.pem'), 'utf8');
    return { options: options, body: body, requestId: requestId };
}
function chat(history) {
    let request, timer, settled = false, rejectPending;
    const promise = new Promise((resolve, reject) => {
        rejectPending = reject;
        const finish = (error, text) => {
            if (settled) return;
            settled = true; clearTimeout(timer);
            if (error) reject(error); else resolve(text);
        };
        try {
            // Allow the backend's 120-second model deadline plus relay/network overhead.
            timer = setTimeout(() => { finish(fail('Free AI took too long to respond. Please try again later.')); if (request) request.destroy(); }, 150000);
            Promise.resolve().then(() => people.list()).then(snapshot => {
            if (settled) return;
            const validId = id => typeof id === 'string' && !!id.trim() && id.length <= 128 && !/[\x00-\x1f\x7f-\x9f]/.test(id);
            const robotId = snapshot && snapshot.robot;
            if (!validId(robotId)) throw fail('Free AI could not identify this robot.');
            const prepared = prepare(history, robotId);
            request = https.request(prepared.options, response => {
                let bytes = 0, chunks = [];
                response.on('data', chunk => {
                    if (settled) return;
                    bytes += chunk.length;
                    if (bytes > 65536) { finish(fail('Free AI returned an invalid response.')); response.destroy(); request.destroy(); }
                    else chunks.push(chunk);
                });
                response.on('error', () => finish(fail('Free AI disconnected. Please try again later.')));
                response.on('aborted', () => finish(fail('Free AI disconnected. Please try again later.')));
                response.on('end', () => {
                    if (settled) return;
                    if (response.statusCode !== 200) {
                        const code = response.statusCode;
                        finish(fail(code === 429 ? 'The Free AI request limit has been reached. Please try again later.' : code === 503 ? 'Free AI is unavailable or busy right now. Please try again later.' : code === 504 ? 'Free AI took too long to respond. Please try again later.' : 'Free AI could not complete the request. Please try again later.'));
                        return;
                    }
                    try {
                        const data = JSON.parse(Buffer.concat(chunks).toString('utf8'));
                        if (!data || data.requestId !== prepared.requestId || data.model !== 'gemma3:4b' || typeof data.text !== 'string' || !data.text.trim() || data.text.length > 12000) throw new Error('invalid');
                        finish(null, data.text.trim());
                    } catch (_) { finish(fail('Free AI returned an invalid response.')); }
                });
            });
            request.on('error', () => finish(fail('Could not connect securely to BEefy for Free AI.')));
            request.end(prepared.body);
            }).catch(error => { finish(error && error.status === 400 ? error : fail('Free AI could not prepare a secure request.')); if (request) request.destroy(); });
        } catch (error) {
            finish(error && error.status === 400 ? error : fail('Free AI could not prepare a secure request.'));
            if (request) request.destroy();
        }
    });
    return { promise: promise, cancel: () => {
        if (settled) return;
        settled = true; clearTimeout(timer); if (request) request.destroy(); rejectPending(fail('Free AI request cancelled.'));
    } };
}
module.exports = { chat: chat };
