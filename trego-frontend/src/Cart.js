// trego-frontend/src/Cart.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCart, updateCartQuantity, deleteCartItem, checkout } from './api/api';

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const data = await getCart();
      console.log('Fetched cart items:', data);
      setCartItems(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load cart items');
      setLoading(false);
    }
  };

  const handleIncrement = async (cartId, currentQuantity) => {
    try {
      const updatedItem = await updateCartQuantity(cartId, currentQuantity + 1);
      setCartItems(cartItems.map(item => 
        item.id === cartId ? updatedItem : item
      ));
    } catch (err) {
      setError('Failed to update quantity');
    }
  };

  const handleDecrement = async (cartId, currentQuantity) => {
    if (currentQuantity <= 1) return;
    try {
      const updatedItem = await updateCartQuantity(cartId, currentQuantity - 1);
      setCartItems(cartItems.map(item => 
        item.id === cartId ? updatedItem : item
      ));
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
      const response = await checkout();
      console.log('Checkout response:', response);
      setCartItems([]); // Clear cart on successful checkout
      alert('Order placed successfully!');
    } catch (err) {
      setError('Checkout failed');
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  if (loading) return <div className="text-center text-2xl text-white">Loading...</div>;
  if (error) return <div className="text-center text-red-400">{error}</div>;

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
            <div
              key={item.id}
              className="flex items-center bg-white bg-opacity-10 p-4 rounded-lg backdrop-blur-md"
            >
              <img
                src={item.product.image || 'https://via.placeholder.com/150'}
                alt={item.product.name}
                className="w-24 h-24 object-cover rounded mr-4"
              />
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-white">{item.product.name}</h2>
                <p className="text-sm text-gray-300">{item.product.description}</p>
                <p className="text-xl text-pink-400">
                  ${parseFloat(item.product.price).toFixed(2)} x {item.quantity}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <button
                    onClick={() => handleDecrement(item.id, item.quantity)}
                    className="px-2 py-1 bg-gray-500 rounded text-white hover:bg-gray-600"
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span className="text-white">{item.quantity}</span>
                  <button
                    onClick={() => handleIncrement(item.id, item.quantity)}
                    className="px-2 py-1 bg-blue-500 rounded text-white hover:bg-blue-600"
                  >
                    +
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="ml-4 px-2 py-1 bg-red-500 rounded text-white hover:bg-red-600"
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
              className="px-6 py-2 bg-green-500 rounded text-white hover:bg-green-600"
            >
              Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;