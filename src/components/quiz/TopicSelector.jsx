// src/components/quiz/TopicSelector.jsx
import React from "react";
import "./TopicSelector.css";

function TopicSelector({ topics, userScores, onSelect }) {
  // Get best score per topic for display
  const bestScores = {};
  (userScores || []).forEach(({ topic, score }) => {
    if (!bestScores[topic] || score > bestScores[topic]) {
      bestScores[topic] = score;
    }
  });

  return (
    <div className="topic-selector">
      <div className="topic-selector__grid">
        {topics.map((topic) => {
          const best = bestScores[topic.name];
          return (
            <button
              key={topic.id}
              className="topic-card"
              onClick={() => onSelect(topic.id)}
            >
              <div className="topic-card__icon">{topic.icon}</div>
              <div className="topic-card__name">{topic.name}</div>
              {best !== undefined ? (
                <div
                  className="topic-card__score"
                  style={{
                    color:
                      best >= 75 ? "var(--accent)"
                      : best >= 50 ? "var(--accent3)"
                      : "var(--accent2)",
                  }}
                >
                  Best: {best}%
                </div>
              ) : (
                <div className="topic-card__score">Not attempted</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default TopicSelector;
