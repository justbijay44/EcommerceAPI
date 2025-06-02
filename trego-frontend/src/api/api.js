// trego-frontend/src/api/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('Token set:', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    console.log('Token removed');
  }
};

export const getProducts = async () => {
  try {
    const response = await api.get('products/');
    return response.data;
  } catch (error) {
    console.error('Fetch products error:', error.response?.status, error.message);
    throw error;
  }
};

export const getToken = async (username, password) => {
  try {
    const response = await api.post('token/', { username, password });
    return response.data.access;
  } catch (error) {
    console.error('Get token error:', error.response?.status, error.message);
    throw error;
  }
};

export const addToCart = async (productId, quantity = 1) => {
  try {
    const response = await api.post('cart/', { product_id: productId, quantity });
    return response.data;
  } catch (error) {
    console.error('Add to cart error:', error.response?.status, error.message);
    throw error;
  }
};

export const getCart = async () => {
  try {
    const response = await api.get('cart/');
    return response.data;
  } catch (error) {
    console.error('Fetch cart error:', error.response?.status, error.message);
    throw error;
  }
};

export const updateCartQuantity = async (cartId, quantity) => {
  try {
    const response = await api.patch(`cart/${cartId}/update-quantity/`, { quantity });
    return response.data;
  } catch (error) {
    console.error('Update cart quantity error:', error.response?.status, error.message);
    throw error;
  }
};

export const deleteCartItem = async (cartId) => {
  try {
    await api.delete(`cart/${cartId}/delete/`);
  } catch (error) {
    console.error('Delete cart item error:', error.response?.status, error.message);
    throw error;
  }
};

export const checkout = async () => {
  try {
    const response = await api.post('orders/checkout/');
    return response.data;
  } catch (error) {
    console.error('Checkout error:', error.response?.status, error.message);
    throw error;
  }
};

export const getOrderHistory = async () => {
  try {
    const response = await api.get('orders/order-history/');
    console.log('Order history response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Get order history error:', error.response?.status, error.message);
    throw error;
  }
};