import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('fundrise_user');
    const token = localStorage.getItem('fundrise_token');
    if (stored && token) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('fundrise_user');
        localStorage.removeItem('fundrise_token');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token, ...userData } = res.data.data;
    localStorage.setItem('fundrise_token', token);
    localStorage.setItem('fundrise_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (data) => {
    const res = await authAPI.register(data);
    const { token, ...userData } = res.data.data;
    localStorage.setItem('fundrise_token', token);
    localStorage.setItem('fundrise_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('fundrise_token');
    localStorage.removeItem('fundrise_user');
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedData) => {
    const merged = { ...user, ...updatedData };
    localStorage.setItem('fundrise_user', JSON.stringify(merged));
    setUser(merged);
  }, [user]);

  const isAdmin = user?.role === 'ADMIN';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      user, loading, login, register, logout, updateUser, isAdmin, isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
