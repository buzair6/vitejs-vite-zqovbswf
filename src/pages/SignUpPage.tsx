import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import './Auth.css'; // Import Auth.css

interface SignUpPageProps {
  onSignUpSuccess: () => void;
}

const SignUpPage: React.FC<SignUpPageProps> = ({ onSignUpSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // API call for user registration
    const performSignUp = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setMessage(data.message || 'Sign up successful! Please log in.');
          onSignUpSuccess(); // Call the prop on successful sign-up
          setUsername(''); // Clear fields on success
          setPassword('');
          setConfirmPassword('');
        } else {
          setError(data.message || 'Sign up failed. Please try again.');
        }
      } catch (err) {
        setError('An error occurred during sign up. Please try again.');
        console.error('Sign up error:', err);
      }
    };

    performSignUp();
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h2>Sign Up</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <p className="auth-error">{error}</p>}
          {message && <p className="auth-message">{message}</p>}
          <div className="auth-form-group">
            <label htmlFor="username-signup" className="auth-label">Username:</label>
            <input
              type="text"
              id="username-signup" // Unique ID for label association
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="auth-input"
              required
            />
          </div>
          <div className="auth-form-group">
            <label htmlFor="password-signup" className="auth-label">Password:</label>
            <input
              type="password"
              id="password-signup" // Unique ID
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input"
              required
            />
          </div>
          <div className="auth-form-group">
            <label htmlFor="confirm-password-signup" className="auth-label">Confirm Password:</label>
            <input
              type="password"
              id="confirm-password-signup" // Unique ID
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="auth-input"
              required
            />
          </div>
          <button type="submit" className="auth-button">Sign Up</button>
        </form>
        <div className="auth-link-container">
          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
