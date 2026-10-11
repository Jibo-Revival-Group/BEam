/* Apply appearance before the stylesheet loads, avoiding a bright startup flash. */
(function () {
    'use strict';
    var key = 'beacon-appearance', choices = ['bright', 'system', 'dark'], bound = [];
    var media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    function stored() {
        try { var value = window.localStorage.getItem(key); return choices.indexOf(value) >= 0 ? value : 'system'; }
        catch (err) { return 'system'; }
    }
    var preference = stored();
    function apply() {
        var dark = preference === 'dark' || (preference === 'system' && media && media.matches);
        document.documentElement.setAttribute('data-appearance', dark ? 'dark' : 'bright');
        document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
        bound.forEach(function (control) { control.set(preference); });
    }
    function setPreference(value) {
        if (choices.indexOf(value) < 0) { return; }
        preference = value;
        try { window.localStorage.setItem(key, value); } catch (err) { /* Settings still work without storage. */ }
        apply();
    }
    function createSwitch(root, onChange) {
        var buttons = root.querySelectorAll('.store-switch-tab'), slider = root.querySelector('.store-switch-slider');
        var selected;
        function set(value) {
            for (var i = 0; i < buttons.length; i++) {
                var active = buttons[i].getAttribute('data-value') === value;
                buttons[i].setAttribute('aria-checked', String(active)); buttons[i].tabIndex = active ? 0 : -1;
                if (active) { selected = value; slider.style.transform = 'translateX(' + (i * 100) + '%)'; }
            }
        }
        slider.style.width = (100 / buttons.length) + '%';
        for (var i = 0; i < buttons.length; i++) {
            (function (index) {
                var button = buttons[index]; button.style.width = (100 / buttons.length) + '%';
                function choose() { set(button.getAttribute('data-value')); if (onChange) { onChange(selected); } }
                button.onclick = choose;
                button.addEventListener('keydown', function (event) {
                    var next;
                    if (event.key === 'Home') { next = 0; }
                    else if (event.key === 'End') { next = buttons.length - 1; }
                    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') { next = (index + buttons.length - 1) % buttons.length; }
                    else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') { next = (index + 1) % buttons.length; }
                    else { return; }
                    event.preventDefault(); buttons[next].focus(); buttons[next].onclick();
                });
            }(i));
        }
        return { set: set, get: function () { return selected; } };
    }
    function bind(root) { var control = createSwitch(root, setPreference); bound.push(control); control.set(preference); return control; }
    if (media) {
        if (media.addEventListener) { media.addEventListener('change', apply); }
        else if (media.addListener) { media.addListener(apply); }
    }
    window.addEventListener('storage', function (event) {
        if (event.key === key || event.key === null) { preference = stored(); apply(); }
    });
    apply();
    window.BEaconAppearance = { bind: bind, createSwitch: createSwitch, set: setPreference,
        get: function () { return preference; } };
}());
