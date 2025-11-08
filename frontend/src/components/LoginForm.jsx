import { useState } from 'react';
import axios from 'axios';

const LoginForm = ({ onLoginSuccess, onShowSignup }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', formData);
  // Store token in localStorage
  localStorage.setItem('token', response.data.token);
  // Call optional callback to update parent state
  if (onLoginSuccess) onLoginSuccess();
  else window.location.href = '/dashboard';
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <div className="auth-container">
      <div className="form-card">
        <h2>Login</h2>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
            <input
              className="input"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              className="input"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="actions">
            <button type="submit" className="primary">Login</button>
          </div>
        </form>

        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <span>Don't have an account? </span>
          <button className="ghost" type="button" onClick={() => onShowSignup && onShowSignup()}>
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;