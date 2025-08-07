import axios from "axios";

// Backend base URL
const BASE_URL = "http://localhost:8081";

// Always use "token" as the localStorage key for JWT
function getToken() {
  return localStorage.getItem("token");
}

// Create an Axios instance
const apiClient = axios.create({
  baseURL: BASE_URL,
  // timeout: 10000, // optional
});

// Request interceptor: Attach JWT if present
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle auth errors ONLY if token is present
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const token = getToken();
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403) &&
      token // Only force logout if token exists
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Helper: unwrap response data
function unwrap(res) {
  return res.data;
}

// Exported API functions
export const api = {
  get: (url, params) => apiClient.get(url, { params }).then(unwrap),
  post: (url, data, config = {}) => apiClient.post(url, data, config).then(unwrap),
  put: (url, data, config = {}) => apiClient.put(url, data, config).then(unwrap),
  delete: (url, config = {}) => apiClient.delete(url, config).then(unwrap),

  // File upload
  upload: (url, formData, config = {}) =>
    apiClient
      .post(url, formData, {
        ...config,
        headers: {
          ...(config.headers || {}),
          // Axios will set content-type automatically for FormData
        },
      })
      .then(unwrap),
};

// Optional: export apiClient for advanced usage
export default apiClient;
