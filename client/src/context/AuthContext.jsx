import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);
const STORAGE_KEY = 'pf_auth';

function readStored() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(readStored);

  // Clear session when the axios interceptor detects an expired token
  useEffect(() => {
    const onExpired = () => setAuth(null);
    window.addEventListener('pf-auth-expired', onExpired);
    return () => window.removeEventListener('pf-auth-expired', onExpired);
  }, []);

  const login = async (accessCode) => {
    const { data } = await api.post('/auth/login', { code: accessCode });
    const value = { token: data.token, user: data.user };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    setAuth(value);
    return value;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAuth(null);
  };

  const isAdmin = auth?.user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ auth, user: auth?.user, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
