import { useState } from 'react';

function App() {
  // Estados para controlar el acceso
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mensajeLogin, setMensajeLogin] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Navegación interna: 'principal' o 'buscador'
  const [vista, setVista] = useState('principal');

  // Estados del Buscador de productos
  const [codigoBusqueda, setCodigoBusqueda] = useState('');
  const [productoEncontrado, setProductoEncontrado] = useState(null);
  const [mensajeBuscador, setMensajeBuscador] = useState('');

  // Cambiar por la URL de Render al subir a producción
  const BASE_URL = "https://proyecto-fullstack-buscador.onrender.com/api";

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setIsLoggedIn(true);
        setVista('principal');
        setMensajeLogin('');
      } else {
        setMensajeLogin(data.message || "Usuario o contraseña inválidos.");
      }
    } catch (error) {
      setMensajeLogin("Sin comunicación con el servidor backend.");
    }
  };

  const handleBuscarProducto = async (e) => {
    e.preventDefault();
    setProductoEncontrado(null);
    setMensajeBuscador('');

    try {
      const response = await fetch(`${BASE_URL}/productos/${codigoBusqueda}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setProductoEncontrado(data.producto);
      } else {
        setMensajeBuscador(data.message || "No se encontró coincidencia.");
      }
    } catch (error) {
      setMensajeBuscador("Error interno en la búsqueda.");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
    setCodigoBusqueda('');
    setProductoEncontrado(null);
    setMensajeBuscador('');
    setVista('principal');
  };

  // ================= RENDERIZADO CONDICIONAL DE VISTAS =================

  // Vista 1: Formulario de Login
  if (!isLoggedIn) {
    return (
      <div className="card-panel">
        <form onSubmit={handleLogin}>
          <h2>Control de Acceso</h2>
          <div className="form-item">
            <label>Usuario:</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
            />
          </div>
          <div className="form-item">
            <label>Contraseña:</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="btn-accent">Ingresar al Sistema</button>
        </form>
        {mensajeLogin && <p className="alert-red">{mensajeLogin}</p>}
      </div>
    );
  }

  // Vista 2: Ventana Principal
  if (vista === 'principal') {
    return (
      <div className="card-panel text-center">
        <h2>Ventana Principal</h2>
        <p className="subtitle">Módulo activo para: <strong>{username}</strong></p>
        
        <div className="vertical-stack">
          <button onClick={() => setVista('buscador')} className="btn-success">
            🔍 Abrir Buscador de Productos
          </button>
          
          <button onClick={handleLogout} className="btn-danger">
            🚪 Salir del Sistema
          </button>
        </div>
      </div>
    );
  }

  // Vista 3: Ventana del Buscador
  if (vista === 'buscador') {
    return (
      <div className="card-panel">
        <h2>Buscador de Almacén</h2>
        
        <form onSubmit={handleBuscarProducto} className="search-box">
          <div className="form-item">
            <label>Ingrese el código del artículo (Ej: P001, P002):</label>
            <div className="input-row">
              <input 
                type="text" 
                value={codigoBusqueda} 
                onChange={(e) => setCodigoBusqueda(e.target.value)} 
                placeholder="Código..."
                required 
              />
              <button type="submit" className="btn-accent">Buscar</button>
            </div>
          </div>
        </form>

        {productoEncontrado && (
          <div className="box-result">
            <h3>📦 Registro Encontrado</h3>
            <p><strong>SKU:</strong> {productoEncontrado.codigo}</p>
            <p><strong>Producto:</strong> {productoEncontrado.nombre}</p>
            <p><strong>Precio unitario:</strong> ${productoEncontrado.precio.toFixed(2)}</p>
            <p><strong>Existencias actuales:</strong> {productoEncontrado.stock} unds.</p>
          </div>
        )}

        {mensajeBuscador && <p className="alert-red">{mensajeBuscador}</p>}

        <button 
          onClick={() => { setVista('principal'); setCodigoBusqueda(''); setProductoEncontrado(null); setMensajeBuscador(''); }} 
          className="btn-neutral"
        >
          ⬅️ Regresar
        </button>
      </div>
    );
  }
}

export default App;