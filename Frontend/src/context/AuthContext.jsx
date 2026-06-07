import { createContext, useMemo, useState } from 'react';
import { logout as logoutApi } from '../api/authApi';

export const AuthContext = createContext(null);

function getStoredUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    localStorage.removeItem('user');
    return null;
  }
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  function login(userData, authToken) {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
  }

  function logout() {
    // Fire-and-forget the server-side blacklist call.
    // We still clear local state immediately so the UX is instant.
    // Log failures so they don't go completely unnoticed.
    logoutApi().catch((err) => {
      console.error('[AuthContext] Server-side logout failed:', err?.message ?? err);
    });

    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  const value = useMemo(
    () => ({ user, token, login, logout, isAuthenticated: Boolean(token) }),
    // login and logout reference stable state setters so they don't need to be
    // in the dep array, but token and user determine the derived isAuthenticated.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
