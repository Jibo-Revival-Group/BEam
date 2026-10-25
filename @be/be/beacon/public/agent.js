(function () {
    'use strict';
    var form = document.getElementById('agent-settings');
    if (!form) return;
    function field(name) { return document.getElementById('agent-' + name); }
    var saved = null, revision = 0;
    function local() { return ['ollama', 'openclaw', 'custom'].indexOf(field('provider').value) !== -1; }
    function same() { return saved && saved.provider === field('provider').value && saved.endpoint === field('endpoint').value.trim(); }
    function render() {
        field('endpoint-row').hidden = !local(); field('endpoint-hint').hidden = !local();
        field('endpoint').required = local();
        field('key-label').textContent = local() ? 'API key (optional)' : 'API key';
        field('key').required = !local() && !(same() && saved.hasApiKey) && !field('clear-key').checked;
        field('model-label').textContent = field('provider').value === 'openclaw' ? 'Model / agent' : 'Model';
        field('key-status').textContent = same() && saved.hasApiKey ? 'A key is saved on Jibo. Leave blank to keep it.' : 'No saved key for this service.';
    }
    function body() { return { provider: field('provider').value, endpoint: local() ? field('endpoint').value.trim() : '', model: field('model').value.trim(), apiKey: field('key').value, clearApiKey: field('clear-key').checked }; }
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
