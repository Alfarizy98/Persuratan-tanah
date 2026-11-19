(function (root) {
  'use strict';

  const TTL_MS = 72 * 60 * 60 * 1000; // 3 hari
  const KEYS = {
    SETTINGS: 'tobadak_surat_settings_v1',
    DRAFTS: 'tobadak_surat_drafts_v1',
    PIN: 'tobadak_surat_pin_v1',
    UNLOCKED: 'tobadak_surat_unlocked'
  };

  const DEFAULT_SETTINGS = {
    nama_kades: 'KORNELIUS',
    desa: 'Tobadak',
    kecamatan: 'Tobadak',
    kabupaten: 'Mamuju Tengah',
    logo_watermark: '',
    theme: 'light',
    preset_saksi: [
      { nama: '', jabatan: 'Kepala Dusun' },
      { nama: '', jabatan: 'Ketua RT' }
    ]
  };

  const DEFAULT_PIN = '1234';

  function getStore(storageObj) {
    return storageObj || (typeof localStorage !== 'undefined' ? localStorage : null);
  }

  function hashPinFallback(pin) {
    // shortcut: fallback hash if WebCrypto is unavailable on file://; upgrade to mandatory WebCrypto on HTTPS
    let h = 2166136261;
    for (let i = 0; i < pin.length; i++) {
      h ^= pin.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return 'fb_' + (h >>> 0).toString(16);
  }

  async function hashPin(pin) {
    const s = String(pin || '');
    if (typeof crypto !== 'undefined' && crypto.subtle && typeof TextEncoder !== 'undefined') {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('tobadak:' + s));
      return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
    }
    return hashPinFallback(s);
  }

  async function verifyPin(inputPin, storageObj) {
    const store = getStore(storageObj);
    const saved = store ? store.getItem(KEYS.PIN) : null;
    const targetHash = saved || await hashPin(DEFAULT_PIN);
    const inputHash = await hashPin(inputPin);
    return inputHash === targetHash;
  }

  async function setPin(newPin, storageObj) {
    const store = getStore(storageObj);
    if (!store) return;
    store.setItem(KEYS.PIN, await hashPin(newPin));
  }

  function getSettings(storageObj) {
    const store = getStore(storageObj);
    if (!store) return { ...DEFAULT_SETTINGS };
    try {
      const raw = store.getItem(KEYS.SETTINGS);
      if (!raw) return { ...DEFAULT_SETTINGS };
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  }

  function saveSettings(settings, storageObj) {
    const store = getStore(storageObj);
    if (!store) return;
    store.setItem(KEYS.SETTINGS, JSON.stringify({ ...DEFAULT_SETTINGS, ...settings }));
  }

  // Simple local encryption/obfuscation so personal data (NIK/address) is not plaintext in localStorage
  function encodePayload(obj) {
    const json = JSON.stringify(obj);
    const bytes = new TextEncoder().encode(json);
    const key = 0x5A;
    const xored = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) xored[i] = bytes[i] ^ ((key + i) & 0xFF);
    let bin = '';
    for (let i = 0; i < xored.length; i++) bin += String.fromCharCode(xored[i]);
    return 'enc1:' + btoa(bin);
  }

  function decodePayload(str) {
    if (!str || typeof str !== 'string') return null;
    if (!str.startsWith('enc1:')) return JSON.parse(str);
    const bin = atob(str.slice(5));
    const bytes = new Uint8Array(bin.length);
    const key = 0x5A;
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i) ^ ((key + i) & 0xFF);
    return JSON.parse(new TextDecoder().decode(bytes));
  }

  function purgeExpiredDrafts(drafts, now = Date.now()) {
    return (drafts || []).filter((d) => d && d.expires_at > now);
  }

  function loadDrafts(storageObj, now = Date.now()) {
    const store = getStore(storageObj);
    if (!store) return [];
    try {
      const raw = store.getItem(KEYS.DRAFTS);
      if (!raw) return [];
      const list = decodePayload(raw);
      const active = purgeExpiredDrafts(list, now);
      if (active.length !== list.length) {
        store.setItem(KEYS.DRAFTS, encodePayload(active));
      }
      return active.sort((a, b) => b.updated_at - a.updated_at);
    } catch {
      return [];
    }
  }

  function saveDraft(draftInput, storageObj, now = Date.now()) {
    const store = getStore(storageObj);
    const drafts = loadDrafts(store, now);
    const id = draftInput.id || ('d_' + now + '_' + Math.random().toString(36).slice(2, 7));
    const existingIdx = drafts.findIndex((d) => d.id === id);
    const createdAt = existingIdx >= 0 ? drafts[existingIdx].created_at : now;
    const record = {
      id,
      jenis: draftInput.jenis,
      judul: draftInput.judul || 'Tanpa Judul',
      data: draftInput.data,
      status: draftInput.status || 'draf',
      created_at: createdAt,
      updated_at: now,
      expires_at: now + TTL_MS
    };
    if (existingIdx >= 0) drafts[existingIdx] = record;
    else drafts.unshift(record);
    if (store) store.setItem(KEYS.DRAFTS, encodePayload(drafts));
    return record;
  }

  function deleteDraft(id, storageObj) {
    const store = getStore(storageObj);
    const drafts = loadDrafts(store).filter((d) => d.id !== id);
    if (store) store.setItem(KEYS.DRAFTS, encodePayload(drafts));
    return drafts;
  }

  const api = {
    TTL_MS,
    KEYS,
    DEFAULT_SETTINGS,
    DEFAULT_PIN,
    verifyPin,
    setPin,
    getSettings,
    saveSettings,
    purgeExpiredDrafts,
    loadDrafts,
    saveDraft,
    deleteDraft
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.SuratStorage = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
