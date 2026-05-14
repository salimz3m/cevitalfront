import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Injecte le token JWT dans chaque requête
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  console.log(localStorage.getItem("token"));
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirige vers /login si le token expire (401)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

export default api;
