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
  kewarganegaraan: text('kewarganegaraan'),
  kelurahan: text('kelurahan'),
  idWilayah: text('id_wilayah'),
  penerimaKps: text('penerima_kps'),
  namaIbuKandung: text('nama_ibu_kandung'),
  status: text('status').default('Baru'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const prodi = pgTable('prodi', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
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

export const usersRelations = relations(users, ({ many }) => ({
  configs: many(neofeederConfig),
  students: many(students),
  prodi: many(prodi),
  periode: many(periode),
  dosen: many(dosen),
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
