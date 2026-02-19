// src/pages/QuizPage.jsx
import React, { useState } from "react";
import AuthPage from "./AuthPage";
import TopicSelector from "../components/quiz/TopicSelector";
import QuestionCard from "../components/quiz/QuestionCard";
import ResultsScreen from "../components/quiz/ResultsScreen";
import useLocalStorage from "../hooks/useLocalStorage";
import { TOPICS, QUESTIONS } from "../data/quiz";
import "./QuizPage.css";

// Shuffle array (Fisher-Yates)
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Build leaderboard for a topic from the full users object
function buildLeaderboard(users, topicName) {
  return Object.values(users)
    .flatMap((u) =>
      (u.scores || [])
        .filter((s) => s.topic === topicName)
        .map((s) => ({ name: u.username, score: s.score }))
    )
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

const PHASES = { TOPICS: "topics", PLAYING: "playing", RESULTS: "results" };

function QuizPage() {
  const [users, setUsers] = useLocalStorage("cc_users", {});
  const [user, setUser] = useLocalStorage("cc_user", null);

  // Quiz state
  const [phase, setPhase] = useState(PHASES.TOPICS);
  const [activeTopic, setActiveTopic] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);

  const currentUser = user ? users[user.username] ?? user : null;

  // ── Auth ──────────────────────────────────────────
  const handleLogin = (u) => setUser(u);
  const handleLogout = () => setUser(null);

  // ── Quiz flow ─────────────────────────────────────
  const startQuiz = (topicId) => {
    const topic = TOPICS.find((t) => t.id === topicId);
    const qs = shuffle(QUESTIONS[topicId]);
    setActiveTopic(topic);
    setQuestions(qs);
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setPhase(PHASES.PLAYING);
  };

  const handleSelect = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === questions[current].answer) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    const isLast = current + 1 >= questions.length;
    if (isLast) {
      // Persist score
      const finalScore = score + (selected === questions[current].answer ? 0 : 0);
      // score is already incremented by handleSelect; just use `score`
      const pct = Math.round((score / questions.length) * 100);
      const entry = { topic: activeTopic.name, score: pct, date: Date.now() };
      const updatedUser = {
        ...users[currentUser.username],
        scores: [...(users[currentUser.username]?.scores ?? []), entry],
      };
      const updatedUsers = { ...users, [currentUser.username]: updatedUser };
      setUsers(updatedUsers);
      setUser(updatedUser);
      setPhase(PHASES.RESULTS);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
    }
  };

  const handleExit = () => {
    setPhase(PHASES.TOPICS);
    setActiveTopic(null);
  };

  // ── Render ────────────────────────────────────────
  if (!currentUser) {
    return <AuthPage onLogin={handleLogin} users={users} setUsers={setUsers} />;
  }

  return (
    <div className="page quiz-page">
      <div className="quiz-page__container">

        {/* Topic selection */}
        {phase === PHASES.TOPICS && (
          <>
            <div className="quiz-page__header">
              <div>
                <div className="section-label">DSA Quiz</div>
                <h2 className="section-title" style={{ fontSize: "2rem", marginBottom: "0.25rem" }}>
                  Choose a Topic
                </h2>
                <p className="quiz-page__welcome">
                  Hey, <strong style={{ color: "var(--accent)" }}>{currentUser.username}</strong>! Pick a topic to start.
                </p>
              </div>
              <button className="btn-ghost" onClick={handleLogout}>Log out</button>
            </div>

            {/* Recent scores */}
            {currentUser.scores?.length > 0 && (
              <div className="quiz-page__recent">
                <div className="quiz-page__recent-label">Recent scores</div>
                {[...currentUser.scores].reverse().slice(0, 3).map((s, i) => (
                  <div key={i} className="quiz-page__recent-row">
                    <span>{s.topic}</span>
                    <span style={{
                      fontFamily: "var(--font-mono)",
                      color: s.score >= 75 ? "#4ade80" : s.score >= 50 ? "var(--accent3)" : "#f87171",
                    }}>
                      {s.score}%
                    </span>
                  </div>
                ))}
              </div>
            )}

            <TopicSelector
              topics={TOPICS}
              userScores={currentUser.scores}
              onSelect={startQuiz}
            />
          </>
        )}

        {/* Playing */}
        {phase === PHASES.PLAYING && (
          <QuestionCard
            question={questions[current]}
            selected={selected}
            onSelect={handleSelect}
            onNext={handleNext}
            onExit={handleExit}
            isLast={current + 1 >= questions.length}
            score={score}
            current={current}
            total={questions.length}
          />
        )}

        {/* Results */}
        {phase === PHASES.RESULTS && (
          <ResultsScreen
            topic={activeTopic}
            correct={score}
            total={questions.length}
            leaderboard={buildLeaderboard(users, activeTopic.name)}
            username={currentUser.username}
            onRetry={() => startQuiz(activeTopic.id)}
            onBack={handleExit}
          />
        )}
      </div>
    </div>
  );
}

export default QuizPage;
