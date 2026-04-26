import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser } from '../services/api';

const AuthContext = createContext(null);

// Decode JWT payload without a library
const decodeToken = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = decodeToken(token);
      if (decoded) {
        setUser({
          token,
          id: decoded.id,
          role: (decoded.role || '').toLowerCase(),
          name: localStorage.getItem('name') || '',
        });
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const data = await loginUser(credentials);
    const decoded = decodeToken(data.token);
    localStorage.setItem('token', data.token);
    const role = (data.role || decoded?.role || '').toLowerCase();
    localStorage.setItem('role', role);
    if (data.name) localStorage.setItem('name', data.name);
    const userData = {
      token: data.token,
      id: decoded?.id,
      role,
      name: data.name || '',
    };
    setUser(userData);
    return { ...data, role };
  };

  const register = async (credentials) => registerUser(credentials);

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 