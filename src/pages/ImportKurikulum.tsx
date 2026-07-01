import React, { useState, useEffect, useRef } from 'react';
import { fetchWithAuth } from '../lib/api.ts';
import { Upload, Download, RefreshCw, Send, AlertCircle, FileUp, Plus, X, Edit, Trash2, Save } from 'lucide-react';
import * as XLSX from 'xlsx';

interface KurikulumPayload {
  id?: number;
  id_prodi: string;
  nama_kurikulum: string;
  id_semester: string;
  jumlah_sks_lulus: string | number;
  jumlah_sks_wajib: string | number;
  jumlah_sks_pilihan: string | number;
  status?: string;
}

export const ImportKurikulum: React.FC = () => {
  const [prodiList, setProdiList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [parsedData, setParsedData] = useState<KurikulumPayload[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [syncLog, setSyncLog] = useState<{ status: 'success' | 'error' | 'pending'; message: string; payload?: any }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRow, setEditingRow] = useState<KurikulumPayload | null>(null);
  const [rowToDelete, setRowToDelete] = useState<KurikulumPayload | null>(null);
  const [newRow, setNewRow] = useState<KurikulumPayload>({
    id_prodi: '',
    nama_kurikulum: '',
    id_semester: '',
    jumlah_sks_lulus: 0,
    jumlah_sks_wajib: 0,
    jumlah_sks_pilihan: 0,
    status: 'Baru'
  });

  useEffect(() => {
    loadProdi();
    loadKurikulum();
  }, []);

  const loadProdi = async () => {
    try {
      const data = await fetchWithAuth('/api/prodi');
      setProdiList(data.prodi || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadKurikulum = async () => {
    try {
      const data = await fetchWithAuth('/api/kurikulum');
      if (data.kurikulum) {
        setParsedData(data.kurikulum);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      {
        'Kode Prodi': 'Contoh: 55201',
        'Nama Kurikulum': 'Contoh: Kurikulum MBKM 2023',
        'Semester Mulai': 'Contoh: 20231',
        'SKS Lulus': 144,
        'SKS Wajib': 130,
        'SKS Pilihan': 14
      }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'Template_Import_Kurikulum.xlsx');
  };

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
        
        const mappedData: KurikulumPayload[] = data.map((row: any) => {
          const kodeProdiInput = (row['Kode Prodi'] || row['kode_prodi'] || '')?.toString().trim();
          const masterProdi = prodiList.find(p => p.kode_program_studi === kodeProdiInput);

          return {
            id_prodi: masterProdi ? (masterProdi.id_prodi || masterProdi.kode_program_studi) : (row['Kode Prodi'] || row['ID Prodi'] || row['id_prodi'] || ''),
            nama_kurikulum: row['Nama Kurikulum'] || row['nama_kurikulum'] || '',
            id_semester: row['Semester Mulai'] || row['semester_mulai'] || row['id_semester'] || '',
            jumlah_sks_lulus: row['SKS Lulus'] || row['sks_lulus'] || row['jumlah_sks_lulus'] || 0,
            jumlah_sks_wajib: row['SKS Wajib'] || row['sks_wajib'] || row['jumlah_sks_wajib'] || 0,
            jumlah_sks_pilihan: row['SKS Pilihan'] || row['sks_pilihan'] || row['jumlah_sks_pilihan'] || 0,
            status: 'Baru'
          };
        }).filter(k => k.nama_kurikulum && k.id_prodi);

        const updatedData = [...parsedData, ...mappedData];
        setParsedData(updatedData);
        setSyncLog(mappedData.map(d => ({ status: 'pending', message: `Menunggu sinkronisasi: ${d.nama_kurikulum}`, payload: d })));
        
        // Save to database
        try {
          await fetchWithAuth('/api/kurikulum/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: mappedData })
          });
          await loadKurikulum();
        } catch (err) {
          console.error("Gagal menyimpan ke database", err);
        }
        
      } catch (err) {
        console.error(err);
        alert("Gagal memproses file Excel");
      } finally {
        setLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  const syncToNeofeeder = async () => {
    const itemsToSync = parsedData.filter(d => d.status === 'Baru' || d.status === 'Gagal');
    if (itemsToSync.length === 0) {
      alert("Tidak ada data baru atau gagal untuk disinkronisasi.");
      return;
    }
    
    setSyncing(true);
    const newLogs = [...syncLog];
    
    for (let i = 0; i < parsedData.length; i++) {
      const payload = parsedData[i];
      if (payload.status !== 'Baru' && payload.status !== 'Gagal') continue;
      
      try {
        newLogs[i] = { status: 'pending', message: `Proses sinkronisasi: ${payload.nama_kurikulum}...`, payload };
        setSyncLog([...newLogs]);

        const result = await fetchWithAuth('/api/neofeeder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'InsertKurikulum',
            payload: { record: payload }
          })
        });

        if (result.error_code === 0) {
          newLogs[i] = { status: 'success', message: `Berhasil import: ${payload.nama_kurikulum}`, payload };
          
          // Update status in parsedData
          setParsedData(prev => {
            const newData = [...prev];
            newData[i] = { ...newData[i], status: 'Sukses' };
            return newData;
          });
          
          // Save status to DB
          try {
            await fetchWithAuth('/api/kurikulum/bulk', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ items: [{ ...payload, status: 'Sukses' }] })
            });
          } catch (e) {
            console.error("Gagal update status di database", e);
          }
        } else {
          newLogs[i] = { status: 'error', message: `Gagal import: ${payload.nama_kurikulum} - ${result.error_desc || 'Unknown error'}`, payload };
          
          // Update status in parsedData
          setParsedData(prev => {
            const newData = [...prev];
            newData[i] = { ...newData[i], status: 'Gagal' };
            return newData;
          });
          
          // Save status to DB
          try {
            await fetchWithAuth('/api/kurikulum/bulk', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ items: [{ ...payload, status: 'Gagal' }] })
            });
          } catch (e) {
            console.error("Gagal update status di database", e);
          }
        }
      } catch (err: any) {
        newLogs[i] = { status: 'error', message: `Gagal import: ${payload.nama_kurikulum} - ${err.message}`, payload };
        
        // Update status in parsedData
        setParsedData(prev => {
          const newData = [...prev];
          newData[i] = { ...newData[i], status: 'Gagal' };
          return newData;
        });
        
        // Save status to DB
        try {
          await fetchWithAuth('/api/kurikulum/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: [{ ...payload, status: 'Gagal' }] })
          });
        } catch (e) {
          console.error("Gagal update status di database", e);
        }
      }
      setSyncLog([...newLogs]);
    }
    
    setSyncing(false);
  };

  const handleAddRow = async () => {
    if (!newRow.id_prodi || !newRow.nama_kurikulum || !newRow.id_semester) return;
    
    setParsedData(prev => [...prev, newRow]);
    setSyncLog(prev => [...prev, { status: 'pending', message: `Menunggu sinkronisasi: ${newRow.nama_kurikulum}`, payload: newRow }]);
    setShowAddModal(false);
    
    const rowToSave = { ...newRow };
    
    setNewRow({
      id_prodi: '',
      nama_kurikulum: '',
      id_semester: '',
      jumlah_sks_lulus: 0,
      jumlah_sks_wajib: 0,
      jumlah_sks_pilihan: 0,
      status: 'Baru'
    });
    
    // Save to database
    try {
      await fetchWithAuth('/api/kurikulum/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [rowToSave] })
      });
      await loadKurikulum();
    } catch (err) {
      console.error("Gagal menyimpan ke database", err);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingRow || !editingRow.id) return;
    try {
      await fetchWithAuth(`/api/kurikulum/${editingRow.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingRow)
      });
      setEditingRow(null);
      await loadKurikulum();
    } catch (e) {
      console.error('Failed to update kurikulum', e);
    }
  };

  const executeDelete = async () => {
    if (!rowToDelete || !rowToDelete.id) return;
    try {
      await fetchWithAuth(`/api/kurikulum/${rowToDelete.id}`, { method: 'DELETE' });
      await loadKurikulum();
    } catch (e) {
      console.error('Failed to delete kurikulum', e);
    } finally {
      setRowToDelete(null);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Import Kurikulum</h1>
          <p className="text-gray-500 text-sm mt-1">Upload data kurikulum ke Neofeeder via Excel</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm"
          >
            <Plus className="h-4 w-4" />
            Tambah Manual
          </button>
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm"
          >
            <Download className="h-4 w-4" />
            Download Template
          </button>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx, .xls"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading || syncing}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm disabled:opacity-50"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
            Pilih File Excel
          </button>
          <button
            onClick={syncToNeofeeder}
            disabled={syncing || parsedData.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {syncing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Sinkronisasi Neofeeder
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h2 className="font-semibold text-gray-700">Data Siap Import ({parsedData.length})</h2>
              {parsedData.length > 0 && (
                <button
                  onClick={async () => {
                    setParsedData([]);
                    setSyncLog([]);
                    try {
                      await fetchWithAuth('/api/kurikulum', {
                        method: 'DELETE'
                      });
                      await loadKurikulum();
                    } catch (e) {
                      console.error("Gagal menghapus database kurikulum", e);
                    }
                  }}
                  disabled={syncing}
                  className="text-red-500 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                >
                  Bersihkan Data
                </button>
              )}
            </div>
            <div className="overflow-x-auto max-h-[600px]">
              <table className="w-full text-left border-collapse">
                <thead className="bg-white sticky top-0 shadow-sm">
                  <tr>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-600 border-b">No</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-600 border-b">Program Studi</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-600 border-b">Nama Kurikulum</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-600 border-b">Semester</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-600 border-b">SKS Lulus</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-600 border-b">SKS Wajib</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-600 border-b">SKS Pilihan</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-600 border-b">Status</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-600 border-b">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {parsedData.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                        Belum ada data. Silakan upload file excel atau tambah manual.
                      </td>
                    </tr>
                  ) : (
                    parsedData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-600">{idx + 1}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {(() => {
                            const prodi = prodiList.find(p => p.id_prodi === row.id_prodi);
                            if (prodi) {
                              return `${prodi.nama_program_studi} ${prodi.nama_jenjang_pendidikan ? `(${prodi.nama_jenjang_pendidikan})` : ''}`;
                            }
                            return row.id_prodi;
                          })()}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">{row.nama_kurikulum}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{row.id_semester}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{row.jumlah_sks_lulus}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{row.jumlah_sks_wajib}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{row.jumlah_sks_pilihan}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {row.status === 'Sukses' ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Sukses
                            </span>
                          ) : row.status === 'Gagal' ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Gagal
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {row.status || 'Baru'}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-[#374151]">
                          <div className="flex space-x-2">
                            <button onClick={() => setEditingRow(row)} className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded" title="Edit">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button onClick={() => setRowToDelete(row)} className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded" title="Hapus">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-[600px] flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="font-semibold text-gray-700">Log Sinkronisasi</h2>
            </div>
            <div className="p-4 flex-1 overflow-y-auto space-y-3 bg-gray-50">
              {syncLog.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <AlertCircle className="h-8 w-8 mb-2 opacity-20" />
                  <p className="text-sm">Log akan tampil di sini</p>
                </div>
              ) : (
                syncLog.map((log, i) => (
                  <div key={i} className={`p-3 rounded-lg border text-sm flex flex-col gap-2
                    ${log.status === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 
                      log.status === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 
                      'bg-white border-gray-200 text-gray-600'}`}>
                    <div className="flex gap-3 items-start">
                      <div className="mt-0.5 shrink-0">
                        {log.status === 'success' ? <span className="text-green-500">✓</span> : 
                         log.status === 'error' ? <span className="text-red-500">✗</span> : 
                         <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />}
                      </div>
                      <div className="flex-1">{log.message}</div>
                    </div>
                    {log.payload && (
                      <div className="mt-2 pl-7">
                        <pre className={`text-xs p-2 rounded overflow-x-auto ${
                          log.status === 'success' ? 'bg-green-100/50 text-green-900' :
                          log.status === 'error' ? 'bg-red-100/50 text-red-900' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {JSON.stringify(log.payload, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="font-semibold text-gray-800">Tambah Kurikulum Manual</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Program Studi</label>
                <select 
                  value={newRow.id_prodi}
                  onChange={(e) => setNewRow({...newRow, id_prodi: e.target.value})}
                  className="w-full border-gray-300 rounded-md shadow-sm text-sm p-2 border focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Pilih Program Studi</option>
                  {prodiList.map(p => (
                    <option key={p.id_prodi} value={p.id_prodi}>
                      {p.nama_program_studi} {p.nama_jenjang_pendidikan ? `(${p.nama_jenjang_pendidikan})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kurikulum</label>
                <input 
                  type="text" 
                  value={newRow.nama_kurikulum}
                  onChange={(e) => setNewRow({...newRow, nama_kurikulum: e.target.value})}
                  className="w-full border-gray-300 rounded-md shadow-sm text-sm p-2 border focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Contoh: Kurikulum MBKM 2023"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Semester Mulai</label>
                <input 
                  type="text" 
                  value={newRow.id_semester}
                  onChange={(e) => setNewRow({...newRow, id_semester: e.target.value})}
                  className="w-full border-gray-300 rounded-md shadow-sm text-sm p-2 border focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Contoh: 20231"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKS Lulus</label>
                  <input 
                    type="number" 
                    value={newRow.jumlah_sks_lulus}
                    onChange={(e) => setNewRow({...newRow, jumlah_sks_lulus: e.target.value})}
                    className="w-full border-gray-300 rounded-md shadow-sm text-sm p-2 border focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKS Wajib</label>
                  <input 
                    type="number" 
                    value={newRow.jumlah_sks_wajib}
                    onChange={(e) => setNewRow({...newRow, jumlah_sks_wajib: e.target.value})}
                    className="w-full border-gray-300 rounded-md shadow-sm text-sm p-2 border focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKS Pilihan</label>
                  <input 
                    type="number" 
                    value={newRow.jumlah_sks_pilihan}
                    onChange={(e) => setNewRow({...newRow, jumlah_sks_pilihan: e.target.value})}
                    className="w-full border-gray-300 rounded-md shadow-sm text-sm p-2 border focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-2">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 text-sm">Batal</button>
              <button 
                onClick={handleAddRow} 
                disabled={!newRow.id_prodi || !newRow.nama_kurikulum || !newRow.id_semester}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm disabled:opacity-50"
              >
                Tambahkan
              </button>
            </div>
          </div>
        </div>
      )}

      {editingRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="font-semibold text-gray-800">Edit Kurikulum</h3>
              <button onClick={() => setEditingRow(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Program Studi</label>
                <select 
                  value={editingRow.id_prodi}
                  onChange={(e) => setEditingRow({...editingRow, id_prodi: e.target.value})}
                  className="w-full border-gray-300 rounded-md shadow-sm text-sm p-2 border focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Pilih Program Studi</option>
                  {prodiList.map(p => (
                    <option key={p.id_prodi} value={p.id_prodi}>
                      {p.nama_program_studi} {p.nama_jenjang_pendidikan ? `(${p.nama_jenjang_pendidikan})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kurikulum</label>
                <input 
                  type="text" 
                  value={editingRow.nama_kurikulum}
                  onChange={(e) => setEditingRow({...editingRow, nama_kurikulum: e.target.value})}
                  className="w-full border-gray-300 rounded-md shadow-sm text-sm p-2 border focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Contoh: Kurikulum 2021"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Semester Mulai Berlaku</label>
                <input 
                  type="text" 
                  value={editingRow.id_semester}
                  onChange={(e) => setEditingRow({...editingRow, id_semester: e.target.value})}
                  className="w-full border-gray-300 rounded-md shadow-sm text-sm p-2 border focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Contoh: 20211"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKS Lulus</label>
                  <input 
                    type="number" 
                    value={editingRow.jumlah_sks_lulus}
                    onChange={(e) => setEditingRow({...editingRow, jumlah_sks_lulus: e.target.value})}
                    className="w-full border-gray-300 rounded-md shadow-sm text-sm p-2 border focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKS Wajib</label>
                  <input 
                    type="number" 
                    value={editingRow.jumlah_sks_wajib}
                    onChange={(e) => setEditingRow({...editingRow, jumlah_sks_wajib: e.target.value})}
                    className="w-full border-gray-300 rounded-md shadow-sm text-sm p-2 border focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKS Pilihan</label>
                  <input 
                    type="number" 
                    value={editingRow.jumlah_sks_pilihan}
                    onChange={(e) => setEditingRow({...editingRow, jumlah_sks_pilihan: e.target.value})}
                    className="w-full border-gray-300 rounded-md shadow-sm text-sm p-2 border focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-2">
              <button onClick={() => setEditingRow(null)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 text-sm">Batal</button>
              <button 
                onClick={handleSaveEdit} 
                disabled={!editingRow.id_prodi || !editingRow.nama_kurikulum || !editingRow.id_semester}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm disabled:opacity-50"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {rowToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-center text-gray-900 mb-2">Hapus Data Kurikulum</h3>
              <p className="text-sm text-gray-500 text-center mb-6">Apakah Anda yakin ingin menghapus data kurikulum ini? Tindakan ini tidak dapat dibatalkan.</p>
              <div className="flex justify-center space-x-3">
                <button onClick={() => setRowToDelete(null)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 text-sm font-medium transition-colors">Batal</button>
                <button onClick={executeDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium transition-colors">Hapus</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
