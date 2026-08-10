import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authApi, setToken, clearToken, getToken, type AuthUser } from '../lib/api';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName?: string, phone?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getIsAdmin = (user: AuthUser | null) => {
  if (!user) return false;
  const userWithAdmin = user as AuthUser & { isAdmin?: boolean };
  return Boolean(userWithAdmin.isAdmin || user.role === 'admin');
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    // Decode JWT payload to restore user session
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp && payload.exp * 1000 > Date.now()) {
        const isAdmin = Boolean(payload.isAdmin || payload.role === 'admin');
        setUser({
          id: payload.id || payload.userId,
          email: payload.email || '',
          full_name: payload.full_name || payload.name || '',
          role: payload.role === 'admin' ? 'admin' : 'customer',
          isAdmin,
        });
      } else {
        clearToken();
      }
    } catch {
      clearToken();
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { token, user } = await authApi.login(email, password);
      setToken(token);
      setUser(user);
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Sign in failed') };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string, phone?: string) => {
    try {
      const { token, user } = await authApi.signup(email, password, fullName, phone);
      setToken(token);
      setUser(user);
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Sign up failed') };
    }
  };

  const signOut = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore logout network errors; local state is still cleared
    }
    clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin: getIsAdmin(user), signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
