// src/db/schema.ts
import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const neofeederConfig = pgTable('neofeeder_config', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  url: text('url').notNull(),
  username: text('username').notNull(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const students = pgTable('students', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  nim: text('nim').notNull(),
  name: text('name').notNull(),
  programStudy: text('program_study'),
  admissionPeriod: text('admission_period'),
  jenisKelamin: text('jenis_kelamin'),
  tempatLahir: text('tempat_lahir'),
  tanggalLahir: text('tanggal_lahir'),
  idAgama: text('id_agama'),
  nik: text('nik'),
  nisn: text('nisn'),
  npwp: text('npwp'),
  kewarganegaraan: text('kewarganegaraan'),
  jalan: text('jalan'),
  dusun: text('dusun'),
  rt: text('rt'),
  rw: text('rw'),
  kelurahan: text('kelurahan'),
  kodePos: text('kode_pos'),
  idWilayah: text('id_wilayah'),
  idJenisTinggal: text('id_jenis_tinggal'),
  idAlatTransportasi: text('id_alat_transportasi'),
  telepon: text('telepon'),
  handphone: text('handphone'),
  email: text('email'),
  penerimaKps: text('penerima_kps'),
  nomorKps: text('nomor_kps'),
  nikAyah: text('nik_ayah'),
  namaAyah: text('nama_ayah'),
  tanggalLahirAyah: text('tanggal_lahir_ayah'),
  idPendidikanAyah: text('id_pendidikan_ayah'),
  idPekerjaanAyah: text('id_pekerjaan_ayah'),
  idPenghasilanAyah: text('id_penghasilan_ayah'),
  nikIbu: text('nik_ibu'),
  namaIbuKandung: text('nama_ibu_kandung'),
  tanggalLahirIbu: text('tanggal_lahir_ibu'),
  idPendidikanIbu: text('id_pendidikan_ibu'),
  idPekerjaanIbu: text('id_pekerjaan_ibu'),
  idPenghasilanIbu: text('id_penghasilan_ibu'),
  namaWali: text('nama_wali'),
  tanggalLahirWali: text('tanggal_lahir_wali'),
  idPendidikanWali: text('id_pendidikan_wali'),
  idPekerjaanWali: text('id_pekerjaan_wali'),
  idPenghasilanWali: text('id_penghasilan_wali'),
  idKebutuhanKhususMahasiswa: text('id_kebutuhan_khusus_mahasiswa'),
  idKebutuhanKhususAyah: text('id_kebutuhan_khusus_ayah'),
  idKebutuhanKhususIbu: text('id_kebutuhan_khusus_ibu'),
  idJenisDaftar: text('id_jenis_daftar'),
  idJalurDaftar: text('id_jalur_daftar'),
  idPembiayaan: text('id_pembiayaan'),
  biayaMasuk: text('biaya_masuk'),
  idProdi: text('id_prodi'),
  status: text('status').default('Baru'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const prodi = pgTable('prodi', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  id_prodi: text('id_prodi'),
  kode_program_studi: text('kode_program_studi').notNull(),
  nama_program_studi: text('nama_program_studi').notNull(),
  status: text('status'),
  nama_jenjang_pendidikan: text('nama_jenjang_pendidikan'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const periode = pgTable('periode', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  id_prodi: text('id_prodi').notNull(),
  kode_prodi: text('kode_prodi').notNull(),
  nama_program_studi: text('nama_program_studi').notNull(),
  status_prodi: text('status_prodi'),
  jenjang_pendidikan: text('jenjang_pendidikan'),
  periode_pelaporan: text('periode_pelaporan').notNull(),
  tipe_periode: text('tipe_periode'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const dosen = pgTable('dosen', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  id_dosen: text('id_dosen').notNull(),
  nama_dosen: text('nama_dosen').notNull(),
  nidn: text('nidn'),
  jenis_kelamin: text('jenis_kelamin'),
  id_status_aktif: text('id_status_aktif'),
  nama_status_aktif: text('nama_status_aktif'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const agama = pgTable('agama', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  id_agama: text('id_agama').notNull(),
  nama_agama: text('nama_agama').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const wilayah = pgTable('wilayah', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  id_wilayah: text('id_wilayah').notNull(),
  id_negara: text('id_negara'),
  nama_wilayah: text('nama_wilayah').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const jenisDaftar = pgTable('jenis_daftar', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  id_jenis_daftar: text('id_jenis_daftar').notNull(),
  nama_jenis_daftar: text('nama_jenis_daftar').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const jalurMasuk = pgTable('jalur_masuk', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  id_jalur_masuk: text('id_jalur_masuk').notNull(),
  nama_jalur_masuk: text('nama_jalur_masuk').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const pekerjaan = pgTable('pekerjaan', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  id_pekerjaan: text('id_pekerjaan').notNull(),
  nama_pekerjaan: text('nama_pekerjaan').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const penghasilan = pgTable('penghasilan', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  id_penghasilan: text('id_penghasilan').notNull(),
  nama_penghasilan: text('nama_penghasilan').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  configs: many(neofeederConfig),
  students: many(students),
  prodi: many(prodi),
  periode: many(periode),
  dosen: many(dosen),
  agama: many(agama),
  wilayah: many(wilayah),
  jenisDaftar: many(jenisDaftar),
  jalurMasuk: many(jalurMasuk),
  pekerjaan: many(pekerjaan),
  penghasilan: many(penghasilan),
}));

export const configRelations = relations(neofeederConfig, ({ one }) => ({
  user: one(users, {
    fields: [neofeederConfig.userId],
    references: [users.id],
  }),
}));

export const studentsRelations = relations(students, ({ one }) => ({
  user: one(users, {
    fields: [students.userId],
    references: [users.id],
  }),
}));

export const prodiRelations = relations(prodi, ({ one }) => ({
  user: one(users, {
    fields: [prodi.userId],
    references: [users.id],
  }),
}));

export const periodeRelations = relations(periode, ({ one }) => ({
  user: one(users, {
    fields: [periode.userId],
    references: [users.id],
  }),
}));

export const dosenRelations = relations(dosen, ({ one }) => ({
  user: one(users, {
    fields: [dosen.userId],
    references: [users.id],
  }),
}));

export const agamaRelations = relations(agama, ({ one }) => ({
  user: one(users, {
    fields: [agama.userId],
    references: [users.id],
  }),
}));

export const wilayahRelations = relations(wilayah, ({ one }) => ({
  user: one(users, {
    fields: [wilayah.userId],
    references: [users.id],
  }),
}));

export const jenisDaftarRelations = relations(jenisDaftar, ({ one }) => ({
  user: one(users, {
    fields: [jenisDaftar.userId],
    references: [users.id],
  }),
}));

export const jalurMasukRelations = relations(jalurMasuk, ({ one }) => ({
  user: one(users, {
    fields: [jalurMasuk.userId],
    references: [users.id],
  }),
}));

export const pekerjaanRelations = relations(pekerjaan, ({ one }) => ({
  user: one(users, {
    fields: [pekerjaan.userId],
    references: [users.id],
  }),
}));

export const penghasilanRelations = relations(penghasilan, ({ one }) => ({
  user: one(users, {
    fields: [penghasilan.userId],
    references: [users.id],
  }),
}));
