(function () {
    'use strict';
    var form = document.getElementById('agent-settings');
    if (!form) return;
    function field(name) { return document.getElementById('agent-' + name); }
    var saved = null, revision = 0;
    function local() { return ['ollama', 'openclaw', 'hermes', 'custom'].indexOf(field('provider').value) !== -1; }
    function same() { return saved && saved.provider === field('provider').value && saved.endpoint === field('endpoint').value.trim(); }
    function render() {
        var free = field('provider').value === 'free', hermes = field('provider').value === 'hermes';
        field('endpoint-row').hidden = !local(); field('endpoint-hint').hidden = !local();
        field('endpoint').required = local();
        field('key-row').hidden = free; field('key-status').hidden = free;
        field('free-hint').hidden = !free;
        field('free-hint').textContent = 'Free uses BEefy and its BEefyER worker to run gemma3:4b. Ollama localhost is on the BEefyER machine, not on Jibo. No personal API key is needed.';
        field('key-label').textContent = hermes ? 'API server key' : local() ? 'API key (optional)' : 'API key';
        field('key').required = !free && (hermes || !local()) && !(same() && saved.hasApiKey) && !field('clear-key').checked;
        field('model-label').textContent = field('provider').value === 'openclaw' || hermes ? 'Model / agent' : 'Model';
        field('model').readOnly = free; field('load-models').hidden = free;
        if (free) field('model').value = 'gemma3:4b';
        field('endpoint').placeholder = hermes ? 'http://hermes-server:8642/v1' : 'http://server:11434';
        field('endpoint-hint').textContent = hermes ? 'Use your Hermes Agent API server URL, such as http://hermes-server:8642/v1, and its API_SERVER_KEY. The default model is hermes-agent; load models to select a profile. Hermes can use its configured tools and retain server-side history. Localhost here means Jibo.' : 'Use an OpenAI-compatible base URL including /v1. For OpenClaw, enable its chat-completions endpoint and select an agent such as openclaw/default. For Ollama, use the server root without /api.';
        field('key-status').textContent = same() && saved.hasApiKey ? 'A key is saved on Jibo. Leave blank to keep it.' : 'No saved key for this service.';
    }
    function body() { var free = field('provider').value === 'free'; return { provider: field('provider').value, endpoint: local() ? field('endpoint').value.trim() : '', model: free ? 'gemma3:4b' : field('model').value.trim(), apiKey: free ? '' : field('key').value, clearApiKey: free || field('clear-key').checked }; }
    function api(method, route, data) {
        return fetch('/api/agent/' + route, { method: method, headers: { 'Content-Type': 'application/json' }, body: data ? JSON.stringify(data) : undefined }).then(function (response) {
            return response.json().then(function (value) { if (!response.ok) throw new Error(value.error && value.error.message || value.error || 'Agent settings request failed.'); return value; });
        });
    }
    function apply(data) {
        saved = data; field('provider').value = data.provider; field('endpoint').value = data.endpoint || ''; field('model').value = data.model || '';
        field('key').value = ''; field('clear-key').checked = false; render();
    }
    function busy(value) { Array.prototype.forEach.call(form.querySelectorAll('button'), function (button) { button.disabled = value; }); }
    form.addEventListener('input', function () { ++revision; render(); });
    field('provider').addEventListener('change', function () {
        field('endpoint').value = ''; field('key').value = ''; field('model').value = ''; field('models').textContent = ''; field('clear-key').checked = false; render();
        if (field('provider').value === 'hermes') field('model').value = 'hermes-agent';
    });
    field('load-models').onclick = function () {
        var version = revision;
        busy(true); field('status').textContent = 'Loading models…';
        api('POST', 'models', body()).then(function (data) {
            if (version !== revision) return;
            field('models').textContent = '';
            data.models.forEach(function (model) { var option = document.createElement('option'); option.value = model.id; option.label = model.name; field('models').appendChild(option); });
            field('status').textContent = data.models.length ? 'Choose a model or enter its ID.' : 'No models listed. Enter a model ID.';
        }).catch(function (error) { field('status').textContent = error.message + ' You can enter a model ID manually.'; }).then(function () { busy(false); });
    };
    form.onsubmit = function (event) {
        event.preventDefault(); busy(true);
        var version = revision;
        api('POST', 'settings', body()).then(function (data) {
            if (version === revision) apply(data);
            field('status').textContent = 'Saved. Changes apply to the next conversation.';
        }).catch(function (error) { field('status').textContent = error.message; }).then(function () { busy(false); });
    };
    window.BEaconAgent = { load: function () {
        var version = revision;
        return api('GET', 'settings').then(function (data) { if (version === revision) apply(data); }).catch(function (error) { field('status').textContent = error.message; });
    } };
    render();
}());
