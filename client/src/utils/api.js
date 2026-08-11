import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    if (config.headers.set) {
      config.headers.set('Authorization', `Bearer ${token}`);
    } else {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export const menuAPI = {
  getAll: () => api.get('/menu'),
  getByCategory: (category) => api.get(`/menu?category=${category}`),
  getById: (id) => api.get(`/menu/${id}`),
};

export const orderAPI = {
  create: (orderData) => api.post('/orders', orderData),
  getById: (id) => api.get(`/orders/${id}`),
  getMyOrders: () => api.get('/orders/history/me'),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  calculateDistance: (lat, lng) => api.post('/orders/distance/calculate', { lat, lng }),
};

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getCurrentUser: () => {
    const token = localStorage.getItem('token');
    if (token) {
      return api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
    return Promise.resolve({ success: false });
  }
};

export const paymentAPI = {
  createRazorpayOrder: (data) => api.post('/payment/create-order', data),
  verifyRazorpayPayment: (data) => api.post('/webhook/verify', data),
};

export default api;
