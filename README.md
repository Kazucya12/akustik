# Loopify

(Sebelumnya bernama Midnight Acoustic.)

> **v4.12:** sumber Audius, Jamendo, dan Internet Archive dihapus. Sumber yang tersisa: YouTube (`api/yt-music.js`, butuh `YOUTUBE_API_KEY`) dan Radio (`api/music.js`). Trending, Daily Mix, lagu serupa, rekomendasi, dan impor playlist sekarang memakai pencarian YouTube. Lagu lama yang tersimpan dengan alamat Audius tetap bisa diputar selama alamatnya masih hidup.

Pemutar musik dan video. Frontend statis (`index.html`, `style.css`, `app.js`) dan dua fungsi server di `api/` supaya API key tidak terlihat di browser.

## Fitur (v2.4, versi awal; lihat bagian v3.x–v4.x di bawah)
- Kontrol di layar kunci dan notifikasi (Media Session), antrean (putar berikutnya, hapus), sleep timer, kecepatan putar 0.75x-2x, transisi halus fade in/out (Pengaturan)
- Lirik otomatis dari LRCLIB (tanpa key), baris berjalan bila tersedia, ketuk baris untuk melompat
- Trending per genre (Home dan Explore), rekomendasi SoundStat dengan Putar Semua dan Segarkan
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
- **v4.40, pencarian & lirik** (`extra48.js`, `extra49.js`, `extra50.js`, plus mode `asearch`/`aid` di `api/artist.js`):
  - Hasil Library muncul seketika, cache hasil per sesi (8 menit), riwayat berisi artis/lagu/album dengan foto, album dicari lewat nama (iTunes, tanpa kuota YouTube), pencarian lirik (lirik tersimpan + tebakan YouTube untuk potongan lirik).
  - Menu ⋯ di tiap baris lagu (Putar, antrean, Suka, playlist, artis, bagikan) menggantikan tombol +. Kartu genre membuka halaman genre sendiri.
  - Lirik otomatis: pencarian lirik berlapis (variasi judul, dipilih lewat kemiripan judul + durasi), waktu perkiraan untuk lirik tanpa penanda waktu, dan lirik dari audio (Whisper di Groq, khusus lagu dari perangkat; API key Groq milik pengguna disimpan di perangkat). Lagu YouTube tidak bisa dibaca otomatis karena audionya tidak dapat diambil dari browser.
  - Lirik di layar kunci: sudah ada sejak v3.7 (Profil > Pengaturan > "Lirik di notifikasi"); lirik perkiraan dan lirik AI ikut tampil di sana. Tampilan akhir mengikuti OS (Android/iOS).
  - **APK, layar kunci lirik penuh dan notifikasi dengan lirik (v4.46):** sisi native ada di `.github/workflows/build-apk.yml` (`LockActivity.java`, `MusicService.java`, jembatan `lyS`/`lyI`/`lk`/`ln` di `MainActivity.java`). Notifikasi musik sekarang menampilkan judul, baris lirik yang sedang dinyanyikan (♪ ...), dan artis; kontrol layar kunci Android 13+ memakai "Judul • Artis" dan baris lirik. Saklar Pengaturan > "Lirik layar kunci penuh": saat layar menyala terkunci dan musik diputar, muncul layar jam + 5 baris lirik + kartu pemutar + "Geser ke atas untuk membuka" (memakai izin notifikasi layar penuh; di Android 14+ Android mungkin meminta izin itu sekali).
  - **Lirik mengambang (APK, `FloatLyric.java`):** saklar Pengaturan > "Lirik mengambang". Pil hitam kecil di atas aplikasi lain dan game: judul + artis beberapa detik saat lagu ganti, lalu satu baris lirik berjalan. Sentuhan tembus ke game. Hanya tampil saat Loopify di latar belakang dan layar tidak terkunci. Butuh izin "Tampil di atas aplikasi lain".
  - **v4.47 (APK):** pil lirik mengambang bisa diatur (posisi atas tengah/kiri/kanan/bawah, ukuran, transparansi: Pengaturan > Lirik mengambang). Widget layar utama menampilkan baris lirik; ada widget kedua "Loopify Besar" (cover besar + lirik 3 baris). Mode mobil (`extra54.js`) menampilkan lirik besar + baris berikutnya dan menjaga layar tetap menyala (`LoopifyNative.awake`).
  - Fungsi Vercel tetap 12 (mode album iTunes digabung ke `api/artist.js`). Uji: `npm test`.
- **v4.39, pencarian ala Spotify** (`extra48.js/.css`): hasil langsung saat mengetik, kartu **Hasil teratas** (dipilih lewat skor relevansi), bagian Lagu / Artis / Album / Playlist dengan "Lihat semua", chip filter termasuk **Album**, koreksi ejaan "Maksud kamu …?" (otomatis bila hasil kosong), Pencarian terbaru berupa daftar yang bisa dihapus satu per satu, tombol hapus teks, kartu genre dengan ikon, dan "Pencarian terkait". Album dicari lewat artis YouTube yang cocok. Uji: `node test/search48.js`
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
- `api/yt-music.js`: pencarian YouTube (musik dan video)
- `api/soundstat.js`: rekomendasi lagu berdasarkan suasana, aktivitas, dan waktu (SoundStat)
- `manifest.json`, `sw.js`, `icon-*.png`: PWA
- `.env.example`: daftar variabel lingkungan

## Deploy
1. Upload folder ini ke repositori GitHub baru.
2. Di Vercel: Add New > Project > pilih repo tadi > Deploy (build command otomatis dari `vercel.json`: `node build.js`).
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


## v4.29: perapian UI/UX dan struktur
- **Satu bundle.** `index.html` kini memuat hanya `loopify.css` dan `loopify.js` (sebelumnya 13 CSS dan 31 script). Keduanya dihasilkan dari file sumber lewat `node build.js` (tanpa instalasi). Setelah mengubah `app.js`, `extraNN.js/css`, `a11y.*`, jalankan `node build.js` lalu commit hasilnya. Fitur baru: tambahkan nama filenya ke daftar di `build.js`.
- Tiap file `extra*.js` dibungkus try/catch di bundle, jadi satu file yang error tidak menghentikan fitur lain.
- `extra11.css` dihapus dari urutan muat karena isinya duplikat `extra10.css`.
- **Aksesibilitas** (`a11y.js`, `a11y.css`): tombol ikon mendapat nama untuk pembaca layar, kartu/baris/chip bisa difokus dan ditekan dengan Enter/Spasi, kolom isi diberi label, toast diumumkan, area ketuk tombol ikon diperluas ke ±44px, teks 10px dinaikkan ke 11px.
- **Splash** dipersingkat (maksimal sekitar 1,6 detik) dan dilewati pada pembukaan berikutnya dalam sesi yang sama.
- Service worker hanya menyimpan cangkang yang kini lebih ringkas (bundle, manifest, ikon).

## v4.30: rate limit, sinkron aman, hardening, update otomatis
- **Rate limit** (`api/_rl.js`, per IP lewat Upstash Redis yang sama; file berawalan `_` bukan fungsi Vercel). Batas per menit: yt-music 40, suggest 120, stream 60, artist 60, import 10, soundstat 20. Kalau Redis belum diatur, permintaan tetap lolos.
- **Perbaikan rute:** `api/sugest.js` diganti nama menjadi `api/suggest.js` (aplikasi memanggil `/api/suggest`, sebelumnya 404 sehingga saran pencarian tidak pernah muncul). Hapus `api/sugest.js` lama di repo.
- **Sinkron gabung tiga arah** (`extra17.js` + `api/sync.js`): penambahan/penghapusan dari dua perangkat dipertahankan; server menjawab 409 bila simpanan berdasar versi lama.
- **Hardening:** data dari file cadangan/sinkron dibersihkan (`scrubData`), tombol unduh menolak alamat non-https, angka yang dicetak ke HTML dipaksa numerik, alamat autentikasi MusicAPI harus https.
- **Update otomatis:** `node build.js` mengisi nama cache `sw.js` dengan hash bundle; aplikasi memeriksa versi baru tiap 30 menit dan saat dibuka kembali.
- Splash: bar dan tagline kini selesai dalam durasi splash.


## Struktur folder (v4.39)
- `api/` fungsi server Vercel: `auth` (masuk/daftar), `sync` (sinkron akun), `collab` (playlist bersama), `artist` (halaman artis & rilis baru), `stream` (alamat putar), `suggest` (saran pencarian), `yt-music` (pencarian YouTube), `jiosaavn` (butuh `JIOSAAVN_API_URL`), `music` (radio), `musicapi` (YouTube Music), `soundstat`, `import`. `_rl.js` = rate limit (bukan fungsi).
- `test/smoke.js`: uji asap (`npm test`). `.github/workflows/test.yml`: menjalankan uji tiap push. `.github/workflows/build-apk.yml`: membuat APK.
- Sumber Audius, Jamendo, dan Internet Archive sudah dihapus; bagian README lama yang menyebutnya hanya riwayat.

## Pembaruan paket (package-lock.json)
- `package-lock.json` mengunci versi persis semua paket. **Commit file ini.** CI memakai `npm ci`, yang gagal kalau lockfile tidak cocok dengan `package.json`.
- Mengubah kode biasa tidak perlu menyentuh lockfile. Hanya saat menambah atau memperbarui paket: jalankan `npm install nama-paket@versi` (atau `npm update`), lalu commit `package.json` dan `package-lock.json` bersama-sama. Jangan edit lockfile manual.

## Variabel tambahan
- `JIOSAAVN_API_URL`: alamat backend JioSaavn milikmu.
- `DEV_EMAILS`: email (pisahkan koma) yang mendapat lencana developer.
