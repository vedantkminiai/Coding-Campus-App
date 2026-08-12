// src/pages/ContactPage.jsx
import React from "react";
import BrandMark from "../components/BrandMark";
import SocialCard from "../components/SocialCard";
import { SOCIAL_LINKS } from "../data/contact";
import "./ContactPage.css";

function ContactPage() {
  return (
    <div className="page contact-page">
      <section className="contact-page__section">
        <header className="contact-page__header fade-up">
          <BrandMark size="medium" className="contact-page__brand-mark" />
          <div className="contact-page__eyebrow">
            <span aria-hidden /> Connect with us
          </div>
          <h1 className="contact-page__title">
            Stay connected with <span>Coding Campus.</span>
          </h1>
          <p className="contact-page__intro">
            Follow our journey, discover upcoming opportunities, and see what
            our community is creating.
          </p>
        </header>

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
    </div>
  );
}

export default ContactPage;
