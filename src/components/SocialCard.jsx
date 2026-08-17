// src/components/SocialCard.jsx
import React from "react";
import "./SocialCard.css";

const icons = {
  linkedin: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6.5 8.2H3.2V19h3.3V8.2ZM4.85 3A1.93 1.93 0 1 0 4.85 6.86 1.93 1.93 0 0 0 4.85 3ZM20.8 12.8c0-3.25-1.73-4.77-4.05-4.77a3.5 3.5 0 0 0-3.18 1.75V8.2h-3.3V19h3.3v-5.34c0-1.4.27-2.77 2.02-2.77 1.72 0 1.74 1.61 1.74 2.86V19h3.3l.17-6.2Z" />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.25" />
      <circle className="social-card__icon-dot" cx="17.4" cy="6.7" r="1" />
    </svg>
  ),
};

function SocialCard({ platform, title, detail, href, linkLabel, delay = 0 }) {
  return (
    <a
      className={`social-card social-card--${platform} fade-up`}
      style={{ animationDelay: `${delay}s` }}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${linkLabel} (opens in a new tab)`}
    >
      <div className="social-card__icon">{icons[platform]}</div>
      <div className="social-card__copy">
        <h2 className="social-card__title">{title}</h2>
        <p className="social-card__detail">{detail}</p>
      </div>
      <div className="social-card__link">
        {linkLabel} <span aria-hidden>↗</span>
      </div>
    </a>
  );
}

export default SocialCard;
