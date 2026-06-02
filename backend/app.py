from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__)
CORS(app)  # Abre los permisos de seguridad para que React se conecte

DB_PATH = os.path.join(os.path.dirname(__file__), 'database.db')

def init_db():
    """Inicializa la base de datos SQLite con tablas de usuarios y productos"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Tabla de Usuarios de accesos
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    ''')
    
    # Tabla de Productos del almacén
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS productos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            codigo TEXT UNIQUE NOT NULL,
            nombre TEXT NOT NULL,
            precio REAL NOT NULL,
            stock INTEGER NOT NULL
        )
    ''')
    
    # Insertar el usuario administrador base
    cursor.execute("SELECT * FROM usuarios WHERE username = 'admin'")
    if not cursor.fetchone():
        cursor.execute("INSERT INTO usuarios (username, password) VALUES ('admin', 'admin123')")
        
    # Insertar un catálogo de productos de prueba
    cursor.execute("SELECT * FROM productos")
    if not cursor.fetchone():
        productos_catalogo = [
            ('P001', 'Laptop Asus ROG Zephyrus', 1450.00, 10),
            ('P002', 'Mouse Mecánico Logitech G502', 65.90, 45),
            ('P003', 'Teclado Mecánico Razer BlackWidow', 110.00, 25),
            ('P004', 'Monitor Curvo Samsung 27" 144Hz', 280.00, 18)
        ]
        cursor.executemany("INSERT INTO productos (codigo, nombre, precio, stock) VALUES (?, ?, ?, ?)", productos_catalogo)
        
    conn.commit()
    conn.close()

# Disparar la inicialización de la base de datos
init_db()

# ==================== ENDPOINTS DE LA API ====================

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username_ingresado = data.get('username')
    password_ingresado = data.get('password')

    if not username_ingresado or not password_ingresado:
        return jsonify({"success": False, "message": "Datos incompletos."}), 400

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM usuarios WHERE username = ? AND password = ?", (username_ingresado, password_ingresado))
    usuario = cursor.fetchone()
    conn.close()

    if usuario:
        return jsonify({"success": True, "message": f"Acceso exitoso. Bienvenido {username_ingresado}"})
    else:
        return jsonify({"success": False, "message": "Usuario o contraseña incorrectos."}), 401


@app.route('/api/productos/<codigo>', methods=['GET'])
def buscar_producto(codigo):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT codigo, nombre, precio, stock FROM productos WHERE codigo = ?", (codigo.strip(),))
    row = cursor.fetchone()
    conn.close()

    if row:
        producto = {
            "codigo": row[0],
            "nombre": row[1],
            "precio": row[2],
            "stock": row[3]
        }
        return jsonify({"success": True, "producto": producto})
    else:
        return jsonify({"success": False, "message": "El código de producto no existe."}), 404


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)