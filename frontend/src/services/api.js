import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5001'

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
})

export function setToken(token) {
  if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  else delete api.defaults.headers.common['Authorization']
}

// Interceptor to handle 401 (Unauthorized) responses - Auto logout on token expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid - auto logout
      localStorage.removeItem("mc_token");
      localStorage.removeItem("mc_name");
      localStorage.removeItem("mc_email");
      localStorage.removeItem("mc_role");
      localStorage.removeItem("mc_userId");
      localStorage.removeItem("mc_sellerStatus");
      localStorage.removeItem("mc_hostelBlock");
      localStorage.removeItem("mc_roomNumber");
      localStorage.removeItem("mc_shopName");
      
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api
