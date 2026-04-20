import './firstpage.css';
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabase";
import OverlayModal from "./components/OverlayModal";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function FirstPage() {
  const navigate = useNavigate();
  const [modalType, setModalType] = useState("");
  const [role, setRole] = useState("voter");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [friendlyError, setFriendlyError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const isSignup = modalType === "signup";

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const activeRole = session.user.user_metadata?.role?.toLowerCase();
        if (activeRole) {
          localStorage.setItem("userRole", activeRole);
          navigate(activeRole === "candidate" ? "/candidate/home" : "/voter/home");
        }
      }
    };

    checkSession();
  }, [navigate]);

  const modalTitle = useMemo(() => {
    if (!modalType) {
      return "";
    }
    return `${isSignup ? "Sign Up" : "Login"} as ${role === "candidate" ? "Candidate" : "Voter"}`;
  }, [isSignup, modalType, role]);

  const openModal = (nextType, nextRole) => {
    setModalType(nextType);
    setRole(nextRole);
    setForm({
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setFriendlyError("");
    setSuccessMessage("");
    setFieldErrors({
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  const closeModal = () => {
    setModalType("");
    setLoading(false);
    setFriendlyError("");
    setSuccessMessage("");
    setFieldErrors({
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFriendlyError("");
    setSuccessMessage("");
    setFieldErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const getFriendlyError = (error) => {
    if (!error) return null;
    const msg = error.message?.toLowerCase() || "";

    if (msg.includes("failed to fetch") || msg.includes("networkerror") || msg.includes("fetch")) {
      return "⚠️ Cannot connect to the server. Please check your internet connection and try again.";
    }
    if (msg.includes("invalid login credentials") || msg.includes("invalid email or password")) {
      return "❌ Incorrect email or password. Please try again.";
    }
    if (msg.includes("email already registered") || msg.includes("user already registered")) {
      return "📧 This email is already registered. Please log in instead.";
    }
    if (msg.includes("email not confirmed")) {
      return "📩 Please check your email and confirm your account before logging in.";
    }
    if (msg.includes("rate limit") || msg.includes("too many requests")) {
      return "⏳ Too many attempts. Please wait a moment and try again.";
    }
    if (msg.includes("password")) {
      return "🔒 Password must be at least 6 characters.";
    }
    return "Something went wrong. Please try again.";
  };

  const redirectByRole = (activeRole) => {
    navigate(activeRole === "candidate" ? "/candidate/home" : "/voter/home");
  };

  const validateSignup = () => {
    const errors = {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    if (!form.fullName.trim()) {
      errors.fullName = "Please enter your full name.";
    } else if (form.fullName.trim().length < 2) {
      errors.fullName = "Name must be at least 2 characters.";
    }

    if (!form.email.trim()) {
      errors.email = "Please enter your email address.";
    } else if (!EMAIL_REGEX.test(form.email.trim())) {
      errors.email = "Please enter a valid email address.";
    }

    if (!form.password) {
      errors.password = "Please enter a password.";
    } else if (form.password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }

    if (!form.confirmPassword) {
      errors.confirmPassword = "Please confirm your password.";
    } else if (form.password !== form.confirmPassword) {
      errors.confirmPassword = "Passwords do not match. Please try again.";
    }

    setFieldErrors(errors);
    return !Object.values(errors).some(Boolean);
  };

  const validateLogin = () => {
    const errors = {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    if (!form.email.trim()) {
      errors.email = "Please enter your email address.";
    }

    if (!form.password) {
      errors.password = "Please enter your password.";
    }

    setFieldErrors(errors);
    return !Object.values(errors).some(Boolean);
  };

  const getInputClass = (name) => {
    if (!form[name]) {
      return "";
    }
    return fieldErrors[name] ? "input-error" : "input-valid";
  };

  const submit = async (event) => {
    event.preventDefault();
    setFriendlyError("");
    setSuccessMessage("");

    const isValid = isSignup ? validateSignup() : validateLogin();
    if (!isValid) {
      return;
    }

    setLoading(true);

    if (isSignup) {
      const { error } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          data: {
            full_name: form.fullName.trim(),
            role,
          },
        },
      });

      if (error) {
        setFriendlyError(getFriendlyError(error));
        setLoading(false);
        return;
      }

      localStorage.setItem("userRole", role);
      setSuccessMessage("✅ Account created! Please check your email to confirm your account, then log in.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.email.trim(),
      password: form.password,
    });

    if (error) {
      setFriendlyError(getFriendlyError(error));
      setLoading(false);
      return;
    }

    const activeRole =
      data.user?.user_metadata?.role?.toLowerCase() || role;

    localStorage.setItem("userRole", activeRole);
    setSuccessMessage("✅ Welcome back! Redirecting...");
    setLoading(false);
    setTimeout(() => redirectByRole(activeRole), 700);
  };

  const roleLabel = role === "candidate" ? "Candidate" : "Voter";

  const AuthForm = (
    <form className="auth-form" onSubmit={submit}>
      {isSignup && (
        <>
          <input
            name="fullName"
            placeholder={`Full Name (${roleLabel})`}
            value={form.fullName}
            onChange={handleChange}
            className={getInputClass("fullName")}
          />
          {fieldErrors.fullName && <p className="auth-inline-error">{fieldErrors.fullName}</p>}
        </>
      )}
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        className={getInputClass("email")}
      />
      {fieldErrors.email && <p className="auth-inline-error">{fieldErrors.email}</p>}
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
        className={getInputClass("password")}
      />
      {fieldErrors.password && <p className="auth-inline-error">{fieldErrors.password}</p>}
      {isSignup && (
        <>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            className={getInputClass("confirmPassword")}
          />
          {fieldErrors.confirmPassword && <p className="auth-inline-error">{fieldErrors.confirmPassword}</p>}
        </>
      )}
      {friendlyError && <div className="auth-error-box">{friendlyError}</div>}
      {successMessage && <div className="auth-success-box">{successMessage}</div>}
      <button className="btn primary" type="submit" disabled={loading}>
        {loading ? (isSignup ? "Creating Account..." : "Logging in...") : isSignup ? "Create Account" : "Login"}
      </button>
    </form>
  );

  return (
    <>
      <div className="container">
        <h1>PoliProfile</h1>
        <p className="subtitle">Connect Voters with Candidates</p>

        <div className="cards">
          <div className="card voter">
            <div className="icon">🗳️</div>
            <h2>I'm a Voter</h2>
            <p>Discover candidates and make informed decisions</p>
            <button onClick={() => openModal("login", "voter")} className="btn primary">Login as Voter</button>
            <button onClick={() => openModal("signup", "voter")} className="btn secondary">Sign Up as Voter</button>
          </div>

          <div className="card candidate">
            <div className="icon">👤</div>
            <h2>I'm a Candidate</h2>
            <p>Share your platform and connect with voters</p>
            <button onClick={() => openModal("login", "candidate")} className="btn primary">Login as Candidate</button>
            <button onClick={() => openModal("signup", "candidate")} className="btn secondary">Sign Up as Candidate</button>
          </div>
        </div>
      </div>

      {modalType && (
        <OverlayModal title={modalTitle} onClose={closeModal}>
          {AuthForm}
        </OverlayModal>
      )}
    </>
  );
}

export default FirstPage;