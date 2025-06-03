import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Login from './Login';
import Navbar from './Navbar';
import Cart from './Cart';
import Home from './Home';
import OrderHistory from './OrderHistory';
import Feedback from './Feedback';
import ProductDetails from './ProductDetails';
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
      setError(null); // Clear previous errors
      const data = await getProducts();
      setProducts(data);
      setLoading(false);
    } catch (err) {
      console.error('Fetch products failed:', err.message);
      setError('Failed to load products. Please log in again.');
      setIsLoggedIn(false);
      localStorage.removeItem('token');
      setAuthToken(null);
      setTimeout(() => navigate('/'), 2000);
      setLoading(false);
    }
  };

  const handleLogin = async (credentials) => {
    try {
      const token = await getToken(credentials.username, credentials.password);
      setAuthToken(token);
      localStorage.setItem('token', token);
      setIsLoggedIn(true);
      setError(null);
      await fetchProducts();
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuthToken(null);
    setIsLoggedIn(false);
    setProducts([]);
    navigate('/');
  };

  const handleAddToCart = async (productId) => {
    try {
      const response = await addToCart(productId, 1);
      console.log('Add to cart response:', response);
    } catch (err) {
      console.error('Failed to add to cart:', err.response?.status, err.message);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setAuthToken(token);
      setIsLoggedIn(true);
      fetchProducts();
    } else {
      setIsLoggedIn(false);
      navigate('/');
    }
  }, []); // Run once on mount

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
            <Login onLogin={handleLogin} error={error} />
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
            <Login onLogin={handleLogin} error={error} />
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
            <Login onLogin={handleLogin} error={error} />
          )
        }
      />
      <Route
        path="/payment/:orderId"
        element={
          isLoggedIn ? (
            <>
              <Navbar onLogout={handleLogout} />
              <Cart />
            </>
          ) : (
            <Login onLogin={handleLogin} error={error} />
          )
        }
      />
      <Route
        path="/feedback"
        element={
          isLoggedIn ? (
            <>
              <Navbar onLogout={handleLogout} />
              <Feedback />
            </>
          ) : (
            <Login onLogin={handleLogin} error={error} />
          )
        }
      />
      <Route
        path="/product/:productId"
        element={
          isLoggedIn ? (
            <>
              <Navbar onLogout={handleLogout} />
              <ProductDetails />
            </>
          ) : (
            <Login onLogin={handleLogin} error={error} />
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