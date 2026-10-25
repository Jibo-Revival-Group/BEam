'use strict';

const http = require('http'), https = require('https'), url = require('url'), fs = require('fs'), path = require('path');
const settings = require('./agent-settings');
const SYSTEM = 'You are Jibo, a friendly, curious conversational robot. Respond briefly, preferably in 1–2 sentences. Use plain spoken language and avoid Markdown. You can converse but cannot perform robot or device actions. Do not claim to have performed actions.';
const BASES = { openai: 'https://api.openai.com/v1', claude: 'https://api.anthropic.com/v1', gemini: 'https://generativelanguage.googleapis.com/v1beta', openrouter: 'https://openrouter.ai/api/v1' };
let authorities;
function failure(message) { return settings.fail(message || 'The AI service could not complete the request.'); }
function base(config) { return (BASES[config.provider] || config.endpoint).replace(/\/+$/, ''); }
function request(config, route, body) {
    let req, timer, settled = false, rejectRequest;
    const promise = new Promise((resolve, reject) => {
        rejectRequest = reject;
        const options = url.parse(base(config) + route);
        options.method = body === undefined ? 'GET' : 'POST';
        options.headers = { Accept: 'application/json', 'Content-Type': 'application/json' };
        if (config.apiKey) {
            if (config.provider === 'claude') options.headers['x-api-key'] = config.apiKey;
            else if (config.provider === 'gemini') options.headers['x-goog-api-key'] = config.apiKey;
            else options.headers.Authorization = 'Bearer ' + config.apiKey;
        }
        if (config.provider === 'claude') options.headers['anthropic-version'] = '2023-06-01';
        if (options.protocol === 'https:') {
            if (!authorities) authorities = fs.readFileSync(path.join(__dirname, '../certs/mozilla-ca.pem'), 'utf8');
            options.ca = authorities; options.rejectUnauthorized = true;
        }
        const finish = (error, data) => {
            if (settled) return;
            settled = true; clearTimeout(timer);
            if (error) reject(error); else resolve(data);
        };
        timer = setTimeout(() => { finish(failure('The AI service took too long to respond.')); req.destroy(); }, 60000);
        try {
            req = (options.protocol === 'https:' ? https : http).request(options, response => {
            let size = 0, chunks = [];
            response.on('data', chunk => {
                size += chunk.length;
                if (size > 4 * 1024 * 1024) { finish(failure('The AI response was too large.')); response.destroy(); req.destroy(); }
                else chunks.push(chunk);
            });
            response.on('error', () => finish(failure()));
            response.on('aborted', () => finish(failure()));
            response.on('end', () => {
                if (response.statusCode < 200 || response.statusCode >= 300) {
                    finish(failure(response.statusCode === 401 || response.statusCode === 403 ? 'Check the AI service API key and permissions.' : 'The AI service rejected the request. Check the endpoint and model.')); return;
                }
                try { finish(null, JSON.parse(Buffer.concat(chunks).toString('utf8'))); }
                catch (_) { finish(failure('The AI service returned an invalid response.')); }
            });
            });
            req.on('error', () => finish(failure('Could not connect to the AI service.')));
            req.end(body === undefined ? undefined : JSON.stringify(body));
        } catch (_) {
            finish(failure('Could not connect to the AI service.'));
            if (req) req.destroy();
        }
    });
    return { promise: promise, cancel: () => {
        if (settled) return;
        settled = true; clearTimeout(timer); if (req) req.destroy(); rejectRequest(failure('AI request cancelled.'));
    } };
}
function models(input) {
    const config = settings.resolve(input, false);
    if (!settings.local(config.provider) && !config.apiKey) return Promise.reject(failure('Enter an API key to load models.'));
    function page(next, collected, pages) {
        let route = config.provider === 'ollama' ? '/api/tags' : '/models';
        if (next) route += config.provider === 'claude' ? '?after_id=' + encodeURIComponent(next) : '?pageToken=' + encodeURIComponent(next);
        return request(config, route).promise.then(data => {
            const list = config.provider === 'ollama' || config.provider === 'gemini' ? data.models : data.data;
            if (!Array.isArray(list)) throw failure('Model discovery is unavailable. Enter a model ID manually.');
            list.forEach(model => {
                if (config.provider === 'gemini' && (!model.supportedGenerationMethods || model.supportedGenerationMethods.indexOf('generateContent') === -1)) return;
                const id = model.id || model.name || model.model;
                if (typeof id === 'string') collected.push({ id: config.provider === 'gemini' ? id.replace(/^models\//, '') : id, name: model.displayName || model.display_name || model.name || id });
            });
            const cursor = config.provider === 'claude' && data.has_more ? data.last_id : config.provider === 'gemini' ? data.nextPageToken : null;
            return cursor && collected.length < 5000 && pages < 50 ? page(cursor, collected, pages + 1) : collected;
        });
    }
    return page(null, [], 1).then(list => ({ models: list.sort((a, b) => a.id.localeCompare(b.id)) }));
}
function chat(config, history) {
    const messages = [{ role: 'system', content: SYSTEM }].concat(history);
    let route = '/chat/completions', body = { model: config.model, messages: messages, stream: false }, extract = data => data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    if (config.provider === 'openai') {
        route = '/responses'; body = { model: config.model, instructions: SYSTEM, input: history, store: false };
        extract = data => (data.output || []).filter(item => item.type === 'message').map(item => (item.content || []).filter(part => part.type === 'output_text').map(part => part.text).join('')).join('\n');
    } else if (config.provider === 'claude') {
        route = '/messages'; body = { model: config.model, system: SYSTEM, messages: history, max_tokens: 1024, stream: false };
        extract = data => (data.content || []).filter(part => part.type === 'text').map(part => part.text).join('\n');
    } else if (config.provider === 'gemini') {
        route = '/models/' + encodeURIComponent(config.model.replace(/^models\//, '')) + ':generateContent';
        body = { systemInstruction: { parts: [{ text: SYSTEM }] }, contents: history.map(message => ({ role: message.role === 'assistant' ? 'model' : 'user', parts: [{ text: message.content }] })) };
        extract = data => (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts || []).filter(part => !part.thought && typeof part.text === 'string').map(part => part.text).join('\n');
    } else if (config.provider === 'ollama') route = '/api/chat';
    if (config.provider === 'ollama') extract = data => data.message && data.message.content;
    const operation = request(config, route, body);
    operation.promise = operation.promise.then(data => {
        const text = extract(data);
        if (typeof text !== 'string' || !text.trim()) throw failure('The AI service returned no spoken answer.');
        return text.trim().slice(0, 12000);
    });
    return operation;
}
module.exports = { models: models, chat: chat, SYSTEM: SYSTEM };
