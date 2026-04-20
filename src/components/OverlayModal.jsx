import { useEffect } from "react";
import "./overlayModal.css";

export default function OverlayModal({ title, children, onClose }) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="ovm-backdrop" onClick={onClose}>
      <div className="ovm-card" onClick={(event) => event.stopPropagation()}>
        <div className="ovm-header">
          <h3>{title}</h3>
          <button className="ovm-close" onClick={onClose} aria-label="Close modal">
            x
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
