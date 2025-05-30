import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// Configuración de axios
axios.defaults.baseURL = API_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Función para manejar errores
export default axios; 