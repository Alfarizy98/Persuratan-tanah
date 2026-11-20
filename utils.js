(function (root) {
  'use strict';

  const BULAN_ID = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const SATUAN = [
    '', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima',
    'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'
  ];

  function terbilangInt(n) {
    if (n === 0) return '';
    if (n < 12) return SATUAN[n];
    if (n < 20) return SATUAN[n - 10] + ' Belas';
    if (n < 100) {
      return SATUAN[Math.floor(n / 10)] + ' Puluh' + (n % 10 ? ' ' + terbilangInt(n % 10) : '');
    }
    if (n < 200) return 'Seratus' + (n % 100 ? ' ' + terbilangInt(n % 100) : '');
    if (n < 1000) {
      return SATUAN[Math.floor(n / 100)] + ' Ratus' + (n % 100 ? ' ' + terbilangInt(n % 100) : '');
    }
    if (n < 2000) return 'Seribu' + (n % 1000 ? ' ' + terbilangInt(n % 1000) : '');
    if (n < 1000000) {
      return terbilangInt(Math.floor(n / 1000)) + ' Ribu' + (n % 1000 ? ' ' + terbilangInt(n % 1000) : '');
    }
    if (n < 1000000000) {
      return terbilangInt(Math.floor(n / 1000000)) + ' Juta' + (n % 1000000 ? ' ' + terbilangInt(n % 1000000) : '');
    }
    if (n < 1000000000000) {
      return terbilangInt(Math.floor(n / 1000000000)) + ' Miliar' + (n % 1000000000 ? ' ' + terbilangInt(n % 1000000000) : '');
    }
    return terbilangInt(Math.floor(n / 1000000000000)) + ' Triliun' + (n % 1000000000000 ? ' ' + terbilangInt(n % 1000000000000) : '');
  }

  function terbilang(nilai) {
    const num = Math.floor(Number(String(nilai).replace(/[^\d]/g, '')));
    if (!Number.isFinite(num) || num <= 0) return '';
    return terbilangInt(num).trim() + ' Rupiah';
  }

  function formatRupiah(nilai) {
    const num = Math.floor(Number(String(nilai).replace(/[^\d]/g, '')));
    if (!Number.isFinite(num) || num <= 0) return 'Rp 0';
    return 'Rp ' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  function parseDateParts(str) {
    if (!str) return null;
    const s = String(str).trim();
    // Support YYYY-MM-DD (input[type=date]) or DD-MM-YYYY
    let y, m, d;
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      [y, m, d] = s.split('-').map(Number);
    } else if (/^\d{2}-\d{2}-\d{4}$/.test(s)) {
      [d, m, y] = s.split('-').map(Number);
    } else {
      return null;
    }
    const dt = new Date(y, m - 1, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) {
      return null;
    }
    return { y, m, d };
  }

  function formatTanggalLahir(str) {
    const p = parseDateParts(str);
    if (!p) return str || '';
    const dd = String(p.d).padStart(2, '0');
    const mm = String(p.m).padStart(2, '0');
    return `${dd}-${mm}-${p.y}`;
  }

  function formatTanggalSurat(str) {
    const p = parseDateParts(str);
    if (!p) return str || '';
    return `${p.d} ${BULAN_ID[p.m - 1]} ${p.y}`;
  }

  function validateNIK(nik) {
    const clean = String(nik || '').trim();
    if (!clean) return 'NIK wajib diisi';
    if (!/^\d{16}$/.test(clean)) return 'NIK harus terdiri dari tepat 16 digit angka';
    return '';
  }

  function validatePihak(pihak, label) {
    const errs = {};
    if (!pihak) return { [label]: `Data ${label} wajib diisi` };
    if (!String(pihak.nama || '').trim()) errs.nama = `Nama ${label} wajib diisi`;
    if (!String(pihak.tempat_lahir || '').trim()) errs.tempat_lahir = `Tempat lahir ${label} wajib diisi`;
    if (!parseDateParts(pihak.tanggal_lahir)) errs.tanggal_lahir = `Tanggal lahir ${label} tidak valid (DD-MM-YYYY)`;
    const nikErr = validateNIK(pihak.nik);
    if (nikErr) errs.nik = nikErr;
    if (!String(pihak.agama || '').trim()) errs.agama = `Agama ${label} wajib diisi`;
    if (!String(pihak.pekerjaan || '').trim()) errs.pekerjaan = `Pekerjaan ${label} wajib diisi`;
    if (!String(pihak.alamat || '').trim()) errs.alamat = `Alamat ${label} wajib diisi`;
    return errs;
  }

  function validateForm(jenis, data) {
    const errors = [];
    const checkPihak = (p, label) => {
      const e = validatePihak(p, label);
      Object.values(e).forEach((msg) => errors.push(msg));
    };

    if (jenis === 'ganti_rugi') {
      checkPihak(data.pihak1, 'Pihak I (Pertama)');
      checkPihak(data.pihak2, 'Pihak II (Kedua)');
      if (!Number(data.objek?.luas) || Number(data.objek.luas) <= 0) errors.push('Luas tanah harus angka positif');
      if (!(Number(String(data.objek?.harga || '').replace(/[^\d]/g, '')) > 0)) errors.push('Harga ganti rugi wajib diisi');
      if (!String(data.objek?.tahun || '').trim()) errors.push('Tahun transaksi wajib diisi');
      if (!String(data.objek?.dusun || '').trim()) errors.push('Dusun lokasi tanah wajib diisi');
    } else if (jenis === 'hibah') {
      checkPihak(data.pihak1, 'Pihak I (Pertama)');
      checkPihak(data.pihak2, 'Pihak II (Kedua)');
      if (!Number(data.objek?.luas) || Number(data.objek.luas) <= 0) errors.push('Luas tanah harus angka positif');
      if (!String(data.objek?.tahun || '').trim()) errors.push('Tahun hibah wajib diisi');
      if (!String(data.objek?.dusun || '').trim()) errors.push('Dusun lokasi tanah wajib diisi');
    } else if (jenis === 'sporadik') {
      checkPihak(data.pihak1, 'Yang Menyatakan');
      if (!Number(data.objek?.luas) || Number(data.objek.luas) <= 0) errors.push('Luas tanah harus angka positif');
      if (!String(data.objek?.dusun || '').trim()) errors.push('Dusun lokasi tanah wajib diisi');
      if (!String(data.perolehan?.cara || '').trim()) errors.push('Cara perolehan wajib diisi');
      if (!String(data.perolehan?.dari || '').trim()) errors.push('Asal perolehan (dari siapa) wajib diisi');
      if (!String(data.perolehan?.tahun || '').trim()) errors.push('Tahun perolehan wajib diisi');
      const s1 = data.saksi?.[0] || {};
      const s2 = data.saksi?.[1] || {};
      if (!String(s1.nama || '').trim() || !String(s2.nama || '').trim()) {
        errors.push('Nama kedua saksi wajib diisi');
      }
    }

    ['utara', 'timur', 'selatan', 'barat'].forEach((arah) => {
      if (!String(data.batas?.[arah] || '').trim()) {
        errors.push(`Batas sebelah ${arah} wajib diisi`);
      }
    });

    if (!String(data.penutup?.tempat || '').trim()) errors.push('Tempat penandatanganan wajib diisi');
    if (!parseDateParts(data.penutup?.tanggal)) errors.push('Tanggal surat tidak valid');

    return errors;
  }

  function formatSisaWaktu(expiresAt, now = Date.now()) {
    const diff = expiresAt - now;
    if (diff <= 0) return { text: 'Kedaluwarsa', expired: true, warning: true };
    const totalHours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    let text = 'Sisa ';
    if (days > 0) text += `${days} hari ${hours} jam`;
    else if (hours > 0) text += `${hours} jam ${mins} menit`;
    else text += `${Math.max(1, mins)} menit`;
    return {
      text,
      expired: false,
      warning: diff < 24 * 60 * 60 * 1000
    };
  }

  function escapeHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  const api = {
    terbilang,
    formatRupiah,
    parseDateParts,
    formatTanggalLahir,
    formatTanggalSurat,
    validateNIK,
    validateForm,
    formatSisaWaktu,
    escapeHtml
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.SuratUtils = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
