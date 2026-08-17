// src/components/TeamCard.jsx
import React from "react";
import "./TeamCard.css";

function getInitials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("");
}

function TeamCard({ name, role, delay = 0 }) {
  return (
    <div className="team-card fade-up" style={{ animationDelay: `${delay}s` }}>
      <div className="team-card__avatar" aria-hidden>
        {getInitials(name)}
      </div>
      <div className="team-card__name">{name}</div>
      <div className="team-card__role">{role}</div>
    </div>
  );
}

export default TeamCard;
