import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../lib/api.ts';
import { Building, AlertCircle, RefreshCw, Save, Check } from 'lucide-react';

export const ProgramStudi: React.FC = () => {
  const [prodi, setProdi] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchProdiLocal = async () => {
    setLoading(true);
    setError('');
    setSaveSuccess(false);
    try {
      const data = await fetchWithAuth('/api/prodi', {
        method: 'GET'
      });
      if (data.prodi) {
        setProdi(data.prodi);
      }
    } catch (err: any) {
      setError('Gagal mengambil data prodi lokal: ' + err.message);
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
        body: JSON.stringify({ action: 'GetProdi' })
      });
      
      if (data.error_code === 0 && data.data) {
        setProdi(data.data);
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
    if (prodi.length === 0) return;
    setSaveLoading(true);
    setSaveSuccess(false);
    setError('');
    try {
      const data = await fetchWithAuth('/api/prodi/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: prodi })
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
    fetchProdiLocal();
  }, []);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Data Program Studi</h1>
          <p className="text-[#6B7280] mt-1 text-sm">Daftar program studi dari PDDIKTI Neofeeder</p>
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
            disabled={loading || saveLoading || prodi.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {saveSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saveLoading ? 'Menyimpan...' : saveSuccess ? 'Tersimpan' : 'Simpan'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
        <div className="px-6 py-5 border-b border-[#E5E7EB] flex items-center space-x-3 text-[#111827] bg-[#F9FAFB]">
          <Building className="h-5 w-5 text-[#2563EB]" />
          <h3 className="m-0 text-base font-semibold">Daftar Program Studi</h3>
        </div>
        
        {loading ? (
          <div className="p-8 flex justify-center items-center text-[#6B7280]">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mr-4"></div>
            Memuat data program studi...
          </div>
        ) : error ? (
          <div className="p-12 text-center text-[#B91C1C]">
             <AlertCircle className="h-12 w-12 mx-auto mb-4 text-[#FCA5A5]" />
             <p className="font-semibold">Terjadi Kesalahan</p>
             <p className="text-sm mt-1">{error}</p>
          </div>
        ) : prodi.length === 0 ? (
          <div className="p-12 text-center text-[#6B7280]">
             <AlertCircle className="h-12 w-12 mx-auto mb-4 text-[#D1D5DB]" />
             <p>Tidak ada data program studi ditemukan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-[#F9FAFB]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] border-b border-[#E5E7EB]">ID Prodi</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] border-b border-[#E5E7EB]">Kode Prodi</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] border-b border-[#E5E7EB]">Nama Program Studi</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] border-b border-[#E5E7EB]">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] border-b border-[#E5E7EB]">Jenjang</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#F3F4F6]">
                {prodi.map((p, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#1F2937]">{p.id_prodi}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151]">{p.kode_program_studi}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151]">{p.nama_program_studi}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151]">{p.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151]">{p.nama_jenjang_pendidikan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-6 py-4 border-t border-[#E5E7EB] flex justify-between items-center bg-[#F9FAFB]">
          <span className="text-[13px] text-[#6B7280]">Total {prodi.length} Program Studi</span>
        </div>
      </div>
    </div>
  );
};
