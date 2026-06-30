import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../lib/api.ts';
import { Database, Play, AlertCircle, Table } from 'lucide-react';

export const DatabaseOps: React.FC = () => {
  const [tables, setTables] = useState<any[]>([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTables = async () => {
    try {
      const data = await fetchWithAuth('/api/db/tables', { method: 'GET' });
      if (data.tables) {
        setTables(data.tables);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleRunQuery = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setResults(null);
    try {
      const data = await fetchWithAuth('/api/db/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      if (data.error) {
        setError(data.error);
      } else {
        setResults(data.result);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal mengeksekusi query');
    } finally {
      setLoading(false);
    }
  };

  const handleViewTable = async (tableName: string) => {
    setSelectedTable(tableName);
    setQuery(`SELECT * FROM "${tableName}" LIMIT 100;`);
    setLoading(true);
    setError('');
    setResults(null);
    try {
      const data = await fetchWithAuth('/api/db/table-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableName, limit: 100 })
      });
      if (data.error) {
        setError(data.error);
      } else {
        setResults(data.data);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data tabel');
    } finally {
      setLoading(false);
    }
  };

  const renderTable = (data: any[]) => {
    if (!data || data.length === 0) {
      return (
        <div className="p-8 text-center text-[#6B7280]">
          Tidak ada data (hasil kosong).
        </div>
      );
    }

    const columns = Object.keys(data[0]);

    return (
      <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
        <table className="w-full text-sm border-collapse relative">
          <thead className="bg-[#F9FAFB] sticky top-0 z-10 shadow-sm">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] border-b border-[#E5E7EB] whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[#F3F4F6]">
            {data.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-gray-50 transition-colors">
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className="px-6 py-3 text-sm text-[#374151] whitespace-nowrap border-b border-[#E5E7EB]">
                    {row[col] !== null ? String(row[col]) : <span className="text-gray-400 italic">null</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="p-8 flex gap-6 h-[calc(100vh-64px)] overflow-hidden">
      {/* Sidebar for Tables */}
      <div className="w-64 bg-white rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.1)] flex flex-col h-full">
        <div className="px-4 py-3 border-b border-[#E5E7EB] bg-[#F9FAFB] flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-600" />
          <h3 className="font-semibold text-sm text-[#111827]">Daftar Tabel</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {tables.length === 0 ? (
            <p className="text-xs text-gray-500 text-center mt-4">Memuat tabel...</p>
          ) : (
            <div className="flex flex-col gap-1">
              {tables.map((t, idx) => (
                <button
                  key={idx}
                  onClick={() => handleViewTable(t.table_name)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors text-left ${
                    selectedTable === t.table_name 
                      ? 'bg-blue-50 text-blue-700 font-medium' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Table className="w-3.5 h-3.5" />
                  <span className="truncate">{t.table_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-6 h-full overflow-y-auto">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Operasional Database</h1>
          <p className="text-[#6B7280] mt-1 text-sm">Lihat tabel dan jalankan query SQL secara langsung</p>
        </div>

        {/* Query Input */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.1)] flex flex-col">
          <div className="p-4 border-b border-[#E5E7EB]">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Masukkan query SQL di sini (misal: SELECT * FROM users)..."
              className="w-full h-32 p-3 text-sm font-mono border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-gray-50"
            />
          </div>
          <div className="px-4 py-3 bg-[#F9FAFB] flex justify-between items-center rounded-b-xl">
            <span className="text-xs text-gray-500">
              Gunakan query SQL yang valid untuk mengeksekusi operasi (SELECT, INSERT, UPDATE, DELETE)
            </span>
            <button
              onClick={handleRunQuery}
              disabled={loading || !query.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              ) : (
                <Play className="w-4 h-4" />
              )}
              Jalankan Query
            </button>
          </div>
        </div>

        {/* Results Area */}
        <div className="flex-1 bg-white rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden min-h-[300px]">
          <div className="px-4 py-3 border-b border-[#E5E7EB] bg-[#F9FAFB]">
            <h3 className="font-semibold text-sm text-[#111827]">Hasil Query</h3>
          </div>
          
          <div className="flex-1 overflow-hidden relative">
            {error ? (
              <div className="p-6 text-red-600 bg-red-50 m-4 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <h4 className="font-semibold">Error Eksekusi Query</h4>
                </div>
                <p className="text-sm font-mono whitespace-pre-wrap">{error}</p>
              </div>
            ) : results ? (
              renderTable(results)
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                Jalankan query untuk melihat hasil
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
