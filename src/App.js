import './App.css';

function App() {

  const handleLogin = (role) => {
    alert(`Login as ${role}`);
    // Example: redirect
    // navigate(`/login/${role}`);
  };

  const handleSignup = (role) => {
    alert(`Sign up as ${role}`);
    // Example: redirect
    // navigate(`/signup/${role}`);
  };

  return (
    <div className="container">
      <h1>PoliProfile</h1>
      <p className="subtitle">Connect Voters with Candidates</p>

      <div className="cards">
        {/* Voter Card */}
        <div className="card voter">
          <div className="icon">🗳️</div>
          <h2>I'm a Voter</h2>
          <p>Discover candidates and make informed decisions</p>
          <button onClick={() => handleLogin('Voter')} className="btn primary">Login as Voter</button>
          <button onClick={() => handleSignup('Voter')} className="btn secondary">Sign Up as Voter</button>
        </div>

        {/* Candidate Card */}
        <div className="card candidate">
          <div className="icon">👤</div>
          <h2>I'm a Candidate</h2>
          <p>Share your platform and connect with voters</p>
          <button onClick={() => handleLogin('Candidate')} className="btn primary">Login as Candidate</button>
          <button onClick={() => handleSignup('Candidate')} className="btn secondary">Sign Up as Candidate</button>
        </div>
      </div>
    </div>
  );
}

export default App;