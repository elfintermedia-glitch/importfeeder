import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { BookOpen, MapPin } from 'lucide-react'; // Placeholder icons for logos

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
    <div className="min-h-screen relative flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans overflow-hidden">
      {/* Background Styling mimicking a generated tech/academic background */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#2563eb] opacity-90">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[120px] opacity-30 mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-400 rounded-full blur-[120px] opacity-20 mix-blend-screen"></div>
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-indigo-500 rounded-full blur-[100px] opacity-20 mix-blend-screen"></div>
      </div>
      
      {/* Top Banner indicating Logos */}
      <div className="absolute top-0 left-0 w-full p-6 z-10 flex justify-between tracking-wide px-8 items-center text-white/80">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
               <BookOpen size={20} className="text-white" />
             </div>
             <span className="text-sm font-medium tracking-widest uppercase">Tut Wuri Handayani</span>
          </div>
          <div className="flex items-center gap-3">
             <span className="text-sm font-medium tracking-widest uppercase text-right">Elfatta<br/>Intermedia</span>
             <div className="w-10 h-10 bg-blue-600/30 backdrop-blur-md rounded flex items-center justify-center border border-blue-400/30">
               <MapPin size={20} className="text-blue-300" />
             </div>
          </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/95 backdrop-blur-xl py-12 px-4 shadow-2xl border border-white/20 rounded-2xl sm:px-10 text-center">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl mx-auto mb-6 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-blue-500/30">
            N
          </div>
          <h2 className="mb-2 text-3xl font-extrabold tracking-tight text-gray-900">Feeder Integrator</h2>
          <p className="mb-8 text-sm text-gray-500">Silahkan masukkan username dan password</p>
          
          <form onSubmit={handleSubmit} className="text-left space-y-5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-gray-900"
              />
            </div>
            
            <button
              type="submit"
              className="w-full mt-2 flex justify-center items-center py-3 px-4 rounded-xl shadow-md bg-gradient-to-r from-blue-600 to-indigo-600 text-sm font-semibold text-white hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all cursor-pointer transform active:scale-[0.98]"
            >
              Log in
            </button>
          </form>
        </div>
        <p className="mt-8 text-center text-sm font-medium text-white/60 tracking-wider">
          &copy; {new Date().getFullYear()} Dikembangkan oleh Elfatta Intermedia
        </p>
      </div>
    </div>
  );
};
