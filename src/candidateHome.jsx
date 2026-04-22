import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./candidateHome.css";
import { supabase } from "./supabase";
import ProfileMenu from "./components/ProfileMenu";
import { getElectionDatasets, searchDataset } from "./services/openDataService"; // ✅ ADDED

const LEVELS = ["Barangay", "Municipal", "Provincial", "National"];

export default function CandidateHome() {
  const [activeTab, setActiveTab] = useState("candidates");
  const [activeLevel, setActiveLevel] = useState("Barangay");

  const [profile, setProfile] = useState({
    name: "",
    position: "",
    party: "",
    bio: ""
  });

  const [savedProfile, setSavedProfile] = useState(null);
  const [user, setUser] = useState(null);

  // ✅ ADDED: Open Data PH states
  const [electionDatasets, setElectionDatasets] = useState([]);
  const [officialDatasets, setOfficialDatasets] = useState([]);
  const [loadingElections, setLoadingElections] = useState(false);
  const [loadingOfficials, setLoadingOfficials] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const role = session?.user?.user_metadata?.role?.toLowerCase();
      if (!session?.user || role !== "candidate") {
        navigate("/", { replace: true });
        return;
      }

      localStorage.setItem("userRole", role);
      setUser(session.user);

      const stored = localStorage.getItem("candidateProfile");
      if (stored) {
        setSavedProfile(JSON.parse(stored));
      }
    };

    checkSession();
  }, [navigate]);

  // ✅ ADDED: fetch data when tab changes
  useEffect(() => {
    if (activeTab === "candidates") {
      const fetch = async () => {
        setLoadingElections(true);
        try {
          const data = await getElectionDatasets();
          setElectionDatasets(data || []);
        } catch (err) {
          console.error("Failed to fetch election data:", err);
        } finally {
          setLoadingElections(false);
        }
      };
      fetch();
    }

    if (activeTab === "officials") {
      const fetch = async () => {
        setLoadingOfficials(true);
        try {
          const data = await searchDataset("government officials philippines");
          setOfficialDatasets(data || []);
        } catch (err) {
          console.error("Failed to fetch officials data:", err);
        } finally {
          setLoadingOfficials(false);
        }
      };
      fetch();
    }
  }, [activeTab]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("userRole");
    navigate("/", { replace: true });
  };

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const saveProfile = () => {
    localStorage.setItem("candidateProfile", JSON.stringify(profile));
    setSavedProfile(profile);
    alert("Profile saved successfully!");
  };

  return (
    <div className="vh-root">

      {/* NAVBAR */}
      <nav className="vh-nav">
        <div className="vh-nav-brand">Candidate Panel</div>
        <div className="vh-nav-actions">
          <button className="vh-logout-btn" onClick={handleLogout}>
            Log Out
          </button>
          <ProfileMenu user={user} role="candidate" />
        </div>
      </nav>

      {/* HERO */}
      <header className="vh-hero">
        <h1 className="vh-hero-title">Candidate Dashboard</h1>
        <p className="vh-hero-sub">
          Manage your profile and explore election data
        </p>
      </header>

      {/* TABS */}
      <div className="vh-tab-wrapper">
        <div className="vh-tabs">
          <button
            className={`vh-tab ${activeTab === "candidates" ? "active" : ""}`}
            onClick={() => setActiveTab("candidates")}
          >
            Candidates
          </button>

          <button
            className={`vh-tab ${activeTab === "officials" ? "active" : ""}`}
            onClick={() => setActiveTab("officials")}
          >
            Officials
          </button>

          <button
            className={`vh-tab ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            My Profile
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="vh-section">

        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <>
            <h2 className="vh-section-title">My Profile</h2>
            <p className="vh-section-sub">Create or update your candidate profile</p>

            <div className="vh-profile-form">
              <input
                name="name"
                placeholder="Full Name"
                value={profile.name}
                onChange={handleChange}
              />
              <input
                name="position"
                placeholder="Position (e.g. Mayor)"
                value={profile.position}
                onChange={handleChange}
              />
              <input
                name="party"
                placeholder="Political Party"
                value={profile.party}
                onChange={handleChange}
              />
              <textarea
                name="bio"
                placeholder="Short Bio"
                value={profile.bio}
                onChange={handleChange}
              />
              <button className="vh-profile-btn" onClick={saveProfile}>
                Save Profile
              </button>
            </div>

            {savedProfile && (
              <div className="vh-card">
                <h3>{savedProfile.name}</h3>
                <p><b>Position:</b> {savedProfile.position}</p>
                <p><b>Party:</b> {savedProfile.party}</p>
                <p>{savedProfile.bio}</p>
              </div>
            )}
          </>
        )}

        {/* CANDIDATES TAB - ✅ UPDATED with Open Data PH */}
        {activeTab === "candidates" && (
          <>
            <h2 className="vh-section-title">Election Datasets</h2>
            <p className="vh-section-sub">Official election data from Open Data Philippines</p>

            <div className="vh-levels">
              {LEVELS.map((lvl) => (
                <button
                  key={lvl}
                  className={`vh-level-btn ${activeLevel === lvl ? "active" : ""}`}
                  onClick={() => setActiveLevel(lvl)}
                >
                  {lvl}
                </button>
              ))}
            </div>

            {loadingElections && <p className="vh-loading">Loading election data...</p>}

            {!loadingElections && electionDatasets.length === 0 && (
              <p className="vh-empty">No election datasets found.</p>
            )}

            <div className="vh-data-list">
              {electionDatasets.map((dataset) => (
                <div key={dataset.id} className="vh-card">
                  <h3>{dataset.title}</h3>
                  <p>{dataset.notes?.slice(0, 150) || "No description available."}...</p>
                  {dataset.url && (
                    <a href={dataset.url} target="_blank" rel="noreferrer" className="vh-link">
                      View Dataset →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* OFFICIALS TAB - ✅ UPDATED with Open Data PH */}
        {activeTab === "officials" && (
          <>
            <h2 className="vh-section-title">Government Officials</h2>
            <p className="vh-section-sub">Official data from Open Data Philippines</p>

            <div className="vh-levels">
              {LEVELS.map((lvl) => (
                <button
                  key={lvl}
                  className={`vh-level-btn ${activeLevel === lvl ? "active" : ""}`}
                  onClick={() => setActiveLevel(lvl)}
                >
                  {lvl}
                </button>
              ))}
            </div>

            {loadingOfficials && <p className="vh-loading">Loading officials data...</p>}

            {!loadingOfficials && officialDatasets.length === 0 && (
              <p className="vh-empty">No officials data found.</p>
            )}

            <div className="vh-data-list">
              {officialDatasets.map((dataset) => (
                <div key={dataset.id} className="vh-card">
                  <h3>{dataset.title}</h3>
                  <p>{dataset.notes?.slice(0, 150) || "No description available."}...</p>
                  {dataset.url && (
                    <a href={dataset.url} target="_blank" rel="noreferrer" className="vh-link">
                      View Dataset →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
}