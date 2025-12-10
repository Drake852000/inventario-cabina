import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Dashboard() {
  const { usuario, logout } = useContext(AuthContext);

  return (
    <div style={{ padding: 20 }}>
      <h1>Bienvenido {usuario?.nombre}</h1>
      <p>Tu rol: {usuario?.rol}</p>

      <button onClick={logout}>Cerrar sesión</button>
    </div>
  );
}
