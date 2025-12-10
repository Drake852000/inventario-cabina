import { createContext, useState, useEffect } from "react";
import api from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  const login = async (email, password) => {
    console.log("ENVIANDO LOGIN:", email, password);

    const resp = await api.post("/auth/login", { email, password });

    localStorage.setItem("token", resp.data.accessToken);

    setUsuario(resp.data.usuario);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUsuario(null);
  };

  const cargarUsuario = async () => {
    try {
      const resp = await api.get("/auth/me");
      setUsuario(resp.data);
    } catch {
      setUsuario(null);
    }
    setCargando(false);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    // 🚀 SOLO llamar /auth/me si ya existe token
    if (token) {
      cargarUsuario();
    } else {
      setCargando(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, login, logout, cargando }}>
      {children}
    </AuthContext.Provider>
  );
};
