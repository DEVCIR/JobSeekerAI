import axios from "axios";

// Create an Axios instance
const api = axios.create({
  baseURL: "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response, 
  async (error) => {
    if (error.response && error.response.status === 401) {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const { data } = await axios.post("https://your-api-url.com/api/refresh", { refreshToken });

          localStorage.setItem("access_token", data.accessToken);
          localStorage.setItem("refreshToken", data.refreshToken);

          error.config.headers.Authorization = `Bearer ${data.accessToken}`;
          return axios(error.config);
        } catch (refreshError) {
          console.error("Token refresh failed", refreshError);
          localStorage.removeItem("access_token");
          localStorage.removeItem("refreshToken");
          window.location.href = "/";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
