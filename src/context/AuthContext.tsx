import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: any | null;
  loading: boolean;
  signIn: (u: string, p: string) => Promise<boolean>;
  logout: () => void;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);

    const handleUnauthorized = () => {
      logout();
    };
    
    window.addEventListener('auth_unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth_unauthorized', handleUnauthorized);
  }, []);

  const signIn = async (username: string, password: string) => {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('auth_user', JSON.stringify(data.user));
        setUser(data.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error signing in", error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setUser(null);
  };

  const getToken = async () => {
    return localStorage.getItem('auth_token');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
