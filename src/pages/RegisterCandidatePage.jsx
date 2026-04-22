import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import OverlayModal from "../components/OverlayModal";
import BackToHomeButton from "../components/BackToHomeButton";
import { sendCandidateNotification } from "../services/brevoService"; // ✅ ADDED
import "./registerCandidatePage.css";

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
  { key: "coc", label: "Certificate of Candidacy (COC)", accept: ".pdf,image/*", required: true },
  { key: "govId", label: "Valid Government ID", accept: "image/*", required: true },
  { key: "voterProof", label: "Voter's ID / Voter Certification", accept: "image/*", required: true },
  { key: "brgyClearance", label: "Barangay Clearance", accept: "image/*", required: true },
  { key: "itrOrSaln", label: "Optional: Latest ITR or SALN", accept: ".pdf,image/*", required: false },
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

function isImageType(mime) {
  return typeof mime === "string" && mime.startsWith("image/");
}

export default function RegisterCandidatePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const userKey = useMemo(() => user?.id || user?.email || "anonymous", [user]);

  const [draft, setDraft] = useState({
    position: "",
    barangay: "",
    municipality: "",
    province: "",
    party: "",
    platform: "",
    documents: {},
    certify: false,
    status: "not_started",
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

  useEffect(() => {
    if (!user) return;
    const stored = safeJsonParse(localStorage.getItem(`candidateRegistration:${userKey}`), null);
    if (stored) {
      setDraft((prev) => ({ ...prev, ...stored, documents: stored.documents || {} }));
    }
  }, [user, userKey]);

  const saveDraft = (next) => {
    setDraft(next);
    localStorage.setItem(`candidateRegistration:${userKey}`, JSON.stringify(next));
  };

  const updateField = (key, value) => saveDraft({ ...draft, [key]: value });

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
      uploadedAt: Date.now(),
      status: "Submitted",
      rejectReason: "",
      previewDataUrl: null,
    };

    if (isImageType(file.type)) {
      const reader = new FileReader();
      reader.onload = () => {
        const nextDocs = { ...(draft.documents || {}) };
        nextDocs[docKey] = { ...base, previewDataUrl: String(reader.result || "") };
        saveDraft({ ...draft, documents: nextDocs });
      };
      reader.readAsDataURL(file);
      return;
    }

    const nextDocs = { ...(draft.documents || {}) };
    nextDocs[docKey] = base;
    saveDraft({ ...draft, documents: nextDocs });
  };

  const canGoStep2 = Boolean(draft.position && draft.province);
  const requiredDocKeys = DOC_FIELDS.filter((d) => d.required).map((d) => d.key);
  const hasAllDocs = requiredDocKeys.every((k) => Boolean(draft.documents?.[k]?.name));
  const canSubmit = hasAllDocs && draft.certify;

  // ✅ UPDATED: sends email notification after submission
  const submit = async () => {
    if (!canSubmit) return;
    const next = { ...draft, status: "pending", submittedAt: Date.now() };
    saveDraft(next);

    try {
      if (user?.email) {
        await sendCandidateNotification(
          user.email,
          user.user_metadata?.full_name || "Candidate",
          user.user_metadata?.full_name || "Candidate",
          draft.position
        );
      }
    } catch (err) {
      console.error("Email notification failed:", err);
      // ✅ won't block navigation even if email fails
    }

    navigate("/voter/profile");
  };

  const backToHomeClicked = () => setShowLeaveConfirm(true);

  const leave = () => {
    setShowLeaveConfirm(false);
    navigate("/");
  };

  return (
    <main className="rcp-root">
      <BackToHomeButton onClick={backToHomeClicked} />

      <header className="rcp-hero">
        <div className="rcp-hero-inner">
          <h1>Register as Candidate</h1>
          <p>Submit your declaration and documents for verification.</p>
        </div>
      </header>

      <section className="rcp-content">
        <div className="rcp-card">
          <div className="rcp-steps">
            <span className={step === 1 ? "active" : ""}>1. Declaration</span>
            <span className={step === 2 ? "active" : ""}>2. Documents</span>
            <span className={step === 3 ? "active" : ""}>3. Review</span>
          </div>

          {step === 1 && (
            <>
              <div className="rcp-field">
                <label>Position running for</label>
                <select value={draft.position} onChange={(e) => updateField("position", e.target.value)}>
                  <option value="">Select position...</option>
                  {POSITIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rcp-grid2">
                <div className="rcp-field">
                  <label>Barangay</label>
                  <input value={draft.barangay} onChange={(e) => updateField("barangay", e.target.value)} />
                </div>
                <div className="rcp-field">
                  <label>Municipality / City</label>
                  <input value={draft.municipality} onChange={(e) => updateField("municipality", e.target.value)} />
                </div>
              </div>

              <div className="rcp-field">
                <label>Province</label>
                <input value={draft.province} onChange={(e) => updateField("province", e.target.value)} />
              </div>

              <div className="rcp-field">
                <label>Party affiliation (optional)</label>
                <input value={draft.party} onChange={(e) => updateField("party", e.target.value)} />
              </div>

              <div className="rcp-field">
                <label>Campaign platform</label>
                <textarea value={draft.platform} onChange={(e) => updateField("platform", e.target.value)} />
              </div>

              <div className="rcp-actions">
                <button className="rcp-btn primary" disabled={!canGoStep2} onClick={() => setStep(2)}>
                  Next
                </button>
              </div>

              {!canGoStep2 && <div className="rcp-hint">Select a position and enter your province to continue.</div>}
            </>
          )}

          {step === 2 && (
            <>
              <div className="rcp-upload-hint">Accepted formats: PDF, JPG, PNG. Max file size: 5MB.</div>
              <div className="rcp-upload-list">
                {DOC_FIELDS.map((f) => {
                  const doc = draft.documents?.[f.key];
                  return (
                    <div className="rcp-upload" key={f.key}>
                      <div className="rcp-upload-head">
                        <div className="rcp-upload-title">
                          {f.label} {f.required ? <span className="rcp-req">*</span> : null}
                        </div>
                        <label className="rcp-upload-btn">
                          Upload
                          <input type="file" accept={f.accept} onChange={(e) => onDocSelected(f.key, e.target.files?.[0])} />
                        </label>
                      </div>
                      <div className="rcp-upload-meta">
                        <div className="rcp-upload-file">{doc?.name || "No file uploaded yet"}</div>
                        {doc?.size ? <div>{bytesToMB(doc.size)}MB</div> : null}
                      </div>
                      {doc?.previewDataUrl ? <img className="rcp-preview" src={doc.previewDataUrl} alt="Preview" /> : null}
                    </div>
                  );
                })}
              </div>

              <div className="rcp-actions">
                <button className="rcp-btn" onClick={() => setStep(1)}>
                  Back
                </button>
                <button className="rcp-btn primary" disabled={!hasAllDocs} onClick={() => setStep(3)}>
                  Next
                </button>
              </div>

              {!hasAllDocs && <div className="rcp-hint">Upload all required documents to continue.</div>}
            </>
          )}

          {step === 3 && (
            <>
              <div className="rcp-review">
                <div className="rcp-review-row">
                  <span>Position</span>
                  <b>{draft.position || "—"}</b>
                </div>
                <div className="rcp-review-row">
                  <span>Location</span>
                  <b>{[draft.barangay, draft.municipality, draft.province].filter(Boolean).join(", ") || "—"}</b>
                </div>
                <div className="rcp-review-row">
                  <span>Party</span>
                  <b>{draft.party || "Independent"}</b>
                </div>
                <div className="rcp-review-row">
                  <span>Documents</span>
                  <b>{hasAllDocs ? "Complete" : "Incomplete"}</b>
                </div>
              </div>

              <label className="rcp-check">
                <input type="checkbox" checked={draft.certify} onChange={(e) => updateField("certify", e.target.checked)} />
                I certify that all information provided is true and accurate.
              </label>

              <div className="rcp-actions">
                <button className="rcp-btn" onClick={() => setStep(2)}>
                  Back
                </button>
                <button className="rcp-btn primary" disabled={!canSubmit} onClick={submit}>
                  Submit for Verification
                </button>
              </div>

              {!canSubmit && <div className="rcp-hint">Check the certification box to enable submission.</div>}
            </>
          )}
        </div>
      </section>

      {showLeaveConfirm && (
        <OverlayModal title="Leave this page?" onClose={() => setShowLeaveConfirm(false)}>
          <div className="rcp-confirm">
            <p>Are you sure? Your progress may not be saved.</p>
            <div className="rcp-actions">
              <button className="rcp-btn primary" onClick={() => setShowLeaveConfirm(false)}>
                Stay
              </button>
              <button className="rcp-btn" onClick={leave}>
                Leave
              </button>
            </div>
          </div>
        </OverlayModal>
      )}
    </main>
  );
}

