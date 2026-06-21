import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../lib/api.ts';
import { Server, Save, CheckCircle } from 'lucide-react';

export const Configuration: React.FC = () => {
  const [url, setUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const data = await fetchWithAuth('/api/config');
        if (data.config) {
          setUrl(data.config.url);
          setUsername(data.config.username);
          setPassword(data.config.password);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      await fetchWithAuth('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, username, password }),
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      console.error(e);
      alert('Gagal menyimpan konfigurasi');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTestResult('Menguji koneksi...');
    try {
      const data = await fetchWithAuth('/api/neofeeder-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          username,
          password,
          action: 'GetProfilPT',
        })
      });
      if (data.error_code === 0) {
        setTestResult('Koneksi Berhasil! PT: ' + data.data[0].nama_perguruan_tinggi);
      } else {
        setTestResult('Koneksi Gagal: ' + data.error_desc);
      }
    } catch (e: any) {
      setTestResult('Error: ' + e.message);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#111827]">Konfigurasi Server</h1>
        <p className="text-[#6B7280] mt-1 text-sm">Konfigurasi koneksi ke server PDDIKTI Neofeeder</p>
      </div>

      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.1)] flex flex-col">
        <div className="px-6 py-5 border-b border-[#E5E7EB] bg-[#F9FAFB] flex items-center space-x-3 text-[#111827]">
          <Server className="h-5 w-5 text-[#2563EB]" />
          <h2 className="text-base font-semibold m-0">Kredensial Server</h2>
        </div>
        
        <form onSubmit={handleSave} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-[#374151] mb-2">URL Web Service</label>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="http://localhost:8100/ws/live2.php"
              className="w-full px-4 py-3 border border-[#D1D5DB] rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow text-sm text-[#111827]"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-[#374151] mb-2">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-[#D1D5DB] rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow text-sm text-[#111827]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#374151] mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-[#D1D5DB] rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow text-sm text-[#111827]"
              />
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-[#F3F4F6] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-[#2563EB] text-white rounded-md text-sm font-semibold hover:bg-blue-700 flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Menyimpan...' : 'Simpan Konfigurasi'}
              </button>
              
              <button
                type="button"
                onClick={handleTestConnection}
                className="px-5 py-2.5 bg-transparent border border-[#D1D5DB] text-[#374151] rounded-md text-sm font-semibold hover:bg-gray-50 flex items-center gap-2 cursor-pointer transition-colors"
                title="Lakukan tes koneksi menggunakan GetProfilPT"
              >
                Test Koneksi
              </button>
            </div>
            
            {success && (
              <span className="flex items-center text-[#059669] font-medium text-sm">
                <CheckCircle className="h-4 w-4 mr-1.5" />
                Tersimpan
              </span>
            )}
          </div>
          
          {testResult && (
            <div className={`p-4 rounded-md text-sm font-medium mt-4 ${testResult.includes('Berhasil') ? 'bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]' : 'bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]'}`}>
              {testResult}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
