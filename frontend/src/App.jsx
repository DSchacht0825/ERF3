import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import ApplicationForm from './components/ApplicationForm';
import Dashboard from './components/Dashboard';
import Home from './components/Home';

function App() {
  return (
    <Router>
      <div className="app">
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
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
              </li>
            </ul>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/apply" element={<ApplicationForm />} />
            <Route path="/dashboard" element={<Dashboard />} />
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
