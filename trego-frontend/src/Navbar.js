import React from 'react';
import { Link } from 'react-router-dom';

function Navbar({ onLogout }) {
  return (
    <nav className="bg-white bg-opacity-10 p-4 backdrop-blur-md shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-xl font-bold hover:text-pink-400 transition-colors">
          TregoPack
        </Link>
        <div className="space-x-4">
          <Link to="/cart" className="text-white hover:text-pink-400 transition-colors">Cart</Link>
          <Link to="/order-history" className="text-white hover:text-pink-400 transition-colors">Order History</Link>
          <Link to="/feedback" className="text-white hover:text-pink-400 transition-colors">Feedback</Link>
          <button
            onClick={onLogout}
            className="text-white hover:text-pink-400 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;