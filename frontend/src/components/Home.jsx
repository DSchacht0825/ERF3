import { Link } from 'react-router-dom';
import '../styles/Home.css';

function Home() {
  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>ERF3 Grant Funding</h1>
        <h2>Rental Assistance Application Portal</h2>
        <p>Welcome to the ERF3 Grant Funding application system. Our program provides rental assistance with a structured step-down plan to help clients achieve financial independence.</p>

        <div className="cta-buttons">
          <Link to="/apply" className="btn btn-primary">Start New Application</Link>
          <Link to="/dashboard" className="btn btn-secondary">View Dashboard</Link>
        </div>
      </div>

      <div className="info-section">
        <div className="info-card">
          <h3>📋 Simple Application</h3>
          <p>Complete the multi-step application form with all required information about the client and their needs.</p>
        </div>

        <div className="info-card">
          <h3>📊 Track Applications</h3>
          <p>Monitor all submitted applications, review status, and manage approvals through our comprehensive dashboard.</p>
        </div>

        <div className="info-card">
          <h3>📈 Custom Reports</h3>
          <p>Generate reports filtered by demographics, income levels, status, and more to analyze your program data.</p>
        </div>
      </div>

      <div className="features-section">
        <h2>What We Offer</h2>
        <ul>
          <li><strong>Rental Assistance:</strong> Support for monthly rent payments</li>
          <li><strong>Security Deposits:</strong> Help with upfront housing costs</li>
          <li><strong>Step-Down Plans:</strong> Customized plans to transition clients to independence</li>
          <li><strong>Case Management Integration:</strong> Coordination with referring agencies</li>
        </ul>
      </div>
    </div>
  );
}

export default Home;
