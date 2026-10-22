/* Runs synchronously before the app/styles. This key stores only a color preference. */
(function () {
    'use strict';
    var key = 'ikonectt.admin.theme';
    var root = document.documentElement;
    var media = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    var valid = function (value) { return value === 'light' || value === 'dark' || value === 'system'; };
    var preference = 'light';
    var storage;
    try { storage = window.localStorage; var saved = storage.getItem(key); if (valid(saved)) preference = saved; } catch (_) { /* Storage may be blocked. Theme still works in memory. */ }
    function apply() {
        root.dataset.themePreference = preference;
        root.dataset.theme = preference === 'system' ? (media && media.matches ? 'dark' : 'light') : preference;
        // Match the canvas/native controls even before development CSS arrives.
        root.style.colorScheme = root.dataset.theme;
        root.style.backgroundColor = root.dataset.theme === 'dark' ? '#111418' : '#f5f6f8';
        window.dispatchEvent(new CustomEvent('ikonectt-theme-change'));
    }
    window.ikonecttTheme = {
        get preference() { return preference; },
        setPreference: function (value) {
            if (!valid(value)) return;
            preference = value;
            try { if (storage) storage.setItem(key, preference); } catch (_) { /* Use in-memory preference. */ }
            apply();
        }
    };
    function systemChanged() { if (preference === 'system') apply(); }
    if (media && media.addEventListener) media.addEventListener('change', systemChanged);
    else if (media && media.addListener) media.addListener(systemChanged);
    window.addEventListener('storage', function (event) {
        if ((event.key === key || event.key === null) && (!event.storageArea || event.storageArea === storage)) {
            preference = valid(event.newValue) ? event.newValue : 'light';
            apply();
        }
    });
    apply();
}());
