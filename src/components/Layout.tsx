import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LogOut, LayoutDashboard, Settings, Users, Database, ChevronDown, ChevronRight, Building, Calendar, Download, FileUp, Terminal, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

export const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [dataMasterOpen, setDataMasterOpen] = useState(true);
  const [importDataOpen, setImportDataOpen] = useState(true);
  const [superAdminOpen, setSuperAdminOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard Utama', href: '/', icon: LayoutDashboard },
  ];

  return (
    <div className="h-screen bg-[#F3F4F6] text-[#111827] flex font-sans overflow-hidden">
      {/* Sidebar */}
      <div className="w-[240px] bg-[#1E293B] text-white flex flex-col shrink-0">
        <div className="p-6 text-xl font-bold tracking-tight border-b border-[#334155] flex items-center gap-[10px]">
          <div className="w-8 h-8 bg-blue-500 rounded-md grid place-items-center">N</div>
          <span className="text-lg">Feeder Integrator</span>
        </div>
        <nav className="flex-1 py-5 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-[12px] px-6 py-3 text-sm transition-all border-l-4 ${
                  isActive 
                    ? 'bg-[#334155] text-white border-blue-500' 
                    : 'text-[#94A3B8] hover:bg-[#334155] hover:text-white border-transparent'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            )
          })}

          <div className="mt-2">
            <button
              onClick={() => setDataMasterOpen(!dataMasterOpen)}
              className="w-full flex items-center justify-between px-6 py-3 text-sm text-[#94A3B8] hover:bg-[#334155] hover:text-white transition-all border-l-4 border-transparent cursor-pointer"
            >
              <div className="flex items-center gap-[12px]">
                <Database className="h-5 w-5" />
                <span>Data Master</span>
              </div>
              {dataMasterOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
            {dataMasterOpen && (
              <div className="bg-[#0F172A] py-2">
                <Link
                  to="/programs"
                  className={`flex items-center gap-[12px] pl-14 pr-6 py-2.5 text-sm transition-all border-l-4 ${
                    location.pathname === '/programs'
                      ? 'bg-[#1E293B] text-white border-blue-500' 
                      : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-white border-transparent'
                  }`}
                >
                  <Building className="h-4 w-4" />
                  <span>Data Program Studi</span>
                </Link>
                <Link
                  to="/periods"
                  className={`flex items-center gap-[12px] pl-14 pr-6 py-2.5 text-sm transition-all border-l-4 ${
                    location.pathname === '/periods'
                      ? 'bg-[#1E293B] text-white border-blue-500' 
                      : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-white border-transparent'
                  }`}
                >
                  <Calendar className="h-4 w-4" />
                  <span>Data Periode</span>
                </Link>
                <Link
                  to="/dosen"
                  className={`flex items-center gap-[12px] pl-14 pr-6 py-2.5 text-sm transition-all border-l-4 ${
                    location.pathname === '/dosen'
                      ? 'bg-[#1E293B] text-white border-blue-500' 
                      : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-white border-transparent'
                  }`}
                >
                  <Users className="h-4 w-4" />
                  <span>Data Dosen</span>
                </Link>
                <Link
                  to="/agama"
                  className={`flex items-center gap-[12px] pl-14 pr-6 py-2.5 text-sm transition-all border-l-4 ${
                    location.pathname === '/agama'
                      ? 'bg-[#1E293B] text-white border-blue-500' 
                      : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-white border-transparent'
                  }`}
                >
                  <Database className="h-4 w-4" />
                  <span>Data Agama</span>
                </Link>
                <Link
                  to="/wilayah"
                  className={`flex items-center gap-[12px] pl-14 pr-6 py-2.5 text-sm transition-all border-l-4 ${
                    location.pathname === '/wilayah'
                      ? 'bg-[#1E293B] text-white border-blue-500' 
                      : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-white border-transparent'
                  }`}
                >
                  <Database className="h-4 w-4" />
                  <span>Data Wilayah</span>
                </Link>
                <Link
                  to="/jenis-pendaftaran"
                  className={`flex items-center gap-[12px] pl-14 pr-6 py-2.5 text-sm transition-all border-l-4 ${
                    location.pathname === '/jenis-pendaftaran'
                      ? 'bg-[#1E293B] text-white border-blue-500' 
                      : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-white border-transparent'
                  }`}
                >
                  <Database className="h-4 w-4" />
                  <span>Jenis Pendaftaran</span>
                </Link>
                <Link
                  to="/jalur-masuk"
                  className={`flex items-center gap-[12px] pl-14 pr-6 py-2.5 text-sm transition-all border-l-4 ${
                    location.pathname === '/jalur-masuk'
                      ? 'bg-[#1E293B] text-white border-blue-500' 
                      : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-white border-transparent'
                  }`}
                >
                  <Database className="h-4 w-4" />
                  <span>Jalur Masuk</span>
                </Link>
                <Link
                  to="/pekerjaan"
                  className={`flex items-center gap-[12px] pl-14 pr-6 py-2.5 text-sm transition-all border-l-4 ${
                    location.pathname === '/pekerjaan'
                      ? 'bg-[#1E293B] text-white border-blue-500' 
                      : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-white border-transparent'
                  }`}
                >
                  <Database className="h-4 w-4" />
                  <span>Data Pekerjaan</span>
                </Link>
                <Link
                  to="/penghasilan"
                  className={`flex items-center gap-[12px] pl-14 pr-6 py-2.5 text-sm transition-all border-l-4 ${
                    location.pathname === '/penghasilan'
                      ? 'bg-[#1E293B] text-white border-blue-500' 
                      : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-white border-transparent'
                  }`}
                >
                  <Database className="h-4 w-4" />
                  <span>Data Penghasilan</span>
                </Link>
              </div>
            )}
          </div>

          <div className="mt-2">
            <button
              onClick={() => setImportDataOpen(!importDataOpen)}
              className="w-full flex items-center justify-between px-6 py-3 text-sm text-[#94A3B8] hover:bg-[#334155] hover:text-white transition-all border-l-4 border-transparent cursor-pointer"
            >
              <div className="flex items-center gap-[12px]">
                <FileUp className="h-5 w-5" />
                <span>Import Data</span>
              </div>
              {importDataOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
            {importDataOpen && (
              <div className="bg-[#0F172A] py-2">
                <Link
                  to="/students"
                  className={`flex items-center gap-[12px] pl-14 pr-6 py-2.5 text-sm transition-all border-l-4 ${
                    location.pathname === '/students' 
                      ? 'bg-[#1E293B] text-white border-blue-500' 
                      : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-white border-transparent'
                  }`}
                >
                  <Users className="h-4 w-4" />
                  <span>Data Mahasiswa Baru</span>
                </Link>
                <Link
                  to="/import-kurikulum"
                  className={`flex items-center gap-[12px] pl-14 pr-6 py-2.5 text-sm transition-all border-l-4 ${
                    location.pathname === '/import-kurikulum' 
                      ? 'bg-[#1E293B] text-white border-blue-500' 
                      : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-white border-transparent'
                  }`}
                >
                  <FileUp className="h-4 w-4" />
                  <span>Import Kurikulum</span>
                </Link>
              </div>
            )}
          </div>
          
          <Link
            to="/config"
            className={`flex items-center gap-[12px] px-6 py-3 text-sm transition-all border-l-4 ${
              location.pathname === '/config' 
                ? 'bg-[#334155] text-white border-blue-500' 
                : 'text-[#94A3B8] hover:bg-[#334155] hover:text-white border-transparent'
            }`}
          >
            <Settings className="h-5 w-5" />
            <span>Konfigurasi Server</span>
          </Link>

          {user?.role === 'Superadmin' && (
            <div className="mt-2">
              <button
                onClick={() => setSuperAdminOpen(!superAdminOpen)}
                className="w-full flex items-center justify-between px-6 py-3 text-sm text-[#94A3B8] hover:bg-[#334155] hover:text-white transition-all border-l-4 border-transparent cursor-pointer"
              >
                <div className="flex items-center gap-[12px]">
                  <Shield className="h-5 w-5" />
                  <span>Super Admin</span>
                </div>
                {superAdminOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              {superAdminOpen && (
                <div className="bg-[#0F172A] py-2">
                  <Link
                    to="/users"
                    className={`flex items-center gap-[12px] pl-14 pr-6 py-2.5 text-sm transition-all border-l-4 ${
                      location.pathname === '/users' 
                        ? 'bg-[#1E293B] text-white border-blue-500' 
                        : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-white border-transparent'
                    }`}
                  >
                    <Users className="h-4 w-4" />
                    <span>Manajemen Pengguna</span>
                  </Link>
                  <Link
                    to="/database-ops"
                    className={`flex items-center gap-[12px] pl-14 pr-6 py-2.5 text-sm transition-all border-l-4 ${
                      location.pathname === '/database-ops' 
                        ? 'bg-[#1E293B] text-white border-blue-500' 
                        : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-white border-transparent'
                    }`}
                  >
                    <Terminal className="h-4 w-4" />
                    <span>Operasional Database</span>
                  </Link>
                  <Link
                    to="/update"
                    className={`flex items-center gap-[12px] pl-14 pr-6 py-2.5 text-sm transition-all border-l-4 ${
                      location.pathname === '/update' 
                        ? 'bg-[#1E293B] text-white border-blue-500' 
                        : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-white border-transparent'
                    }`}
                  >
                    <Download className="h-4 w-4" />
                    <span>Update Aplikasi</span>
                  </Link>
                </div>
              )}
            </div>
          )}
        </nav>
        
        <div className="p-6 border-t border-[#334155] text-[11px] text-[#64748B]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {user?.displayName?.charAt(0) || 'U'}
              </div>
              <span className="text-sm font-medium text-white truncate">{user?.displayName}</span>
            </div>
            <button
              onClick={logout}
              className="p-1.5 text-[#94A3B8] hover:text-red-400 hover:bg-[#334155] rounded-lg transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
          <div>
            Database: PostgreSQL<br />
            Status: Connected
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-8 shrink-0">
          <div className="flex gap-6 items-center">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F0FDF4] text-[#166534] text-xs font-semibold rounded-full tracking-wide">
              <div className="w-2 h-2 bg-[#22C55E] rounded-full"></div>
              Server Live
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
