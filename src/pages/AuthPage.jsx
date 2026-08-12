// src/pages/AuthPage.jsx
import React, { useState } from "react";
import BrandMark from "../components/BrandMark";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import "./AuthPage.css";

function AuthPage() {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const switchMode = () => {
    setMode((m) => (m === "login" ? "register" : "login"));
    setError("");
    setMessage("");
  };

  const handleSubmit = async () => {
    setError("");
    setMessage("");

    if (!isSupabaseConfigured) {
      setError("Add your Supabase project URL and publishable key to .env.local, then restart the app.");
      return;
    }

    if (!email.trim() || !password.trim() || (mode === "register" && !username.trim())) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);

    try {
      if (mode === "register") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { username: username.trim() } },
        });

        if (signUpError) throw signUpError;

        if (!data.session) {
          setMessage("Account created. Check your email to confirm your account, then log in.");
        }
      } else {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (loginError) throw loginError;
      }
    } catch (submitError) {
      setError(submitError.message || "Authentication failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="page auth-page">
      <div className="auth-box fade-up">
        <BrandMark size="small" className="auth-box__brand-mark" />
        <h2 className="auth-box__title">
          {mode === "login" ? "Welcome back 👋" : "Join Coding-Campus"}
        </h2>
        <p className="auth-box__sub">
          {mode === "login"
            ? "Log in to continue your learning journey."
            : "Create an account to track your scores."}
        </p>

        {mode === "register" && (
          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <input
              id="username"
              className="form-input"
              placeholder="e.g. codeninja42"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="username"
            />
          </div>
        )}

        <div className="form-group">
          <label className="form-label" htmlFor="email">Email</label>
          <input
            id="email"
            className="form-input"
            type="email"
            placeholder="you@school.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password">Password</label>
          <input
            id="password"
            className="form-input"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
        </div>

        {error && <p className="form-error">⚠ {error}</p>}
        {message && <p className="auth-box__message">{message}</p>}

        <button
          className="btn-primary auth-box__submit"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Please wait…" : mode === "login" ? "Log In" : "Create Account"}
        </button>

        <p className="auth-box__switch">
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button onClick={switchMode}>
            {mode === "login" ? "Sign up" : "Log in"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default AuthPage;
