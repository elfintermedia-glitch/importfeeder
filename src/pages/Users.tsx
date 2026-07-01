import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Plus, Edit, Trash2, X } from 'lucide-react';

interface User {
  id: number;
  uid: string;
  name: string;
  email: string;
  role: string;
}

export const Users: React.FC = () => {
  const { getToken } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const [uid, setUid] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Admin');
  const [error, setError] = useState('');

  const [userToDelete, setUserToDelete] = useState<number | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const openAdd = () => {
    setEditingUser(null);
    setUid('');
    setName('');
    setEmail('');
    setPassword('');
    setRole('Admin');
    setError('');
    setShowModal(true);
  };

  const openEdit = (u: User) => {
    setEditingUser(u);
    setUid(u.uid);
    setName(u.name || '');
    setEmail(u.email);
    setPassword('');
    setRole(u.role || 'Admin');
    setError('');
    setShowModal(true);
  };

  const saveUser = async () => {
    if (!uid || !name || !email) {
      setError('UID, Name, and Email are required.');
      return;
    }
    if (!editingUser && !password) {
      setError('Password is required for new users.');
      return;
    }

    try {
      const token = await getToken();
      const method = editingUser ? 'PUT' : 'POST';
      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
      
      const payload: any = { uid, name, email, role };
      if (password) payload.password = password;

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setShowModal(false);
        fetchUsers();
      } else {
        const d = await res.json();
        setError(d.error || 'Failed to save user');
      }
    } catch (e: any) {
      setError(e.message || 'Error saving user');
    }
  };

  const confirmDeleteUser = (id: number) => {
    setUserToDelete(id);
  };

  const executeDeleteUser = async () => {
    if (userToDelete === null) return;
    try {
      const token = await getToken();
      const res = await fetch(`/api/users/${userToDelete}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchUsers();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to delete user');
      }
    } catch (e: any) {
      alert(e.message || 'Error deleting user');
      console.error(e);
    } finally {
      setUserToDelete(null);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Memuat...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Pengguna</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola akses dan akun pengguna aplikasi.</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-sm text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Tambah Pengguna
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-[#F9FAFB]">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] border-b border-[#E5E7EB]">UID/Username</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] border-b border-[#E5E7EB]">Nama</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] border-b border-[#E5E7EB]">Email</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] border-b border-[#E5E7EB]">Role</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] border-b border-[#E5E7EB]">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[#F3F4F6]">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#1F2937]">{u.uid}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151]">{u.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151]">{u.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151]">
                  <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${
                    u.role === 'Superadmin' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'
                  }`}>
                    {u.role || 'Admin'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151]">
                  <div className="flex space-x-2">
                    <button onClick={() => openEdit(u)} className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded" title="Edit">
                      <Edit className="h-4 w-4" />
                    </button>
                    {u.uid !== 'admin' && (
                      <button onClick={() => confirmDeleteUser(u.id)} className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded" title="Hapus">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  Tidak ada pengguna ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">{editingUser ? 'Edit Pengguna' : 'Tambah Pengguna'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-500">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">UID / Username</label>
                <input type="text" value={uid} onChange={e => setUid(e.target.value)} disabled={editingUser?.uid === 'admin'} className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password {editingUser && '(Kosongkan jika tidak ingin diubah)'}</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select value={role} onChange={e => setRole(e.target.value)} disabled={editingUser?.uid === 'admin'} className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm">
                  <option value="Admin">Admin</option>
                  <option value="Superadmin">Superadmin</option>
                </select>
              </div>
              
              <div className="pt-4 flex justify-end space-x-3">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 text-sm font-medium transition-colors">Batal</button>
                <button onClick={saveUser} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition-colors">Simpan</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {userToDelete !== null && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Konfirmasi Hapus</h3>
              <p className="text-sm text-gray-500 mb-6">Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan.</p>
              <div className="flex justify-end space-x-3">
                <button onClick={() => setUserToDelete(null)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 text-sm font-medium transition-colors">Batal</button>
                <button onClick={executeDeleteUser} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium transition-colors">Hapus</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
