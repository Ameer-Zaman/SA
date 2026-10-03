import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

/** Admin session state. The JWT lives in an httpOnly cookie; we only ask the API who we are. */
export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    api.me().then((d) => setAdmin(d.admin)).catch(() => setAdmin(null)).finally(() => setChecking(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const d = await api.login(email, password);
    setAdmin(d.admin);
    return d.admin;
  }, []);

  const logout = useCallback(async () => {
    await api.logout().catch(() => {});
    setAdmin(null);
  }, []);

  const value = useMemo(() => ({ admin, checking, login, logout }), [admin, checking, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
