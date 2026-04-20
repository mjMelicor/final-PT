import "./backToHomeButton.css";

export default function BackToHomeButton({ label = "← Back to Home", onClick }) {
  return (
    <button className="bth-btn" type="button" onClick={onClick}>
      {label}
    </button>
  );
}

