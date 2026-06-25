import axios from "axios";



const rawApiUrl = import.meta.env.VITE_API_URL?.trim() || '';

export const API_URL = rawApiUrl.replace(/\/+$/, '');

export const API_PATH = API_URL || '';

// Axios client with shared base URL and auth header injection.
export const apiClient = axios.create({
  baseURL: API_PATH || undefined,
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

export default apiClient;