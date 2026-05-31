// Shared storage keys and localStorage helpers.
(function () {
  const STORAGE_KEYS = Object.freeze({
    lang: 'fithop-language',
    playlists: 'fithop-playlists',
    favorites: 'fithop-favorites',
    selectedFitclip: 'fithop-selected-fitclip',
    purchases: 'fithop-purchases',
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

  window.FITHOP_STORAGE_KEYS = STORAGE_KEYS;
  window.FITHOP_STATE = { STORAGE_KEYS, lsGet, lsSetRaw, lsSet };
})();
