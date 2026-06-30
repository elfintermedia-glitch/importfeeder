/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Login } from './pages/Login.tsx';
import { Layout } from './components/Layout.tsx';
import { Dashboard } from './pages/Dashboard.tsx';
import { Configuration } from './pages/Configuration.tsx';
import { Students } from './pages/Students.tsx';
import { ProgramStudi } from './pages/ProgramStudi.tsx';
import { DataPeriode } from './pages/DataPeriode.tsx';
import { DataDosen } from './pages/DataDosen.tsx';
import { DataAgama } from './pages/DataAgama.tsx';
import { DataWilayah } from './pages/DataWilayah.tsx';
import { DataJenisPendaftaran } from './pages/DataJenisPendaftaran.tsx';
import { DataJalurMasuk } from './pages/DataJalurMasuk.tsx';
import { DataPekerjaan } from './pages/DataPekerjaan.tsx';
import { DataPenghasilan } from './pages/DataPenghasilan.tsx';
import { DatabaseOps } from './pages/DatabaseOps.tsx';
import { UpdateAplikasi } from './pages/UpdateAplikasi.tsx';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" />;

  return <>{children}</>;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="students" element={<Students />} />
        <Route path="programs" element={<ProgramStudi />} />
        <Route path="periods" element={<DataPeriode />} />
        <Route path="dosen" element={<DataDosen />} />
        <Route path="agama" element={<DataAgama />} />
        <Route path="wilayah" element={<DataWilayah />} />
        <Route path="jenis-pendaftaran" element={<DataJenisPendaftaran />} />
        <Route path="jalur-masuk" element={<DataJalurMasuk />} />
        <Route path="pekerjaan" element={<DataPekerjaan />} />
        <Route path="penghasilan" element={<DataPenghasilan />} />
        <Route path="database-ops" element={<DatabaseOps />} />
        <Route path="config" element={<Configuration />} />
        <Route path="update" element={<UpdateAplikasi />} />
      </Route>
    </Routes>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
