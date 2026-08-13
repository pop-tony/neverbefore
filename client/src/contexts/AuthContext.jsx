import { jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState } from "react";
import { authApi, setToken, clearToken, getToken } from "../lib/api";
const AuthContext = createContext(void 0);
const getIsAdmin = (user) => {
  if (!user) return false;
  const userWithAdmin = user;
  return Boolean(userWithAdmin.isAdmin || user.role === "admin");
};
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.exp && payload.exp * 1e3 > Date.now()) {
        const isAdmin = Boolean(payload.isAdmin || payload.role === "admin");
        setUser({
          id: payload.id || payload.userId,
          email: payload.email || "",
          full_name: payload.full_name || payload.name || "",
          role: payload.role === "admin" ? "admin" : "customer",
          isAdmin
        });
      } else {
        clearToken();
      }
    } catch {
      clearToken();
    }
    setLoading(false);
  }, []);
  const signIn = async (email, password) => {
    try {
      const { token, user: user2 } = await authApi.login(email, password);
      setToken(token);
      setUser(user2);
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error("Sign in failed") };
    }
  };
  const signUp = async (email, password, fullName, phone) => {
    try {
      const { token, user: user2 } = await authApi.signup(email, password, fullName, phone);
      setToken(token);
      setUser(user2);
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error("Sign up failed") };
    }
  };
  const signOut = async () => {
    try {
      await authApi.logout();
    } catch {
    }
    clearToken();
    setUser(null);
  };
  return /* @__PURE__ */ jsx(AuthContext.Provider, { value: { user, loading, isAdmin: getIsAdmin(user), signIn, signUp, signOut }, children });
}
function useAuth() {
  const context = useContext(AuthContext);
  if (context === void 0) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
export {
  AuthProvider,
  useAuth
};
