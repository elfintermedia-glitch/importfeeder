-- SQL script to create database schema

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  uid TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS neofeeder_config (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  url TEXT NOT NULL,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  nim TEXT NOT NULL,
  name TEXT NOT NULL,
  program_study TEXT,
  admission_period TEXT,
  status TEXT DEFAULT 'Baru',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS prodi (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  kode_program_studi TEXT NOT NULL,
  nama_program_studi TEXT NOT NULL,
  status TEXT,
  nama_jenjang_pendidikan TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS periode (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  id_prodi TEXT NOT NULL,
  kode_prodi TEXT NOT NULL,
  nama_program_studi TEXT NOT NULL,
  status_prodi TEXT,
  jenjang_pendidikan TEXT,
  periode_pelaporan TEXT NOT NULL,
  tipe_periode TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dosen (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  id_dosen TEXT NOT NULL,
  nama_dosen TEXT NOT NULL,
  nidn TEXT,
  jenis_kelamin TEXT,
  id_status_aktif TEXT,
  nama_status_aktif TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
