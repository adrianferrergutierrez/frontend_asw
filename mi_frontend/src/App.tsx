import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "https://waslab04-p1hk.onrender.com/items";

function App() {
    const [items, setItems] = useState([]);
    const [nuevoNombre, setNuevoNombre] = useState("");
    const [editarId, setEditarId] = useState(null);
    const [editarNombre, setEditarNombre] = useState("");

    // GET: Cargar datos al iniciar
    useEffect(() => {
        obtenerItems();
    }, []);

    const obtenerItems = async () => {
        try {
            const res = await axios.get(API_URL);
            setItems(res.data);
        } catch (err) {
            console.error("Error al obtener items:", err);
        }
    };

    // POST: Crear item
    const crearItem = async () => {
        try {
            await axios.post(API_URL, { nombre: nuevoNombre });
            setNuevoNombre("");
            obtenerItems();
        } catch (err) {
            console.error("Error al crear item:", err);
        }
    };

    // PUT: Editar item
    const actualizarItem = async (id) => {
        try {
            await axios.put(`${API_URL}/${id}`, { nombre: editarNombre });
            setEditarId(null);
            setEditarNombre("");
            obtenerItems();
        } catch (err) {
            console.error("Error al editar item:", err);
        }
    };

    // DELETE: Eliminar item
    const eliminarItem = async (id) => {
        try {
            await axios.delete(`${API_URL}/${id}`);
            obtenerItems();
        } catch (err) {
            console.error("Error al eliminar item:", err);
        }
    };

    return (
        <div style={{ padding: "2rem" }}>
            <h1>Gestión de Items</h1>

            <input
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
                placeholder="Nuevo nombre"
            />
            <button onClick={crearItem}>Crear</button>

            <ul>
                {items.map((item) => (
                    <li key={item.id || item._id}>
                        {editarId === item.id || editarId === item._id ? (
                            <>
                                <input
                                    value={editarNombre}
                                    onChange={(e) => setEditarNombre(e.target.value)}
                                />
                                <button onClick={() => actualizarItem(item.id || item._id)}>Guardar</button>
                                <button onClick={() => setEditarId(null)}>Cancelar</button>
                            </>
                        ) : (
                            <>
                                {item.nombre}
                                <button onClick={() => {
                                    setEditarId(item.id || item._id);
                                    setEditarNombre(item.nombre);
                                }}>Editar</button>
                                <button onClick={() => eliminarItem(item.id || item._id)}>Eliminar</button>
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;
