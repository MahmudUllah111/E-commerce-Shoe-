import axios from 'axios';

const API = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Authentication & Profile
export const loginUser = async (credentials) => {
  const response = await API.post('/login', credentials);
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await API.post('/register', userData);
  return response.data;
};

export const updateUserProfile = async (profileData) => {
  const response = await API.put('/user/profile', profileData);
  return response.data;
};

export const getUserOrders = async (email) => {
  const response = await API.get('/user/orders', { params: { email } });
  return response.data;
};

// Store Catalog & Orders
export const getProducts = async (params = {}) => {
  const response = await API.get('/products', { params });
  return response.data;
};

export const getProductById = async (id) => {
  const response = await API.get(`/products/${id}`);
  return response.data;
};

export const submitProductReview = async (productId, reviewData) => {
  const response = await API.post(`/products/${productId}/reviews`, reviewData);
  return response.data;
};

export const getCategories = async () => {
  const response = await API.get('/categories');
  return response.data;
};

export const getBrands = async () => {
  const response = await API.get('/brands');
  return response.data;
};

export const validateCoupon = async (code, subtotal) => {
  const response = await API.get('/coupons/validate', {
    params: { code, subtotal },
  });
  return response.data;
};

export const createOrder = async (orderPayload) => {
  const response = await API.post('/orders', orderPayload);
  return response.data;
};

export const getOrderDetails = async (orderNumber) => {
  const response = await API.get(`/orders/${orderNumber}`);
  return response.data;
};

export const subscribeStockNotification = async (payload) => {
  const response = await API.post('/stock-notifications', payload);
  return response.data;
};

// Admin Endpoints
export const getAdminCatalog = async () => {
  const response = await API.get('/admin/catalog');
  return response.data;
};

export const updateVariantStock = async (variantId, newStock) => {
  const response = await API.post('/admin/inventory/update', {
    variant_id: variantId,
    new_stock: newStock,
  });
  return response.data;
};

export const createNewProduct = async (productData) => {
  const response = await API.post('/admin/products', productData);
  return response.data;
};

export const getAdminOrders = async () => {
  const response = await API.get('/admin/orders');
  return response.data;
};

export const updateOrderStatus = async (orderId, status) => {
  const response = await API.post('/admin/orders/status', {
    order_id: orderId,
    status: status,
  });
  return response.data;
};

export const submitContactForm = async (formData) => {
  const response = await API.post('/contact', formData);
  return response.data;
};

export default API;