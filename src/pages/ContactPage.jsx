// src/pages/ContactPage.jsx
import React from "react";
import SocialCard from "../components/SocialCard";
import TeamCard from "../components/TeamCard";
import { SOCIAL_LINKS, TEAM_MEMBERS } from "../data/contact";
import "./ContactPage.css";

function ContactPage() {
  return (
    <div className="page">
      {/* Social links */}
      <section className="section">
        <div className="section-label">Get in touch</div>
        <div className="section-title">Contact &amp; Socials</div>
        <p className="section-sub">
          We'd love to hear from you — whether you're a student, sponsor, or
          just curious about what we do.
        </p>

        <div className="contact-page__grid">
          {SOCIAL_LINKS.map((link, i) => (
            <SocialCard
              key={link.title}
              {...link}
              delay={i * 0.08}
            />
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="section contact-page__team-section">
        <div className="section-label">The people</div>
        <div className="section-title">Meet the Team</div>

        <div className="contact-page__team-grid">
          {TEAM_MEMBERS.map((member, i) => (
            <TeamCard key={member.name} {...member} delay={i * 0.08} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default ContactPage;
