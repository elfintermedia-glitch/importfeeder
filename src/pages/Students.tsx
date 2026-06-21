import React, { useState, useEffect, useRef } from 'react';
import { fetchWithAuth } from '../lib/api.ts';
import { Upload, Download, RefreshCw, Send, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

export const Students: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncLog, setSyncLog] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        const mappedData = data.map((row: any) => ({
          nim: row['NIM'] || row['nim'] || '',
          name: row['Nama'] || row['nama'] || '',
          programStudy: row['ProgramStudi'] || row['program_studi'] || '',
          admissionPeriod: row['PeriodeMasuk'] || row['periode_masuk'] || '',
          status: row['Status'] || row['status'] || 'Baru'
        })).filter(s => s.nim && s.name);

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
      ['NIM', 'Nama', 'ProgramStudi', 'PeriodeMasuk', 'Status'],
      ['12345', 'Budi Santoso', 'Teknik Informatika', '20231', 'Baru'],
      ['12346', 'Siti Aminah', 'Sistem Informasi', '20231', 'Lulus']
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Mahasiswa");
    XLSX.writeFile(wb, "Template_Mahasiswa.xlsx");
  };

  const syncToNeofeeder = async () => {
    if (!confirm(`Sinkronisasi ${students.length} data mahasiswa ke Neofeeder?`)) return;
    setSyncing(true);
    setSyncLog([]);
    const logs = [];
    
    // In a real app, we need dictionary mapping for Program Studi
    // For this example, we just push dummy data to represent the logic
    for (const student of students) {
      logs.push(`Memproses ${student.name} (${student.nim})...`);
      setSyncLog([...logs]);
      
      try {
        // Step 1: Insert Mahasiswa (Biodata)
        // Adjust the payload based on actual Neofeeder Dictionary
        const res = await fetchWithAuth('/api/neofeeder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'InsertMahasiswa',
            payload: {
              record: {
                nama_mahasiswa: student.name,
                jenis_kelamin: "L", // Dummy
                tempat_lahir: "Jakarta",
                tanggal_lahir: "2000-01-01",
                id_agama: 1, // Islam
                nik: "1234567890123456",
                kewarganegaraan: "ID",
                nama_ibu_kandung: "Ibu " + student.name
              }
            }
          })
        });

        if (res.error_code === 0) {
          logs.push(`✅ Biodata ${student.name} berhasil diinsert.`);
          // Next step typically is InsertRiwayatPendidikanMahasiswa 
          // passing the new id_mahasiswa along with NIM and Program Studi ID
        } else {
          logs.push(`❌ Gagal: ${res.error_desc}`);
        }
      } catch (e: any) {
         logs.push(`❌ Error: ${e.message}`);
      }
      setSyncLog([...logs]);
    }
    
    logs.push("Sinkronisasi Selesai.");
    setSyncLog([...logs]);
    setSyncing(false);
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
              <table className="w-full text-sm border-collapse">
                <thead className="bg-[#F9FAFB]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] border-b border-[#E5E7EB]">NIM</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] border-b border-[#E5E7EB]">Nama</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] border-b border-[#E5E7EB]">Prodi</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] border-b border-[#E5E7EB]">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[#F3F4F6]">
                  {students.map((student, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#1F2937]">{student.nim}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151]">{student.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151]">{student.programStudy}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${
                          student.status === 'Baru' ? 'bg-[#F0FDF4] text-[#166534]' :
                          student.status === 'Lulus' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-[#6B7280]'
                        }`}>
                          {student.status === 'Baru' ? '● Terkirim' : student.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
    </div>
  );
};
