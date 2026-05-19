<div align="center">
  <h1>RateMate</h1>
  <p><strong>Dynamic Currency Converter — Chrome Extension</strong></p>
  <p>
    <a href="#fitur">Fitur</a> •
    <a href="#cara-pakai">Cara Pakai</a> •
    <a href="#cara-install">Install</a> •
    <a href="#struktur">Struktur</a>
  </p>
</div>

RateMate adalah ekstensi Chrome yang secara otomatis mengonversi harga-harga di situs e-commerce ke mata uang lokal pilihan Anda secara real-time.

---

<h2 id="fitur">Fitur</h2>

- **Auto-Convert** — Deteksi harga otomatis di berbagai situs belanja
- **13+ Mata Uang** — IDR, USD, EUR, GBP, JPY, SGD, MYR, AUD, CNY, KRW, THB, PHP, INR
- **Toggle On/Off** — Nyalakan atau matikan konversi kapan saja
- **Real-time Rates** — Nilai tukar dari Frankfurter API (update per jam)
- **Non-destructive** — Harga asli tetap utuh, hasil konversi ditampilkan sebagai anotasi
- **Caching** — Rate disimpan di `chrome.storage` selama 1 jam

### Cara Kerja

1. Content script memindai halaman untuk elemen yang mengandung harga (berdasarkan class, id, atribut, atau pola teks)
2. Mendeteksi mata uang sumber dari simbol ($, €, £, Rp, dll)
3. Mengirim request ke background service worker untuk mengambil kurs terbaru
4. Menambahkan badge kecil di samping setiap harga dengan hasil konversi
5. Saat toggle dimatikan, semua anotasi dihapus tanpa merusak DOM asli

---

<h2 id="cara-pakai">Cara Pakai</h2>

1. Install ekstensi (lihat di bawah)
2. Buka situs e-commerce (Amazon, eBay, Tokopedia, dll)
3. Klik ikon RateMate di toolbar untuk membuka popup
4. **Toggle "Auto-Convert"** untuk menyalakan/mematikan
5. **Pilih mata uang target** dari dropdown
6. Harga di halaman akan otomatis berubah!

---

<h2 id="cara-install">Cara Install (Developer Mode)</h2>

```bash
git clone https://github.com/FMATheNomad/RateMate.git
```

1. Buka `chrome://extensions/`
2. Nyalakan **Developer mode** (pojok kanan atas)
3. Klik **Load unpacked**
4. Pilih folder `RateMate/`

---

<h2 id="struktur">Struktur Direktori</h2>

```
RateMate/
├── manifest.json          # Chrome Extension v3 manifest
├── background.js          # Service worker: fetch & cache rates
├── content.js             # Content script: scan prices, convert, annotate
├── popup/
│   ├── popup.html         # UI popup (toggle, currency selector, status)
│   └── popup.js           # Popup logic: state management, messaging
├── icons/
│   ├── icon16.png         # Icon 16x16
│   ├── icon48.png         # Icon 48x48
│   └── icon128.png        # Icon 128x128
└── README.md
```

---

## API

RateMate menggunakan [Frankfurter API](https://www.frankfurter.app/) (gratis, open-source, tanpa API key).

- Base currency: `USD`
- Update rate: setiap hari kerja (bank sentral Eropa)
- Cache di `chrome.storage.local` selama 1 jam

---

<h2>Lisensi</h2>

MIT © 2024 [FMATheNomad](https://github.com/FMATheNomad)
