import React, { useState } from 'react';
import axios from 'axios';

function SignUp() {
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
    // Basic email format validation (client-side)
    if (!email.includes('@')) {
      setMessage('Invalid email format');
      return;
    }
    // Basic password length validation (client-side)
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters long');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3001/api/auth/signup', {
        email,
        password,
      });
      setMessage(response.data.message || 'Sign up successful!');
      console.log('Sign up response:', response.data);
      setEmail(''); // Clear form
      setPassword(''); // Clear form
    } catch (error) {
      console.error('Sign up error:', error);
      if (error.response && error.response.data && error.response.data.error) {
        setMessage(error.response.data.error);
      } else {
        setMessage('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <div>
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Sign Up</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default SignUp;
