import { useEffect, useState, useCallback, type ReactNode } from 'react';
import { authService, getAuthToken } from '../services';
import type { User, LoginPayload, RegisterPayload } from '../types';
import { AuthContext } from './authContextDef';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(() => !!getAuthToken());

  const refreshUser = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const currentUser = await authService.getMe();
      setUser(currentUser);
    } catch {
      authService.logout();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      return;
    }

    let active = true;
    authService
      .getMe()
      .then((currentUser) => {
        if (active) {
          setUser(currentUser);
        }
      })
      .catch(() => {
        if (active) {
          authService.logout();
          setUser(null);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    const handleUnauthorized = () => {
      if (active) {
        setUser(null);
      }
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      active = false;
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (payload: LoginPayload) => {
    await authService.login(payload);
    const currentUser = await authService.getMe();
    setUser(currentUser);
  };

  const register = async (payload: RegisterPayload): Promise<User> => {
    return await authService.register(payload);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
