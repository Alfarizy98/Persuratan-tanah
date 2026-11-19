import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const U = require('./utils.js');
const T = require('./templates.js');
const S = require('./storage.js');

function makeMemStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k)
  };
}

test('terbilang dan formatRupiah dari ribuan sampai miliar', () => {
  assert.equal(U.formatRupiah(70000000), 'Rp 70.000.000');
  assert.equal(U.terbilang(70000000), 'Tujuh Puluh Juta Rupiah');
  assert.equal(U.terbilang(1500), 'Seribu Lima Ratus Rupiah');
  assert.equal(U.terbilang(2500000000), 'Dua Miliar Lima Ratus Juta Rupiah');
});

test('format tanggal surat dan tanggal lahir', () => {
  assert.equal(U.formatTanggalSurat('2026-11-16'), '16 November 2026');
  assert.equal(U.formatTanggalLahir('1990-05-03'), '03-05-1990');
});

test('validasi NIK tepat 16 digit angka', () => {
  assert.equal(U.validateNIK('7606011234560001'), '');
  assert.notEqual(U.validateNIK('12345'), '');
  assert.notEqual(U.validateNIK('760601123456000A'), '');
  assert.notEqual(U.validateNIK(''), '');
});

test('render template Ganti Rugi, Hibah, Sporadik sesuai aturan persuratan & tanpa umur saksi', () => {
  const settings = { nama_kades: 'KORNELIUS', desa: 'Tobadak', kecamatan: 'Tobadak', kabupaten: 'Mamuju Tengah' };
  const pihak = {
    nama: 'Budi Santoso', tempat_lahir: 'Tobadak', tanggal_lahir: '1985-04-12',
    nik: '7606011204850001', agama: 'Islam', pekerjaan: 'Petani', alamat: 'Dusun Salugatta'
  };
  const baseData = {
    pihak1: pihak,
    pihak2: { ...pihak, nama: 'Andi Wijaya', nik: '7606011204850002' },
    objek: { jenis_tanah: 'Tanah Pekarangan', luas: '325', rt: '02', dusun: 'Salugatta', harga: '70000000', tahun: '2026' },
    perolehan: { cara: 'Ganti Rugi', dari: 'H. Rahman', tahun: '2021' },
    batas: { utara: 'Jalan', timur: 'Kebun Amir', selatan: 'Sungai', barat: 'Tanah Kas Desa' },
    saksi: [
      { nama: 'Saksi Satu', jabatan: 'Kepala Dusun', pekerjaan: 'Kadus', alamat: 'Tobadak' },
      { nama: 'Saksi Dua', jabatan: 'Ketua RT', pekerjaan: 'Ketua RT', alamat: 'Tobadak' },
      { nama: 'Saksi Tiga', jabatan: 'Saksi Pihak I' },
      { nama: 'Saksi Empat', jabatan: 'Saksi Pihak II' }
    ],
    penutup: { tempat: 'Tobadak', tanggal: '2026-11-16' }
  };

  const htmlGR = T.renderLetter('ganti_rugi', baseData, settings);
  assert.match(htmlGR, /PIHAK I \(PERTAMA\) \/ PENJUAL/);
  assert.match(htmlGR, /PIHAK II \(KEDUA\) \/ PEMBELI/);
  assert.match(htmlGR, /Tujuh Puluh Juta Rupiah/);
  assert.match(htmlGR, /Materai<br\/>10\.000/);
  assert.match(htmlGR, /KORNELIUS/);

  const htmlHibah = T.renderLetter('hibah', baseData, settings);
  assert.match(htmlHibah, /PIHAK I \(PERTAMA\) \/ PEMBERI HIBAH/);
  assert.doesNotMatch(htmlHibah, /Pihak II : -/);

  const htmlSporadik = T.renderLetter('sporadik', baseData, settings);
  assert.match(htmlSporadik, /SPORADIK/);
  assert.doesNotMatch(htmlSporadik, /Umur/);
  assert.equal(U.validateForm('sporadik', baseData).length, 0);
});

test('arsip sementara kedaluwarsa otomatis setelah 72 jam & verifikasi PIN', async () => {
  const mem = makeMemStorage();
  const t0 = 1_700_000_000_000;
  S.saveDraft({ jenis: 'hibah', judul: 'Draf Lama', data: {} }, mem, t0);
  assert.equal(S.loadDrafts(mem, t0 + 71 * 3600 * 1000).length, 1);
  assert.equal(S.loadDrafts(mem, t0 + 72 * 3600 * 1000 + 1).length, 0);

  assert.equal(await S.verifyPin('1234', mem), true);
  assert.equal(await S.verifyPin('9999', mem), false);
  await S.setPin('5678', mem);
  assert.equal(await S.verifyPin('5678', mem), true);
});
