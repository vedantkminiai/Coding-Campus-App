// src/components/SocialCard.jsx
import React from "react";
import "./SocialCard.css";

function SocialCard({ icon, title, detail, href, linkLabel, delay = 0 }) {
  const handleClick = () => {
    window.open(href, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className="social-card card fade-up"
      style={{ animationDelay: `${delay}s` }}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
    >
      <div className="social-card__icon">{icon}</div>
      <div className="social-card__title">{title}</div>
      <div className="social-card__detail">{detail}</div>
      <a
        className="social-card__link"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
      >
        {linkLabel} <span aria-hidden>↗</span>
      </a>
    </div>
  );
}

export default SocialCard;
