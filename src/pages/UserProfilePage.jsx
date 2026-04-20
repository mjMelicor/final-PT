import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabase";
import OverlayModal from "../components/OverlayModal";
import ChangePhotoModal from "../components/ChangePhotoModal";
import BackToHomeButton from "../components/BackToHomeButton";
import { faceMemeAvatars } from "../faceMemeAvatars";
import "./userProfilePage.css";
import { useNavigate } from "react-router-dom";

// Face memes only — must show a human face clearly
const FACE_MEME_AVATARS = faceMemeAvatars;

const POSITIONS = [
  "Barangay Captain",
  "Barangay Kagawad",
  "SK Chairperson",
  "City Mayor",
  "City Vice Mayor",
  "City Councilor",
  "Provincial Governor",
  "Provincial Vice Governor",
  "Provincial Board Member",
  "Senator",
  "House Representative",
];

const DOC_FIELDS = [
  { key: "coc", label: "Certificate of Candidacy (COC)", accept: ".pdf,image/*" },
  { key: "govId", label: "Valid Government ID", accept: "image/*" },
  { key: "voterProof", label: "Voter's ID / Voter Certification", accept: "image/*" },
  { key: "brgyClearance", label: "Barangay Clearance", accept: "image/*" },
  { key: "itrOrSaln", label: "Optional: Latest ITR or SALN", accept: ".pdf,image/*" },
];

function safeJsonParse(raw, fallback) {
  try {
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function bytesToMB(bytes) {
  return Math.round((bytes / (1024 * 1024)) * 10) / 10;
}

const isImageType = (file) => {
  return file && ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type);
};

export default function UserProfilePage() {
  const [user, setUser] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [showChangePhoto, setShowChangePhoto] = useState(false);
  const navigate = useNavigate();

  const [showEditModal, setShowEditModal] = useState(false);
  const [privateInfo, setPrivateInfo] = useState({
    fullName: "",
    birthday: "",
    address: "",
    contactNumber: "",
    email: "",
  });

  const [candidateDraft, setCandidateDraft] = useState({
    position: "",
    barangay: "",
    municipality: "",
    province: "",
    party: "",
    platform: "",
    documents: {},
    certify: false,
    status: "not_started", // not_started | pending | verified
    submittedAt: null,
  });

  useEffect(() => {
    const load = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };

    load();
  }, []);

  const role = (user?.user_metadata?.role || "").toLowerCase();
  const userKey = useMemo(() => user?.id || user?.email || "anonymous", [user]);

  useEffect(() => {
    if (!user) return;

    const storedAvatar = localStorage.getItem(`profileAvatar:${userKey}`);
    if (storedAvatar) {
      setAvatarUrl(storedAvatar);
    } else {
      const random = FACE_MEME_AVATARS[Math.floor(Math.random() * FACE_MEME_AVATARS.length)];
      setAvatarUrl(random);
      localStorage.setItem(`profileAvatar:${userKey}`, random);
    }

    const storedPrivate = safeJsonParse(localStorage.getItem(`privateProfile:${userKey}`), null);
    const defaultName = user.user_metadata?.full_name || "";
    const defaultEmail = user.email || "";
    const nextPrivate = {
      fullName: storedPrivate?.fullName ?? defaultName,
      birthday: storedPrivate?.birthday ?? "",
      address: storedPrivate?.address ?? "",
      contactNumber: storedPrivate?.contactNumber ?? "",
      email: storedPrivate?.email ?? defaultEmail,
    };
    setPrivateInfo(nextPrivate);

    const storedReg = safeJsonParse(localStorage.getItem(`candidateRegistration:${userKey}`), null);
    if (storedReg) {
      setCandidateDraft((prev) => ({
        ...prev,
        ...storedReg,
        documents: storedReg.documents || {},
      }));
    }
  }, [user, userKey]);

  const savePrivateInfo = () => {
    localStorage.setItem(`privateProfile:${userKey}`, JSON.stringify(privateInfo));
    setShowEditModal(false);
  };

  const saveAvatar = (nextUrl) => {
    setAvatarUrl(nextUrl);
    localStorage.setItem(`profileAvatar:${userKey}`, nextUrl);
  };

  const candidateBadge = useMemo(() => {
    if (candidateDraft.status === "pending") return "⏳ Verification Pending";
    if (candidateDraft.status === "verified") return "✅ Verified Candidate";
    return null;
  }, [candidateDraft.status]);

  const saveCandidateDraft = (next) => {
    setCandidateDraft(next);
    localStorage.setItem(`candidateRegistration:${userKey}`, JSON.stringify(next));
  };

  const updateCandidateField = (key, value) => {
    const next = { ...candidateDraft, [key]: value };
    saveCandidateDraft(next);
  };

  const onDocSelected = (docKey, file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert(`Max file size is 5MB. Your file is ${bytesToMB(file.size)}MB.`);
      return;
    }

    const base = {
      name: file.name,
      type: file.type || "application/octet-stream",
      size: file.size,
      lastModified: file.lastModified,
      previewDataUrl: null,
    };

    if (isImageType(file)) {
      const reader = new FileReader();
      reader.onload = () => {
        const nextDocs = { ...(candidateDraft.documents || {}) };
        nextDocs[docKey] = { ...base, previewDataUrl: String(reader.result || "") };
        saveCandidateDraft({ ...candidateDraft, documents: nextDocs });
      };
      reader.readAsDataURL(file);
      return;
    }

    const nextDocs = { ...(candidateDraft.documents || {}) };
    nextDocs[docKey] = base;
    saveCandidateDraft({ ...candidateDraft, documents: nextDocs });
  };

  const requiredDocKeys = ["coc", "govId", "voterProof", "brgyClearance"];

  return (
    <main className="upp-wrap">
      <BackToHomeButton onClick={() => navigate("/")} />
      <div className="upp-card">
        <div className="upp-top">
          <div
            className="upp-avatar-wrap"
            onClick={() => setShowChangePhoto(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setShowChangePhoto(true);
              }
            }}
          >
            <img src={avatarUrl} alt="Profile" className="upp-avatar" />
            <div className="upp-avatar-overlay">
              <span className="upp-camera">📷</span>
              <span>Change Photo</span>
            </div>
          </div>

          <div className="upp-head">
            <h1>My Profile</h1>
            <div className="upp-sub">
              <span className="upp-pill">{role ? role.toUpperCase() : "USER"}</span>
              {candidateBadge && <span className="upp-pill warn">{candidateBadge}</span>}
            </div>
          </div>
        </div>

        <div className="upp-info">
          <div className="upp-row">
            <span className="upp-label">Name</span>
            <span className="upp-value">{user?.user_metadata?.full_name || "N/A"}</span>
          </div>
          <div className="upp-row">
            <span className="upp-label">Email</span>
            <span className="upp-value">{user?.email || "N/A"}</span>
          </div>
          <div className="upp-row">
            <span className="upp-label">Role</span>
            <span className="upp-value">{user?.user_metadata?.role || "N/A"}</span>
          </div>
        </div>

        <div className="upp-actions">
          <button className="upp-btn primary" onClick={() => setShowEditModal(true)}>
            Edit Profile
          </button>

          {role === "voter" && (
            <button className="upp-btn" onClick={() => navigate("/register-candidate")}>
              Register as Candidate
            </button>
          )}
        </div>

        <div className="upp-note">
          Private information is only visible to you and is saved locally on this device.
        </div>
      </div>

      {showEditModal && (
        <OverlayModal title="Edit Profile (Private)" onClose={() => setShowEditModal(false)}>
          <div className="upp-modal">
            <div className="upp-field">
              <label>Full Name</label>
              <input
                value={privateInfo.fullName}
                onChange={(e) => setPrivateInfo((p) => ({ ...p, fullName: e.target.value }))}
                placeholder="Full Name"
              />
            </div>
            <div className="upp-field">
              <label>Birthday</label>
              <input
                type="date"
                value={privateInfo.birthday}
                onChange={(e) => setPrivateInfo((p) => ({ ...p, birthday: e.target.value }))}
              />
            </div>
            <div className="upp-field">
              <label>Address</label>
              <input
                value={privateInfo.address}
                onChange={(e) => setPrivateInfo((p) => ({ ...p, address: e.target.value }))}
                placeholder="Home address"
              />
            </div>
            <div className="upp-field">
              <label>Contact Number</label>
              <input
                value={privateInfo.contactNumber}
                onChange={(e) => setPrivateInfo((p) => ({ ...p, contactNumber: e.target.value }))}
                placeholder="09xx..."
              />
            </div>
            <div className="upp-field">
              <label>Email</label>
              <input
                type="email"
                value={privateInfo.email}
                onChange={(e) => setPrivateInfo((p) => ({ ...p, email: e.target.value }))}
                placeholder="Email"
              />
            </div>

            <div className="upp-modal-actions">
              <button className="upp-btn primary" onClick={savePrivateInfo}>
                Save
              </button>
              <button className="upp-btn" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </OverlayModal>
      )}

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
