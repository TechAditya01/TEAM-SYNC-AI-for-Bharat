/* eslint-disable react-refresh/only-export-components */
import React from 'react';

const AuthContext = React.createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = React.useState(null);

  const login = async (email) => {
    const user = { uid: 'demo-user', email };
    setCurrentUser(user);
    return { user };
  };

  const googleLogin = async () => {
    const user = { uid: 'demo-google-user', email: 'demo@gmail.com' };
    setCurrentUser(user);
    return { user };
  };

  const register = async (payload) => {
    const user = {
      uid: 'demo-user',
      email: payload.email,
      role: payload.role || 'citizen',
    };
    setCurrentUser(user);
    return { uid: user.uid };
  };

  const resetPassword = async () => true;

  const loginWithToken = async () => {
    if (!currentUser) {
      setCurrentUser({ uid: 'demo-user', email: 'demo@example.com' });
    }
    return true;
  };

  const value = {
    currentUser,
    isAuthenticated: Boolean(currentUser),
    role: currentUser?.role || 'citizen',
    login,
    googleLogin,
    register,
    resetPassword,
    loginWithToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
