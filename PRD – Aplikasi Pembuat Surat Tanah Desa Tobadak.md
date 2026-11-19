# PRD – Aplikasi Pembuat Surat Tanah Desa Tobadak

**Versi:** 1.0 (Draft) · **Tanggal:** 19 November 2026 · **Pemilik Produk:** Staf Kantor Desa Tobadak, Kec. Tobadak, Kab. Mamuju Tengah

## 1. Ringkasan

Aplikasi web sederhana untuk membuat tiga jenis surat tanah dengan format baku desa: **(1) Surat Keterangan Ganti Rugi Tanah**, **(2) Surat Keterangan Hibah Tanah**, dan **(3) Surat Pernyataan Penguasaan Fisik Bidang Tanah (Sporadik)**. Petugas cukup mengisi formulir, sistem menyusun surat otomatis sesuai template (kop berbingkai, watermark lambang Mamuju Tengah, materai, kolom saksi, kolom No/Tanggal), lalu surat dapat dicetak pada kertas **21,59 × 33 cm (Folio/F4)**. Surat yang belum dicetak bisa disimpan di **Arsip Sementara** yang otomatis terhapus setelah **3 hari**.

## 2. Latar Belakang dan Masalah

- Surat dibuat manual dengan menyalin file Word lama, sehingga rawan salah ketik (nama, NIK, luas, batas tanah, tanggal) dan sisa data surat sebelumnya.
- Ada teks template yang tidak konsisten antar surat (lihat bagian 10), sehingga hasil tiap surat berbeda-beda.
- Penulisan nominal harga dan terbilang dilakukan manual.
- Surat yang belum final harus disimpan sebagai file terpisah dan sering tercecer.

## 3. Tujuan dan Indikator Keberhasilan

| Tujuan | Indikator |
| --- | --- |
| Mempercepat pembuatan surat | Surat selesai dari isi form sampai siap cetak ≤ 5 menit |
| Mengurangi kesalahan | Validasi NIK (16 digit), kolom wajib, terbilang otomatis; kesalahan input berkurang |
| Format seragam | 100% surat memakai template baku dan ukuran kertas yang sama |
| Draf tidak hilang | Draf tersimpan 3 hari dan dapat dilanjutkan tanpa isi ulang |

## 4. Pengguna

- **Operator/Staf desa (utama):** mengisi form, menyimpan draf, mencetak.
- **Kepala Desa / Sekretaris (opsional):** meninjau pratinjau sebelum cetak.
- **Admin (opsional):** mengubah nama Kepala Desa, nomor surat, dan pengaturan lain.

## 5. Ruang Lingkup

**Termasuk (MVP):** tiga template surat, formulir isian, pratinjau langsung, cetak/ekspor PDF, Arsip Sementara 3 hari, pengaturan dasar (nama Kepala Desa, desa, kecamatan, kabupaten).

**Tidak termasuk (MVP):** tanda tangan digital, integrasi BPN/SIPPT online, arsip permanen, pembuatan jenis surat lain, pengiriman surat via email/WhatsApp.

## 6. Spesifikasi Lembar Kerja (Kertas)

- Ukuran halaman: **lebar 21,59 cm × tinggi 33 cm** (Folio/F4). Cetak 1 halaman per surat, orientasi potret.
- Bingkai hitam tebal di tepi halaman (dekoratif, tiap sudut bertanda kotak), watermark lambang Kab. Mamuju Tengah transparan di tengah halaman.
- Judul tengah, tebal, bergaris bawah; isi menggunakan huruf serif (mis. Times New Roman/Cambria), ukuran 11–12 pt, rata kiri-kanan (justify) pada paragraf.
- Kotak **Materai 10.000** sebagai penanda posisi tanda tangan, selalu tampil di setiap surat (tidak dapat dimatikan), di atas nama Pihak Pertama/yang menyatakan.
- Blok **No / Tanggal** (diisi manual oleh kantor desa) dan nama **Kepala Desa** (KORNELIUS) pada bagian bawah.
- Cetak ke PDF harus berukuran halaman sama persis (21,59 × 33 cm), tanpa penskalaan otomatis, margin dalam bingkai tetap.

## 7. Alur Pengguna

1. Beranda: pilih jenis surat (3 kartu) atau buka Arsip Sementara.
2. Isi formulir (bertahap per bagian: Pihak, Objek Tanah, Batas, Saksi, Tanggal).
3. Pratinjau langsung di sisi kanan/bawah dengan ukuran kertas sebenarnya.
4. Pilih tindakan: **Cetak**, **Simpan PDF**, atau **Simpan ke Arsip Sementara**.
5. Dari Arsip Sementara: buka, lanjutkan edit, cetak, atau hapus.

## 8. Kebutuhan Fungsional

### 8.1 Template dan Form per Jenis Surat

**A. Surat Keterangan Ganti Rugi Tanah**

| Bagian | Field |
| --- | --- |
| Pihak I (Pertama – Penjual/Pemilik pekarangan) | Nama, Tempat & Tanggal Lahir, NIK, Agama, Pekerjaan, Alamat |
| Pihak II (Kedua – Pembeli) | Nama, Tempat & Tanggal Lahir, NIK, Agama, Pekerjaan, Alamat |
| Objek tanah | Jenis (pekarangan/kebun), No. Sertifikat (opsional), Luas (m²), Lokasi (RT, Dusun, Desa, Kec., Kab.), Harga (angka, terbilang otomatis), Tahun transaksi |
| Batas-batas | Utara, Timur, Selatan, Barat |
| Saksi | 4 saksi: nama + jabatan/peran (Kepala Dusun, Ketua RT, Saksi Pihak I, Saksi Pihak II) |
| Penutup | Tempat, Tanggal surat, Nama Kepala Desa (default dari pengaturan) |

Teks baku: pernyataan kesepakatan ganti rugi atas dasar musyawarah tanpa paksaan, Pihak I menanggung segala risiko dan tidak akan mengganggu gugat hingga ahli waris/cucu-cucunya.

**B. Surat Keterangan Hibah Tanah**

| Bagian | Field |
| --- | --- |
| Pihak I (Pertama – Pemberi hibah) | Nama, Tempat & Tanggal Lahir, NIK, Agama, Pekerjaan, Alamat |
| Pihak II (Kedua – Penerima hibah) | Nama, Tempat & Tanggal Lahir, NIK, Agama, Pekerjaan, Alamat |
| Objek tanah | Lokasi tanah (RT, Dusun, Desa, Kec., Kab.; bisa berbeda dari alamat Pihak I), Luas (m²), Tahun hibah |
| Batas-batas | Utara, Timur, Selatan, Barat |
| Saksi | 4 saksi: Kepala Dusun, Ketua RT, Saksi Pihak I, Saksi Pihak II |
| Penutup | Tempat, Tanggal surat, Nama Kepala Desa |

Teks baku: tanah tidak dapat diganggu gugat oleh siapa pun termasuk anak hingga cucu-cucu Pihak I.

**C. Surat Pernyataan Penguasaan Fisik Bidang Tanah (Sporadik)**

| Bagian | Field |
| --- | --- |
| Yang menyatakan | Nama, Tempat & Tanggal Lahir, NIK, Agama, Pekerjaan, Alamat |
| Objek tanah | Dusun, RT/RW, Desa/Kelurahan, Kecamatan, Kabupaten, NJB, Status tanah (mis. Tanah Negara), Digunakan untuk (mis. Kebun), Luas (m²) |
| Batas-batas | Utara, Timur, Selatan, Barat |
| Asal perolehan | Cara perolehan (Ganti Rugi/Hibah/Warisan/lainnya), dari siapa, tahun |
| Saksi | 2 saksi: Nama, Pekerjaan/Jabatan, Alamat, kolom tanda tangan |
| Penutup | Tempat, Tanggal surat, Nama Kepala Desa |

Teks baku: menguasai dengan itikad baik, dikuasai terus-menerus, tidak dijadikan jaminan utang, tidak dalam sengketa, siap diangkat sumpah dan dituntut bila tidak benar.

### 8.2 Fitur Umum

| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| F-01 | Pilih jenis surat dari beranda | Wajib |
| F-02 | Formulir dinamis sesuai jenis surat dengan label sama seperti di surat | Wajib |
| F-03 | Pratinjau langsung (live preview) sesuai tampilan cetak 21,59 × 33 cm | Wajib |
| F-04 | Cetak langsung dan ekspor PDF ukuran tepat | Wajib |
| F-05 | Validasi: NIK 16 digit angka, tanggal valid, luas angka positif, kolom wajib tidak kosong | Wajib |
| F-06 | Format otomatis: nama huruf kapital, tanggal lahir DD-MM-YYYY, tanggal surat ditulis "16 November 2026", luas "325 m²" | Wajib |
| F-07 | Harga: input angka, tampil "Rp 70.000.000" dan terbilang otomatis "(Tujuh Puluh Juta Rupiah)" | Wajib |
| F-08 | Penyimpanan ke Arsip Sementara (lihat 8.3) | Wajib |
| F-09 | Pengaturan: nama Kepala Desa, nama desa/kecamatan/kabupaten, upload logo watermark | Wajib |
| F-10 | Salin data pihak dari surat lain di arsip (mis. data penjual jadi yang menyatakan di Sporadik) | Sebaiknya |
| F-11 | Daftar saksi default (Kepala Dusun/Ketua RT) yang bisa disimpan sebagai preset | Sebaiknya |
| F-12 | Mode gelap/terang dan tampilan nyaman di tablet | Wajib |

### 8.3 Fitur Arsip Sementara (Kedaluwarsa 3 Hari)

- **Simpan:** tombol "Simpan ke Arsip Sementara" menyimpan seluruh isian form beserta jenis surat. Draf boleh disimpan walau belum lengkap.
- **Masa berlaku:** tiap draf punya waktu simpan (`created_at`) dan batas kedaluwarsa (`expires_at = waktu terakhir disimpan + 3 hari`, yaitu 72 jam). Mengedit dan menyimpan ulang menyetel ulang hitungan 3 hari.
- **Daftar arsip:** menampilkan judul otomatis (jenis surat + nama Pihak I/pembuat), tanggal simpan, dan **hitung mundur sisa waktu** (mis. "Sisa 2 hari 5 jam"). Draf yang sisa waktunya < 24 jam diberi penanda peringatan.
- **Tindakan:** Buka/Lanjutkan edit, Cetak, Duplikat, Hapus sekarang.
- **Penghapusan otomatis:** draf yang melewati `expires_at` dihapus permanen (dicek saat aplikasi dibuka dan secara berkala). Draf kedaluwarsa tidak dapat dipulihkan.
- **Setelah dicetak:** pengguna diberi pilihan "Hapus dari arsip setelah dicetak" (default: tidak, agar tetap ada sampai kedaluwarsa).
- **Peringatan privasi:** pada layar arsip tampil keterangan "Draf akan terhapus otomatis dalam 3 hari. Cetak atau simpan PDF jika diperlukan."
- **Penyimpanan data:** karena memuat data pribadi (NIK, alamat), data disimpan lokal di perangkat/browser kantor atau di server desa, bukan layanan publik. Disarankan enkripsi saat disimpan.

## 9. Kebutuhan Non-Fungsional

- **Format cetak:** presisi ukuran 21,59 × 33 cm; tampilan pratinjau = hasil cetak (WYSIWYG).
- **Performa:** pratinjau diperbarui < 300 ms setelah input.
- **Privasi dan keamanan:** data pribadi tidak dikirim ke pihak ketiga; akses aplikasi dengan PIN/kata sandi operator; arsip terenkripsi; hapus otomatis berjalan konsisten.
- **Penggunaan:** dapat dipakai di komputer kantor (Chrome/Edge); tetap berfungsi tanpa internet bila memungkinkan (mode lokal).
- **Bahasa:** Bahasa Indonesia; sesuai kaidah EYD pada teks baku.
- **Kemudahan:** operator non-teknis dapat memakai tanpa pelatihan panjang.

## 10. Temuan pada Template Saat Ini (Perlu Dikonfirmasi)

Saat meninjau tiga contoh surat, saya menemukan beberapa hal yang sebaiknya diperbaiki di template baku agar tidak terbawa ke aplikasi:

1. **Ganti Rugi (Ditetapkan):** penyebutan Pihak I dan Pihak II diatur sesuai ketentuan persuratan: **Pihak I (Pertama)** adalah Penjual/Pemilik dan **Pihak II (Kedua)** adalah Pembeli (mengoreksi kalimat pembuka contoh lama yang salah menyebut Pihak I sebagai "Pihak II (Kedua) Pembeli").
2. **Ganti Rugi & Hibah (Ditetapkan):** urutan tanda tangan mengikuti ketentuan persuratan (**Pihak Kedua** di kiri, **Pihak Pertama** di kanan), dengan kotak **Materai 10.000** baku di atas nama Pihak Pertama.
3. **Hibah (Ditetapkan):** tulisan sisa template `"Pihak II : -"` dihapus, dan penyebutan diseragamkan menjadi **Pihak I (Pertama)** sebagai Pemberi Hibah dan **Pihak II (Kedua)** sebagai Penerima Hibah.
4. **Sporadik (Ditetapkan):** kolom umur saksi tidak ditambahkan di formulir maupun template surat.
5. **Sporadik:** huruf tebal pada "Ganti Rugi dari" dan "2021" muncul karena disorot manual; di aplikasi cara perolehan menjadi pilihan (dropdown) dengan gaya teks seragam.
6. Format penulisan bervariasi ("M2"/"M²", "Nik"/"NIK", jarak spasi ganda, titik dua tidak sejajar). Aplikasi menyeragamkan semuanya.
7. Nama Kepala Desa (KORNELIUS) ditempatkan di posisi berbeda di tiap surat, termasuk tanpa tempat tanda tangan/cap. Aplikasi menyediakan blok baku "Mengetahui, Kepala Desa" dengan ruang tanda tangan/stempel.

## 11. Model Data (Ringkas)

- **Surat/Draf:** `id`, `jenis` (ganti\_rugi | hibah | sporadik), `data` (JSON isi form), `dibuat_pada`, `diperbarui_pada`, `kedaluwarsa_pada`, `status` (draf | dicetak).
- **Pengaturan:** `nama_kades`, `desa`, `kecamatan`, `kabupaten`, `logo_watermark`, `preset_saksi`.
- **Pihak (embedded):** `nama`, `tempat_lahir`, `tanggal_lahir`, `nik`, `agama`, `pekerjaan`, `alamat`.

## 12. Kriteria Penerimaan

1. Tiga template menghasilkan surat yang visualnya sama dengan contoh (bingkai, watermark, materai, saksi) pada kertas 21,59 × 33 cm.
2. Terbilang harga benar untuk nominal ribuan sampai miliar.
3. NIK selain 16 digit ditolak dengan pesan jelas.
4. Draf yang disimpan muncul di Arsip Sementara dengan hitung mundur yang akurat, dan terhapus otomatis setelah 72 jam sejak simpan terakhir.
5. Draf dapat dibuka, diedit, dicetak, dan hasil cetaknya sama dengan pratinjau.
6. Mengubah nama Kepala Desa di pengaturan langsung berlaku pada surat baru.

## 13. Rencana Rilis

| Fase | Isi | Perkiraan |
| --- | --- | --- |
| 1 | Template + form + pratinjau + cetak PDF untuk 3 surat | 1–2 minggu |
| 2 | Arsip Sementara 3 hari + hitung mundur + hapus otomatis | 1 minggu |
| 3 | Pengaturan, preset saksi, salin data pihak, PIN akses | 1 minggu |
| 4 | Uji coba di kantor dan perbaikan | 1 minggu |

## 14. Risiko dan Pertanyaan Terbuka

- Terjawab – Arsip: saat ini arsip kantor berupa fotokopi surat yang sudah dicetak, jadi aplikasi hanya menyediakan Arsip Sementara 3 hari dan tidak membuat arsip permanen.
- Terjawab – Nomor registrasi: tetap diisi manual oleh kantor desa; surat menyediakan kolom No/Tanggal kosong, tanpa penomoran otomatis.
- Apakah perlu jenis surat lain di masa depan (mis. jual beli, waris, sengketa batas)? (NIK tetap divalidasi 16 digit angka, sesuai F-05.)
- Terjawab – Materai: tetap berupa kotak penanda "Materai 10.000" di setiap surat, bukan materai elektronik.
- Risiko: data pribadi warga (NIK, alamat) sudah diarsipkan dan diamankan di web desa, dan aplikasi ini hanya menyimpan draf sementara selama 3 hari, sehingga risiko privasi rendah; draf yang terhapus otomatis tidak bisa dipulihkan, sehingga pengguna perlu diingatkan sebelum kedaluwarsa.
