import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css';
import ApplicationForm from './components/ApplicationForm';
import Dashboard from './components/Dashboard';
import Home from './components/Home';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';

function Navigation() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication status
    const authToken = localStorage.getItem('erf3_authenticated');
    const authTime = localStorage.getItem('erf3_auth_time');
    const isValid = authToken === 'true' && authTime &&
      (new Date().getTime() - parseInt(authTime)) < 24 * 60 * 60 * 1000;

    setIsAuthenticated(isValid);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('erf3_authenticated');
    localStorage.removeItem('erf3_auth_time');
    setIsAuthenticated(false);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <h1 className="nav-logo">ERF3 Grant Funding</h1>
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-link">Home</Link>
          </li>
          <li className="nav-item">
            <Link to="/apply" className="nav-link">Apply</Link>
          </li>
          <li className="nav-item">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
                <button onClick={handleLogout} className="nav-link btn-logout">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="nav-link">Admin Login</Link>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      <div className="app">
        <Navigation />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/apply" element={<ApplicationForm />} />
            <Route path="/login" element={<Login onLogin={setIsAuthenticated} />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>

        <footer className="footer">
          <p>&copy; 2025 ERF3 Grant Funding. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
