import axios from 'axios';

// Support both 'https://domain.com' and 'https://domain.com/api/v1', strip accidental 'VITE_API_URL=' prefix, and trim trailing slashes
const envUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').trim();
const cleanUrl = envUrl.replace(/^VITE_API_URL\s*=\s*/i, '').replace(/\/+$/, '');
const API_BASE_URL = cleanUrl.endsWith('/api/v1') ? cleanUrl : `${cleanUrl}/api/v1`;

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor: Attach JWT Bearer Token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('chhota_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle global responses & 401 Unauthorized
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear expired credentials
      localStorage.removeItem('chhota_auth_token');
      localStorage.removeItem('chhota_user');

      // Dispatch an unauthorized event for stores/subscribers to react
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }

    let errorMsg = error.response?.data?.message || error.message || 'Something went wrong';
    if (error.message === 'Network Error') {
      errorMsg = 'Cannot reach backend server. Please check your internet connection or backend deployment.';
      console.warn(
        `[Network Error] Unable to connect to ${API_BASE_URL}. Ensure your backend server is deployed and VITE_API_URL is configured in your hosting dashboard.`
      );
    }

    const customError = {
      status: error.response?.status || 500,
      message: errorMsg,
      errors: error.response?.data?.errors || [],
    };

    return Promise.reject(customError);
  }
);

export default axiosInstance;
