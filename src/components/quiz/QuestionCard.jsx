// src/components/quiz/QuestionCard.jsx
import React from "react";
import "./QuestionCard.css";

const LETTERS = ["A", "B", "C", "D"];

const DIFF_CLASS = {
  easy:   "tag tag-green",
  medium: "tag tag-amber",
  hard:   "tag tag-red",
};

function QuestionCard({ question, selected, onSelect, onNext, onExit, isLast, score, current, total }) {
  const answered = selected !== null;

  return (
    <div className="question-card fade-up" key={current}>
      {/* Progress bar */}
      <div className="question-card__progress-bar">
        <div
          className="question-card__progress-fill"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>

      {/* Header row */}
      <div className="question-card__header">
        <div>
          <div className="question-card__category">{question.category}</div>
          <div className="question-card__counter">
            Question {current + 1} of {total}
          </div>
        </div>
        <span className="question-card__score">Score: {score}</span>
      </div>

      {/* Question */}
      <span className={DIFF_CLASS[question.difficulty]}>
        {question.difficulty.toUpperCase()}
      </span>
      <p className="question-card__text">{question.q}</p>

      {/* Options */}
      <ul className="question-card__options">
        {question.options.map((opt, i) => {
          let cls = "option-btn";
          if (answered) {
            if (i === question.answer) cls += " option-btn--correct";
            else if (i === selected)  cls += " option-btn--wrong";
          }
          return (
            <li key={i}>
              <button
                className={cls}
                onClick={() => onSelect(i)}
                disabled={answered}
                aria-pressed={selected === i}
              >
                <span className="option-btn__letter">{LETTERS[i]}</span>
                {opt}
              </button>
            </li>
          );
        })}
      </ul>

      {/* Explanation */}
      {answered && (
        <div className="question-card__explanation fade-up">
          <strong>{selected === question.answer ? "✅ Correct!" : "❌ Incorrect."}</strong>{" "}
          {question.explanation}
        </div>
      )}

      {/* Navigation */}
      <div className="question-card__nav">
        <button className="btn-secondary" onClick={onExit}>← Exit</button>
        {answered && (
          <button className="btn-primary" onClick={onNext}>
            {isLast ? "See Results →" : "Next →"}
          </button>
        )}
      </div>
    </div>
  );
}

export default QuestionCard;
