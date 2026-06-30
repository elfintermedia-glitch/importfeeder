import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../lib/api.ts';
import { Database, AlertCircle, RefreshCw, Save, Check, Search } from 'lucide-react';

export const DataPekerjaan: React.FC = () => {
  const [pekerjaan, setPekerjaan] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPekerjaanLocal = async () => {
    setLoading(true);
    setError('');
    setSaveSuccess(false);
    try {
      const data = await fetchWithAuth('/api/pekerjaan', {
        method: 'GET'
      });
      if (data.pekerjaan) {
        setPekerjaan(data.pekerjaan);
      }
    } catch (err: any) {
      setError('Gagal mengambil data pekerjaan lokal: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    setError('');
    setSaveSuccess(false);
    try {
      const data = await fetchWithAuth('/api/neofeeder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'GetPekerjaan' })
      });
      
      if (data.error_code === 0 && data.data) {
        setPekerjaan(data.data);
      } else {
        setError(data.error_desc || 'Gagal mengambil data dari Neofeeder');
      }
    } catch (err: any) {
      setError('Koneksi bermasalah: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (pekerjaan.length === 0) return;
    setSaveLoading(true);
    setSaveSuccess(false);
    setError('');
    try {
      const data = await fetchWithAuth('/api/pekerjaan/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: pekerjaan })
      });
      if (data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setError(data.error || 'Gagal menyimpan data');
      }
    } catch (err: any) {
      setError('Gagal menyimpan: ' + err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  useEffect(() => {
    fetchPekerjaanLocal();
  }, []);

  const filteredPekerjaan = pekerjaan.filter(w => 
    w.nama_pekerjaan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.id_pekerjaan?.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Data Pekerjaan</h1>
          <p className="text-[#6B7280] mt-1 text-sm">Daftar pekerjaan dari PDDIKTI Neofeeder</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            disabled={loading || saveLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleSave}
            disabled={loading || saveLoading || pekerjaan.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {saveSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saveLoading ? 'Menyimpan...' : saveSuccess ? 'Tersimpan' : 'Simpan'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
        <div className="px-6 py-5 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F9FAFB]">
          <div className="flex items-center space-x-3 text-[#111827]">
            <Database className="h-5 w-5 text-[#2563EB]" />
            <h3 className="m-0 text-base font-semibold">Daftar Pekerjaan</h3>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari pekerjaan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
            />
          </div>
        </div>
        
        {loading ? (
          <div className="p-8 flex justify-center items-center text-[#6B7280]">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mr-4"></div>
            Memuat data pekerjaan...
          </div>
        ) : error ? (
          <div className="p-12 text-center text-[#B91C1C]">
             <AlertCircle className="h-12 w-12 mx-auto mb-4 text-[#FCA5A5]" />
             <p className="font-semibold">Terjadi Kesalahan</p>
             <p className="text-sm mt-1">{error}</p>
          </div>
        ) : filteredPekerjaan.length === 0 ? (
          <div className="p-12 text-center text-[#6B7280]">
             <AlertCircle className="h-12 w-12 mx-auto mb-4 text-[#D1D5DB]" />
             <p>Tidak ada data pekerjaan ditemukan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto h-[600px] overflow-y-auto">
            <table className="w-full text-sm border-collapse relative">
              <thead className="bg-[#F9FAFB] sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] border-b border-[#E5E7EB]">ID Pekerjaan</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] border-b border-[#E5E7EB]">Nama Pekerjaan</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#F3F4F6]">
                {filteredPekerjaan.map((d, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#1F2937]">{d.id_pekerjaan}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151]">{d.nama_pekerjaan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-6 py-4 border-t border-[#E5E7EB] flex justify-between items-center bg-[#F9FAFB]">
          <span className="text-[13px] text-[#6B7280]">Total {filteredPekerjaan.length} Data Pekerjaan</span>
        </div>
      </div>
    </div>
  );
};
