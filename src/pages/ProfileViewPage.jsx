import { useNavigate, useParams } from "react-router-dom";
import BackToHomeButton from "../components/BackToHomeButton";

export default function ProfileViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <main style={{ minHeight: "100vh", background: "#e8eaf6", padding: "70px 14px" }}>
      <BackToHomeButton label="← Back to My Profile" onClick={() => navigate("/my-profile")} />
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 14,
          padding: 16,
          boxShadow: "0 10px 22px rgba(17,24,39,0.08)",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Profile View</h2>
        <p style={{ color: "#6b7280", fontWeight: 700 }}>
          Profile ID: <b>{id}</b>
        </p>
        <p style={{ color: "#374151" }}>
          This route is scaffolded for future public profile viewing.
        </p>
      </div>
    </main>
  );
}

