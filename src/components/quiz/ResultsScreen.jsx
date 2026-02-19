// src/components/quiz/ResultsScreen.jsx
import React from "react";
import "./ResultsScreen.css";

function getResultMessage(pct) {
  if (pct >= 90) return "🔥 Outstanding!";
  if (pct >= 75) return "🎉 Great job!";
  if (pct >= 50) return "📚 Keep studying!";
  return "💪 Don't give up!";
}

function ResultsScreen({ topic, correct, total, leaderboard, username, onRetry, onBack }) {
  const pct = Math.round((correct / total) * 100);

  return (
    <div className="results-screen fade-up">
      <div className="results-screen__label">You scored</div>
      <div className="results-screen__score">{pct}%</div>
      <div className="results-screen__message">{getResultMessage(pct)}</div>
      <div className="results-screen__detail">
        {correct} out of {total} correct on <strong>{topic.name}</strong>
      </div>

      <div className="results-screen__actions">
        <button className="btn-primary" onClick={onRetry}>Retry Topic</button>
        <button className="btn-secondary" onClick={onBack}>Choose Another</button>
      </div>

      {leaderboard.length > 0 && (
        <div className="leaderboard">
          <div className="leaderboard__title">🏆 Leaderboard — {topic.name}</div>
          {leaderboard.map((entry, i) => (
            <div
              key={i}
              className={`leaderboard__row ${entry.name === username ? "leaderboard__row--you" : ""}`}
            >
              <span className="leaderboard__rank">#{i + 1}</span>
              <span className="leaderboard__name">
                {entry.name}
                {entry.name === username && <em> (you)</em>}
              </span>
              <span className="leaderboard__score">{entry.score}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ResultsScreen;
