(() => {
  'use strict';
  window.PamyatStorage = Object.freeze({
    read(key) {
      try {
        const raw = window.localStorage.getItem(key);
        return { ok: true, value: raw === null ? null : JSON.parse(raw) };
      } catch {
        return { ok: false, value: null };
      }
    },
    write(key, value) {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch {
        return false;
      }
    }
  });
})();
