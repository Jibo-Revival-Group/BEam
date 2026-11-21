// Loaded by every Jibo service page (see service-pages.css). It only acts inside BEacon's Services console: there,
// stopping @be/be in the Skills Manager (or launching another skill, which also stops it) needs a yes first, because
// Be runs BEacon itself and the console the user is on goes dark. The plain Skills Manager page is left alone.
(function () {
    'use strict';
    if (window.self === window.top || location.port !== '8779') { return; }
    var confirmed = false;
    function skillName(button) {
        var row = button.closest('.list-group-item'), title = row && row.querySelector('h4');
        return title ? title.firstChild.textContent.trim() : '';
    }
    window.addEventListener('click', function (event) {
        var button = !confirmed && event.target.closest && event.target.closest('button.btn-danger, button.btn-success');
        if (!button) { return; }
        var stopsBe = button.classList.contains('btn-danger') ? skillName(button) === '@be/be'
            : Array.prototype.some.call(document.querySelectorAll('.running'), function (r) { return skillName(r) === '@be/be'; });
        if (!stopsBe) { return; }
        event.preventDefault(); event.stopImmediatePropagation();
        var what = button.classList.contains('btn-danger') ? 'Stopping @be/be' : 'Launching ' + skillName(button) + ' stops @be/be, and that';
        if (window.confirm(what + ' shuts down BEacon, including this very page.\n\nJibo\'s face, voice and skills stop too, and this console stops answering until Be is started again (or Jibo restarts).\n\nStop Be anyway?')) {
            confirmed = true;
            try { button.click(); } finally { confirmed = false; }
        }
    }, true);
}());

// Inside the console, every service page also keeps a picture of itself once a second for the last minute, so the
// console's Pause can show any moment of it again (scripts removed, canvases turned into images).
(function () {
    'use strict';
    if (window.self === window.top) { return; }
    var CONSOLE = location.protocol + '//' + location.hostname + ':8123', KEEP = 60000, frames = [];
    // WebGL views (LPS) must keep their last picture or a copy of them comes out blank.
    var getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, attrs) {
        if (/webgl/.test(type)) { attrs = Object.assign({}, attrs, { preserveDrawingBuffer: true }); }
        return getContext.call(this, type, attrs);
    };
    function snapshot() {
        var copy = document.documentElement.cloneNode(true);
        var live = document.querySelectorAll('canvas'), copies = copy.querySelectorAll('canvas');
        Array.prototype.forEach.call(live, function (c, i) {
            var img = document.createElement('img');
            try {
                var still = document.createElement('canvas'), g;
                still.width = c.width; still.height = c.height; g = still.getContext('2d');
                var bg = getComputedStyle(c).backgroundColor;   // JPEG has no transparency: paint what was behind it
                g.fillStyle = /rgba\(.*, 0\)|transparent/.test(bg) ? '#0b1017' : bg; g.fillRect(0, 0, still.width, still.height);
                g.drawImage(c, 0, 0); img.src = still.toDataURL('image/jpeg', 0.7);
            } catch (e) { img.alt = ''; }
            img.className = c.className; img.style.cssText = c.style.cssText;
            img.style.width = c.clientWidth + 'px'; img.style.height = c.clientHeight + 'px';
            copies[i].parentNode.replaceChild(img, copies[i]);
        });
        var fields = document.querySelectorAll('input, textarea, select'), fieldCopies = copy.querySelectorAll('input, textarea, select');
        Array.prototype.forEach.call(fields, function (f, i) {
            var c = fieldCopies[i];
            if (f.tagName === 'TEXTAREA') { c.textContent = f.value; }
            else if (f.tagName === 'SELECT') { Array.prototype.forEach.call(c.options, function (o, j) { o.selected = f.options[j] && f.options[j].selected; if (o.selected) { o.setAttribute('selected', ''); } }); }
            else if (f.type === 'checkbox' || f.type === 'radio') { if (f.checked) { c.setAttribute('checked', ''); } else { c.removeAttribute('checked'); } }
            else { c.setAttribute('value', f.value); }
        });
        Array.prototype.forEach.call(copy.querySelectorAll('script, iframe'), function (n) { n.parentNode.removeChild(n); });
        var base = document.createElement('base'); base.href = location.href;
        var head = copy.querySelector('head'); head.insertBefore(base, head.firstChild);
        return '<!doctype html>' + copy.outerHTML;
    }
    setInterval(function () {
        try { frames.push({ t: Date.now(), html: snapshot() }); } catch (e) { return; }
        while (frames.length && frames[0].t < Date.now() - KEEP) { frames.shift(); }
    }, 1000);
    window.addEventListener('message', function (event) {
        if (event.origin === CONSOLE && event.data && event.data.type === 'beacon-recording') {
            event.source.postMessage({ type: 'beacon-recording', port: location.port, frames: frames.slice() }, CONSOLE);
        }
        if (event.origin === CONSOLE && event.data && event.data.type === 'beacon-recording-clear') { frames = []; }
    });
}());
