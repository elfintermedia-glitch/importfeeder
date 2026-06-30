import React, { useState, useEffect, useRef } from 'react';
import { fetchWithAuth } from '../lib/api.ts';
import { Upload, Download, RefreshCw, Send, AlertCircle, Edit, Trash2, X, Save } from 'lucide-react';
import * as XLSX from 'xlsx';

export const Students: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [prodiList, setProdiList] = useState<any[]>([]);
  const [jenisDaftarList, setJenisDaftarList] = useState<any[]>([]);
  const [jalurMasukList, setJalurMasukList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncLog, setSyncLog] = useState<string[]>([]);
  const [editingStudent, setEditingStudent] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadProdi = async () => {
    try {
      const data = await fetchWithAuth('/api/prodi');
      setProdiList(data.prodi || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadJenisDaftar = async () => {
    try {
      const data = await fetchWithAuth('/api/jenis-daftar');
      setJenisDaftarList(data.jenis_daftar || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadJalurMasuk = async () => {
    try {
      const data = await fetchWithAuth('/api/jalur-masuk');
      setJalurMasukList(data.jalur_masuk || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadStudents = async () => {
    setLoading(true);
    try {
      const data = await fetchWithAuth('/api/students');
      setStudents(data.students || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProdi();
    loadJenisDaftar();
    loadJalurMasuk();
    loadStudents();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        // Map excel data to our format
        // Expected columns: NIM, Nama, ProgramStudi, PeriodeMasuk, Status
      const mappedData = data.map((row: any) => {
        const kodeProdiInput = (row['Kode Prodi'] || row['kode_prodi'] || '')?.toString().trim();
        const masterProdi = prodiList.find(p => p.kode_program_studi === kodeProdiInput);

        return {
          nim: row['NIM'] || row['nim'] || '',
          name: row['Nama Mahasiswa'] || row['nama_mahasiswa'] || row['Nama'] || row['nama'] || '',
          jenisKelamin: row['Jenis Kelamin'] || row['jenis_kelamin'] || '',
          tempatLahir: row['Tempat Lahir'] || row['tempat_lahir'] || '',
          tanggalLahir: row['Tanggal Lahir'] || row['tanggal_lahir'] || '',
          idAgama: row['ID Agama'] || row['id_agama'] || '',
          nik: row['NIK'] || row['nik'] || '',
          nisn: row['NISN'] || row['nisn'] || '',
          npwp: row['NPWP'] || row['npwp'] || '',
          kewarganegaraan: row['Kewarganegaraan'] || row['kewarganegaraan'] || '',
          jalan: row['Jalan'] || row['jalan'] || '',
          dusun: row['Dusun'] || row['dusun'] || '',
          rt: row['RT'] || row['rt'] || '',
          rw: row['RW'] || row['rw'] || '',
          kelurahan: row['Kelurahan'] || row['kelurahan'] || '',
          kodePos: row['Kode Pos'] || row['kode_pos'] || '',
          idWilayah: row['ID Wilayah'] || row['id_wilayah'] || '',
          idJenisTinggal: row['ID Jenis Tinggal'] || row['id_jenis_tinggal'] || '',
          idAlatTransportasi: row['ID Alat Transportasi'] || row['id_alat_transportasi'] || '',
          telepon: row['Telepon'] || row['telepon'] || '',
          handphone: row['No HP'] || row['no_hp'] || row['handphone'] || '',
          email: row['Email'] || row['email'] || '',
          penerimaKps: row['Penerima KPS'] || row['penerima_kps'] || '',
          nomorKps: row['Nomor KPS'] || row['nomor_kps'] || '',
          nikAyah: row['NIK Ayah'] || row['nik_ayah'] || '',
          namaAyah: row['Nama Ayah'] || row['nama_ayah'] || '',
          tanggalLahirAyah: row['Tanggal Lahir Ayah'] || row['tanggal_lahir_ayah'] || '',
          idPendidikanAyah: row['ID Pendidikan Ayah'] || row['id_pendidikan_ayah'] || '',
          idPekerjaanAyah: row['ID Pekerjaan Ayah'] || row['id_pekerjaan_ayah'] || '',
          idPenghasilanAyah: row['ID Penghasilan Ayah'] || row['id_penghasilan_ayah'] || '',
          nikIbu: row['NIK Ibu'] || row['nik_ibu'] || '',
          namaIbuKandung: row['Nama Ibu Kandung'] || row['nama_ibu_kandung'] || '',
          tanggalLahirIbu: row['Tanggal Lahir Ibu'] || row['tanggal_lahir_ibu'] || '',
          idPendidikanIbu: row['ID Pendidikan Ibu'] || row['id_pendidikan_ibu'] || '',
          idPekerjaanIbu: row['ID Pekerjaan Ibu'] || row['id_pekerjaan_ibu'] || '',
          idPenghasilanIbu: row['ID Penghasilan Ibu'] || row['id_penghasilan_ibu'] || '',
          namaWali: row['Nama Wali'] || row['nama_wali'] || '',
          tanggalLahirWali: row['Tanggal Lahir Wali'] || row['tanggal_lahir_wali'] || '',
          idPendidikanWali: row['ID Pendidikan Wali'] || row['id_pendidikan_wali'] || '',
          idPekerjaanWali: row['ID Pekerjaan Wali'] || row['id_pekerjaan_wali'] || '',
          idPenghasilanWali: row['ID Penghasilan Wali'] || row['id_penghasilan_wali'] || '',
          idKebutuhanKhususMahasiswa: row['ID Kebutuhan Khusus Mahasiswa'] || row['id_kebutuhan_khusus_mahasiswa'] || '',
          idKebutuhanKhususAyah: row['ID Kebutuhan Khusus Ayah'] || row['id_kebutuhan_khusus_ayah'] || '',
          idKebutuhanKhususIbu: row['ID Kebutuhan Khusus Ibu'] || row['id_kebutuhan_khusus_ibu'] || '',
          idJenisDaftar: row['ID Jenis Daftar'] || row['id_jenis_daftar'] || '',
          idJalurDaftar: row['ID Jalur Daftar'] || row['id_jalur_daftar'] || '',
          idPembiayaan: row['ID Pembiayaan'] || row['id_pembiayaan'] || '',
          biayaMasuk: row['Biaya Masuk'] || row['biaya_masuk'] || '',
          idProdi: masterProdi ? (masterProdi.id_prodi || masterProdi.kode_program_studi) : (row['Kode Prodi'] || row['ID Prodi'] || row['id_prodi'] || ''),
          programStudy: masterProdi ? masterProdi.nama_program_studi : (row['Program Studi'] || row['program_studi'] || row['ProgramStudi'] || ''),
          admissionPeriod: row['Periode Masuk'] || row['periode_masuk'] || row['PeriodeMasuk'] || '',
          status: row['Status'] || row['status'] || 'Baru'
        };
      }).filter(s => s.nim && s.name);

        await fetchWithAuth('/api/students/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: mappedData })
        });
        
        loadStudents();
      } catch (err) {
        console.error(err);
        alert("Gagal memproses file Excel");
      }
      setLoading(false);
      // reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  };

  const downloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    const wsData = [
      [
        'NIM', 'Nama Mahasiswa', 'Jenis Kelamin', 'Tempat Lahir', 'Tanggal Lahir',
        'ID Agama', 'NIK', 'NISN', 'NPWP', 'Kewarganegaraan', 'Jalan', 'Dusun', 'RT', 'RW', 'Kelurahan', 'Kode Pos', 'ID Wilayah',
        'ID Jenis Tinggal', 'ID Alat Transportasi', 'Telepon', 'No HP', 'Email', 'Penerima KPS', 'Nomor KPS',
        'NIK Ayah', 'Nama Ayah', 'Tanggal Lahir Ayah', 'ID Pendidikan Ayah', 'ID Pekerjaan Ayah', 'ID Penghasilan Ayah',
        'NIK Ibu', 'Nama Ibu Kandung', 'Tanggal Lahir Ibu', 'ID Pendidikan Ibu', 'ID Pekerjaan Ibu', 'ID Penghasilan Ibu',
        'Nama Wali', 'Tanggal Lahir Wali', 'ID Pendidikan Wali', 'ID Pekerjaan Wali', 'ID Penghasilan Wali',
        'ID Kebutuhan Khusus Mahasiswa', 'ID Kebutuhan Khusus Ayah', 'ID Kebutuhan Khusus Ibu',
        'Kode Prodi', 'Program Studi', 'Periode Masuk', 'ID Jenis Daftar', 'ID Jalur Daftar', 'ID Pembiayaan', 'Biaya Masuk', 'Status'
      ],
      [
        '12345', 'Budi Santoso', 'L', 'Jakarta', '2000-01-01',
        '1', '1234567890123456', '0012345678', '', 'ID', 'Jl. Merdeka', 'Dusun A', '1', '1', 'Gambir', '10110', '010000',
        '1', '1', '0211234567', '081234567890', 'budi@example.com', '0', '',
        '', 'Bapak Budi', '1970-01-01', '1', '1', '1',
        '', 'Ibu Budi', '1975-01-01', '1', '1', '1',
        '', '', '0', '0', '0',
        '0', '0', '0',
        '55201', 'Teknik Informatika', '20231', '1', '4', '1', '0', 'Baru'
      ]
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Mahasiswa");
    XLSX.writeFile(wb, "Template_Mahasiswa.xlsx");
  };

  const syncToNeofeeder = async () => {
    const studentsToSync = students.filter(s => s.status === 'Baru' || s.status === 'Gagal');
    if (studentsToSync.length === 0) {
      setSyncLog(['Tidak ada data mahasiswa berstatus "Baru" atau "Gagal" untuk disinkronisasi.']);
      return;
    }
    
    setSyncing(true);
    setSyncLog([]);
    const logs = [];
    
    let successCount = 0;
    let failCount = 0;

    // In a real app, we need dictionary mapping for Program Studi
    // For this example, we just push dummy data to represent the logic
    for (const student of studentsToSync) {
      logs.push(`Memproses ${student.name} (${student.nim})...`);
      setSyncLog([...logs]);
      
      if (!student.idProdi) {
        logs.push(`❌ Gagal ${student.name}: Program Studi (ID Prodi) wajib diisi.`);
        setSyncLog([...logs]);
        failCount++;
        continue;
      }

      if (!student.admissionPeriod) {
        logs.push(`❌ Gagal ${student.name}: Periode Masuk wajib diisi.`);
        setSyncLog([...logs]);
        failCount++;
        continue;
      }

      try {
        // Step 1: Insert Mahasiswa (Biodata)
        // Adjust the payload based on actual Neofeeder Dictionary
        const res = await fetchWithAuth('/api/neofeeder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'InsertBiodataMahasiswa',
            payload: {
              record: {
                nama_mahasiswa: student.name,
                jenis_kelamin: student.jenisKelamin || "L",
                tempat_lahir: student.tempatLahir || "Jakarta",
                tanggal_lahir: student.tanggalLahir || "2000-01-01",
                id_agama: parseInt(student.idAgama || "1", 10),
                nik: student.nik || "1234567890123456",
                nisn: student.nisn || "",
                npwp: student.npwp || "",
                kewarganegaraan: student.kewarganegaraan || "ID",
                jalan: student.jalan || "Jl. Merdeka",
                dusun: student.dusun || "Dusun Merdeka",
                rt: student.rt || 1,
                rw: student.rw || 1,
                kelurahan: student.kelurahan || "Gambir",
                kode_pos: student.kodePos || "10110",
                id_wilayah: student.idWilayah || "010000",
                id_jenis_tinggal: student.idJenisTinggal || 1,
                id_alat_transportasi: student.idAlatTransportasi || 1,
                telepon: student.telepon || "",
                handphone: student.handphone || "",
                email: student.email || "",
                penerima_kps: parseInt(student.penerimaKps || "0", 10),
                nomor_kps: student.nomorKps || "",
                nik_ayah: student.nikAyah || "",
                nama_ayah: student.namaAyah || ("Bapak " + student.name),
                tanggal_lahir_ayah: student.tanggalLahirAyah || "1970-01-01",
                id_pendidikan_ayah: student.idPendidikanAyah || 1,
                id_pekerjaan_ayah: student.idPekerjaanAyah || 1,
                id_penghasilan_ayah: student.idPenghasilanAyah || 14,
                nik_ibu: student.nikIbu || "",
                nama_ibu_kandung: student.namaIbuKandung || ("Ibu " + student.name),
                tanggal_lahir_ibu: student.tanggalLahirIbu || "1975-01-01",
                id_pendidikan_ibu: student.idPendidikanIbu || 1,
                id_pekerjaan_ibu: student.idPekerjaanIbu || 1,
                id_penghasilan_ibu: student.idPenghasilanIbu || 14,
                nama_wali: student.namaWali || "",
                tanggal_lahir_wali: student.tanggalLahirWali || "",
                id_pendidikan_wali: student.idPendidikanWali || 0,
                id_pekerjaan_wali: student.idPekerjaanWali || 0,
                id_penghasilan_wali: student.idPenghasilanWali || 0,
                id_kebutuhan_khusus_mahasiswa: student.idKebutuhanKhususMahasiswa || 0,
                id_kebutuhan_khusus_ayah: student.idKebutuhanKhususAyah || 0,
                id_kebutuhan_khusus_ibu: student.idKebutuhanKhususIbu || 0
              }
            }
          })
        });

        if (res.error_code === 0) {
          logs.push(`✅ Biodata ${student.name} berhasil diinsert.`);
          setSyncLog([...logs]);
          
          const id_mahasiswa = res.data?.id_mahasiswa;
          let isFullySuccessful = false;
          
          if (id_mahasiswa) {
            // Dapatkan id_prodi dari local database 'periode'
            let id_prodi = student.idProdi || "";
            if (!id_prodi) {
              try {
                const prodiQuery = await fetchWithAuth('/api/db/query', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    query: `SELECT id_prodi FROM periode WHERE nama_program_studi ILIKE '%${student.programStudy}%' LIMIT 1`
                  })
                });
                if (prodiQuery.result && prodiQuery.result.length > 0) {
                  id_prodi = prodiQuery.result[0].id_prodi;
                }
              } catch (err) {
                console.error(err);
              }
            }

            if (!id_prodi) {
               logs.push(`⚠️ Peringatan: id_prodi tidak ditemukan di database lokal untuk prodi '${student.programStudy}'. Mencari di Neofeeder...`);
               setSyncLog([...logs]);
               const nfProdi = await fetchWithAuth('/api/neofeeder', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({
                   action: 'GetProdi',
                   payload: { filter: `nama_program_studi LIKE '%${student.programStudy}%'` }
                 })
               });
               if (nfProdi.error_code === 0 && nfProdi.data && nfProdi.data.length > 0) {
                 id_prodi = nfProdi.data[0].id_prodi;
               }
            }

            if (id_prodi) {
               logs.push(`⏳ Mengirim Riwayat Pendidikan ${student.name}...`);
               setSyncLog([...logs]);
               
               const riwayatRes = await fetchWithAuth('/api/neofeeder', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({
                   action: 'InsertRiwayatPendidikanMahasiswa',
                   payload: {
                     record: {
                       id_mahasiswa: id_mahasiswa,
                       nim: student.nim,
                       id_jenis_daftar: student.idJenisDaftar || 1, // 1: Peserta didik baru
                       id_jalur_daftar: student.idJalurDaftar || 4, // 4: Seleksi Mandiri
                       id_periode_masuk: student.admissionPeriod || "20231",
                       tanggal_daftar: student.tanggalLahir || "2023-08-01",
                       id_perguruan_tinggi: "", // optional
                       id_prodi: id_prodi,
                       id_pembiayaan: student.idPembiayaan || 1, // 1: Mandiri
                       biaya_masuk: student.biayaMasuk || 0
                     }
                   }
                 })
               });
               
               if (riwayatRes.error_code === 0) {
                  logs.push(`✅ Riwayat Pendidikan ${student.name} berhasil diinsert.`);
                  isFullySuccessful = true;
               } else {
                  logs.push(`❌ Gagal Riwayat Pendidikan: ${riwayatRes.error_desc}`);
               }
            } else {
               logs.push(`❌ Gagal: Tidak dapat menemukan ID Prodi untuk '${student.programStudy}'`);
            }
          }

          if (isFullySuccessful) {
             successCount++;
             // Update status to Terkirim
             await fetchWithAuth('/api/students/status', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ nim: student.nim, status: 'Terkirim' })
             });
          } else {
             failCount++;
             // Update status to Gagal
             await fetchWithAuth('/api/students/status', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ nim: student.nim, status: 'Gagal' })
             });
          }
        } else {
          logs.push(`❌ Gagal Biodata: ${res.error_desc}`);
          failCount++;
          await fetchWithAuth('/api/students/status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nim: student.nim, status: 'Gagal' })
          });
        }
      } catch (e: any) {
         logs.push(`❌ Error: ${e.message}`);
         failCount++;
         await fetchWithAuth('/api/students/status', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ nim: student.nim, status: 'Gagal' })
         });
      }
      setSyncLog([...logs]);
    }
    
    logs.push(`Sinkronisasi Selesai. Berhasil: ${successCount}, Gagal: ${failCount}`);
    logs.push(`Silakan cek Log Sinkronisasi untuk melihat detail informasi error jika ada.`);
    setSyncLog([...logs]);
    setSyncing(false);
    loadStudents();
  };

  const handleDelete = async (nim: string) => {
    if (!confirm(`Hapus data mahasiswa dengan NIM ${nim}?`)) return;
    try {
      await fetchWithAuth(`/api/students/${nim}`, { method: 'DELETE' });
      loadStudents();
    } catch (e) {
      console.error('Failed to delete student', e);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingStudent) return;
    try {
      await fetchWithAuth(`/api/students/${editingStudent.nim}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingStudent)
      });
      setEditingStudent(null);
      loadStudents();
    } catch (e) {
      console.error('Failed to update student', e);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Data Mahasiswa Baru</h1>
          <p className="text-[#6B7280] mt-1 text-sm">Kelola dan sinkronisasi data mahasiswa ke PDDIKTI</p>
        </div>
        
        <div className="flex space-x-3">
          <button 
            onClick={downloadTemplate}
            className="flex items-center px-4 py-2 bg-transparent border border-[#D1D5DB] text-[#374151] rounded-md hover:bg-gray-50 text-sm font-semibold transition-colors cursor-pointer"
          >
            <Download className="h-4 w-4 mr-2" />
            Template Excel
          </button>
          
          <input 
            type="file" 
            accept=".xlsx, .xls"
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center px-4 py-2 bg-transparent border border-[#D1D5DB] text-[#374151] rounded-md hover:bg-gray-50 text-sm font-semibold transition-colors cursor-pointer"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Data
          </button>
          
          <button 
            onClick={syncToNeofeeder}
            disabled={syncing || students.length === 0}
            className="flex items-center px-4 py-2 bg-[#2563EB] text-white rounded-md hover:bg-blue-700 text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
          >
            {syncing ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
            Sinkronisasi ke Neofeeder
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden flex flex-col shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
            <div className="px-6 py-5 border-b border-[#E5E7EB] flex justify-between items-center">
              <h3 className="m-0 text-base font-semibold text-[#111827]">Daftar Record Mahasiswa</h3>
            </div>
            {loading ? (
              <div className="p-8 text-center text-gray-500">Memuat data...</div>
            ) : students.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Belum ada data mahasiswa.</p>
                <p className="text-sm mt-1">Upload Data menggunakan template Excel.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse min-w-[1200px]">
                  <thead className="bg-[#F9FAFB]">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] border-b border-[#E5E7EB] whitespace-nowrap">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] border-b border-[#E5E7EB] whitespace-nowrap">NIM</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] border-b border-[#E5E7EB] whitespace-nowrap">Nama</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] border-b border-[#E5E7EB] whitespace-nowrap">Kode Prodi</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] border-b border-[#E5E7EB] whitespace-nowrap">Prodi</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] border-b border-[#E5E7EB] whitespace-nowrap">Jenis Kelamin</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] border-b border-[#E5E7EB] whitespace-nowrap">Tempat Lahir</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] border-b border-[#E5E7EB] whitespace-nowrap">Tanggal Lahir</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] border-b border-[#E5E7EB] whitespace-nowrap">Agama</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] border-b border-[#E5E7EB] whitespace-nowrap">NIK</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] border-b border-[#E5E7EB] whitespace-nowrap">NISN</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] border-b border-[#E5E7EB] whitespace-nowrap">No HP</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] border-b border-[#E5E7EB] whitespace-nowrap">Email</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] border-b border-[#E5E7EB] whitespace-nowrap">Kewarganegaraan</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] border-b border-[#E5E7EB] whitespace-nowrap">Kelurahan</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] border-b border-[#E5E7EB] whitespace-nowrap">Wilayah</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] border-b border-[#E5E7EB] whitespace-nowrap">KPS</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] border-b border-[#E5E7EB] whitespace-nowrap">Ibu Kandung</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] border-b border-[#E5E7EB] whitespace-nowrap">Periode Masuk</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] border-b border-[#E5E7EB] whitespace-nowrap">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-[#F3F4F6]">
                    {students.map((student, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${
                            student.status === 'Terkirim' ? 'bg-[#F0FDF4] text-[#166534]' :
                            student.status === 'Gagal' ? 'bg-red-50 text-red-700' :
                            student.status === 'Baru' ? 'bg-yellow-50 text-yellow-700' :
                            student.status === 'Lulus' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-[#6B7280]'
                          }`}>
                            {student.status === 'Terkirim' ? '● Terkirim' : 
                             student.status === 'Gagal' ? '● Gagal' : student.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#1F2937]">{student.nim}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151]">{student.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151]">{prodiList.find(p => p.id_prodi === student.idProdi || p.kode_program_studi === student.idProdi)?.kode_program_studi || student.idProdi}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151]">{prodiList.find(p => p.id_prodi === student.idProdi || p.kode_program_studi === student.idProdi)?.nama_program_studi || student.programStudy}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151]">{student.jenisKelamin}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151]">{student.tempatLahir}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151]">{student.tanggalLahir}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151]">{student.idAgama}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151]">{student.nik}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151]">{student.nisn}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151]">{student.handphone}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151]">{student.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151]">{student.kewarganegaraan}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151]">{student.kelurahan}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151]">{student.idWilayah}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151]">{student.penerimaKps}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151]">{student.namaIbuKandung}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151]">{student.admissionPeriod}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151]">
                          <div className="flex space-x-2">
                            <button onClick={() => setEditingStudent(student)} className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded" title="Edit">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleDelete(student.nim)} className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded" title="Hapus">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="px-6 py-4 border-t border-[#E5E7EB] flex justify-between items-center bg-[#F9FAFB]">
              <span className="text-[13px] text-[#6B7280]">Total {students.length} Mahasiswa</span>
            </div>
          </div>
        </div>
        
        <div className="col-span-1">
          <div className="bg-[#1E293B] rounded-xl border border-[#334155] overflow-hidden text-slate-300 h-full flex flex-col shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
            <div className="p-4 border-b border-[#334155] font-mono text-sm font-semibold flex items-center justify-between text-white">
              <span>Log Sinkronisasi</span>
              {syncing && <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>}
            </div>
            <div className="p-4 flex-1 h-[500px] overflow-y-auto font-mono text-xs space-y-2">
              {syncLog.length === 0 ? (
                <div className="text-[#64748B] italic">Standby...</div>
              ) : (
                syncLog.map((log, i) => <div key={i}>{log}</div>)
              )}
            </div>
          </div>
        </div>
      </div>

      {editingStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">Edit Data Mahasiswa</h3>
              <button onClick={() => setEditingStudent(null)} className="text-gray-400 hover:text-gray-500">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Mahasiswa</label>
                <input type="text" value={editingStudent.name || ''} onChange={e => setEditingStudent({...editingStudent, name: e.target.value})} className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NIM</label>
                <input type="text" value={editingStudent.nim || ''} disabled className="w-full p-2 border border-gray-200 bg-gray-50 rounded-md shadow-sm text-sm text-gray-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Program Studi</label>
                <select 
                  value={editingStudent.idProdi || ''} 
                  onChange={e => {
                    const selected = prodiList.find(p => p.id_prodi === e.target.value || p.kode_program_studi === e.target.value);
                    setEditingStudent({
                      ...editingStudent, 
                      idProdi: selected ? (selected.id_prodi || selected.kode_program_studi) : e.target.value,
                      programStudy: selected ? selected.nama_program_studi : editingStudent.programStudy
                    });
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm"
                >
                  <option value="">-- Pilih Program Studi --</option>
                  {prodiList.map((p, i) => (
                    <option key={p.id || i} value={p.id_prodi || p.kode_program_studi}>
                      {p.nama_program_studi} ({p.kode_program_studi})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NISN</label>
                <input type="text" value={editingStudent.nisn || ''} onChange={e => setEditingStudent({...editingStudent, nisn: e.target.value})} className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NIK</label>
                <input type="text" value={editingStudent.nik || ''} onChange={e => setEditingStudent({...editingStudent, nik: e.target.value})} className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">No HP</label>
                <input type="text" value={editingStudent.handphone || ''} onChange={e => setEditingStudent({...editingStudent, handphone: e.target.value})} className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={editingStudent.email || ''} onChange={e => setEditingStudent({...editingStudent, email: e.target.value})} className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Ibu Kandung</label>
                <input type="text" value={editingStudent.namaIbuKandung || ''} onChange={e => setEditingStudent({...editingStudent, namaIbuKandung: e.target.value})} className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin (L/P)</label>
                <input type="text" value={editingStudent.jenisKelamin || ''} onChange={e => setEditingStudent({...editingStudent, jenisKelamin: e.target.value})} className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir (YYYY-MM-DD)</label>
                <input type="text" value={editingStudent.tanggalLahir || ''} onChange={e => setEditingStudent({...editingStudent, tanggalLahir: e.target.value})} className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Periode Masuk (Contoh: 20231)</label>
                <input type="text" value={editingStudent.admissionPeriod || ''} onChange={e => setEditingStudent({...editingStudent, admissionPeriod: e.target.value})} className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Daftar</label>
                <select 
                  value={editingStudent.idJenisDaftar || ''} 
                  onChange={e => setEditingStudent({...editingStudent, idJenisDaftar: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm"
                >
                  <option value="">-- Pilih Jenis Daftar --</option>
                  {jenisDaftarList.map((j, i) => (
                    <option key={j.id || i} value={j.id_jenis_daftar}>
                      {j.nama_jenis_daftar} ({j.id_jenis_daftar})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jalur Daftar</label>
                <select 
                  value={editingStudent.idJalurDaftar || ''} 
                  onChange={e => setEditingStudent({...editingStudent, idJalurDaftar: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm"
                >
                  <option value="">-- Pilih Jalur Daftar --</option>
                  {jalurMasukList.map((j, i) => (
                    <option key={j.id || i} value={j.id_jalur_masuk}>
                      {j.nama_jalur_masuk} ({j.id_jalur_masuk})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3 bg-gray-50">
              <button onClick={() => setEditingStudent(null)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors">
                Batal
              </button>
              <button onClick={handleSaveEdit} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 flex items-center transition-colors">
                <Save className="h-4 w-4 mr-2" />
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
