// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../lib/api";

// 1. Create AuthContext
const AuthContext = createContext();

// 2. Provider Component
export function AuthProvider({ children }) {
  // Persist auth state
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  // --- LOGIN ---
  async function login({ emailOrUsername, password }) {
    setLoading(true);
    try {
      // Backend expects username (not email)
      const form = new URLSearchParams();
      form.append("username", emailOrUsername); // change if backend expects "email"
      form.append("password", password);

      const resp = await api.post("/api/auth/login", form, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      });

      // resp: { token, username, roles }
      setToken(resp.token);
      setUser({
        username: resp.username,
        roles: Array.isArray(resp.roles)
          ? resp.roles.map(r => r.authority || r) // Support both string and object
          : [],
      });

      localStorage.setItem("token", resp.token);
      localStorage.setItem("user", JSON.stringify({
        username: resp.username,
        roles: Array.isArray(resp.roles)
          ? resp.roles.map(r => r.authority || r)
          : [],
      }));
      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);
      return {
        success: false,
        message: err?.response?.data?.message || err.message
      };
    }
  }

  // --- LOGOUT ---
  function logout() {
    setToken("");
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  // --- Fetch Profile on Reload or if not in state ---
  useEffect(() => {
    async function fetchProfile() {
      // Only fetch if token exists but no user loaded
      if (token && !user) {
        try {
          const resp = await api.get("/api/users/me");
          setUser({
            username: resp.username,
            roles: resp.role ? [resp.role] : [], // if resp.role is a string
            email: resp.email,
            id: resp.id,
            status: resp.status,
          });
          localStorage.setItem("user", JSON.stringify({
            username: resp.username,
            roles: resp.role ? [resp.role] : [],
            email: resp.email,
            id: resp.id,
            status: resp.status,
          }));
        } catch (e) {
          logout();
        }
      }
    }
    fetchProfile();
    // eslint-disable-next-line
  }, [token]);

  // --- Role Helpers ---
  function isAdmin() {
    return user?.roles?.includes("ROLE_ADMIN");
  }
  function isUser() {
    return user?.roles?.includes("ROLE_USER") || isAdmin();
  }

  // --- Context Value ---
  return (
    <AuthContext.Provider value={{
      token,
      user,
      loading,
      login,
      logout,
      isAdmin,
      isUser,
      isAuthenticated: !!token,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// 3. Custom hook
export function useAuth() {
  return useContext(AuthContext);
}
