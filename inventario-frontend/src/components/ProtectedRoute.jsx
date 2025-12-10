import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { usuario, cargando } = useContext(AuthContext);

  if (cargando) return <p>Cargando...</p>;

  if (!usuario) return <Navigate to="/login" />;

  return children;
}
