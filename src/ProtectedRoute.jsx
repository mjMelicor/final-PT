import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "./supabase";

export default function ProtectedRoute({ children, requiredRole }) {
  const [loading, setLoading] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setIsAllowed(false);
        setLoading(false);
        return;
      }

      const metadataRole = session.user.user_metadata?.role?.toLowerCase();
      const localRole = localStorage.getItem("userRole")?.toLowerCase();
      const role = metadataRole || localRole;

      setIsAllowed(!requiredRole || role === requiredRole.toLowerCase());
      setLoading(false);
    };

    checkSession();
  }, [requiredRole]);

  if (loading) {
    return <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>;
  }

  if (!isAllowed) {
    return <Navigate to="/" replace />;
  }

  return children;
}
