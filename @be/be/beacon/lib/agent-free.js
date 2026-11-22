'use strict';
// Free AI uses the public BEefy endpoint. Ollama's loopback address exists
// only on the BEefyER worker; neither its secret nor endpoint belongs on Jibo.
const https = require('https'), os = require('os'), fs = require('fs'), crypto = require('crypto'), path = require('path'), url = require('url');
const people = require('./people'), settings = require('./agent-settings');
const BASE = 'https://api.5x1.com/api/agent/free/', ENDPOINT = BASE + 'chat';
function fail(message) { return settings.fail(message); }
// BEefy names the model that answered; 5x1 can switch it any time, so any plausible model id is accepted.
function validModel(model) { return typeof model === 'string' && /^[A-Za-z0-9._:-]{1,100}$/.test(model); }
function secure(options) { options.rejectUnauthorized = true; options.ca = fs.readFileSync(path.join(__dirname, '../certs/mozilla-ca.pem'), 'utf8'); return options; }
// Free's model list: whatever BEefy uses right now.
function models() {
    return new Promise((resolve, reject) => {
        const failed = () => reject(fail('Could not load the Free model from BEefy. Please try again later.'));
        let request;
        try {
            const options = secure(url.parse(BASE + 'models')); options.method = 'GET'; options.headers = { Accept: 'application/json' };
            request = https.request(options, response => {
                let size = 0; const chunks = [];
                response.on('data', chunk => { size += chunk.length; if (size > 16384) request.destroy(); else chunks.push(chunk); });
                response.on('error', failed);
                response.on('end', () => {
                    try {
                        const list = response.statusCode === 200 ? (JSON.parse(Buffer.concat(chunks).toString('utf8')).models || []) : [];
                        const found = list.filter(m => m && validModel(m.id)).map(m => ({ id: m.id, name: m.id + ' (Free)' }));
                        if (found.length) resolve({ models: found }); else failed();
                    } catch (_) { failed(); }
                });
            });
            request.setTimeout(20000, () => request.destroy());
            request.on('error', failed);
            request.end();
        } catch (_) { failed(); }
    });
}
function prepare(history, robotId, system) {
    if (!Array.isArray(history) || !history.length || history.length > 21 || history.length % 2 !== 1) throw fail('Free conversation history is invalid. Start a new conversation.');
    const messages = history.map((message, index) => {
        if (!message || message.role !== (index % 2 ? 'assistant' : 'user') || typeof message.content !== 'string' || !message.content.trim() || message.content.length > 12000) throw fail('Free conversation history is invalid. Start a new conversation.');
        return { role: message.role, content: message.content };
    });
    const request = { requestId: crypto.randomBytes(16).toString('hex'), messages: messages, robotId: robotId };
    // Jibo's instructions, including the "DO:" actions and installed skills, as paid models get them.
    if (typeof system === 'string' && system.trim()) request.system = system.slice(0, 8000);
    const requestId = request.requestId, body = JSON.stringify(request);
    if (Buffer.byteLength(body, 'utf8') > 30000) throw fail('Free conversation history is too long. Start a new conversation.');
    const options = url.parse(ENDPOINT);
    const headers = { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body, 'utf8'), Accept: 'application/json' };
    options.method = 'POST'; options.headers = headers; secure(options);
    return { options: options, body: body, requestId: requestId };
}
function chat(history, system) {
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
            // A robot whose loop has no people (OOBE, wiped KB) has no loop robot id; its own name still identifies it.
            Promise.resolve().then(() => people.list()).catch(() => null).then(snapshot => {
            if (settled) return;
            const validId = id => typeof id === 'string' && !!id.trim() && id.length <= 128 && !/[\x00-\x1f\x7f-\x9f]/.test(id);
            const robotId = validId(snapshot && snapshot.robot) ? snapshot.robot : os.hostname();
            if (!validId(robotId)) throw fail('Free AI could not identify this robot.');
            const prepared = prepare(history, robotId, system);
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
                        if (!data || data.requestId !== prepared.requestId || !validModel(data.model) || typeof data.text !== 'string' || !data.text.trim() || data.text.length > 12000) throw new Error('invalid');
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
module.exports = { chat: chat, models: models };
