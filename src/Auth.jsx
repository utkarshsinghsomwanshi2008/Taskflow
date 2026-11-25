import React, { useState } from "react";
import {
  Leaf,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

const USERS_KEY = "taskflow-users";
const SESSION_KEY = "taskflow-session";

export function getCurrentUser() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}

export function logoutUser() {
  sessionStorage.removeItem(SESSION_KEY);
}

export default function Auth({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const updateField = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const getUsers = () => {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    } catch {
      return [];
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    setTimeout(() => {
      const users = getUsers();
      const email = form.email.trim().toLowerCase();

      if (mode === "signup") {
        if (!form.name.trim()) {
          setError("Please enter your name.");
          setLoading(false);
          return;
        }

        if (form.password.length < 6) {
          setError("Password must be at least 6 characters.");
          setLoading(false);
          return;
        }

        if (form.password !== form.confirmPassword) {
          setError("Passwords do not match.");
          setLoading(false);
          return;
        }

        if (users.some((u) => u.email === email)) {
          setError("An account with this email already exists.");
          setLoading(false);
          return;
        }

        const newUser = {
          id: Date.now(),
          name: form.name.trim(),
          email,
          password: form.password,
          createdAt: new Date().toISOString(),
        };

        localStorage.setItem(
          USERS_KEY,
          JSON.stringify([...users, newUser])
        );

        setSuccess("Account created! You can now sign in.");
        setMode("login");

        setForm({
          name: "",
          email: form.email,
          password: "",
          confirmPassword: "",
        });

        setLoading(false);
        return;
      }

      const user = users.find(
        (u) => u.email === email && u.password === form.password
      );

      if (!user) {
        setError("Invalid email or password.");
        setLoading(false);
        return;
      }

      const sessionUser = {
        id: user.id,
        name: user.name,
        email: user.email,
      };

      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify(sessionUser)
      );

      setLoading(false);
      onLogin?.(sessionUser);
    }, 450);
  };

  const switchMode = () => {
    setMode(mode === "login" ? "signup" : "login");
    setError("");
    setSuccess("");

    setForm({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  return (
    <div className="auth-page">

      {/* LEFT BRAND PANEL */}
      <div className="auth-brand-panel">

        <div className="auth-brand">
          <div className="auth-logo-icon">
            <Leaf size={25} />
          </div>

          <span>
            taskflow<span className="auth-brand-dot">.</span>
          </span>
        </div>

        <div className="auth-brand-content">
          <div className="auth-pill">
            <Sparkles size={15} />
            A LITTLE MORE FOCUS
          </div>

          <h1>
            Make space
            <br />
            for what
            <br />
            <span>matters.</span>
          </h1>

          <p>
            Less chaos. More clarity.
            <br />
            One task at a time.
          </p>

          <div className="auth-feature-list">
            <div>
              <CheckCircle2 size={18} />
              Organize your day
            </div>

            <div>
              <CheckCircle2 size={18} />
              Track your progress
            </div>

            <div>
              <CheckCircle2 size={18} />
              Focus on meaningful work
            </div>
          </div>
        </div>

        <div className="auth-brand-footer">
          YOUR SPACE. YOUR PACE.
        </div>

        <div className="auth-decoration auth-decoration-one" />
        <div className="auth-decoration auth-decoration-two" />
      </div>

      {/* RIGHT LOGIN PANEL */}
      <div className="auth-form-panel">

        <div className="auth-form-container">

          <div className="auth-mobile-brand">
            <Leaf size={23} />
            <strong>
              taskflow<span>.</span>
            </strong>
          </div>

          <div className="auth-form-top">
            <span className="auth-welcome">
              {mode === "login" ? "WELCOME BACK" : "GET STARTED"}
            </span>

            <h2>
              {mode === "login"
                ? "Good to see you."
                : "Create your space."}
            </h2>

            <p>
              {mode === "login"
                ? "Pick up where you left off."
                : "Start building a more focused day."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">

            {mode === "signup" && (
              <div className="auth-field">
                <label>Full name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Your name"
                  value={form.name}
                  onChange={updateField}
                  required
                />
              </div>
            )}

            <div className="auth-field">
              <label>Email address</label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={updateField}
                required
              />
            </div>

            <div className="auth-field">
              <label>Password</label>

              <div className="auth-password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={updateField}
                  required
                />

                <button
                  type="button"
                  className="auth-eye"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {mode === "signup" && (
              <div className="auth-field">
                <label>Confirm password</label>

                <div className="auth-password-wrapper">
                  <input
                    type={showConfirm ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Repeat your password"
                    value={form.confirmPassword}
                    onChange={updateField}
                    required
                  />

                  <button
                    type="button"
                    className="auth-eye"
                    onClick={() => setShowConfirm(!showConfirm)}
                  >
                    {showConfirm ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>
            )}

            {error && <div className="auth-error">{error}</div>}
            {success && <div className="auth-success">{success}</div>}

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                ? "Sign in"
                : "Create account"}

              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="auth-switch">
            {mode === "login" ? (
              <>
                Don't have an account?
                <button onClick={switchMode}>Create one</button>
              </>
            ) : (
              <>
                Already have an account?
                <button onClick={switchMode}>Sign in</button>
              </>
            )}
          </div>

          <div className="auth-bottom">
            <span>© 2026 TaskFlow</span>
            <span>Made for a calmer workflow.</span>
          </div>

        </div>
      </div>
    </div>
  );
}