// src/pages/HackathonPage.jsx
import React from "react";
import BrandMark from "../components/BrandMark";
import TimelineItem from "../components/TimelineItem";
import { HACKATHON_EVENTS } from "../data/hackathon";
import "./HackathonPage.css";

function HackathonPage() {
  return (
    <div className="page">
      <section className="section">
        <header className="hackathon-page__header">
          <BrandMark size="medium" />
          <div>
            <div className="section-label">September 2024</div>
            <div className="section-title">Apple Hacks Timeline</div>
            <p className="section-sub">
              Follow Apple Hacks 2024 from kickoff to awards, with workshop
              highlights and videos from across the three-day event.
            </p>
          </div>
        </header>

        <div className="hackathon-timeline">
          {/* Vertical center line */}
          <div className="hackathon-timeline__line" aria-hidden />

          {HACKATHON_EVENTS.map((event, i) => (
            <TimelineItem key={i} event={event} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default HackathonPage;
