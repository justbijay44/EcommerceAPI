import axios from 'axios';

const API_URL = 'http://localhost:8000/api/';

let authToken = localStorage.getItem('token');

export const setAuthToken = (token) => {
  authToken = token;
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('Token set:', token);
  } else {
    delete axios.defaults.headers.common['Authorization'];
    console.log('Token removed');
  }
};

export const getToken = async (username, password) => {
  try {
    console.log('Attempting to get token for user:', username);
    const response = await axios.post(`${API_URL}token/`, { username, password });
    const token = response.data.access;
    setAuthToken(token);
    localStorage.setItem('token', token);
    console.log('Token obtained:', token);
    return token;
  } catch (error) {
    console.error('Get token error:', error.response?.status, error.message);
    throw new Error('Failed to authenticate. Please check your credentials.');
  }
};

export const getProducts = async () => {
  try {
    let token = localStorage.getItem('token');
    if (!token) {
      token = await getToken('admin', 'admin123');
    }
    setAuthToken(token);
    console.log('Fetching products with token:', token);
    const response = await axios.get(`${API_URL}products/`);
    return response.data;
  } catch (error) {
    console.error('Get products error:', error.response?.status, error.message);
    if (error.response?.status === 401) {
      const newToken = await getToken('admin', 'admin123');
      setAuthToken(newToken);
      const response = await axios.get(`${API_URL}products/`);
      return response.data;
    }
    throw error;
  }
};

export const getCart = async () => {
  try {
    let token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found, attempting to get new token');
      token = await getToken('admin', 'admin123');
    }
    setAuthToken(token);
    console.log('Fetching cart with token:', token);
    const response = await axios.get(`${API_URL}cart/`);
    console.log('Cart response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Get cart error:', error.response?.status, error.message);
    if (error.response?.status === 401) {
      const newToken = await getToken('admin', 'admin123');
      setAuthToken(newToken);
      const response = await axios.get(`${API_URL}cart/`);
      return response.data;
    }
    throw error;
  }
};

export const addToCart = async (productId, quantity = 1) => {
  try {
    let token = localStorage.getItem('token');
    if (!token) {
      token = await getToken('admin', 'admin123');
    }
    setAuthToken(token);
    const response = await axios.post(`${API_URL}cart/`, { product_id: productId, quantity });
    return response.data;
  } catch (error) {
    console.error('Add to cart error:', error.response?.status, error.message);
    throw error;
  }
};

export const updateCartQuantity = async (cartId, quantity) => {
  try {
    let token = localStorage.getItem('token');
    if (!token) {
      token = await getToken('admin', 'admin123');
    }
    setAuthToken(token);
    const response = await axios.put(`${API_URL}cart/${cartId}/`, { quantity });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteCartItem = async (cartId) => {
  try {
    let token = localStorage.getItem('token');
    if (!token) {
      token = await getToken('admin', 'admin123');
    }
    setAuthToken(token);
    await axios.delete(`${API_URL}cart/${cartId}/`);
  } catch (error) {
    throw error;
  }
};

export const checkout = async () => {
  try {
    let token = localStorage.getItem('token');
    if (!token) {
      token = await getToken('admin', 'admin123');
    }
    setAuthToken(token);
    const response = await axios.post(`${API_URL}orders/checkout/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const processPayment = async (orderId) => {
  try {
    let token = localStorage.getItem('token');
    if (!token) {
      token = await getToken('admin', 'admin123');
    }
    setAuthToken(token);
    const response = await axios.post(`${API_URL}orders/${orderId}/process-payment/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getOrderHistory = async () => {
  try {
    let token = localStorage.getItem('token');
    if (!token) {
      token = await getToken('admin', 'admin123');
    }
    setAuthToken(token);
    const response = await axios.get(`${API_URL}orders/order-history/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const submitFeedback = async (productId, rating, comment) => {
  try {
    let token = localStorage.getItem('token');
    if (!token) {
      token = await getToken('admin', 'admin123');
    }
    setAuthToken(token);
    console.log('Submitting feedback with token:', token);
    const response = await axios.post(`${API_URL}feedback/`, { product: productId, rating, comment });
    return response.data;
  } catch (error) {
    console.error('Submit feedback error:', error.response?.status, error.message);
    throw error;
  }
};