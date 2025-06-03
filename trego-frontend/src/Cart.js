import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getCart, updateCartQuantity, deleteCartItem, checkout, processPayment, getOrderHistory, setAuthToken, getToken } from './api/api';

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const navigate = useNavigate();
  const { orderId } = useParams();

  const fetchCart = async () => {
    try {
      setLoading(true);
      let token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, attempting to get new token');
        token = await getToken('admin', 'admin123');
        setAuthToken(token);
        localStorage.setItem('token', token);
      }
      setAuthToken(token);
      console.log('Fetching cart with token:', token);
      const data = await getCart();
      console.log('Fetched cart data:', data);
      setCartItems(data);
      setLoading(false);
    } catch (err) {
      console.error('Fetch cart error:', err.message, err.response?.status);
      if (err.response?.status === 401) {
        try {
          const newToken = await getToken('admin', 'admin123');
          setAuthToken(newToken);
          localStorage.setItem('token', newToken);
          const data = await getCart();
          setCartItems(data);
          setLoading(false);
        } catch (refreshErr) {
          setError('Session expired. Please log in again.');
          localStorage.removeItem('token');
          setAuthToken(null);
          setTimeout(() => navigate('/'), 2000);
        }
      } else {
        setError('Failed to load cart items');
        setLoading(false);
      }
    }
  };

  const handleIncrement = async (cartId, currentQuantity) => {
    try {
      const updatedItem = await updateCartQuantity(cartId, currentQuantity + 1);
      setCartItems(cartItems.map(item => item.id === cartId ? updatedItem : item));
    } catch (err) {
      setError('Failed to update quantity');
    }
  };

  const handleDecrement = async (cartId, currentQuantity) => {
    if (currentQuantity <= 1) return;
    try {
      const updatedItem = await updateCartQuantity(cartId, currentQuantity - 1);
      setCartItems(cartItems.map(item => item.id === cartId ? updatedItem : item));
    } catch (err) {
      setError('Failed to update quantity');
    }
  };

  const handleDelete = async (cartId) => {
    try {
      await deleteCartItem(cartId);
      setCartItems(cartItems.filter(item => item.id !== cartId));
    } catch (err) {
      setError('Failed to delete item');
    }
  };

  const handleCheckout = async () => {
    try {
      await checkout();
      const orderId = (await getOrderHistory()).slice(-1)[0]?.id;
      if (orderId) {
        navigate(`/payment/${orderId}`);
      } else {
        setError('No order found to process payment');
      }
    } catch (err) {
      setError('Checkout failed');
    }
  };

  const handlePayment = async () => {
    console.log('handlePayment called for Order ID:', orderId);
    if (!orderId) {
      setError('No order ID provided');
      console.log('No order ID provided');
      return;
    }
    try {
      setLoading(true);
      const response = await processPayment(orderId);
      console.log('Payment response:', response);
      setPaymentStatus(response.message);
      setTimeout(() => {
        navigate('/order-history');
      }, 3000);
    } catch (err) {
      console.error('Process payment error:', err.response?.status, err.message);
      setPaymentStatus(err.response?.data?.error || 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!orderId) {
      fetchCart();
    }
  }, [orderId]);

  if (loading) return <div className="text-center text-2xl text-white">Loading...</div>;
  if (error) return <div className="text-center text-red-400">{error}</div>;

  if (orderId) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white text-center mb-6">Payment Processing</h1>
        {paymentStatus ? (
          <div className="text-center">
            <p className={paymentStatus.includes('successful') ? 'text-green-400' : 'text-red-400'}>{paymentStatus}</p>
            <p className="text-white mt-4">Redirecting to order history...</p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-white mb-4">Processing your payment for Order #{orderId}</p>
            <button onClick={() => { console.log('Confirm Payment clicked'); handlePayment(); }} className="button button-success px-6 py-2">
              Confirm Payment
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-white text-center mb-6">Your Cart</h1>
      {cartItems.length === 0 ? (
        <p className="text-center text-white">
          Your cart is empty. <Link to="/" className="text-pink-400 hover:underline">Go shopping!</Link>
        </p>
      ) : (
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="card flex items-center">
              <Link
  to={`/product/${item.product.id}`}
  className="hover:shadow-lg rounded-lg overflow-hidden transition-transform transform hover:scale-105"
>
  <img
    src={item.product.image || "https://via.placeholder.com/150"}
    alt={item.product.name}
    className="w-24 h-24 object-cover rounded mr-4"
  />
</Link>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-white">{item.product.name}</h2>
                <p className="text-sm text-gray-300">{item.product.description}</p>
                <p className="text-xl text-pink-400">
                  ${parseFloat(item.product.price).toFixed(2)} x {item.quantity}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <button
                    onClick={() => handleDecrement(item.id, item.quantity)}
                    className="button button-secondary"
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span className="text-white">{item.quantity}</span>
                  <button
                    onClick={() => handleIncrement(item.id, item.quantity)}
                    className="button button-primary"
                  >
                    +
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="button button-danger ml-4"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          <div className="text-center mt-6">
            <button
              onClick={handleCheckout}
              className="button button-success px-6 py-2"
            >
              Proceed to Payment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;