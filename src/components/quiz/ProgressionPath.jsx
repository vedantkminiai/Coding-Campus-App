import React from "react";
import "./ProgressionPath.css";

export const PASSING_SCORE = 75;

function getBestScores(userScores) {
  return (userScores || []).reduce((best, entry) => {
    best[entry.topic] = Math.max(best[entry.topic] ?? 0, entry.score);
    return best;
  }, {});
}

function ProgressionPath({ topics, userScores, onSelect }) {
  const bestScores = getBestScores(userScores);
  const completed = topics.filter((topic) => (bestScores[topic.name] ?? 0) >= PASSING_SCORE).length;
  const progress = Math.round((completed / topics.length) * 100);

  return (
    <section className="progression-path" aria-labelledby="leetcode-training-title">
      <div className="progression-path__header">
        <div>
          <div className="section-label">Progressive challenge path</div>
          <h2 id="leetcode-training-title" className="progression-path__title">Leetcode Training</h2>
          <p className="progression-path__intro">
            Score {PASSING_SCORE}% or higher to complete a level and unlock the next challenge.
          </p>
        </div>
        <div className="progression-path__summary" aria-label={`${completed} of ${topics.length} levels complete`}>
          <strong>{completed}/{topics.length}</strong>
          <span>levels complete</span>
        </div>
      </div>

      <div className="progression-path__meter" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>

      <div className="progression-path__timeline">
        {topics.map((topic, index) => {
          const best = bestScores[topic.name];
          const previous = topics[index - 1];
          const unlocked = index === 0 || (bestScores[previous.name] ?? 0) >= PASSING_SCORE;
          const complete = (best ?? 0) >= PASSING_SCORE;
          const status = complete ? "complete" : unlocked ? "available" : "locked";

          return (
            <div className={`progression-level progression-level--${status} progression-level--${index % 2 === 0 ? "left" : "right"}`} key={topic.id}>
              <div className="progression-level__rail" aria-hidden>
                <span>{complete ? "✓" : unlocked ? topic.level : "🔒"}</span>
              </div>
              <button
                className="progression-level__card"
                onClick={() => unlocked && onSelect(topic.id)}
                disabled={!unlocked}
                aria-label={`${topic.name}. ${complete ? "Completed" : unlocked ? "Available" : "Locked"}`}
              >
                <span className="progression-level__icon" aria-hidden>{topic.icon}</span>
                <span className="progression-level__content">
                  <span className="progression-level__eyebrow">Level {topic.level}</span>
                  <strong>{topic.name}</strong>
                  <small>
                    {complete
                      ? `Complete · Best ${best}%`
                      : best !== undefined
                        ? `Keep training · Best ${best}%`
                        : unlocked
                          ? "Ready to begin"
                          : `Complete ${previous.name} to unlock`}
                  </small>
                </span>
                <span className="progression-level__action" aria-hidden>
                  {complete ? "Replay" : unlocked ? "Start →" : "Locked"}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default ProgressionPath;
