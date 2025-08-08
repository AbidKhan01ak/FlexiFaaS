import axios from "axios";

// ==== BASE URLs ====
const BASE_URL = "http://localhost:8081"; // Middleware (auth, users, etc.)
export const BACKEND_BASE = "http://localhost:8080"; // Backend (functions, uploads, etc.)

// ==== JWT TOKEN ====
function getToken() {
  return localStorage.getItem("token");
}

// ==== AXIOS CLIENTS ====

// --- Middleware Client (8081) ---
const middlewareClient = axios.create({ baseURL: BASE_URL });

// --- Backend Client (8080) ---
const backendClient = axios.create({ baseURL: BACKEND_BASE });

// ==== INTERCEPTORS (JWT & 401 handling) ====

function attachAuthHeader(config) {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}

// Add to both clients:
middlewareClient.interceptors.request.use(attachAuthHeader, (error) =>
  Promise.reject(error)
);
backendClient.interceptors.request.use(attachAuthHeader, (error) =>
  Promise.reject(error)
);

function handleAuthError(error) {
  const token = getToken();
  if (
    error.response &&
    (error.response.status === 401 || error.response.status === 403) &&
    token
  ) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }
  return Promise.reject(error);
}

middlewareClient.interceptors.response.use(
  (response) => response,
  handleAuthError
);
backendClient.interceptors.response.use(
  (response) => response,
  handleAuthError
);

// ==== HELPER ====
function unwrap(res) {
  return res.data;
}

// ==== EXPORTED API ====

// For middleware (8081)
export const api = {
  get: (url, params) => middlewareClient.get(url, { params }).then(unwrap),
  post: (url, data, config = {}) =>
    middlewareClient.post(url, data, config).then(unwrap),
  put: (url, data, config = {}) =>
    middlewareClient.put(url, data, config).then(unwrap),
  delete: (url, config = {}) =>
    middlewareClient.delete(url, config).then(unwrap),
  patch: (url, data, config = {}) =>
    middlewareClient.patch(url, data, config).then(unwrap),

  // File upload (middleware, if needed)
  upload: (url, formData, config = {}) =>
    middlewareClient
      .post(url, formData, {
        ...config,
        headers: {
          ...(config.headers || {}),
          // Axios will set content-type automatically for FormData
        },
      })
      .then(unwrap),
};

// For backend (8080)
export const backendApi = {
  get: (url, params) => backendClient.get(url, { params }).then(unwrap),
  post: (url, data, config = {}) =>
    backendClient.post(url, data, config).then(unwrap),
  put: (url, data, config = {}) =>
    backendClient.put(url, data, config).then(unwrap),
  delete: (url, config = {}) => backendClient.delete(url, config).then(unwrap),
  patch: (url, data, config = {}) =>
    backendClient.patch(url, data, config).then(unwrap),

  // File upload (backend)
  upload: (url, formData, config = {}) =>
    backendClient
      .post(url, formData, {
        ...config,
        headers: {
          ...(config.headers || {}),
          // Axios will set content-type automatically for FormData
        },
      })
      .then(unwrap),
};

// For advanced/low-level use (optional, not needed for most apps)
export { middlewareClient, backendClient };
