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
    return loginUser(credentials);
  };

  const setSession = ({ token, role, name = '' }) => {
    const decoded = decodeToken(token);
    const normalizedRole = (role || decoded?.role || '').toLowerCase();
    localStorage.setItem('token', token);
    localStorage.setItem('role', normalizedRole);
    if (name) localStorage.setItem('name', name);
    const userData = {
      token,
      id: decoded?.id,
      role: normalizedRole,
      name,
    };
    setUser(userData);
    return userData;
  };

  const register = async (credentials) => registerUser(credentials);

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, setSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 
