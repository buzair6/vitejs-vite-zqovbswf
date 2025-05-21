import React, { useState } from 'react';
import axios from 'axios';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage(''); // Clear previous messages

    // Client-side validation
    if (!email || !password) {
      setMessage('Email and password cannot be empty');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3001/api/auth/login', {
        email,
        password,
      });
      localStorage.setItem('token', response.data.token);
      setMessage('Login successful!');
      console.log('Login response:', response.data);
      setEmail(''); // Clear form
      setPassword(''); // Clear form
    } catch (error) {
      console.error('Login error:', error);
      if (error.response && error.response.data && error.response.data.error) {
        setMessage(error.response.data.error);
      } else {
        setMessage('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="login-email">Email:</label>
          <input
            type="email"
            id="login-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="login-password">Password:</label>
          <input
            type="password"
            id="login-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default Login;
