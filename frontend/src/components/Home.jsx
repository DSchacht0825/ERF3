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
        </div>
      </div>
    </div>
  );
}

export default Home;
