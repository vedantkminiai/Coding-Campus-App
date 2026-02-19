// src/components/Navbar.jsx
import React from "react";
import "./Navbar.css";

function Navbar({ page, setPage, user, onLogout }) {
  const links = [
    { id: "home",      label: "Home" },
    { id: "contact",   label: "Contact" },
    { id: "hackathon", label: "Hackathon" },
    { id: "quiz",      label: "Quiz" },
  ];

  return (
    <nav className="navbar">
      <button className="navbar__logo" onClick={() => setPage("home")}>
        Coding-Campus
      </button>

      <div className="navbar__links">
        {links.map((link) => (
          <button
            key={link.id}
            className={`navbar__link ${page === link.id ? "navbar__link--active" : ""}`}
            onClick={() => setPage(link.id)}
          >
            {link.label}
          </button>
        ))}
      </div>

      {user && (
        <button className="navbar__user" onClick={onLogout} title="Click to log out">
          {user.username} &middot; logout
        </button>
      )}
    </nav>
  );
}

export default Navbar;
