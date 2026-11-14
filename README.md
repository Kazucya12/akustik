# Midnight Acoustic

> **v4.12:** sumber Audius, Jamendo, dan Internet Archive dihapus. Sumber yang tersisa: YouTube (`api/yt-music.js`, butuh `YOUTUBE_API_KEY`) dan Radio (`api/music.js`). Trending, Daily Mix, lagu serupa, rekomendasi, dan impor playlist sekarang memakai pencarian YouTube. Lagu lama yang tersimpan dengan alamat Audius tetap bisa diputar selama alamatnya masih hidup.

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
- `api/music.js`: stasiun radio (radio-browser) atau API kustom
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
   - `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `AUTH_SECRET` (wajib untuk login Gmail, lihat bagian v3.5)
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

## Tambahan v3.5: daftar dan masuk
- `extra4.js` (layar Masuk/Daftar/Lupa password + baris akun di Profil) dan `api/auth.js`.
- Daftar: username, Gmail, password (min. 8). Kode 6 digit dikirim ke Gmail untuk verifikasi (berlaku 10 menit). Masuk: username atau Gmail + password. Lupa password: kode lewat Gmail, lalu password baru (sesi lama otomatis tidak berlaku). Sesi 30 hari. Ada tombol "Lanjut tanpa masuk".
- Password disimpan sebagai hash scrypt (bukan teks asli). Percobaan login salah dibatasi (8x per 15 menit per akun), kode salah maksimal 5x.
- Setup di Vercel:
  1. Project > Storage (atau Marketplace) > Upstash Redis > Create > Connect Project. Variabel `UPSTASH_REDIS_REST_URL` dan `UPSTASH_REDIS_REST_TOKEN` (atau `KV_REST_API_*`) terisi otomatis.
  2. Settings > Environment Variables: `GMAIL_USER` (Gmail pengirim), `GMAIL_APP_PASSWORD` (myaccount.google.com/apppasswords, wajib verifikasi 2 langkah aktif), `AUTH_SECRET` (`openssl rand -hex 32`).
  3. Redeploy.
- Gmail membatasi pengiriman (sekitar 500 email/hari untuk akun biasa).
- Sesi disimpan di kunci `mx_auth` dan tidak ikut Cadangan Data. Data lagu/playlist masih tersimpan di perangkat, belum disinkron lewat akun.


## Integrasi YouTube Music melalui MusicAPI

Fitur ini menambahkan koneksi akun YouTube Music dari halaman Profil, lalu membaca profil, playlist, dan lagu yang disukai. Ini **bukan pemutar audio YouTube Music**; MusicAPI pada integrasi ini dipakai untuk membaca library/playlist. Pemutaran lagu yang sudah ada di aplikasi tetap memakai sumber audio yang tersedia.

### Pengaturan Vercel
1. Buat API key di dashboard MusicAPI dan salin `Client ID` serta `Client Secret`.
2. Tambahkan Environment Variables: `MUSICAPI_CLIENT_ID`, `MUSICAPI_CLIENT_SECRET`, dan `MUSICAPI_SLUG` (slug akun pada hosted auth, misalnya `you`).
3. Tambahkan URL callback berikut ke daftar `returnUrl` yang diizinkan di dashboard MusicAPI: `https://DOMAIN-ANDA/?musicapi_callback=1` (ganti DOMAIN-ANDA dengan domain Vercel aplikasi).
4. Redeploy project.
5. Buka Profil > Hubungkan YouTube Music, lalu selesaikan persetujuan akun Google.

Client Secret hanya digunakan oleh fungsi server `/api/musicapi`; jangan pernah memasukkannya ke `app.js`, `musicapi.js`, atau HTML. UUID koneksi disimpan pada perangkat yang menghubungkan akun.
