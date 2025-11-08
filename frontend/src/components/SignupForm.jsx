import { useState } from 'react';
import API from '../api';

const SignupForm = ({ onSignupSuccess, onShowLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
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
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await API.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
  localStorage.setItem('token', response.data.token);
  if (onSignupSuccess) onSignupSuccess();
  else window.location.href = '/dashboard';
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during registration');
    }
  };

  return (
    <div className="auth-container">
      <div className="form-card">
        <h2>Sign Up</h2>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Name</label>
            <input className="input" type="text" name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="field">
            <label>Email</label>
            <input className="input" type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>

          <div className="field">
            <label>Password</label>
            <input className="input" type="password" name="password" value={formData.password} onChange={handleChange} required minLength={6} />
          </div>

          <div className="field">
            <label>Confirm Password</label>
            <input className="input" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required minLength={6} />
          </div>

          <div className="actions">
            <button type="submit" className="primary">Sign Up</button>
          </div>
        </form>

        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <span>Already have an account? </span>
          <button className="ghost" type="button" onClick={() => onShowLogin && onShowLogin()}>
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;