import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';

export const Login: React.FC = () => {
  const { signIn } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = await signIn(username, password);
    if (!success) {
      setError('Username atau password salah');
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-12 px-4 shadow-[0_1px_3px_rgba(0,0,0,0.1)] border border-[#E5E7EB] rounded-xl sm:px-10 text-center">
          <div className="w-12 h-12 bg-blue-500 rounded-lg mx-auto mb-6 flex items-center justify-center text-white text-2xl font-bold">N</div>
          <h2 className="mb-2 text-3xl font-bold tracking-tight text-[#1F2937]">Neofeeder Importer</h2>
          <p className="mb-8 text-sm text-[#6B7280]">Masuk untuk mengelola data Mahasiswa dan sinkronisasi ke PDDIKTI Neofeeder</p>
          
          <form onSubmit={handleSubmit} className="text-left space-y-4">
            {error && (
              <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C] rounded-md text-sm">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-[#374151] mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 border border-[#D1D5DB] rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow text-sm text-[#111827]"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-[#374151] mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-[#D1D5DB] rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow text-sm text-[#111827]"
              />
            </div>
            
            <button
              type="submit"
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm bg-[#2563EB] text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors cursor-pointer"
            >
              Log in
            </button>
          </form>
        </div>
        <p className="mt-8 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Dikembangkan oleh Elfatta Intermedia
        </p>
      </div>
    </div>
  );
};
