import React from 'react';
import { Link } from 'react-router-dom';

function Home({ products, loading, error, handleAddToCart }) {
  if (loading) return <div className="text-center text-2xl text-white">Loading...</div>;
  if (error) return <div className="text-center text-red-400">{error}</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-white text-center mb-6">Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link to={`/product/${product.id}`} key={product.id} className="card hover:shadow-lg rounded-lg overflow-hidden transition-transform transform hover:scale-105">
            <img
              src={product.image || 'https://via.placeholder.com/150'}
              alt={product.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h2 className="text-lg font-semibold text-white hover:text-pink-400">{product.name}</h2>
              <p className="text-sm text-gray-300">{product.description}</p>
              <p className="text-xl text-pink-400">${parseFloat(product.price).toFixed(2)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Home;
