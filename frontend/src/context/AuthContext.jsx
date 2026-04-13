import { createContext, useMemo, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => ({
    token: localStorage.getItem("token") || "",
    user: JSON.parse(localStorage.getItem("user")) || null,
  }));

  const [adminAuth, setAdminAuth] = useState(() => ({
    adminToken: localStorage.getItem("adminToken") || "",
    adminUser: JSON.parse(localStorage.getItem("adminUser")) || null,
  }));

  const login = (data) => {
    const nextAuth = {
      token: data?.token || "",
      user: data?.user || null,
    };

    localStorage.setItem("token", nextAuth.token);
    localStorage.setItem("user", JSON.stringify(nextAuth.user));
    setAuth(nextAuth);
  };

  const adminLogin = (data) => {
    const nextAdminAuth = {
      adminToken: data?.token || "",
      adminUser: data?.user || null,
    };

    localStorage.setItem("adminToken", nextAdminAuth.adminToken);
    localStorage.setItem("adminUser", JSON.stringify(nextAdminAuth.adminUser));
    setAdminAuth(nextAdminAuth);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuth({ token: "", user: null });
  };

  const adminLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    setAdminAuth({ adminToken: "", adminUser: null });
  };

  const value = useMemo(
    () => ({
      // Regular user auth
      user: auth.user,
      token: auth.token,
      isAuthenticated: Boolean(auth.token && auth.user),
      login,
      logout,
      // Admin auth
      adminUser: adminAuth.adminUser,
      adminToken: adminAuth.adminToken,
      isAdminAuthenticated: Boolean(adminAuth.adminToken && adminAuth.adminUser),
      adminLogin,
      adminLogout,
    }),
    [auth, adminAuth]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};
