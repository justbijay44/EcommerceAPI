import React, { useState, useEffect, use } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProducts, addToCart } from "./api/api";

function ProductDetails() {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { productId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const products = await getProducts();
        const selectedProduct = products.find(p => p.id === parseInt(productId));
        if (!selectedProduct) {
          throw new Error('Product not found');
        }
        setProduct(selectedProduct);
        setLoading(false);
      } catch (err) {
        setError('Failed to load product details');
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleAddToCart = async () => {
    try {
      await addToCart(productId);
      alert('Product added to cart!');
      navigate('/cart');
    } catch (err) {
      setError('Failed to add product to cart');
    }
  };

  if (loading) return <div className="text-center text-2xl text-white">Loading...</div>;
  if (error) return <div className="text-center text-red-400">{error}</div>;
  if (!product) return <div className="text-center text-white">Product not found</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-white text-center mb-6">{product.name}</h1>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <img
            src={product.image || 'https://via.placeholder.com/400'}
            alt={product.name}
            className="w-full h-96 object-cover rounded-lg shadow-lg"
          />
        </div>
        <div className="flex-1 text-white">
          <p className="text-lg mb-4">{product.description}</p>
          <p className="text-2xl text-pink-400 mb-4">${parseFloat(product.price).toFixed(2)}</p>
          <p className="text-sm text-gray-300 mb-4">Category: {product.category.name}</p>
          <button
            onClick={handleAddToCart}
            className="button button-success px-6 py-2 hover:bg-pink-600 transition-colors"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );

};

export default ProductDetails;