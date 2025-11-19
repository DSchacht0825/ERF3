import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

function Login({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simple password check
    // In production, this would be an API call to verify credentials
    const correctPassword = 'Vistaerf'; // Admin password

    if (password === correctPassword) {
      // Set authentication in localStorage
      localStorage.setItem('erf3_authenticated', 'true');
      localStorage.setItem('erf3_auth_time', new Date().getTime());

      onLogin(true);
      navigate('/dashboard');
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🔒 Admin Access</h1>
          <p>Dashboard Login Required</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              required
              autoFocus
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Checking...' : 'Login to Dashboard'}
          </button>
        </form>

        <div className="login-footer">
          <p>Need to submit an application?</p>
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/apply')}
          >
            Go to Application Form
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
