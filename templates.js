(function (root) {
  'use strict';

  const U = (typeof require !== 'undefined') ? require('./utils.js') : root.SuratUtils;

  const DEFAULT_WATERMARK_SVG = 'watermark-mamuju-tengah.png';

  function valOrDots(val, dots = '........................') {
    const s = String(val || '').trim();
    return s ? U.escapeHtml(s) : `<span class="dots">${dots}</span>`;
  }

  function upperOrDots(val, dots = '........................') {
    const s = String(val || '').trim();
    return s ? U.escapeHtml(s.toUpperCase()) : `<span class="dots">${dots}</span>`;
  }

  function renderIdentitasTable(pihak) {
    const ttl = [
      String(pihak?.tempat_lahir || '').trim(),
      pihak?.tanggal_lahir ? U.formatTanggalLahir(pihak.tanggal_lahir) : ''
    ].filter(Boolean).join(', ');

    return `
      <table class="id-table">
        <tr><td class="lbl">Nama</td><td class="sep">:</td><td class="val"><strong>${upperOrDots(pihak?.nama)}</strong></td></tr>
        <tr><td class="lbl">Tempat / Tgl. Lahir</td><td class="sep">:</td><td class="val">${valOrDots(ttl)}</td></tr>
        <tr><td class="lbl">NIK</td><td class="sep">:</td><td class="val">${valOrDots(pihak?.nik)}</td></tr>
        <tr><td class="lbl">Agama</td><td class="sep">:</td><td class="val">${valOrDots(pihak?.agama)}</td></tr>
        <tr><td class="lbl">Pekerjaan</td><td class="sep">:</td><td class="val">${valOrDots(pihak?.pekerjaan)}</td></tr>
        <tr><td class="lbl">Alamat</td><td class="sep">:</td><td class="val">${valOrDots(pihak?.alamat)}</td></tr>
      </table>
    `;
  }

  function renderBatasGrid(batas) {
    return `
      <table class="batas-table">
        <tr><td class="b-lbl">Sebelah Utara</td><td class="sep">:</td><td class="b-val">${valOrDots(batas?.utara)}</td></tr>
        <tr><td class="b-lbl">Sebelah Timur</td><td class="sep">:</td><td class="b-val">${valOrDots(batas?.timur)}</td></tr>
        <tr><td class="b-lbl">Sebelah Selatan</td><td class="sep">:</td><td class="b-val">${valOrDots(batas?.selatan)}</td></tr>
        <tr><td class="b-lbl">Sebelah Barat</td><td class="sep">:</td><td class="b-val">${valOrDots(batas?.barat)}</td></tr>
      </table>
    `;
  }

  function renderSignAndWitnesses(data, settings) {
    const tempat = U.escapeHtml(data.penutup?.tempat || settings?.desa || 'Tobadak');
    const tanggal = data.penutup?.tanggal ? U.formatTanggalSurat(data.penutup.tanggal) : '<span class="dots">................</span>';
    const saksi = data.saksi || [{}, {}, {}, {}];
    const defaultRoles = ['Kepala Dusun', 'Ketua RT', 'Saksi Pihak I', 'Saksi Pihak II'];

    return `
      <div class="sign-row-2">
        <div class="sign-col">
          <div>&nbsp;</div>
          <div>Pihak Kedua</div>
          <div class="sign-space"></div>
          <div><strong><u>${upperOrDots(data.pihak2?.nama)}</u></strong></div>
        </div>
        <div class="sign-col">
          <div>${tempat}, ${tanggal}</div>
          <div>Pihak Pertama</div>
          <div class="materai-wrap"><div class="materai-box">Materai<br/>10.000</div></div>
          <div><strong><u>${upperOrDots(data.pihak1?.nama)}</u></strong></div>
        </div>
      </div>

      <div class="witness-title"><u>Saksi – Saksi :</u></div>
      <table class="witness-table-list">
        ${[0, 1, 2, 3].map((i) => `
          <tr>
            <td class="w-num">${i + 1}.</td>
            <td class="w-name">${upperOrDots(saksi[i]?.nama)}</td>
            <td class="w-dots">....................................</td>
            <td class="w-role">(${U.escapeHtml(saksi[i]?.jabatan || defaultRoles[i])})</td>
          </tr>
        `).join('')}
      </table>
    `;
  }

  function renderFooterKades(settings, isCentered = false) {
    const kades = upperOrDots(settings?.nama_kades || 'KORNELIUS');
    const desa = U.escapeHtml(settings?.desa || 'Tobadak');
    if (isCentered) {
      return `
        <div class="kades-block kades-centered">
          <div class="reg-plain">
            <div><span class="reg-lbl">No</span>:</div>
            <div><span class="reg-lbl">Tanggal</span>:</div>
          </div>
          <div class="kades-sign">
            <div>Mengetahui</div>
            <div>Kepala Desa ${desa}</div>
            <div class="sign-space-sm"></div>
            <div class="sign-name"><strong><u>${kades}</u></strong></div>
          </div>
        </div>
      `;
    }
    return `
      <div class="kades-block">
        <div class="reg-box">
          <div>Nomor &nbsp;&nbsp;&nbsp;: ..............................</div>
          <div>Tanggal &nbsp;: ..............................</div>
        </div>
        <div class="kades-sign">
          <div>Mengetahui,</div>
          <div>Kepala Desa ${desa}</div>
          <div class="sign-space-sm"></div>
          <div class="sign-name"><strong><u>${kades}</u></strong></div>
        </div>
      </div>
    `;
  }

  function wrapPage(innerHtml, settings) {
    const wm = settings?.logo_watermark || DEFAULT_WATERMARK_SVG;
    return `
      <div class="sheet-page">
        <div class="frame-outer">
          <span class="corner tl"></span>
          <span class="corner tr"></span>
          <span class="corner bl"></span>
          <span class="corner br"></span>
          <div class="frame-inner">
            <img class="watermark" src="${wm}" alt="" />
            <div class="sheet-content">
              ${innerHtml}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderGantiRugi(data, settings) {
    const desa = U.escapeHtml(data.objek?.desa || settings?.desa || 'Tobadak');
    const kec = U.escapeHtml(data.objek?.kecamatan || settings?.kecamatan || 'Tobadak');
    const kab = U.escapeHtml(data.objek?.kabupaten || settings?.kabupaten || 'Mamuju Tengah');
    const jenisTanah = U.escapeHtml(data.objek?.jenis_tanah || 'Tanah Pekarangan');
    const luas = data.objek?.luas ? `${U.escapeHtml(data.objek.luas)} m²` : '<span class="dots">......</span> m²';
    const hargaNum = Number(String(data.objek?.harga || '').replace(/[^\d]/g, ''));
    const hargaFmt = hargaNum > 0 ? U.formatRupiah(hargaNum) : 'Rp <span class="dots">............</span>';
    const terbilangFmt = hargaNum > 0 ? U.terbilang(hargaNum) : '<span class="dots">........................</span>';
    const noSertifikat = String(data.objek?.no_sertifikat || '').trim();
    const sertifikatClause = noSertifikat ? ` (No. Sertifikat: ${U.escapeHtml(noSertifikat)})` : '';
    const tempat = U.escapeHtml(data.penutup?.tempat || settings?.desa || 'Tobadak');
    const tanggal = data.penutup?.tanggal ? U.formatTanggalSurat(data.penutup.tanggal) : '<span class="dots">................</span>';
    const saksi = data.saksi || [{}, {}, {}, {}];

    const body = `
      <h1 class="doc-title">SURAT KETERANGAN GANTI RUGI TANAH</h1>

      <p class="para">Yang bertanda tangan di bawah ini masing-masing:</p>

      <div class="party-block">
        <div class="party-head"><strong>1. PIHAK I (PERTAMA) / PENJUAL :</strong></div>
        ${renderIdentitasTable(data.pihak1)}
      </div>

      <div class="party-block">
        <div class="party-head"><strong>2. PIHAK II (KEDUA) / PEMBELI :</strong></div>
        ${renderIdentitasTable(data.pihak2)}
      </div>

      <p class="para">
        Dengan ini menyatakan bahwa pada tahun <strong>${valOrDots(data.objek?.tahun, '......')}</strong>,
        <strong>Pihak I (Pertama)</strong> telah menyerahkan / menjual sebidang <strong>${jenisTanah}</strong>${sertifikatClause}
        seluas <strong>${luas}</strong> yang terletak di RT ${valOrDots(data.objek?.rt, '...')} Dusun ${valOrDots(data.objek?.dusun)}
        Desa ${desa}, Kecamatan ${kec}, Kabupaten ${kab}, kepada <strong>Pihak II (Kedua)</strong>
        dengan nilai ganti rugi sebesar <strong>${hargaFmt}</strong>
        (<em>${terbilangFmt}</em>), Dengan Batas-batas Sebagai Berikut:
      </p>

      ${renderBatasGrid(data.batas)}

      <p class="para">
        Kesepakatan ganti rugi ini dibuat atas dasar musyawarah mufakat tanpa ada paksaan dari pihak mana pun.
        Apabila di kemudian hari terdapat gugatan atau tuntutan dari pihak lain atas tanah tersebut, maka
        <strong>Pihak I (Pertama)</strong> bertanggung jawab sepenuhnya untuk menyelesaikannya serta tidak akan
        mengganggu gugat lagi hingga ahli waris maupun anak cucu Pihak I (Pertama).
      </p>

      ${renderSignAndWitnesses(data, settings)}

      ${renderFooterKades(settings, true)}
    `;
    return wrapPage(body, settings);
  }

  function renderHibah(data, settings) {
    const desa = U.escapeHtml(data.objek?.desa || settings?.desa || 'Tobadak');
    const kec = U.escapeHtml(data.objek?.kecamatan || settings?.kecamatan || 'Tobadak');
    const kab = U.escapeHtml(data.objek?.kabupaten || settings?.kabupaten || 'Mamuju Tengah');
    const luas = data.objek?.luas ? `${U.escapeHtml(data.objek.luas)} m²` : '<span class="dots">......</span> m²';
    const tempat = U.escapeHtml(data.penutup?.tempat || settings?.desa || 'Tobadak');
    const tanggal = data.penutup?.tanggal ? U.formatTanggalSurat(data.penutup.tanggal) : '<span class="dots">................</span>';
    const saksi = data.saksi || [{}, {}, {}, {}];

    const body = `
      <h1 class="doc-title">SURAT KETERANGAN HIBAH TANAH</h1>

      <p class="para">Yang bertanda tangan di bawah ini masing-masing:</p>

      <div class="party-block">
        <div class="party-head"><strong>1. PIHAK I (PERTAMA) / PEMBERI HIBAH :</strong></div>
        ${renderIdentitasTable(data.pihak1)}
      </div>

      <div class="party-block">
        <div class="party-head"><strong>2. PIHAK II (KEDUA) / PENERIMA HIBAH :</strong></div>
        ${renderIdentitasTable(data.pihak2)}
      </div>

      <p class="para">
        Dengan ini menyatakan bahwa pada tahun <strong>${valOrDots(data.objek?.tahun, '......')}</strong>,
        <strong>Pihak I (Pertama)</strong> dengan tulus ikhlas tanpa paksaan dari pihak mana pun telah menghibahkan
        sebidang tanah seluas <strong>${luas}</strong> yang terletak di RT ${valOrDots(data.objek?.rt, '...')}
        Dusun ${valOrDots(data.objek?.dusun)} Desa ${desa}, Kecamatan ${kec}, Kabupaten ${kab},
        kepada <strong>Pihak II (Kedua)</strong>, Dengan Batas-batas Sebagai Berikut:
      </p>

      ${renderBatasGrid(data.batas)}

      <p class="para">
        Sejak surat keterangan hibah ini ditandatangani, tanah tersebut menjadi hak milik <strong>Pihak II (Kedua)</strong>
        dan tidak dapat diganggu gugat oleh siapa pun termasuk ahli waris, anak, hingga cucu-cucu dari
        <strong>Pihak I (Pertama)</strong>.
      </p>

      ${renderSignAndWitnesses(data, settings)}

      ${renderFooterKades(settings, true)}
    `;
    return wrapPage(body, settings);
  }

  function renderSporadik(data, settings) {
    const desa = U.escapeHtml(data.objek?.desa || settings?.desa || 'Tobadak');
    const kec = U.escapeHtml(data.objek?.kecamatan || settings?.kecamatan || 'Tobadak');
    const kab = U.escapeHtml(data.objek?.kabupaten || settings?.kabupaten || 'Mamuju Tengah');
    const luas = data.objek?.luas ? `${U.escapeHtml(data.objek.luas)} m²` : '<span class="dots">......</span> m²';
    const tempat = U.escapeHtml(data.penutup?.tempat || settings?.desa || 'Tobadak');
    const tanggal = data.penutup?.tanggal ? U.formatTanggalSurat(data.penutup.tanggal) : '<span class="dots">................</span>';
    const saksi = data.saksi || [{}, {}];

    const body = `
      <h1 class="doc-title">SURAT PERNYATAAN PENGUASAAN FISIK BIDANG TANAH<br/>(SPORADIK)</h1>

      <p class="para">Yang bertanda tangan di bawah ini:</p>
      ${renderIdentitasTable(data.pihak1)}

      <p class="para">Dengan ini menyatakan dengan sebenarnya bahwa saya dengan itikad baik telah menguasai sebidang tanah yang terletak di:</p>

      <table class="id-table">
        <tr><td class="lbl">Dusun / RT-RW</td><td class="sep">:</td><td class="val">Dusun ${valOrDots(data.objek?.dusun)} / RT-RW ${valOrDots(data.objek?.rt, '...')}</td></tr>
        <tr><td class="lbl">Desa / Kelurahan</td><td class="sep">:</td><td class="val">${desa}</td></tr>
        <tr><td class="lbl">Kecamatan</td><td class="sep">:</td><td class="val">${kec}</td></tr>
        <tr><td class="lbl">Kabupaten</td><td class="sep">:</td><td class="val">${kab}</td></tr>
        <tr><td class="lbl">NJB</td><td class="sep">:</td><td class="val">${valOrDots(data.objek?.njb, '-')}</td></tr>
        <tr><td class="lbl">Status Tanah</td><td class="sep">:</td><td class="val">${valOrDots(data.objek?.status_tanah, 'Tanah Negara')}</td></tr>
        <tr><td class="lbl">Digunakan Untuk</td><td class="sep">:</td><td class="val">${valOrDots(data.objek?.penggunaan, 'Kebun')}</td></tr>
        <tr><td class="lbl">Luas Tanah</td><td class="sep">:</td><td class="val"><strong>${luas}</strong></td></tr>
      </table>

      <p class="para-tight">Dengan Batas-batas Sebagai Berikut:</p>
      ${renderBatasGrid(data.batas)}

      <p class="para">
        Bidang tanah tersebut saya peroleh melalui <strong>${valOrDots(data.perolehan?.cara)}</strong>
        dari <strong>${valOrDots(data.perolehan?.dari)}</strong> pada tahun <strong>${valOrDots(data.perolehan?.tahun, '......')}</strong>,
        dan sampai saat ini saya kuasai secara terus-menerus, tidak dijadikan jaminan utang, serta tidak dalam sengketa dengan pihak mana pun.
        Surat pernyataan ini saya buat dengan sebenarnya dan apabila pernyataan ini tidak benar saya bersedia diangkat sumpah serta dituntut sesuai hukum yang berlaku.
      </p>

      <div class="sporadik-bottom">
        <div class="sporadik-witnesses">
          <div class="witness-title">Saksi-saksi :</div>
          ${[0, 1].map((idx) => `
            <div class="s-witness-item">
              <div><strong>${idx + 1}. Nama</strong> : ${valOrDots(saksi[idx]?.nama)}</div>
              <div>&nbsp;&nbsp;&nbsp;Pekerjaan/Jabatan : ${valOrDots(saksi[idx]?.pekerjaan)}</div>
              <div>&nbsp;&nbsp;&nbsp;Alamat : ${valOrDots(saksi[idx]?.alamat)}</div>
              <div>&nbsp;&nbsp;&nbsp;Tanda Tangan : (........................)</div>
            </div>
          `).join('')}
        </div>
        <div class="sporadik-declarant">
          <div>${tempat}, ${tanggal}</div>
          <div>Yang Membuat Pernyataan,</div>
          <div class="materai-wrap"><div class="materai-box">Materai<br/>10.000</div></div>
          <div><strong><u>${upperOrDots(data.pihak1?.nama)}</u></strong></div>
        </div>
      </div>

      ${renderFooterKades(settings)}
    `;
    return wrapPage(body, settings);
  }

  function renderLetter(jenis, data, settings) {
    if (jenis === 'ganti_rugi') return renderGantiRugi(data, settings);
    if (jenis === 'hibah') return renderHibah(data, settings);
    if (jenis === 'sporadik') return renderSporadik(data, settings);
    return '<p>Jenis surat tidak dikenal.</p>';
  }

  const api = { renderLetter, DEFAULT_WATERMARK_SVG };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.SuratTemplates = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
