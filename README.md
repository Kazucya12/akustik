# Midnight Acoustic

Pemutar musik dan video. Frontend statis (`index.html`, `style.css`, `app.js`) dan dua fungsi server di `api/` supaya API key tidak terlihat di browser.

## Fitur (v2.4)
- Kontrol di layar kunci dan notifikasi (Media Session), antrean (putar berikutnya, hapus), sleep timer, kecepatan putar 0.75x-2x, transisi halus fade in/out (Pengaturan)
- Lirik otomatis dari LRCLIB (tanpa key), baris berjalan bila tersedia, ketuk baris untuk melompat
- Trending Audius per genre (Home dan Explore), rekomendasi SoundStat dengan Putar Semua dan Segarkan
- Equalizer: preset tambahan dan simpan preset sendiri
- Playlist: putar, ekspor/impor JSON, bagikan lewat tautan
- Statistik dengar, mode audio untuk video YouTube, PWA (bisa diinstal dan dibuka offline)

## Tambahan v2.5
- Lanjutkan terakhir diputar, cari/urutkan Library, edit info lagu, baca tag ID3 (judul, artis, cover MP3)
- Playlist otomatis, gestur geser di pemutar, warna tema dari cover, ulang A-B, preload lagu berikutnya
- Lirik layar penuh, radio dari lagu, simpan offline (hanya lagu Audius yang diizinkan artisnya)
- Cadangan data (ekspor/pulihkan JSON), pengingat waktu dengar

## Tambahan v3.1
- Sumber online campuran: Semua (gabungan), Audius, Jamendo, Internet Archive, dan Radio (stasiun HTTPS, siaran langsung, tab Indonesia/Dunia/Pop/Rock/Jazz/Berita)
- Pencarian gabungan: satu kolom mencari Library, musik online, dan video YouTube sekaligus, plus riwayat dan saran pencarian
- Halaman Artis: ketuk nama artis di pemutar, atau buka Library > Artis
- Playlist: ganti nama, ganti cover, atur urutan (naik/turun), hapus lagu, urut A-Z/Artis/Balik

## Tambahan v3.2
- Pilih banyak lagu: tombol ☑ di Library, Explore, halaman Playlist, dan halaman Artis. Aksi massal: putar, antrean, favorit, tambah ke playlist, hapus (atau keluarkan dari playlist)
- Impor playlist: Library > Playlist > Impor dari Spotify / YouTube. Mendukung playlist/album Spotify publik dan playlist YouTube publik, atau tempel daftar lagu manual (satu per baris). Lagu dicocokkan ke Audius; di playlist YouTube yang tidak cocok disimpan sebagai video

## Struktur
- `extra.js`: fitur v3.1, `extra2.js`: fitur v3.2 (dimuat setelah `app.js`)
- `api/import.js`: ambil daftar lagu dari link Spotify/YouTube (YouTube butuh `YOUTUBE_API_KEY`)
- `index.html`, `style.css`, `app.js`: aplikasi
- `api/music.js`: pencarian musik (Audius, Jamendo, Internet Archive, radio-browser, atau API kustom)
- `api/yt-search.js`: pencarian video YouTube
- `api/soundstat.js`: rekomendasi lagu berdasarkan suasana, aktivitas, dan waktu (SoundStat)
- `manifest.json`, `sw.js`, `icon-*.png`: PWA
- `.env.example`: daftar variabel lingkungan

## Deploy
1. Upload folder ini ke repositori GitHub baru.
2. Di Vercel: Add New > Project > pilih repo tadi > Deploy (tanpa build command).
3. Buka Project > Settings > Environment Variables, lalu isi:
   - `YOUTUBE_API_KEY` (wajib untuk cari video)
   - `SOUNDSTAT_API_KEY` (wajib untuk Rekomendasi Suasana)
   - `AUDIUS_API_KEY` (opsional, dipakai saat mencari lagu di Audius)
   - `JAMENDO_CLIENT_ID` (opsional, gratis di devportal.jamendo.com; tanpa ini sumber Jamendo dilewati)
   - `MUSIC_API_URL` dan `MUSIC_API_KEY` (opsional, untuk sumber "API server sendiri")
4. Redeploy supaya variabel terbaca.

Uji lokal: `npm i -g vercel`, salin `.env.example` ke `.env`, isi, lalu `vercel dev`.

## Keamanan
- Jangan menaruh key di `app.js` atau meng-commit `.env`.
- Di Google Cloud Console, batasi key hanya untuk YouTube Data API v3 dan atur kuota harian.
- Hasil pencarian di-cache di edge Vercel supaya kuota hemat.

## Catatan impor
- Spotify dibaca dari halaman embed publik (tanpa key), maksimal 100 lagu pertama. Kalau Spotify mengubah halamannya, pakai opsi tempel daftar lagu.
- Hasil pencocokan hanya untuk lagu yang tersedia penuh di Audius, jadi sebagian lagu populer mungkin dilewati.

## Catatan
- Pemutar YouTube hanya jalan lewat `http(s)`, bukan dari file lokal.
- Tempel link YouTube tetap berfungsi tanpa key.

## SoundStat
Rekomendasi di Home memanggil `/api/soundstat`. SoundStat hanya mengembalikan daftar ID trek (ID Spotify), jadi server mengambil judul dan artis tiap trek (maksimal 10 per permintaan). Analisis trek ditagih per trek unik, karena itu hasil di-cache 24 jam di Vercel. Saat lagu diketuk, aplikasi mencari versi yang bisa diputar penuh lewat Audius (tidak semua lagu tersedia).

## Tambahan v3.3: tampilan website
- `web.css`: layout desktop (lebar ≥ 900px): navigasi jadi sidebar kiri, konten di tengah, mini player jadi bar bawah, panel pemutar/lirik menyisakan sidebar, hover mouse. Tampilan HP tidak berubah
- `web.js`: pintasan keyboard: Spasi/K putar-jeda, ←/→ mundur/maju 5 detik, N/P lagu berikutnya/sebelumnya, `/` buka pencarian, Esc tutup panel
