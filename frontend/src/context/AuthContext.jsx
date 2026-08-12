import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('weatheriq_token');
    const storedUser = localStorage.getItem('weatheriq_user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('weatheriq_token');
        localStorage.removeItem('weatheriq_user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = async (email, password) => {
    const res = await authService.login({ email, password });
    if (res.success && res.data) {
      const { token: jwtToken, user: userData } = res.data;
      setToken(jwtToken);
      setUser(userData);
      localStorage.setItem('weatheriq_token', jwtToken);
      localStorage.setItem('weatheriq_user', JSON.stringify(userData));
      return res;
    }
    throw new Error(res.message || 'Login failed');
  };

  const handleRegister = async (name, email, password) => {
    const res = await authService.register({ name, email, password });
    if (res.success && res.data) {
      const { token: jwtToken, user: userData } = res.data;
      setToken(jwtToken);
      setUser(userData);
      localStorage.setItem('weatheriq_token', jwtToken);
      localStorage.setItem('weatheriq_user', JSON.stringify(userData));
      return res;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('weatheriq_token');
    localStorage.removeItem('weatheriq_user');
  };

  const updateUserState = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('weatheriq_user', JSON.stringify(updatedUser));
  };

  const isAdmin = user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ADMIN');

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isAdmin,
        loading,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        updateUser: updateUserState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
