// src/pages/AuthPage.jsx
import React, { useState } from "react";
import "./AuthPage.css";

function AuthPage({ onLogin, users, setUsers }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const switchMode = () => {
    setMode((m) => (m === "login" ? "register" : "login"));
    setError("");
  };

  const handleSubmit = () => {
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    if (mode === "register") {
      if (users[username]) {
        setError("Username already taken. Please choose another.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
      const newUser = {
        username,
        password,
        email,
        scores: [],
        joined: Date.now(),
      };
      setUsers({ ...users, [username]: newUser });
      onLogin(newUser);
    } else {
      const found = users[username];
      if (!found || found.password !== password) {
        setError("Invalid username or password.");
        return;
      }
      onLogin(found);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="page auth-page">
      <div className="auth-box fade-up">
        <h2 className="auth-box__title">
          {mode === "login" ? "Welcome back 👋" : "Join Coding-Campus"}
        </h2>
        <p className="auth-box__sub">
          {mode === "login"
            ? "Log in to continue your learning journey."
            : "Create an account to track your scores."}
        </p>

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

        {mode === "register" && (
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email <span style={{ color: "var(--muted)" }}>(optional)</span></label>
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
        )}

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

        <button
          className="btn-primary auth-box__submit"
          onClick={handleSubmit}
        >
          {mode === "login" ? "Log In" : "Create Account"}
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
