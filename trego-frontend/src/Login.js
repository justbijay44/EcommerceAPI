// trego-frontend/src/Login.js
import React, { useState } from 'react';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin({ username, password }); // Pass credentials object
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-3xl font-bold text-white text-center mb-6">Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="w-full p-2 rounded bg-white bg-opacity-10 text-white"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-2 rounded bg-white bg-opacity-10 text-white"
        />
        <button
          type="submit"
          className="w-full p-2 bg-blue-500 rounded text-white hover:bg-blue-600"
        >
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;