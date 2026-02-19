// src/pages/HomePage.jsx
import React from "react";
import "./HomePage.css";

const FEATURES = [
  { icon: "🧩", title: "DSA Quiz Game",  desc: "Test your knowledge on arrays, trees, sorting, and more. Track progress and compete with peers." },
  { icon: "🏅", title: "Hackathons",     desc: "48-hour coding sprints with real mentors, workshops, and prizes. Build something that matters." },
  { icon: "📡", title: "Workshops",      desc: "Live and recorded sessions on web dev, backend, AI, and more — led by industry professionals." },
  { icon: "🤝", title: "Community",      desc: "A welcoming space for all skill levels. Pair program, get feedback, grow together." },
];

function HomePage({ setPage }) {
  return (
    <div className="page">
      {/* Hero */}
      <section className="hero">
        <div className="hero__bg-glow" aria-hidden />
        <div className="hero__tag fade-up">Where coders level up</div>

        <h1 className="hero__heading fade-up delay-1">
          Learn. Build.<br />
          <span className="hero__heading--accent">Compete.</span>
        </h1>

        <p className="hero__sub fade-up delay-2">
          Coding-Campus is a student-driven community empowering the next
          generation of developers through workshops, hackathons, and
          interactive learning experiences.
        </p>

        <div className="hero__actions fade-up delay-3">
          <button className="btn-primary" onClick={() => setPage("quiz")}>
            Start Learning →
          </button>
          <button className="btn-secondary" onClick={() => setPage("hackathon")}>
            View Hackathon
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="section">
        <div className="section-label">What we do</div>
        <div className="section-title">Built for builders</div>
        <div className="home__features">
          {FEATURES.map((f, i) => (
            <div className="card home__feature-card fade-up" key={f.title}
              style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="home__feature-icon">{f.icon}</div>
              <div className="home__feature-title">{f.title}</div>
              <div className="home__feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default HomePage;
