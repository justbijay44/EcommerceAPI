
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Login from './Login';
import Navbar from './Navbar';
import Cart from './Cart';
import Home from './Home'; 
import OrderHistory from './OrderHistory';
import { getProducts, setAuthToken, getToken, addToCart } from './api/api';

function AppContent() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      setAuthToken(token);
      console.log('Fetching products with token:', token);
      const data = await getProducts();
      console.log('Fetched products:', data);
      setProducts(data);
      setLoading(false);
    } catch (err) {
      console.error('Fetch products failed:', err.message);
      if (err.response?.status === 401) {
        try {
          const newToken = await getToken('admin', 'admin123');
          setAuthToken(newToken);
          localStorage.setItem('token', newToken);
          const data = await getProducts();
          console.log('Fetched products after token refresh:', data);
          setProducts(data);
          setLoading(false);
        } catch (refreshErr) {
          setError('Session expired. Please log in again.');
          setIsLoggedIn(false);
          localStorage.removeItem('token');
          setAuthToken(null);
          navigate('/');
        }
      } else {
        setError(`Cannot load products: ${err.message}`);
        setLoading(false);
      }
    }
  };

  const handleLogin = async (credentials) => {
    try {
      const token = await getToken(credentials.username, credentials.password);
      setAuthToken(token);
      localStorage.setItem('token', token);
      setIsLoggedIn(true);
    } catch (err) {
      setError('Login failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuthToken(null);
    setIsLoggedIn(false);
    setProducts([]);
  };

  const handleAddToCart = async (productId) => {
    try {
      console.log('Adding to cart, Product ID:', productId);
      const response = await addToCart(productId, 1);
      console.log('Add to cart response:', response);
    } catch (err) {
      console.error('Failed to add to cart:', err.response?.status, err.message);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchProducts();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn && !localStorage.getItem('token')) {
      navigate('/');
    }
  }, [isLoggedIn, navigate]);

  return (
    <Routes>
      <Route
        path="/"
        element={
          isLoggedIn ? (
            <>
              <Navbar onLogout={handleLogout} />
              <Home
                products={products}
                loading={loading}
                error={error}
                handleAddToCart={handleAddToCart}
              />
            </>
          ) : (
            <Login onLogin={handleLogin} />
          )
        }
      />
      <Route
        path="/cart"
        element={
          isLoggedIn ? (
            <>
              <Navbar onLogout={handleLogout} />
              <Cart />
            </>
          ) : (
            <Login onLogin={handleLogin} />
          )
        }
      />
      <Route
        path="/order-history"
        element={
          isLoggedIn ? (
            <>
              <Navbar onLogout={handleLogout} />
              <OrderHistory />
            </>
          ) : (
            <Login onLogin={handleLogin} />
          )
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;