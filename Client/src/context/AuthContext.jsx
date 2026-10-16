import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("shopez_token") || null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    api
      .me(token)
      .then(setUser)
      .catch(() => {
        setToken(null);
        localStorage.removeItem("shopez_token");
      })
      .finally(() => setLoading(false));
  }, [token]);

  async function login(email, password) {
    const data = await api.login({ email, password });
    localStorage.setItem("shopez_token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }

  async function register(payload) {
    await api.register(payload);
    return login(payload.email, payload.password);
  }

  function logout() {
    // JWT auth is stateless, so logout is really a client-side action; we
    // still notify the server (best-effort) to match the explicit logout
    // endpoint and the milestone's login/register/logout flow.
    if (token) {
      api.logout(token).catch(() => {});
    }
    localStorage.removeItem("shopez_token");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
