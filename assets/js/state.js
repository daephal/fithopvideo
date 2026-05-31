// Shared storage keys, defaults, and localStorage helpers.
(function () {
  const STORAGE_KEYS = Object.freeze({
    lang: 'fithop-language',
    playlists: 'fithop-playlists',
    favorites: 'fithop-favorites',
    selectedFitclip: 'fithop-selected-fitclip',
  });
  const SUPPORTED_LANGS = Object.freeze(['KR', 'JP', 'EN']);
  const STATE_DEFAULTS = Object.freeze({
    lang: 'KR',
    selectedFitclip: 48,
  });

  function lsGet(key, fallback) {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function lsSetRaw(key, val) {
    try { localStorage.setItem(key, val); } catch (e) {}
  }

  function lsSet(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }

  function lsGetOrSeed(key, seed) {
    try {
      if (localStorage.getItem(key) !== null) return lsGet(key, []);
    } catch (e) {}
    return seed;
  }

  function detectLang() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.lang);
      if (saved && SUPPORTED_LANGS.includes(saved)) return saved;
    } catch (e) {}
    const n = (typeof navigator !== 'undefined' ? navigator.language || '' : '').toLowerCase();
    if (n.startsWith('ja')) return 'JP';
    if (n.startsWith('en')) return 'EN';
    return STATE_DEFAULTS.lang;
  }

  window.FITHOP_STORAGE_KEYS = STORAGE_KEYS;
  window.FITHOP_STATE = {
    STORAGE_KEYS,
    SUPPORTED_LANGS,
    STATE_DEFAULTS,
    lsGet,
    lsSetRaw,
    lsSet,
    lsGetOrSeed,
    detectLang,
  };
})();
