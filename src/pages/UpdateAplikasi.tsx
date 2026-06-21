import React, { useState, useEffect, useRef } from 'react';
import { Download, AlertCircle, CheckCircle, RefreshCw, Terminal } from 'lucide-react';

export const UpdateAplikasi: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'updating' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const addLog = (text: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${text}`]);
  };

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const handleUpdate = async () => {
    setLoading(true);
    setStatus('updating');
    setProgress(0);
    setLogs([]);
    setMessage('Sedang mengambil data terbaru dari server...');

    try {
      const token = localStorage.getItem('auth_token');
      
      addLog('Menjalankan proses pembaruan (Git Pull, NPM Install, Build)...');
      addLog('Mohon tunggu, proses ini memakan waktu beberapa saat...');
      setProgress(30);
      
      const response = await fetch('/api/update-app', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setProgress(80);
      
      const data = await response.json();
      
      if (data.logs) {
        const logLines = data.logs.split('\n');
        logLines.forEach((line: string) => {
          if (line.trim()) addLog(line);
        });
      }
      
      if (response.ok) {
        addLog('Pembaruan berhasil diterapkan!');
        addLog('Server sedang me-restart secara otomatis...');
        setProgress(100);
        setStatus('success');
        setMessage(data.message || 'Aplikasi berhasil diperbarui. Server sedang me-restart.');
      } else {
        addLog(`Kesalahan: ${data.error || 'Gagal menerapkan pembaruan'}`);
        setStatus('error');
        setMessage(data.error || 'Gagal melakukan pembaruan.');
      }
    } catch (err: any) {
      addLog(`Koneksi bermasalah: ${err.message}`);
      setStatus('error');
      setMessage('Koneksi bermasalah saat melakukan pembaruan: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Update Aplikasi</h1>
        </div>
      </div>

      <div className="max-w-2xl bg-white rounded-xl border border-[#E5E7EB] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
        <div className="px-6 py-5 border-b border-[#E5E7EB] flex items-center space-x-3 text-[#111827] bg-[#F9FAFB]">
          <Download className="h-5 w-5 text-[#2563EB]" />
          <h3 className="m-0 text-base font-semibold">Pembaruan Sistem</h3>
        </div>
        
        <div className="p-8">
          <div className="mb-6">
            <p className="text-gray-700 text-sm leading-relaxed mb-4">
              Fitur ini akan menghubungkan aplikasi Anda dengan repository GitHub resmi untuk mengunduh dan menerapkan pembaruan sistem, perbaikan bug, dan fitur-fitur terbaru secara langsung.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Catatan Penting:</p>
                <ul className="list-disc ml-4 space-y-1">
                  <li>Pastikan tidak ada proses sinkronisasi data yang sedang berjalan.</li>
                  <li>Proses pembaruan mungkin membutuhkan waktu beberapa detik hingga beberapa menit.</li>
                  <li>Aplikasi mungkin akan melakukan restart otomatis setelah pembaruan selesai.</li>
                </ul>
              </div>
            </div>
          </div>

          {status !== 'idle' && (
            <div className="mb-6 space-y-4">
              <div className="bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 font-medium">
                <span>Status Pembaruan</span>
                <span>{progress}% Selesai</span>
              </div>
              
              <div className="bg-[#1E293B] rounded-lg overflow-hidden border border-gray-800 shadow-inner mt-4">
                <div className="px-4 py-2 bg-gray-900 border-b border-gray-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-gray-400">
                    <Terminal className="h-4 w-4" />
                    <span className="text-xs font-mono">system_update.log</span>
                  </div>
                  <div className="flex space-x-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                  </div>
                </div>
                <div className="p-4 h-48 overflow-y-auto font-mono text-[13px] leading-relaxed text-green-400 bg-[#0F172A] space-y-1">
                  {logs.length === 0 ? (
                    <span className="text-gray-500 animate-pulse">Menunggu inisialisasi...</span>
                  ) : (
                    logs.map((log, index) => (
                      <div key={index} className="opacity-90">{log}</div>
                    ))
                  )}
                  <div ref={logsEndRef} />
                </div>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <p className="text-sm text-green-800">{message}</p>
            </div>
          )}

          {status === 'error' && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{message}</p>
            </div>
          )}

          <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
            <button
              onClick={handleUpdate}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Sedang Memperbarui...' : 'Perbarui Aplikasi Sekarang'}
            </button>
            {loading && <span className="text-sm text-gray-500 animate-pulse">Mengunduh data dari GitHub...</span>}
          </div>
        </div>
      </div>
    </div>
  );
};
