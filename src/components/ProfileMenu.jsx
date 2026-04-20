import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import OverlayModal from "./OverlayModal";
import "./profileMenu.css";

const stars = [1, 2, 3, 4, 5];

export default function ProfileMenu({ user, role }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [ratingComment, setRatingComment] = useState("");
  const [feedback, setFeedback] = useState("");
  const navigate = useNavigate();
  const menuRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const initials =
    user?.user_metadata?.full_name
      ?.split(" ")
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase())
      .slice(0, 2)
      .join("") || "P";

  const profileRoute = role === "candidate" ? "/my-profile" : "/voter/profile";

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("userRole");
    navigate("/");
  };

  const saveRating = () => {
    localStorage.setItem(
      "siteRating",
      JSON.stringify({ rating, comment: ratingComment, createdAt: Date.now() })
    );
    setShowRateModal(false);
    setRatingComment("");
  };

  const saveFeedback = () => {
    localStorage.setItem(
      "siteFeedback",
      JSON.stringify({ feedback, createdAt: Date.now() })
    );
    setShowFeedbackModal(false);
    setFeedback("");
  };

  return (
    <div className="pm-wrap" ref={menuRef}>
      <button className="pm-avatar-btn" onClick={() => setIsOpen((prev) => !prev)}>
        {initials}
      </button>

      {isOpen && (
        <div className="pm-dropdown">
          <button onClick={() => navigate(profileRoute)}>My Profile</button>
          <button onClick={() => navigate("/settings")}>Settings</button>
          <button onClick={() => setShowRateModal(true)}>Rate Us</button>
          <button onClick={() => setShowFeedbackModal(true)}>Give Feedback</button>
          <button onClick={() => navigate("/help")}>Help & FAQ</button>
          <button className="pm-danger" onClick={logout}>
            Log Out
          </button>
        </div>
      )}

      {showRateModal && (
        <OverlayModal title="Rate PoliProfile" onClose={() => setShowRateModal(false)}>
          <div className="pm-modal-body">
            <div className="pm-stars">
              {stars.map((star) => (
                <button
                  key={star}
                  className={star <= rating ? "active" : ""}
                  onClick={() => setRating(star)}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              placeholder="Tell us what you think..."
              value={ratingComment}
              onChange={(event) => setRatingComment(event.target.value)}
            />
            <button className="pm-submit" onClick={saveRating}>
              Submit Rating
            </button>
          </div>
        </OverlayModal>
      )}

      {showFeedbackModal && (
        <OverlayModal title="Give Feedback" onClose={() => setShowFeedbackModal(false)}>
          <div className="pm-modal-body">
            <textarea
              placeholder="Share your feedback..."
              value={feedback}
              onChange={(event) => setFeedback(event.target.value)}
            />
            <button className="pm-submit" onClick={saveFeedback}>
              Submit Feedback
            </button>
          </div>
        </OverlayModal>
      )}
    </div>
  );
}
