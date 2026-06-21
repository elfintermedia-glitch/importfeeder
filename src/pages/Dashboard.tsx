import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { fetchWithAuth } from '../lib/api.ts';
import { Users, GraduationCap, Link2, Building2, MapPin, Mail, Phone, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, graduated: 0, active: 0 });
  const [hasConfig, setHasConfig] = useState(true);
  const [ptProfile, setPtProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsData, configData] = await Promise.all([
          fetchWithAuth('/api/students'),
          fetchWithAuth('/api/config')
        ]);
        
        if (!configData.config) {
          setHasConfig(false);
          setProfileLoading(false);
        } else {
          try {
            const ptData = await fetchWithAuth('/api/neofeeder', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'GetProfilPT' })
            });

            if (ptData.error_code === 0 && ptData.data && ptData.data.length > 0) {
              setPtProfile(ptData.data[0]);
            } else {
              setProfileError(ptData.error_desc || 'Gagal mengambil profil PT');
            }
          } catch (err: any) {
             setProfileError('Koneksi ke server Neofeeder bermasalah: ' + err.message);
          } finally {
             setProfileLoading(false);
          }
        }

        const students = studentsData.students || [];
        setStats({
          total: students.length,
          graduated: students.filter((s: any) => s.status === 'Lulus').length,
          active: students.filter((s: any) => s.status !== 'Lulus').length,
        });

      } catch (e) {
        console.error(e);
        setProfileLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Dashboard Utama</h1>
          <p className="text-[#6B7280] mt-1 text-sm">Selamat datang, {user?.displayName}</p>
        </div>
      </div>

      {!hasConfig && (
        <div className="mb-8 p-4 bg-[#FEF3C7] border border-[#FDE68A] rounded-xl flex items-start">
          <Link2 className="h-5 w-5 text-[#D97706] mt-0.5 mr-3 shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-[#92400E]">Koneksi Neofeeder Belum Dikonfigurasi</h3>
            <p className="text-sm text-[#B45309] mt-1">Anda harus mengatur URL, username, dan password Neofeeder agar bisa melakukan sinkronisasi.</p>
            <Link to="/config" className="inline-block mt-3 text-sm font-semibold text-[#92400E] underline hover:text-[#78350F]">
              Atur Konfigurasi Sekarang
            </Link>
          </div>
        </div>
      )}

      {hasConfig && (
        <div className="mb-8 bg-white p-6 rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
          <div className="flex items-center space-x-3 mb-4">
            <Building2 className="w-6 h-6 text-[#2563EB]" />
            <h2 className="text-lg font-bold text-[#1F2937]">Profil Perguruan Tinggi</h2>
          </div>
          
          {profileLoading ? (
            <div className="flex space-x-3 items-center text-sm text-[#6B7280]">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
              <span>Memuat profil PT...</span>
            </div>
          ) : profileError ? (
            <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-md">
               <p className="text-sm text-[#B91C1C]">Error: {profileError}</p>
            </div>
          ) : ptProfile ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
              <div>
                <span className="block text-[#6B7280] text-xs font-semibold mb-1">Nama Perguruan Tinggi</span>
                <span className="text-[#111827] font-medium">{ptProfile.nama_perguruan_tinggi || '-'}</span>
              </div>
              <div>
                 <span className="block text-[#6B7280] text-xs font-semibold mb-1">Kode PT</span>
                 <span className="text-[#111827] font-medium">{ptProfile.kode_perguruan_tinggi || '-'}</span>
              </div>
               <div>
                <span className="block text-[#6B7280] text-xs font-semibold mb-1">Jalan</span>
                <div className="flex items-start text-[#111827]">
                  <MapPin className="w-4 h-4 mr-2 text-[#9CA3AF] mt-0.5" />
                  <span>{ptProfile.jalan || '-'}, {ptProfile.dusun || ''} RT {ptProfile.rt || '-'} / RW {ptProfile.rw || '-'}, {ptProfile.kelurahan || '-'}, Kode Pos: {ptProfile.kode_pos || '-'}</span>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <span className="block text-[#6B7280] text-xs font-semibold mb-1">Kontak</span>
                  <div className="flex items-center text-[#111827] mb-1">
                    <Phone className="w-4 h-4 mr-2 text-[#9CA3AF]" />
                    <span>{ptProfile.telepon || '-'}</span>
                  </div>
                  <div className="flex items-center text-[#111827]">
                    <Mail className="w-4 h-4 mr-2 text-[#9CA3AF]" />
                    <span>{ptProfile.email || '-'}</span>
                  </div>
                   <div className="flex items-center text-[#111827] mt-1">
                    <Globe className="w-4 h-4 mr-2 text-[#9CA3AF]" />
                    <span>{ptProfile.website || '-'}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
             <div className="text-sm text-[#6B7280]">Tidak ada data.</div>
          )}
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
          <div className="text-xs uppercase text-[#6B7280] font-semibold tracking-wide">Total Mahasiswa</div>
          <div className="text-[28px] font-bold mt-2 text-[#1F2937]">{stats.total}</div>
          <div className="text-xs text-[#059669] mt-1">Dalam sistem</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
          <div className="text-xs uppercase text-[#6B7280] font-semibold tracking-wide">Mahasiswa Aktif</div>
          <div className="text-[28px] font-bold mt-2 text-[#1F2937]">{stats.active}</div>
          <div className="text-xs text-[#6B7280] mt-1">Baru / Sedang Kuliah</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
          <div className="text-xs uppercase text-[#6B7280] font-semibold tracking-wide">Sudah Lulus</div>
          <div className="text-[28px] font-bold mt-2 text-[#1F2937]">{stats.graduated}</div>
          <div className="text-xs text-[#6B7280] mt-1">Penyelesaian</div>
        </div>
      </div>
    </div>
  );
};
