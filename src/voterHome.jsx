import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./voterHome.css";
import { supabase } from "./supabase";
import ProfileMenu from "./components/ProfileMenu";
import { LEVELS } from "./mockData";
import { getElectionDatasets, searchDataset } from "./services/openDataService";

export default function VoterHome() {
  const [activeTab, setActiveTab] = useState("officials");
  const [activeLevel, setActiveLevel] = useState("Barangay");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const [officials, setOfficials] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loadingOfficials, setLoadingOfficials] = useState(false);
  const [loadingCandidates, setLoadingCandidates] = useState(false);

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

  useEffect(() => {
    if (activeTab === "officials") {
      const fetchData = async () => {
        setLoadingOfficials(true);
        try {
          const data = await searchDataset("government officials philippines");
          setOfficials(data || []);
        } catch (err) {
          console.error("Failed to fetch officials:", err);
        } finally {
          setLoadingOfficials(false);
        }
      };
      fetchData();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "candidates") {
      const fetchData = async () => {
        setLoadingCandidates(true);
        try {
          const data = await getElectionDatasets();
          setCandidates(data || []);
        } catch (err) {
          console.error("Failed to fetch election datasets:", err);
        } finally {
          setLoadingCandidates(false);
        }
      };
      fetchData();
    }
  }, [activeTab]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("userRole");
    navigate("/", { replace: true });
  };

  const openProfile = (item) => {
    if (activeTab === "officials") {
      navigate(`/voter/officials/${item.id}`);
      return;
    }
    alert("Candidate full profile page is coming soon.");
  };

  const data = activeTab === "officials" ? officials : candidates;
  const isLoading = activeTab === "officials" ? loadingOfficials : loadingCandidates;

  return (
    <div className="vh-root">
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

      <header className="vh-hero">
        <h1 className="vh-hero-title">Philippine Political Platform</h1>
        <p className="vh-hero-sub">
          Track government performance and discover candidates from barangay to
          national level
        </p>
      </header>

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

      <section className="vh-section">
        <h2 className="vh-section-title">
          {activeTab === "officials" ? "Current Officials" : "Running Candidates"}
        </h2>
        <p className="vh-section-sub">
          {activeTab === "officials"
            ? "Browse elected officials and track their performance ratings."
            : "Discover candidates running in the upcoming elections."}
        </p>

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

        {isLoading && (
          <p className="vh-empty">Loading data from Open Data Philippines...</p>
        )}

        {!isLoading && (
          <div className="vh-cards">
            {data.length === 0 ? (
              <p className="vh-empty">
                No {activeTab === "officials" ? "officials" : "candidates"} data found.
              </p>
            ) : (
              data.map((item) => (
                <div
                  key={item.id}
                  className="vh-card"
                  role={activeTab === "officials" ? "button" : undefined}
                  tabIndex={activeTab === "officials" ? 0 : undefined}
                  onClick={() => activeTab === "officials" ? openProfile(item) : null}
                  onKeyDown={(e) => {
                    if (activeTab !== "officials") return;
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openProfile(item);
                    }
                  }}
                >
                  <div className="vh-card-header">
                    <div className="vh-card-info">
                      <h3 className="vh-card-name">{item.title}</h3>
                      <p className="vh-card-position">
                        {item.organization?.title || "Open Data Philippines"}
                      </p>
                      <span className="vh-card-party">
                        {item.metadata_modified
                          ? `Updated: ${new Date(item.metadata_modified).toLocaleDateString()}`
                          : ""}
                      </span>
                    </div>
                  </div>

                  <div className="vh-platform">
                    <p className="vh-platform-title">Description</p>
                    <p>{item.notes?.slice(0, 200) || "No description available."}</p>
                  </div>

                  {item.url && (
                    <a
                      href={item.url}
                      target ="_blank"
                      rel="noreferrer"
                      className="vh-profile-btn"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View Full Data →
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </section>
    </div>
  );
}