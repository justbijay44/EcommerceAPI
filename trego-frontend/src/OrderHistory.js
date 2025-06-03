import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getOrderHistory, setAuthToken, getToken } from './api/api';

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchOrderHistory = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      setAuthToken(token);
      console.log('Fetching order history with token:', token);
      const data = await getOrderHistory();
      console.log('Fetched order history:', data);
      setOrders(data);
      setLoading(false);
    } catch (err) {
      console.error('Fetch order history failed:', err.message);
      if (err.response?.status === 401) {
        try {
          const newToken = await getToken('admin', 'admin123');
          setAuthToken(newToken);
          localStorage.setItem('token', newToken);
          const data = await getOrderHistory();
          setOrders(data);
          setLoading(false);
        } catch (refreshErr) {
          setError('Session expired. Please log in again.');
          localStorage.removeItem('token');
          setAuthToken(null);
          setTimeout(() => navigate('/'), 2000);
        }
      } else {
        setError('Failed to load order history');
        setLoading(false);
      }
    }
  }, [navigate]);

  useEffect(() => {
    fetchOrderHistory();
  }, [location.pathname, fetchOrderHistory]);

  // Add polling to refresh order status
  useEffect(() => {
    const pollInterval = setInterval(() => {
      fetchOrderHistory();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollInterval);
  }, [fetchOrderHistory]);

  if (loading) return <div className="text-center text-2xl text-white">Loading...</div>;
  if (error) return <div className="text-center text-red-400">{error}</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-white text-center mb-6">Order History</h1>
      {orders.length === 0 ? (
        <p className="text-center text-white">
          No orders yet. <Link to="/" className="text-pink-400 hover:underline">Go shopping!</Link>
        </p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card">
              <h2 className="text-lg font-semibold text-white">Order #{order.id}</h2>
              <p className="text-sm text-gray-300">Date: {new Date(order.created_at).toLocaleString()}</p>
              <p className="text-sm text-gray-300">Product: {order.product.name}</p>
              <p className="text-sm text-gray-300">Quantity: {order.quantity}</p>
              <p className="text-sm text-gray-300">Total: ${parseFloat(order.product.price * order.quantity).toFixed(2)}</p>
              <p className="text-sm text-gray-300">Status: {order.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OrderHistory;