
function Home({ products, loading, error, handleAddToCart }) {
  if (loading) return <div className="text-center text-2xl text-white">Loading...</div>;
  if (error) return <div className="text-center text-red-400">{error}</div>;

  console.log('Products in Home:', products);
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-white text-center mb-6">TregoPack</h1>
      {products.length === 0 ? (
        <p className="text-center text-white">No products yet. Add some in admin!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white bg-opacity-10 p-4 rounded-lg backdrop-blur-md"
            >
              <img
                src={product.image || 'https://via.placeholder.com/150'}
                alt={product.name}
                className="w-full h-40 object-cover rounded mb-2"
              />
              <h2 className="text-lg font-semibold text-white">{product.name}</h2>
              <p className="text-sm text-gray-300">{product.description || 'No description'}</p>
              <p className="text-xl text-pink-400">${parseFloat(product.price).toFixed(2)}</p>
              <button
                onClick={() => handleAddToCart(product.id)}
                className="mt-2 w-full p-2 bg-blue-500 rounded text-white hover:bg-blue-600"
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;