import { useState } from "react";
import "./voterHome.css";

const mockOfficials = [
  {
    id: 1,
    name: "Kapitan Alden Piattos",
    position: "Barangay Captain",
    party: "Independent",
    satisfaction: 87,
    transparency: 92,
    level: "Barangay",
    platforms: [
      "Improve barangay health center facilities",
      "Establish community daycare center",
      "Install streetlights in all purok areas",
      "Organize skills training for residents",
    ],
  },
  {
    id: 2,
    name: "Hon. Maria Santos",
    position: "City Mayor",
    party: "Partido ng Bayan",
    satisfaction: 79,
    transparency: 85,
    level: "City/Municipal",
    platforms: [
      "Improve city road infrastructure",
      "Expand public health services",
      "Support local businesses",
      "Enhance public safety programs",
    ],
  },
  {
    id: 3,
    name: "Gov. Ramon dela Cruz",
    position: "Provincial Governor",
    party: "Lakas-CMD",
    satisfaction: 83,
    transparency: 88,
    level: "Provincial",
    platforms: [
      "Provincial tourism development",
      "Agricultural support programs",
      "Infrastructure modernization",
      "Environmental conservation",
    ],
  },
  {
    id: 4,
    name: "Sen. Ana Reyes",
    position: "Senator",
    party: "PDP-Laban",
    satisfaction: 91,
    transparency: 94,
    level: "National",
    platforms: [
      "Education reform bill",
      "Universal healthcare expansion",
      "Anti-corruption legislation",
      "Economic development programs",
    ],
  },
];

const mockCandidates = [
  {
    id: 1,
    name: "Korah Cute",
    position: "Barangay Captain Candidate",
    party: "Independent",
    level: "Barangay",
    platforms: [
      "Improve barangay health center facilities",
      "Establish community daycare center",
      "Install streetlights in all purok areas",
      "Organize skills training for residents",
    ],
  },
  {
    id: 2,
    name: "Juan Tira Dhore",
    position: "Barangay Kagawad Candidate",
    party: "Local Unity Party",
    level: "Barangay",
    platforms: [
      "Youth sports development programs",
      "Senior citizen assistance programs",
      "Community clean and green initiatives",
      "Peace and order maintenance",
    ],
  },
  {
    id: 3,
    name: "Liza Magtanggol",
    position: "City Councilor Candidate",
    party: "Aksyon Demokratiko",
    level: "City/Municipal",
    platforms: [
      "Public market renovation",
      "Livelihood programs for women",
      "Flood control projects",
      "Scholarship for deserving students",
    ],
  },
];

const levels = ["Barangay", "City/Municipal", "Provincial", "National"];

export default function VoterHome() {
  const [activeTab, setActiveTab] = useState("officials");
  const [activeLevel, setActiveLevel] = useState("Barangay");

  const data = activeTab === "officials" ? mockOfficials : mockCandidates;
  const filtered = data.filter((item) => item.level === activeLevel);

  return (
    <div className="vh-root">
      {/* Navbar */}
      <nav className="vh-nav">
        <div className="vh-nav-brand">
          <span className="vh-nav-icon">⊟</span>
          <span className="vh-nav-title">PoliProfile</span>
        </div>
        <button className="vh-logout-btn">Log Out</button>
      </nav>

      {/* Hero */}
      <header className="vh-hero">
        <h1 className="vh-hero-title">Philippine Political Platform</h1>
        <p className="vh-hero-sub">
          Track government performance and discover candidates from barangay to
          national level
        </p>
      </header>

      {/* Tab Toggle */}
      <div className="vh-tab-wrapper">
        <div className="vh-tabs">
          <button
            className={`vh-tab ${activeTab === "officials" ? "active" : ""}`}
            onClick={() => { setActiveTab("officials"); setActiveLevel("Barangay"); }}
          >
            ⊙ Current Officials
          </button>
          <button
            className={`vh-tab ${activeTab === "candidates" ? "active" : ""}`}
            onClick={() => { setActiveTab("candidates"); setActiveLevel("Barangay"); }}
          >
            ↗ Running Candidates
          </button>
        </div>
      </div>

      {/* Content Section */}
      <section className="vh-section">
        <h2 className="vh-section-title">
          {activeTab === "officials"
            ? "Current Government Officials"
            : "2028 Election Candidates"}
        </h2>
        <p className="vh-section-sub">
          {activeTab === "officials"
            ? "View performance metrics, achievements, and accomplished platforms of elected officials currently in office"
            : "Explore candidates running for office from your barangay to the national government"}
        </p>

        {/* Level Filter */}
        <div className="vh-levels">
          {levels.map((level) => (
            <button
              key={level}
              className={`vh-level-btn ${activeLevel === level ? "active" : ""}`}
              onClick={() => setActiveLevel(level)}
            >
              📍 {level}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="vh-cards">
          {filtered.length === 0 ? (
            <p className="vh-empty">No data available for this level.</p>
          ) : (
            filtered.map((person) => (
              <div className="vh-card" key={person.id}>
                <div className="vh-card-header">
                  <div className="vh-avatar">
                    <div className="vh-avatar-icon">👤</div>
                  </div>
                  <div className="vh-card-info">
                    <h3 className="vh-card-name">{person.name}</h3>
                    <p className="vh-card-position">{person.position}</p>
                    <span className="vh-card-party">{person.party}</span>
                  </div>
                </div>

                {activeTab === "officials" && (
                  <div className="vh-badges">
                    <span className="vh-badge green">
                      ↗{person.satisfaction}% Satisfaction Rating
                    </span>
                    <span className="vh-badge green">
                      ↗{person.transparency}% Transparency
                    </span>
                  </div>
                )}

                <div className="vh-platform">
                  <p className="vh-platform-title">🔵 Campaign Platform</p>
                  <ul className="vh-platform-list">
                    {person.platforms.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <button className="vh-profile-btn">
                  {activeTab === "officials"
                    ? "View Full Profile & Performance"
                    : "View Full Profile"}
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="vh-footer">
        <div className="vh-footer-inner">
          <div className="vh-footer-brand">
            <div className="vh-footer-logo">
              <span>⊟</span> PoliProfile
            </div>
            <p>
              Empowering Filipino citizens with comprehensive political
              information for informed decision-making.
            </p>
          </div>
          <div className="vh-footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li>Current Officials</li>
              <li>Running Candidates</li>
              <li>Voter Login</li>
            </ul>
          </div>
          <div className="vh-footer-about">
            <h4>About</h4>
            <p>
              PoliProfile connects Filipino voters with political candidates and
              government officials at all levels.
            </p>
          </div>
        </div>
        <div className="vh-footer-copy">
          © 2026 PoliProfile. All rights reserved.
        </div>
      </footer>
    </div>
  );
}