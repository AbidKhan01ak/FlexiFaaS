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
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      // resp: { token, username, roles }
      setToken(resp.token);
      localStorage.setItem("token", resp.token);

      const profile = await api.get("/api/users/me");

      const userObj = {
        id: profile.id,
        username: profile.username,
        email: profile.email,
        roles: profile.role ? [profile.role] : [],
        status: profile.status,
      };
      setUser(userObj);

      localStorage.setItem("user", JSON.stringify(userObj));
      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);
      return {
        success: false,
        message: err?.response?.data?.message || err.message,
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
  // useEffect(() => {
  //   async function fetchProfile() {
  //     // Only fetch if token exists but no user loaded
  //     if (token && (!user || !user.id)) {
  //       try {
  //         const resp = await api.get("/api/users/me");
  //         console.log(resp);
  //         const userObj = {
  //           id: resp.id,
  //           username: resp.username,
  //           email: resp.email,
  //           roles: resp.role ? [resp.role] : [],
  //           status: resp.status,
  //         };
  //         setUser(userObj);

  //         localStorage.setItem("user", JSON.stringify(userObj));
  //       } catch (e) {
  //         logout();
  //       }
  //     }
  //   }
  //   fetchProfile();
  //   // eslint-disable-next-line
  // }, [token]);

  // --- Role Helpers ---
  function isAdmin() {
    return user?.roles?.includes("ROLE_ADMIN");
  }
  function isUser() {
    return user?.roles?.includes("ROLE_USER") || isAdmin();
  }

  // --- Context Value ---
  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        login,
        setUser,
        logout,
        isAdmin,
        isUser,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// 3. Custom hook
export function useAuth() {
  return useContext(AuthContext);
}
