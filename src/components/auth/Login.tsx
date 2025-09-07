import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styles from './Auth.module.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get success message from URL params (if any)
  const urlParams = new URLSearchParams(location.search);
  const successMessage = urlParams.get('message');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      const { error: authError } = await login(email, password);
      
      if (authError) {
        if (authError.message.includes('email not confirmed')) {
          setError('Please confirm your email address before logging in. Check your inbox for a confirmation link.');
        } else if (authError.message.includes('Invalid login credentials')) {
          setError('Incorrect email or password. Please try again.');
        } else {
          setError(authError.message);
        }
      } else {
        // Always redirect to dashboard for seamless UX
        navigate('/dashboard');
      }
    } catch (error: any) {
      setError('Failed to log in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h2 className={styles.authTitle}>Welcome to CivicReport</h2>
        <p className={styles.subtitle}>
          Sign in to report issues and track their progress
        </p>
        
        {/* Success message from registration or guest submission */}
        {successMessage && (
          <div style={{ 
            background: '#d1fae5', 
            border: '1px solid #a7f3d0', 
            color: '#065f46', 
            padding: '1rem', 
            borderRadius: '8px', 
            marginBottom: '1rem',
            fontSize: '0.875rem'
          }}>
            ✅ {decodeURIComponent(successMessage)}
          </div>
        )}
        
        {error && <div className={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit} className={styles.authForm}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              placeholder="Enter your email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              placeholder="Enter your password"
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? <span className="spinner"></span> : 'Sign In & Go to Dashboard'}
          </button>
        </form>
        
        <p className={styles.authLink}>
          Don't have an account? <Link to="/register">Create one here</Link>
        </p>
        
        {/* Quick demo info */}
        <div style={{ 
          marginTop: '1.5rem', 
          padding: '1rem', 
          background: '#f0f9ff', 
          borderRadius: '8px', 
          fontSize: '0.875rem',
          color: '#0369a1'
        }}>
          <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.875rem' }}>New here?</h4>
          <p style={{ margin: 0 }}>
            Create an account to report civic issues, track their progress, and help improve your community!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
