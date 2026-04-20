import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./voterHome.css";
import { supabase } from "./supabase";
import ProfileMenu from "./components/ProfileMenu";
import { LEVELS, mockCandidates, mockOfficials } from "./mockData";

export default function VoterHome() {
  const [activeTab, setActiveTab] = useState("officials");
  const [activeLevel, setActiveLevel] = useState("Barangay");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const role = session?.user?.user_metadata?.role?.toLowerCase();
      if (!session?.user || role !== "voter") {
        navigate("/", { replace: true });
        return;
      }

      localStorage.setItem("userRole", role);
      setUser(session.user);
    };

    checkSession();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("userRole");
    navigate("/", { replace: true });
  };

  const data = activeTab === "officials" ? mockOfficials : mockCandidates;
  const filtered = data.filter((item) => item.level === activeLevel);

  const openProfile = (item) => {
    if (activeTab === "officials") {
      navigate(`/voter/officials/${item.id}`);
      return;
    }
    alert("Candidate full profile page is coming soon.");
  };

  return (
    <div className="vh-root">
      {/* Navbar */}
      <nav className="vh-nav">
        <div className="vh-nav-brand">
          <span className="vh-nav-icon">⊟</span>
          PoliProfile
        </div>
        <div className="vh-nav-actions">
          <button className="vh-logout-btn" onClick={handleLogout}>
            Log Out
          </button>
          <ProfileMenu user={user} role="voter" />
        </div>
      </nav>

      {/* Hero */}
      <header className="vh-hero">
        <h1 className="vh-hero-title">Philippine Political Platform</h1>
        <p className="vh-hero-sub">
          Track government performance and discover candidates from barangay to
          national level
        </p>
      </header>

      {/* Tabs */}
      <div className="vh-tab-wrapper">
        <div className="vh-tabs">
          <button
            className={`vh-tab ${activeTab === "officials" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("officials");
              setActiveLevel("Barangay");
            }}
          >
            ⊙ Current Officials
          </button>
          <button
            className={`vh-tab ${activeTab === "candidates" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("candidates");
              setActiveLevel("Barangay");
            }}
          >
            ↗ Running Candidates
          </button>
        </div>
      </div>

      {/* Main Section */}
      <section className="vh-section">
        <h2 className="vh-section-title">
          {activeTab === "officials" ? "Current Officials" : "Running Candidates"}
        </h2>
        <p className="vh-section-sub">
          {activeTab === "officials"
            ? "Browse elected officials and track their performance ratings."
            : "Discover candidates running in the upcoming elections."}
        </p>

        {/* Level Filter */}
        <div className="vh-levels">
          {LEVELS.map((level) => (
            <button
              key={level}
              className={`vh-level-btn ${activeLevel === level ? "active" : ""}`}
              onClick={() => setActiveLevel(level)}
            >
              {level}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="vh-cards">
          {filtered.length === 0 ? (
            <p className="vh-empty">
              No {activeTab === "officials" ? "officials" : "candidates"} found
              for {activeLevel} level.
            </p>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="vh-card"
                role={activeTab === "officials" ? "button" : undefined}
                tabIndex={activeTab === "officials" ? 0 : undefined}
                onClick={() => (activeTab === "officials" ? openProfile(item) : null)}
                onKeyDown={(e) => {
                  if (activeTab !== "officials") return;
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openProfile(item);
                  }
                }}
              >
                <div className="vh-card-header">
                  <div className="vh-avatar">
                    <img src={item.image} alt={item.name} className="vh-avatar-img" />
                  </div>
                  <div className="vh-card-info">
                    <h3 className="vh-card-name">{item.name}</h3>
                    <p className="vh-card-position">{item.position}</p>
                    <span className="vh-card-party">{item.party}</span>
                  </div>
                </div>

                {activeTab === "officials" && (
                  <div className="vh-badges">
                    <span className="vh-badge green">
                      ✓ Satisfaction: {item.satisfaction}%
                    </span>
                    <span className="vh-badge green">
                      ◎ Transparency: {item.transparency}%
                    </span>
                  </div>
                )}

                <div className="vh-platform">
                  <p className="vh-platform-title">Campaign Platforms</p>
                  <ul className="vh-platform-list">
                    {item.platforms.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>

                <button
                  className="vh-profile-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    openProfile(item);
                  }}
                >
                  View Full Profile
                </button>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}