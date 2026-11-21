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
