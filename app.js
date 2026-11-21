(function () {
  'use strict';

  const U = window.SuratUtils;
  const T = window.SuratTemplates;
  const S = window.SuratStorage;

  const JENIS_LABEL = {
    ganti_rugi: 'Surat Keterangan Ganti Rugi Tanah',
    hibah: 'Surat Keterangan Hibah Tanah',
    sporadik: 'Surat Pernyataan Penguasaan Fisik (Sporadik)'
  };

  const AGAMA_LIST = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu'];

  let state = {
    view: 'home',
    jenis: 'ganti_rugi',
    draftId: null,
    step: 0,
    settings: S.getSettings(),
    data: null
  };

  function emptyPihak() {
    return { nama: '', tempat_lahir: '', tanggal_lahir: '', nik: '', agama: 'Islam', pekerjaan: '', alamat: '' };
  }

  function createEmptyData(jenis) {
    const s = state.settings;
    const today = new Date().toISOString().slice(0, 10);
    const pSaksi = s.preset_saksi || [];
    const base = {
      pihak1: emptyPihak(),
      pihak2: emptyPihak(),
      objek: {
        jenis_tanah: 'Tanah Pekarangan',
        no_sertifikat: '',
        luas: '',
        rt: '',
        dusun: '',
        desa: s.desa || 'Tobadak',
        kecamatan: s.kecamatan || 'Tobadak',
        kabupaten: s.kabupaten || 'Mamuju Tengah',
        harga: '',
        tahun: String(new Date().getFullYear()),
        njb: '',
        status_tanah: 'Tanah Negara',
        penggunaan: 'Kebun'
      },
      perolehan: { cara: 'Ganti Rugi', dari: '', tahun: '' },
      batas: { utara: '', timur: '', selatan: '', barat: '' },
      saksi: jenis === 'sporadik'
        ? [
            { nama: '', pekerjaan: '', alamat: '' },
            { nama: '', pekerjaan: '', alamat: '' }
          ]
        : [
            { nama: pSaksi[0]?.nama || '', jabatan: 'Kepala Dusun' },
            { nama: pSaksi[1]?.nama || '', jabatan: 'Ketua RT' },
            { nama: '', jabatan: 'Saksi Pihak I' },
            { nama: '', jabatan: 'Saksi Pihak II' }
          ],
      penutup: {
        tempat: s.desa || 'Tobadak',
        tanggal: today
      }
    };
    return base;
  }

  const $ = (id) => document.getElementById(id);

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme || 'light');
  }

  function updateTopbar() {
    const drafts = S.loadDrafts();
    $('archive-count').textContent = drafts.length;
    $('brand-sub').textContent = `Desa ${state.settings.desa}, Kec. ${state.settings.kecamatan}, Kab. ${state.settings.kabupaten}`;
  }

  function showView(name) {
    state.view = name;
    ['home', 'editor', 'archive'].forEach((v) => {
      $('view-' + v).classList.toggle('hidden', v !== name);
    });
    if (name === 'archive') renderArchive();
    updateTopbar();
  }

  function getSteps() {
    if (state.jenis === 'sporadik') {
      return ['Yang Menyatakan', 'Objek & Perolehan', 'Batas-batas', 'Saksi (2)', 'Penutup'];
    }
    return ['Pihak I & II', 'Objek Tanah', 'Batas-batas', 'Saksi (4)', 'Penutup'];
  }

  function renderField(label, path, opts = {}) {
    const val = getByPath(state.data, path) ?? '';
    const type = opts.type || 'text';
    const placeholder = opts.placeholder || '';
    const extraAttr = opts.maxlength ? `maxlength="${opts.maxlength}"` : '';
    let inputHtml = '';
    if (type === 'select') {
      const options = (opts.options || []).map((o) => `<option value="${U.escapeHtml(o)}" ${val === o ? 'selected' : ''}>${U.escapeHtml(o)}</option>`).join('');
      inputHtml = `<select data-path="${path}" class="ui-input">${options}</select>`;
    } else {
      inputHtml = `<input type="${type}" data-path="${path}" value="${U.escapeHtml(val)}" placeholder="${U.escapeHtml(placeholder)}" class="ui-input" ${extraAttr} />`;
    }
    let hintHtml = opts.hint ? `<div class="field-hint">${opts.hint}</div>` : '';
    if (opts.isNik && val) {
      const err = U.validateNIK(val);
      if (err) hintHtml = `<div class="field-error">${err}</div>`;
    }
    if (opts.isHarga && val) {
      const t = U.terbilang(val);
      hintHtml = `<div class="field-hint">${U.formatRupiah(val)} ${t ? `(${t})` : ''}</div>`;
    }
    return `<div class="field-group"><label class="field-lbl">${label}</label>${inputHtml}${hintHtml}</div>`;
  }

  function renderPihakFields(prefix, title) {
    return `
      <fieldset class="ui-fieldset">
        <legend>${title}</legend>
        ${renderField('Nama Lengkap', `${prefix}.nama`, { placeholder: 'Otomatis kapital di surat' })}
        <div class="field-grid-2">
          ${renderField('Tempat Lahir', `${prefix}.tempat_lahir`)}
          ${renderField('Tanggal Lahir', `${prefix}.tanggal_lahir`, { type: 'date' })}
        </div>
        <div class="field-grid-2">
          ${renderField('NIK (16 digit)', `${prefix}.nik`, { maxlength: 16, isNik: true, placeholder: '16 digit angka' })}
          ${renderField('Agama', `${prefix}.agama`, { type: 'select', options: AGAMA_LIST })}
        </div>
        ${renderField('Pekerjaan', `${prefix}.pekerjaan`)}
        ${renderField('Alamat', `${prefix}.alamat`)}
      </fieldset>
    `;
  }

  function renderStepBody() {
    const step = state.step;
    const j = state.jenis;

    if (step === 0) {
      if (j === 'ganti_rugi') {
        return renderPihakFields('pihak1', 'Pihak I (Pertama) – Penjual / Pemilik') +
               renderPihakFields('pihak2', 'Pihak II (Kedua) – Pembeli');
      }
      if (j === 'hibah') {
        return renderPihakFields('pihak1', 'Pihak I (Pertama) – Pemberi Hibah') +
               renderPihakFields('pihak2', 'Pihak II (Kedua) – Penerima Hibah');
      }
      return renderPihakFields('pihak1', 'Yang Membuat Pernyataan');
    }

    if (step === 1) {
      if (j === 'ganti_rugi') {
        return `
          <div class="field-grid-2">
            ${renderField('Jenis Tanah', 'objek.jenis_tanah', { type: 'select', options: ['Tanah Pekarangan', 'Tanah Kebun', 'Tanah Sawah'] })}
            ${renderField('No. Sertifikat (opsional)', 'objek.no_sertifikat')}
          </div>
          <div class="field-grid-2">
            ${renderField('Luas Tanah (m²)', 'objek.luas', { type: 'number', placeholder: 'Contoh: 325' })}
            ${renderField('Tahun Transaksi', 'objek.tahun', { type: 'number' })}
          </div>
          ${renderField('Harga Ganti Rugi (Rp)', 'objek.harga', { type: 'number', isHarga: true, placeholder: 'Contoh: 70000000' })}
          <div class="field-grid-2">
            ${renderField('RT', 'objek.rt')}
            ${renderField('Dusun', 'objek.dusun')}
          </div>
          <div class="field-grid-2">
            ${renderField('Desa', 'objek.desa')}
            ${renderField('Kecamatan', 'objek.kecamatan')}
          </div>
          ${renderField('Kabupaten', 'objek.kabupaten')}
        `;
      }
      if (j === 'hibah') {
        return `
          <div class="field-grid-2">
            ${renderField('Luas Tanah (m²)', 'objek.luas', { type: 'number', placeholder: 'Contoh: 400' })}
            ${renderField('Tahun Hibah', 'objek.tahun', { type: 'number' })}
          </div>
          <div class="field-grid-2">
            ${renderField('RT', 'objek.rt')}
            ${renderField('Dusun', 'objek.dusun')}
          </div>
          <div class="field-grid-2">
            ${renderField('Desa', 'objek.desa')}
            ${renderField('Kecamatan', 'objek.kecamatan')}
          </div>
          ${renderField('Kabupaten', 'objek.kabupaten')}
        `;
      }
      // Sporadik
      return `
        <div class="field-grid-2">
          ${renderField('Dusun', 'objek.dusun')}
          ${renderField('RT / RW', 'objek.rt')}
        </div>
        <div class="field-grid-2">
          ${renderField('Desa / Kelurahan', 'objek.desa')}
          ${renderField('Kecamatan', 'objek.kecamatan')}
        </div>
        <div class="field-grid-2">
          ${renderField('Kabupaten', 'objek.kabupaten')}
          ${renderField('NJB', 'objek.njb', { placeholder: 'Opsional / -' })}
        </div>
        <div class="field-grid-2">
          ${renderField('Status Tanah', 'objek.status_tanah', { placeholder: 'Tanah Negara' })}
          ${renderField('Digunakan Untuk', 'objek.penggunaan', { placeholder: 'Kebun / Pekarangan' })}
        </div>
        ${renderField('Luas Tanah (m²)', 'objek.luas', { type: 'number' })}
        <hr style="border:0; border-top:1px solid var(--border); margin:0.75rem 0;" />
        <div class="field-grid-2">
          ${renderField('Cara Perolehan', 'perolehan.cara', { type: 'select', options: ['Ganti Rugi', 'Hibah', 'Warisan', 'Pembukaan Lahan', 'Lainnya'] })}
          ${renderField('Tahun Perolehan', 'perolehan.tahun', { type: 'number' })}
        </div>
        ${renderField('Diperoleh Dari', 'perolehan.dari', { placeholder: 'Nama pemilik sebelumnya' })}
      `;
    }

    if (step === 2) {
      return `
        ${renderField('Batas Sebelah Utara', 'batas.utara', { placeholder: 'Contoh: ARDIN' })}
        ${renderField('Batas Sebelah Timur', 'batas.timur', { placeholder: 'Contoh: Jalan' })}
        ${renderField('Batas Sebelah Selatan', 'batas.selatan', { placeholder: 'Contoh: IRA' })}
        ${renderField('Batas Sebelah Barat', 'batas.barat', { placeholder: 'Contoh: NUR ARFA' })}
      `;
    }

    if (step === 3) {
      if (j === 'sporadik') {
        const placeholders = [
          { nama: 'Contoh: MUHAMMAD IRWANSYAH', pekerjaan: 'Contoh: Kepala Dusun Sipudeceng', alamat: 'Contoh: Dusun Sipudeceng, Desa Tobadak' },
          { nama: 'Contoh: M. TAKDIR', pekerjaan: 'Contoh: Ketua RT.003', alamat: 'Contoh: Dusun Sipudeceng, Desa Tobadak' }
        ];
        return [0, 1].map((i) => `
          <fieldset class="ui-fieldset">
            <legend>Saksi ${i + 1}</legend>
            ${renderField('Nama Saksi', `saksi.${i}.nama`, { placeholder: placeholders[i].nama })}
            ${renderField('Pekerjaan', `saksi.${i}.pekerjaan`, { placeholder: placeholders[i].pekerjaan })}
            ${renderField('Alamat', `saksi.${i}.alamat`, { placeholder: placeholders[i].alamat })}
          </fieldset>
        `).join('');
      }
      return [0, 1, 2, 3].map((i) => `
        <div class="field-grid-2">
          ${renderField(`Nama Saksi ${i + 1}`, `saksi.${i}.nama`)}
          ${renderField('Jabatan / Peran', `saksi.${i}.jabatan`)}
        </div>
      `).join('');
    }

    // Step 4: Penutup
    return `
      ${renderField('Tempat Surat', 'penutup.tempat')}
      ${renderField('Tanggal Surat', 'penutup.tanggal', { type: 'date' })}
      <div class="field-hint">Nama Kepala Desa pada surat mengikuti Pengaturan: <strong>${U.escapeHtml(state.settings.nama_kades)}</strong>.</div>
    `;
  }

  function getByPath(obj, path) {
    return path.split('.').reduce((acc, k) => (acc == null ? undefined : acc[k]), obj);
  }

  function setByPath(obj, path, val) {
    const keys = path.split('.');
    let cur = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      if (cur[keys[i]] == null) cur[keys[i]] = {};
      cur = cur[keys[i]];
    }
    cur[keys[keys.length - 1]] = val;
  }

  function renderEditor() {
    $('editor-title').textContent = JENIS_LABEL[state.jenis];
    const steps = getSteps();
    $('step-tabs').innerHTML = steps.map((label, idx) =>
      `<button class="step-tab ${idx === state.step ? 'active' : ''}" data-step="${idx}">${idx + 1}. ${label}</button>`
    ).join('');

    $('form-body').innerHTML = renderStepBody();
    $('btn-prev-step').disabled = state.step === 0;
    $('btn-next-step').disabled = state.step === steps.length - 1;
    renderPreview();
  }

  function renderPreview() {
    const html = T.renderLetter(state.jenis, state.data, state.settings);
    $('live-preview').innerHTML = html;
    applyPreviewZoom();
  }

  function applyPreviewZoom() {
    const z = Number($('preview-zoom').value || 0.65);
    $('zoom-label').textContent = Math.round(z * 100) + '%';
    const scaleEl = $('preview-scale');
    scaleEl.style.transform = `scale(${z})`;
    scaleEl.style.width = `calc(21.59cm * ${z})`;
    scaleEl.style.height = `calc(33cm * ${z})`;
  }

  function startNewLetter(jenis) {
    state.jenis = jenis;
    state.draftId = null;
    state.step = 0;
    state.data = createEmptyData(jenis);
    $('form-errors').classList.add('hidden');
    showView('editor');
    renderEditor();
  }

  function saveCurrentDraft(status = 'draf') {
    const namaP1 = String(state.data?.pihak1?.nama || '').trim() || 'Belum Bernama';
    const judul = `${JENIS_LABEL[state.jenis]} – ${namaP1.toUpperCase()}`;
    const saved = S.saveDraft({
      id: state.draftId,
      jenis: state.jenis,
      judul,
      data: state.data,
      status
    });
    state.draftId = saved.id;
    updateTopbar();
    return saved;
  }

  function renderArchive() {
    const drafts = S.loadDrafts();
    const listEl = $('archive-list');
    if (drafts.length === 0) {
      listEl.innerHTML = `<div class="panel"><div class="panel-body" style="font-size:0.85rem; color:var(--muted);">Belum ada draf tersimpan di Arsip Sementara.</div></div>`;
      return;
    }
    listEl.innerHTML = drafts.map((d) => {
      const sisa = U.formatSisaWaktu(d.expires_at);
      const tgl = new Date(d.updated_at).toLocaleString('id-ID');
      return `
        <div class="archive-item">
          <div>
            <div style="font-size:0.9rem; font-weight:600;">${U.escapeHtml(d.judul)}</div>
            <div style="font-size:0.78rem; color:var(--muted); margin-top:0.2rem;">
              Disimpan: ${tgl} · Status: ${d.status === 'dicetak' ? 'Sudah dicetak' : 'Draf'}
            </div>
            <div style="margin-top:0.35rem;">
              <span class="countdown-pill ${sisa.warning ? 'warn' : ''}">${sisa.text}</span>
            </div>
          </div>
          <div style="display:flex; gap:0.4rem; flex-wrap:wrap;">
            <button class="btn btn-sm btn-primary" data-arch-open="${d.id}">Buka / Edit</button>
            <button class="btn btn-sm" data-arch-dup="${d.id}">Duplikat</button>
            <button class="btn btn-sm" data-arch-print="${d.id}">Cetak</button>
            <button class="btn btn-sm btn-danger" data-arch-del="${d.id}">Hapus</button>
          </div>
        </div>
      `;
    }).join('');
  }

  function printLetter() {
    const errors = U.validateForm(state.jenis, state.data);
    const errBox = $('form-errors');
    if (errors.length > 0) {
      errBox.innerHTML = `<strong>Periksa kembali isian berikut sebelum mencetak:</strong><ul style="margin:0.35rem 0 0 1.2rem; padding:0;">${errors.map((e) => `<li>${U.escapeHtml(e)}</li>`).join('')}</ul>`;
      errBox.classList.remove('hidden');
      errBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }
    errBox.classList.add('hidden');
    if (state.draftId) saveCurrentDraft('dicetak');
    $('print-area').innerHTML = T.renderLetter(state.jenis, state.data, state.settings);
    window.print();
    if (state.draftId) {
      $('modal-post-print').classList.remove('hidden');
    }
  }

  function openSettings() {
    const s = state.settings;
    $('set-kades').value = s.nama_kades || '';
    $('set-desa').value = s.desa || '';
    $('set-kecamatan').value = s.kecamatan || '';
    $('set-kabupaten').value = s.kabupaten || '';
    $('set-kadus').value = s.preset_saksi?.[0]?.nama || '';
    $('set-rt').value = s.preset_saksi?.[1]?.nama || '';
    $('set-new-pin').value = '';
    $('modal-settings').classList.remove('hidden');
  }

  function openCopyPartyModal() {
    const drafts = S.loadDrafts();
    const el = $('copy-list');
    if (drafts.length === 0) {
      el.innerHTML = '<p style="font-size:0.8rem; color:var(--muted);">Belum ada draf di Arsip Sementara.</p>';
    } else {
      const items = [];
      drafts.forEach((d) => {
        if (d.data?.pihak1?.nama) {
          items.push({ label: `${d.data.pihak1.nama} (Pihak I – ${JENIS_LABEL[d.jenis]})`, pihak: d.data.pihak1 });
        }
        if (d.data?.pihak2?.nama) {
          items.push({ label: `${d.data.pihak2.nama} (Pihak II – ${JENIS_LABEL[d.jenis]})`, pihak: d.data.pihak2 });
        }
      });
      el.innerHTML = items.length === 0
        ? '<p style="font-size:0.8rem; color:var(--muted);">Tidak ada data pihak yang tersimpan.</p>'
        : items.map((it, idx) => `
          <div style="display:flex; align-items:center; justify-content:space-between; gap:0.5rem; padding:0.55rem 0; border-bottom:1px solid var(--border);">
            <span style="font-size:0.8rem;">${U.escapeHtml(it.label)}</span>
            <span style="display:flex; gap:0.35rem; flex-shrink:0;">
              <button class="btn btn-sm" data-copy-idx="${idx}" data-target="pihak1">Ke Pihak I</button>
              ${state.jenis !== 'sporadik' ? `<button class="btn btn-sm" data-copy-idx="${idx}" data-target="pihak2">Ke Pihak II</button>` : ''}
            </span>
          </div>
        `).join('');
      el._items = items;
    }
    $('modal-copy').classList.remove('hidden');
  }

  function checkPinGate() {
    if (sessionStorage.getItem(S.KEYS.UNLOCKED) === '1') return;
    $('modal-pin').classList.remove('hidden');
    $('pin-input').focus();
  }

  // Event Listeners
  function bindEvents() {
    document.querySelectorAll('[data-new]').forEach((btn) => {
      btn.addEventListener('click', () => startNewLetter(btn.getAttribute('data-new')));
    });

    $('nav-home').addEventListener('click', () => showView('home'));
    $('nav-archive').addEventListener('click', () => showView('archive'));
    $('nav-settings').addEventListener('click', openSettings);

    $('toggle-theme').addEventListener('click', () => {
      const next = state.settings.theme === 'dark' ? 'light' : 'dark';
      state.settings.theme = next;
      S.saveSettings(state.settings);
      applyTheme(next);
    });

    $('btn-lock').addEventListener('click', () => {
      sessionStorage.removeItem(S.KEYS.UNLOCKED);
      $('pin-input').value = '';
      $('pin-error').classList.add('hidden');
      $('modal-pin').classList.remove('hidden');
    });

    $('btn-unlock').addEventListener('click', async () => {
      const ok = await S.verifyPin($('pin-input').value);
      if (ok) {
        sessionStorage.setItem(S.KEYS.UNLOCKED, '1');
        $('modal-pin').classList.add('hidden');
        $('pin-error').classList.add('hidden');
      } else {
        $('pin-error').classList.remove('hidden');
      }
    });
    $('pin-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') $('btn-unlock').click();
    });

    $('step-tabs').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-step]');
      if (!btn) return;
      state.step = Number(btn.getAttribute('data-step'));
      renderEditor();
    });

    $('btn-prev-step').addEventListener('click', () => {
      if (state.step > 0) { state.step--; renderEditor(); }
    });
    $('btn-next-step').addEventListener('click', () => {
      if (state.step < getSteps().length - 1) { state.step++; renderEditor(); }
    });

    // Live form input binding (< 10ms preview update)
    $('form-body').addEventListener('input', (e) => {
      const path = e.target.getAttribute('data-path');
      if (!path) return;
      setByPath(state.data, path, e.target.value);
      renderPreview();
      // Update inline NIK / Terbilang hint without losing focus
      const group = e.target.closest('.field-group');
      if (!group) return;
      if (path.endsWith('.nik')) {
        let hint = group.querySelector('.field-error');
        const err = e.target.value ? U.validateNIK(e.target.value) : '';
        if (err) {
          if (!hint) { hint = document.createElement('div'); hint.className = 'field-error'; group.appendChild(hint); }
          hint.textContent = err;
        } else if (hint) {
          hint.remove();
        }
      } else if (path === 'objek.harga') {
        let hint = group.querySelector('.field-hint');
        if (!hint) { hint = document.createElement('div'); hint.className = 'field-hint'; group.appendChild(hint); }
        const t = U.terbilang(e.target.value);
        hint.textContent = e.target.value ? `${U.formatRupiah(e.target.value)} ${t ? `(${t})` : ''}` : '';
      }
    });

    $('form-body').addEventListener('change', (e) => {
      const path = e.target.getAttribute('data-path');
      if (!path) return;
      setByPath(state.data, path, e.target.value);
      renderPreview();
    });

    $('preview-zoom').addEventListener('input', applyPreviewZoom);

    $('btn-save-draft').addEventListener('click', () => {
      try {
        saveCurrentDraft('draf');
        alert('Draf disimpan ke Arsip Sementara (berlaku 3 hari / 72 jam).');
      } catch (err) {
        alert(err.message);
      }
    });

    $('btn-print').addEventListener('click', printLetter);

    $('btn-keep-after-print').addEventListener('click', () => {
      $('modal-post-print').classList.add('hidden');
    });
    $('btn-delete-after-print').addEventListener('click', () => {
      if (state.draftId) {
        S.deleteDraft(state.draftId);
        state.draftId = null;
        updateTopbar();
      }
      $('modal-post-print').classList.add('hidden');
    });

    // Archive actions
    $('archive-list').addEventListener('click', (e) => {
      const openId = e.target.getAttribute('data-arch-open');
      const dupId = e.target.getAttribute('data-arch-dup');
      const printId = e.target.getAttribute('data-arch-print');
      const delId = e.target.getAttribute('data-arch-del');
      const drafts = S.loadDrafts();

      if (openId) {
        const d = drafts.find((x) => x.id === openId);
        if (!d) return;
        state.jenis = d.jenis;
        state.draftId = d.id;
        state.step = 0;
        state.data = JSON.parse(JSON.stringify(d.data));
        $('form-errors').classList.add('hidden');
        showView('editor');
        renderEditor();
      } else if (dupId) {
        const d = drafts.find((x) => x.id === dupId);
        if (!d) return;
        S.saveDraft({ jenis: d.jenis, judul: d.judul + ' (Salinan)', data: JSON.parse(JSON.stringify(d.data)) });
        renderArchive();
        updateTopbar();
      } else if (printId) {
        const d = drafts.find((x) => x.id === printId);
        if (!d) return;
        state.jenis = d.jenis;
        state.draftId = d.id;
        state.data = JSON.parse(JSON.stringify(d.data));
        showView('editor');
        renderEditor();
        printLetter();
      } else if (delId) {
        if (confirm('Hapus draf ini dari Arsip Sementara?')) {
          S.deleteDraft(delId);
          renderArchive();
          updateTopbar();
        }
      }
    });

    // Copy party modal
    $('btn-copy-party').addEventListener('click', openCopyPartyModal);
    $('btn-close-copy').addEventListener('click', () => $('modal-copy').classList.add('hidden'));
    $('copy-list').addEventListener('click', (e) => {
      const idx = e.target.getAttribute('data-copy-idx');
      const target = e.target.getAttribute('data-target');
      if (idx == null || !target) return;
      const item = $('copy-list')._items?.[Number(idx)];
      if (!item) return;
      state.data[target] = JSON.parse(JSON.stringify(item.pihak));
      $('modal-copy').classList.add('hidden');
      renderEditor();
    });

    // Settings modal
    $('btn-close-settings').addEventListener('click', () => $('modal-settings').classList.add('hidden'));
    $('btn-reset-logo').addEventListener('click', () => {
      state.settings.logo_watermark = '';
      $('set-logo-file').value = '';
      alert('Logo dikembalikan ke default (klik Simpan Pengaturan).');
    });
    $('btn-save-settings').addEventListener('click', async () => {
      const file = $('set-logo-file').files?.[0];
      if (file && file.size > 1.5 * 1024 * 1024) {
        alert('Ukuran file logo maksimal 1,5 MB agar tidak memenuhi penyimpanan browser.');
        return;
      }
      const finishSave = async (logoDataUrl) => {
        try {
          state.settings.nama_kades = $('set-kades').value.trim() || 'KORNELIUS';
          state.settings.desa = $('set-desa').value.trim() || 'Tobadak';
          state.settings.kecamatan = $('set-kecamatan').value.trim() || 'Tobadak';
          state.settings.kabupaten = $('set-kabupaten').value.trim() || 'Mamuju Tengah';
          state.settings.preset_saksi = [
            { nama: $('set-kadus').value.trim(), jabatan: 'Kepala Dusun' },
            { nama: $('set-rt').value.trim(), jabatan: 'Ketua RT' }
          ];
          if (logoDataUrl !== undefined) state.settings.logo_watermark = logoDataUrl;
          S.saveSettings(state.settings);
          const newPin = $('set-new-pin').value.trim();
          if (newPin) await S.setPin(newPin);
          $('modal-settings').classList.add('hidden');
          updateTopbar();
          if (state.view === 'editor') renderPreview();
        } catch (err) {
          alert(err.message);
        }
      };

      if (file) {
        const reader = new FileReader();
        reader.onload = () => finishSave(reader.result);
        reader.readAsDataURL(file);
      } else {
        await finishSave(undefined);
      }
    });
  }

  // Init
  if (window.innerWidth < 640) {
    $('preview-zoom').value = '0.4';
  }
  applyTheme(state.settings.theme);
  updateTopbar();
  bindEvents();
  checkPinGate();

  // Periodic auto-purge & countdown refresh every 60s
  setInterval(() => {
    updateTopbar();
    if (state.view === 'archive') renderArchive();
  }, 60 * 1000);
})();
