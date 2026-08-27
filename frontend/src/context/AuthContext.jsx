import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const defaultPublicUser = {
  id: 'public_guest_user',
  name: 'WeatherIQ Explorer',
  email: 'public@weatheriq.app',
  roles: ['ROLE_ADMIN', 'ROLE_USER'],
  emailVerified: true,
  enabled: true,
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(defaultPublicUser);
  const [token, setToken] = useState('public_free_access_token');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('weatheriq_user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser({ ...defaultPublicUser, ...parsed, roles: ['ROLE_ADMIN', 'ROLE_USER'] });
      } catch (e) {
        setUser(defaultPublicUser);
      }
    }
  }, []);

  const handleLogin = async () => {
    return { success: true, message: 'Free access active' };
  };

  const handleRegister = async () => {
    return { success: true, message: 'Free access active' };
  };

  const handleLogout = () => {
    setUser(defaultPublicUser);
    setToken('public_free_access_token');
  };

  const updateUserState = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('weatheriq_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user: user || defaultPublicUser,
        token: token || 'public_free_access_token',
        isAuthenticated: true,
        isAdmin: true,
        loading: false,
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
