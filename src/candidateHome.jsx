import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./candidateHome.css";
import { supabase } from "./supabase";
import ProfileMenu from "./components/ProfileMenu";

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

        {/* OTHER TABS */}
        {activeTab !== "profile" && (
          <>
            <h2 className="vh-section-title">Dashboard</h2>
            <p className="vh-section-sub">
              Filter data by government level
            </p>

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

            <div className="vh-empty">
              Data will display here...
            </div>
          </>
        )}

      </div>
    </div>
  );
}