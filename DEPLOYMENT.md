# Panduan Deployment di aaPanel

Aplikasi ini telah disiapkan untuk di-deploy ke **aaPanel** menggunakan Node.js Manager (PM2) dan PostgreSQL database.

## 1. Persiapan Database (PostgreSQL)

1. Pastikan Anda telah menginstal aplikasi **PostgreSQL** melalui **App Store** di aaPanel.
2. Buka menu **Databases** -> **PgSQL**.
3. Buat database baru:
   - **Database Name**: (misal: `importer_db`)
   - **Username**: (misal: `importer_user`)
   - **Password**: (atur kata sandi yang kuat)
4. Pastikan akses database dapat dihubungi secara lokal (`localhost` atau `127.0.0.1`).

## 2. Persiapan Project Node.js

1. Akses **Files** dan masuk ke direktori tempat Anda menyimpan web, misalnya `/www/wwwroot/importer.elfatta-intermedia.com`.
2. Upload semua file (atau clone dari repositori GitHub). Jika Anda melakukan zip, ekstrak di folder tersebut (pastikan ada file `package.json`).
3. Buat file bernama `.env` di folder utama aplikasi dengan isi konfigurasi database yang telah Anda buat:

```env
SQL_HOST="127.0.0.1"
SQL_USER="importer_user"
SQL_PASSWORD="password_database_anda"
SQL_DB_NAME="importer_db"
SQL_ADMIN_USER="importer_user"
SQL_ADMIN_PASSWORD="password_database_anda"
# Biarkan variabel lain jika diperlukan
```

## 3. Instalasi dan Build

1. Buka terminal (atau gunakan SSH) lalu arahkan ke folder project:
   ```bash
   cd /www/wwwroot/importer.elfatta-intermedia.com
   ```
2. Jalankan instalasi dependensi:
   ```bash
   npm install
   ```
3. Lakukan build aplikasi untuk memproduksi file server siap produksi:
   ```bash
   npm run build
   ```
4. Push / migrasi skema database (agar tabel terbuat otomatis):
   ```bash
   npx drizzle-kit push
   ```

## 4. Setup di aaPanel (Node.js Project)

1. Buka menu **Websites** -> **Node project** di aaPanel.
2. Tambahkan project baru (**Add Node project**):
   - **Project directory**: `/www/wwwroot/importer.elfatta-intermedia.com`
   - **Start command**: Anda bisa memilih file `ecosystem.config.cjs` atau cukup mengatur script run menjadi `npm start`. Kami menyarankan memilih file `ecosystem.config.cjs` karena PM2 akan membacanya secara otomatis.
   - **Project environment**: Pastikan memilih `production`.
   - **Project name**: Secara otomatis terisi (misal `importer-app`).
   - **Domain name**: `importer.elfatta-intermedia.com`
   - **Port**: `3000` (Port untuk proxy akan dikelola secara otomatis oleh aaPanel).
3. Simpan dan tunggu server mencoba menjalankan proses.
4. Anda dapat mengecek logs (tombol *Log*) di menu Node project untuk memastikan server berjalan dengan baik. Jika `SQL_HOST` dkk sudah benar di `.env`, aplikasi akan konek ke database. 

## 5. Konfigurasi Domain Utama dan SSL

1. Bila domain `importer.elfatta-intermedia.com` di setel pada langkah 4, aaPanel akan otomatis membuatkan proxy Nginx.
2. Anda bisa mengeklik tombol *Conf* atau mengklik domain tersebut untuk memasangkan SSL (Let's Encrypt).
3. Semua traffic dari `https://importer.elfatta-intermedia.com` sekarang akan diteruskan oleh Nginx ke aplikasi Node (Port 3000) Anda.

Selamat, aplikasi Anda sudah online!
