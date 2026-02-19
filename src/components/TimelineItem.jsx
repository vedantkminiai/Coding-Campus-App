// src/components/TimelineItem.jsx
import React, { useState } from "react";
import "./TimelineItem.css";

function TimelineItem({ event, index }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className={`timeline-item timeline-item--${index % 2 === 0 ? "left" : "right"} fade-up`}
      style={{ animationDelay: `${index * 0.1}s` }}>

      <div className="timeline-item__content">
        <span className={`tag tag-amber`}>{event.tag}</span>
        <div className="timeline-item__date">{event.date}</div>
        <div className="timeline-item__title">{event.title}</div>
        <p className="timeline-item__desc">{event.desc}</p>

        {event.hasVideo && !playing && (
          <button
            className="timeline-item__video-placeholder"
            onClick={() => setPlaying(true)}
            aria-label={`Play video for ${event.title}`}
          >
            <span className="timeline-item__play-icon" aria-hidden>▶</span>
            <span>Click to play video</span>
            <span className="timeline-item__video-source">YouTube</span>
          </button>
        )}

        {event.hasVideo && playing && (
          <div className="timeline-item__video-embed">
            <iframe
              src={`https://www.youtube.com/embed/${event.videoId}?autoplay=1`}
              title={event.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {!event.hasVideo && (
          <div className="timeline-item__coming-soon">
            📹 Video coming soon — stay tuned!
          </div>
        )}
      </div>

      <div className="timeline-item__dot" aria-hidden>
        {event.emoji}
      </div>

      <div className="timeline-item__spacer" />
    </div>
  );
}

export default TimelineItem;
