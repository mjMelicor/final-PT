import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import BackToHomeButton from "../components/BackToHomeButton";
import ChangePhotoModal from "../components/ChangePhotoModal";
import { faceMemeAvatars } from "../faceMemeAvatars";
import "./candidateMyProfilePage.css";

function safeJsonParse(raw, fallback) {
  try {
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function formatDate(ts) {
  if (!ts) return "—";
  const d = new Date(ts);
  return d.toLocaleDateString();
}

export default function CandidateMyProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const [avatarUrl, setAvatarUrl] = useState("");
  const [showChangePhoto, setShowChangePhoto] = useState(false);

  const userKey = useMemo(() => user?.id || user?.email || "anonymous", [user]);

  const [editingPersonal, setEditingPersonal] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState(false);
  const [personal, setPersonal] = useState({
    fullName: "",
    dob: "",
    address: "",
    contactNumber: "",
    email: "",
    voterId: "",
    position: "",
    status: "⏳ Verification Pending",
  });

  const [platform, setPlatform] = useState("");
  const [accomplishments, setAccomplishments] = useState([]);
  const [achievements, setAchievements] = useState([]);

  const [docExtra, setDocExtra] = useState([]);

  useEffect(() => {
    const load = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    load();
  }, []);

  useEffect(() => {
    if (!user) return;

    const storedAvatar = localStorage.getItem(`profileAvatar:${userKey}`);
    if (storedAvatar) {
      setAvatarUrl(storedAvatar);
    } else {
      // Face memes only — must show a human face clearly
      const random = faceMemeAvatars[Math.floor(Math.random() * faceMemeAvatars.length)];
      setAvatarUrl(random);
      localStorage.setItem(`profileAvatar:${userKey}`, random);
    }

    const storedPersonal = safeJsonParse(localStorage.getItem(`candidateMyProfile:${userKey}`), null);
    const storedPrivate = safeJsonParse(localStorage.getItem(`privateProfile:${userKey}`), null);
    const storedReg = safeJsonParse(localStorage.getItem(`candidateRegistration:${userKey}`), null);

    const defaultName = user.user_metadata?.full_name || "";
    const defaultEmail = user.email || "";

    const status =
      storedReg?.status === "verified"
        ? "✅ Verified Candidate"
        : storedReg?.status === "pending"
          ? "⏳ Verification Pending"
          : "⏳ Verification Pending";

    setPersonal({
      fullName: storedPersonal?.fullName ?? storedPrivate?.fullName ?? defaultName,
      dob: storedPersonal?.dob ?? storedPrivate?.birthday ?? "",
      address: storedPersonal?.address ?? storedPrivate?.address ?? "",
      contactNumber: storedPersonal?.contactNumber ?? storedPrivate?.contactNumber ?? "",
      email: storedPersonal?.email ?? storedPrivate?.email ?? defaultEmail,
      voterId: storedPersonal?.voterId ?? "",
      position: storedPersonal?.position ?? storedReg?.position ?? "Candidate",
      status,
    });

    setPlatform(storedPersonal?.platform ?? storedReg?.platform ?? "");
    setAccomplishments(storedPersonal?.accomplishments ?? []);
    setAchievements(storedPersonal?.achievements ?? []);
    setDocExtra(storedPersonal?.extraDocuments ?? []);
  }, [user, userKey]);

  const persist = (next) => {
    localStorage.setItem(`candidateMyProfile:${userKey}`, JSON.stringify(next));
  };

  const saveAvatar = (nextUrl) => {
    setAvatarUrl(nextUrl);
    localStorage.setItem(`profileAvatar:${userKey}`, nextUrl);
  };

  const savePersonal = () => {
    const next = {
      ...safeJsonParse(localStorage.getItem(`candidateMyProfile:${userKey}`), {}),
      ...personal,
      platform,
      accomplishments,
      achievements,
      extraDocuments: docExtra,
    };
    persist(next);
    setEditingPersonal(false);
  };

  const cancelPersonal = () => {
    const stored = safeJsonParse(localStorage.getItem(`candidateMyProfile:${userKey}`), null);
    if (stored) {
      setPersonal((p) => ({
        ...p,
        fullName: stored.fullName ?? p.fullName,
        dob: stored.dob ?? p.dob,
        address: stored.address ?? p.address,
        contactNumber: stored.contactNumber ?? p.contactNumber,
        email: stored.email ?? p.email,
        voterId: stored.voterId ?? p.voterId,
      }));
    }
    setEditingPersonal(false);
  };

  const savePlatform = () => {
    const next = {
      ...safeJsonParse(localStorage.getItem(`candidateMyProfile:${userKey}`), {}),
      ...personal,
      platform,
      accomplishments,
      achievements,
      extraDocuments: docExtra,
    };
    persist(next);
    setEditingPlatform(false);
  };

  const cancelPlatform = () => {
    const stored = safeJsonParse(localStorage.getItem(`candidateMyProfile:${userKey}`), null);
    if (stored?.platform != null) setPlatform(stored.platform);
    setEditingPlatform(false);
  };

  const addAccomplishment = () => {
    const text = prompt("Add accomplishment:");
    if (!text?.trim()) return;
    const next = [...accomplishments, text.trim()];
    setAccomplishments(next);
    persist({
      ...safeJsonParse(localStorage.getItem(`candidateMyProfile:${userKey}`), {}),
      ...personal,
      platform,
      accomplishments: next,
      achievements,
      extraDocuments: docExtra,
    });
  };

  const deleteAccomplishment = (idx) => {
    const next = accomplishments.filter((_, i) => i !== idx);
    setAccomplishments(next);
    persist({
      ...safeJsonParse(localStorage.getItem(`candidateMyProfile:${userKey}`), {}),
      ...personal,
      platform,
      accomplishments: next,
      achievements,
      extraDocuments: docExtra,
    });
  };

  const addAchievement = () => {
    const text = prompt("Add achievement:");
    if (!text?.trim()) return;
    const next = [...achievements, text.trim()];
    setAchievements(next);
    persist({
      ...safeJsonParse(localStorage.getItem(`candidateMyProfile:${userKey}`), {}),
      ...personal,
      platform,
      accomplishments,
      achievements: next,
      extraDocuments: docExtra,
    });
  };

  const editAchievement = (idx) => {
    const current = achievements[idx] || "";
    const nextText = prompt("Edit achievement:", current);
    if (nextText == null) return;
    const next = achievements.map((a, i) => (i === idx ? nextText.trim() : a));
    setAchievements(next);
    persist({
      ...safeJsonParse(localStorage.getItem(`candidateMyProfile:${userKey}`), {}),
      ...personal,
      platform,
      accomplishments,
      achievements: next,
      extraDocuments: docExtra,
    });
  };

  const deleteAchievement = (idx) => {
    const next = achievements.filter((_, i) => i !== idx);
    setAchievements(next);
    persist({
      ...safeJsonParse(localStorage.getItem(`candidateMyProfile:${userKey}`), {}),
      ...personal,
      platform,
      accomplishments,
      achievements: next,
      extraDocuments: docExtra,
    });
  };

  const uploadAdditionalDocument = () => {
    const name = prompt("Document name (e.g., Additional ID):");
    if (!name?.trim()) return;
    const next = [
      ...docExtra,
      { name: name.trim(), uploadedAt: Date.now(), status: "Submitted", rejectReason: "" },
    ];
    setDocExtra(next);
    persist({
      ...safeJsonParse(localStorage.getItem(`candidateMyProfile:${userKey}`), {}),
      ...personal,
      platform,
      accomplishments,
      achievements,
      extraDocuments: next,
    });
  };

  return (
    <main className="cmp-root">
      <BackToHomeButton onClick={() => navigate("/")} />

      <header className="cmp-hero">
        <div className="cmp-hero-inner">
          <div
            className="cmp-avatar-wrap"
            role="button"
            tabIndex={0}
            onClick={() => setShowChangePhoto(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setShowChangePhoto(true);
              }
            }}
          >
            <img src={avatarUrl} alt="Profile" className="cmp-avatar" />
            <div className="cmp-avatar-overlay">
              <span>📷</span>
              <span>Change Photo</span>
            </div>
          </div>

          <div className="cmp-hero-text">
            <h1>{personal.fullName || "Candidate"}</h1>
            <p className="cmp-sub">{personal.position}</p>
            <span className={`cmp-badge ${personal.status.includes("Verified") ? "green" : "warn"}`}>
              {personal.status}
            </span>
          </div>

          <div className="cmp-hero-actions">
            <button className="cmp-btn primary" onClick={() => setEditingPersonal(true)}>
              Edit Profile
            </button>
          </div>
        </div>
      </header>

      <section className="cmp-content">
        <div className="cmp-grid">
          <div className="cmp-section">
            <div className="cmp-section-head">
              <h2>Personal Information</h2>
              <button className="cmp-icon-btn" onClick={() => setEditingPersonal((v) => !v)} aria-label="Edit section">
                ✎
              </button>
            </div>

            <div className="cmp-card">
              <div className="cmp-row">
                <span>Full Name</span>
                {editingPersonal ? (
                  <input value={personal.fullName} onChange={(e) => setPersonal((p) => ({ ...p, fullName: e.target.value }))} />
                ) : (
                  <b>{personal.fullName || "—"}</b>
                )}
              </div>
              <div className="cmp-row">
                <span>Date of Birth</span>
                {editingPersonal ? (
                  <input type="date" value={personal.dob} onChange={(e) => setPersonal((p) => ({ ...p, dob: e.target.value }))} />
                ) : (
                  <b>{personal.dob || "—"}</b>
                )}
              </div>
              <div className="cmp-row">
                <span>Address</span>
                {editingPersonal ? (
                  <input value={personal.address} onChange={(e) => setPersonal((p) => ({ ...p, address: e.target.value }))} />
                ) : (
                  <b>{personal.address || "—"}</b>
                )}
              </div>
              <div className="cmp-row">
                <span>
                  Contact Number <span className="cmp-lock">🔒</span>
                </span>
                {editingPersonal ? (
                  <input value={personal.contactNumber} onChange={(e) => setPersonal((p) => ({ ...p, contactNumber: e.target.value }))} />
                ) : (
                  <b>{personal.contactNumber || "—"}</b>
                )}
              </div>
              <div className="cmp-row">
                <span>
                  Email <span className="cmp-lock">🔒</span>
                </span>
                {editingPersonal ? (
                  <input type="email" value={personal.email} onChange={(e) => setPersonal((p) => ({ ...p, email: e.target.value }))} />
                ) : (
                  <b>{personal.email || "—"}</b>
                )}
              </div>
              <div className="cmp-row">
                <span>
                  Voter&apos;s ID <span className="cmp-lock">🔒</span>
                </span>
                {editingPersonal ? (
                  <input value={personal.voterId} onChange={(e) => setPersonal((p) => ({ ...p, voterId: e.target.value }))} />
                ) : (
                  <b>{personal.voterId || "—"}</b>
                )}
              </div>

              {editingPersonal && (
                <div className="cmp-actions">
                  <button className="cmp-btn primary" onClick={savePersonal}>
                    Save Changes
                  </button>
                  <button className="cmp-btn" onClick={cancelPersonal}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="cmp-section">
            <div className="cmp-section-head">
              <h2>Campaign Platform</h2>
              <button className="cmp-icon-btn" onClick={() => setEditingPlatform((v) => !v)} aria-label="Edit section">
                ✎
              </button>
            </div>

            <div className="cmp-card">
              {editingPlatform ? (
                <>
                  <textarea
                    maxLength={1000}
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    placeholder="Describe your campaign platform..."
                  />
                  <div className="cmp-counter">{platform.length}/1000</div>
                  <div className="cmp-actions">
                    <button className="cmp-btn primary" onClick={savePlatform}>
                      Save Changes
                    </button>
                    <button className="cmp-btn" onClick={cancelPlatform}>
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <p className="cmp-paragraph">{platform || "—"}</p>
              )}
            </div>
          </div>

          <div className="cmp-section">
            <div className="cmp-section-head">
              <h2>Accomplishments</h2>
            </div>
            <div className="cmp-list green">
              {accomplishments.length ? (
                accomplishments.map((a, idx) => (
                  <div className="cmp-item" key={`${a}-${idx}`}>
                    <span className="cmp-bullet">✓</span>
                    <span className="cmp-text">{a}</span>
                    <button className="cmp-del" onClick={() => deleteAccomplishment(idx)} aria-label="Delete">
                      🗑
                    </button>
                  </div>
                ))
              ) : (
                <div className="cmp-empty">No accomplishments yet.</div>
              )}
              <button className="cmp-add" onClick={addAccomplishment}>
                + Add Accomplishment
              </button>
            </div>
          </div>

          <div className="cmp-section">
            <div className="cmp-section-head">
              <h2>Key Achievements</h2>
            </div>
            <div className="cmp-list purple">
              {achievements.length ? (
                achievements.map((a, idx) => (
                  <div className="cmp-item" key={`${a}-${idx}`}>
                    <span className="cmp-bullet">★</span>
                    <span className="cmp-text">{a}</span>
                    <div className="cmp-item-actions">
                      <button className="cmp-mini" onClick={() => editAchievement(idx)} aria-label="Edit">
                        ✎
                      </button>
                      <button className="cmp-mini" onClick={() => deleteAchievement(idx)} aria-label="Delete">
                        🗑
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="cmp-empty">No achievements yet.</div>
              )}
              <button className="cmp-add" onClick={addAchievement}>
                + Add Achievement
              </button>
            </div>
          </div>

          <div className="cmp-section">
            <div className="cmp-section-head">
              <h2>Submitted Documents</h2>
            </div>
            <div className="cmp-docs">
              {docExtra.map((d, idx) => (
                <div className="cmp-doc" key={`${d.name}-${idx}`}>
                  <div className="cmp-doc-top">
                    <div className="cmp-doc-name">{d.name}</div>
                    <span className={`cmp-doc-badge ${String(d.status).toLowerCase()}`}>{d.status}</span>
                  </div>
                  <div className="cmp-doc-meta">Uploaded: {formatDate(d.uploadedAt)}</div>
                  {d.status === "Rejected" && d.rejectReason ? (
                    <div className="cmp-doc-reject">Reason: {d.rejectReason}</div>
                  ) : null}
                </div>
              ))}
              <button className="cmp-add" onClick={uploadAdditionalDocument}>
                Upload Additional Document
              </button>
            </div>
          </div>
        </div>
      </section>

      {showChangePhoto && (
        <ChangePhotoModal
          currentUrl={avatarUrl}
          onClose={() => setShowChangePhoto(false)}
          onConfirm={saveAvatar}
        />
      )}
    </main>
  );
}

