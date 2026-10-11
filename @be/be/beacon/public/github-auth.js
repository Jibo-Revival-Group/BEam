(function () {
    'use strict';
    window.BEaconGithub = { create: function (options) {
        var status = document.getElementById('github-auth-status'), code = document.getElementById('github-auth-code'), link = document.getElementById('github-auth-link');
        var start = document.getElementById('github-auth-start'), disconnect = document.getElementById('github-auth-disconnect');
        var timer = null, busy = false;
        function render(data) {
            clearTimeout(timer); timer = null;
            status.textContent = data.error || (data.state === 'pending' ? 'Enter this code on GitHub to finish signing in.' : data.connected ? 'GitHub connected. Store requests use your authenticated rate limit.' : 'Sign in to GitHub to use the Store.');
            if (options.onChange) { options.onChange(data); }
            code.textContent = data.userCode || ''; code.hidden = data.state !== 'pending'; link.hidden = data.state !== 'pending';
            start.textContent = data.state === 'pending' ? 'Start again' : data.connected ? 'Reconnect GitHub' : 'Sign in to GitHub';
            disconnect.hidden = !data.connected && data.state !== 'pending'; disconnect.textContent = data.state === 'pending' && !data.connected ? 'Cancel sign-in' : 'Disconnect GitHub';
            if (data.state === 'pending') { timer = setTimeout(poll, Math.max(5, data.interval || 5) * 1000); }
        }
        function poll() {
            return options.api('POST', '/api/github/auth/poll').then(function (data) {
                render(data); if (data.connected && data.state === 'connected') { options.toast('GitHub connected.', 'ok'); return options.refresh(); }
            }).catch(function (err) { options.reportError(err); timer = setTimeout(load, 10000); });
        }
        function load() { return options.api('GET', '/api/github/auth').then(render).catch(options.reportError); }
        start.onclick = function () {
            if (busy) { return; } busy = true; start.disabled = true;
            return options.api('POST', '/api/github/auth').then(render).catch(options.reportError).then(function () { busy = false; start.disabled = false; });
        };
        disconnect.onclick = function () {
            clearTimeout(timer); timer = null;
            return options.api('DELETE', '/api/github/auth').then(render).catch(options.reportError);
        };
        return { load: load };
    } };
}());
