// src/pages/HackathonPage.jsx
import React from "react";
import TimelineItem from "../components/TimelineItem";
import { HACKATHON_EVENTS } from "../data/hackathon";
import "./HackathonPage.css";

function HackathonPage() {
  return (
    <div className="page">
      <section className="section">
        <div className="section-label">Spring 2024</div>
        <div className="section-title">Campus Hackathon</div>
        <p className="section-sub">
          48 hours. 80+ students. 12 projects. Here's the complete story of our
          inaugural hackathon — from kickoff to awards — with videos from every
          moment.
        </p>

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
