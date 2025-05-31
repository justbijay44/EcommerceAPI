import React, { useState, useEffect } from 'react';
import { getProducts, getToken, setAuthToken } from './api/api';

function App() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch token with superuser credentials (for testing)
        const token = await getToken('admin', 'admin');
        setAuthToken(token);
        const data = await getProducts();
        setProducts(data);
        setLoading(false);
      } catch (err) {
        setError(`Failed to fetch products: ${err.message}`);
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) return <div className="text-center text-white">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-900 via-blue-900 to-pink-900 p-8">
      <h1 className="text-4xl font-bold text-white text-center mb-8">Tregopack</h1>
      {products.length === 0 ? (
        <p className="text-center text-gray-300">No products available. Add some in the admin panel!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-4 shadow-lg hover:shadow-xl transition"
            >
              <img
                src={product.image || 'https://via.placeholder.com/150'}
                alt={product.name}
                className="w-full h-48 object-cover rounded mb-4"
              />
              <h2 className="text-xl font-semibold text-white">{product.name}</h2>
              <p className="text-gray-300">{product.description}</p>
              <p className="text-2xl font-bold text-pink-400">Rs.{product.price}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;