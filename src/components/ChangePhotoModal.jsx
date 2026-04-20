import { useMemo, useRef, useState } from "react";
import OverlayModal from "./OverlayModal";
import { faceMemeAvatars } from "../faceMemeAvatars";
import "./changePhotoModal.css";

function isJpgOrPng(file) {
  const type = file?.type || "";
  return type === "image/jpeg" || type === "image/png";
}

export default function ChangePhotoModal({ currentUrl, onClose, onConfirm }) {
  const [tab, setTab] = useState("upload"); // upload | meme
  const [pendingUrl, setPendingUrl] = useState(currentUrl || "");
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const memes = useMemo(() => faceMemeAvatars, []);

  const pickFile = () => inputRef.current?.click();

  const onFileSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");

    if (!isJpgOrPng(file)) {
      setError("JPG/PNG only.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Max file size is 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setPendingUrl(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const confirm = () => {
    if (!pendingUrl) {
      setError("Please select an image first.");
      return;
    }
    onConfirm(pendingUrl);
    onClose();
  };

  return (
    <OverlayModal title="Change Photo" onClose={onClose}>
      <div className="cpm-wrap">
        <div className="cpm-tabs">
          <button className={tab === "upload" ? "active" : ""} onClick={() => setTab("upload")} type="button">
            Upload Your Own
          </button>
          <button className={tab === "meme" ? "active" : ""} onClick={() => setTab("meme")} type="button">
            Choose a Meme
          </button>
        </div>

        <div className="cpm-preview">
          <div className="cpm-preview-circle">
            {pendingUrl ? <img src={pendingUrl} alt="Preview" /> : <div className="cpm-empty">No image</div>}
          </div>
          <div className="cpm-preview-hint">Preview</div>
        </div>

        {tab === "upload" && (
          <div className="cpm-upload">
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png"
              style={{ display: "none" }}
              onChange={onFileSelected}
            />
            <button className="cpm-action" type="button" onClick={pickFile}>
              Choose JPG/PNG (max 5MB)
            </button>
          </div>
        )}

        {tab === "meme" && (
          <div className="cpm-grid">
            {memes.map((url) => (
              <button
                key={url}
                type="button"
                className={`cpm-meme ${pendingUrl === url ? "selected" : ""}`}
                onClick={() => {
                  setError("");
                  setPendingUrl(url);
                }}
                aria-label="Select meme avatar"
              >
                <img src={url} alt="Meme option" />
              </button>
            ))}
          </div>
        )}

        {error && <div className="cpm-error">{error}</div>}

        <div className="cpm-actions">
          <button className="cpm-confirm" type="button" onClick={confirm}>
            Confirm
          </button>
          <button className="cpm-cancel" type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </OverlayModal>
  );
}

