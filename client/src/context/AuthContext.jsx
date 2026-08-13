import axios from 'axios';
import React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const configuredBase = (import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');
  const backendUrl = configuredBase.endsWith('/api') ? configuredBase : `${configuredBase}/api`;

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(`${backendUrl}/auth/is-auth`, { withCredentials: true });
        if (res.data.success) {
          setUser(res.data.user);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [backendUrl]);

  const login = async (identifier, password) => {
    const res = await axios.post(`${backendUrl}/auth/login`, {
      email: identifier.includes('@') ? identifier : undefined,
      username: identifier.includes('@') ? undefined : identifier,
      password,
    }, { withCredentials: true });
    if (res.data.success) {
      setUser(res.data.user);
    }
    return res.data;
  };

  const register = async (name, username, email, password, number) => {
    const res = await axios.post(`${backendUrl}/auth/register`, {
      name,
      username,
      email,
      password,
      number,
    }, { withCredentials: true });
    if (res.data.success) {
      // Fetch user data after registration
      const authRes = await axios.get(`${backendUrl}/auth/is-auth`, { withCredentials: true });
      if (authRes.data.success) {
        setUser(authRes.data.user);
      }
    }
    return res.data;
  };

  const logout = async () => {
    try {
      await axios.post(`${backendUrl}/auth/logout`, {}, { withCredentials: true });
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      loading,
      login,
      register,
      logout,
      isAuthenticated: !!user,
      isAdmin: user?.isAdmin === true,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};