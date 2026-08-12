// src/pages/QuizPage.jsx
import React, { useCallback, useEffect, useState } from "react";
import BrandMark from "../components/BrandMark";
import AuthPage from "./AuthPage";
import ProgressionPath from "../components/quiz/ProgressionPath";
import QuestionCard from "../components/quiz/QuestionCard";
import ResultsScreen from "../components/quiz/ResultsScreen";
import { LEETCODE_TOPICS, QUESTIONS } from "../data/quiz";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
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

const PHASES = { TOPICS: "topics", PLAYING: "playing", RESULTS: "results" };

function QuizPage({ user, authLoading, onLogout }) {
  // Quiz state
  const [phase, setPhase] = useState(PHASES.TOPICS);
  const [activeTopic, setActiveTopic] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState("");

  const scores = attempts.map((attempt) => ({
    topic: LEETCODE_TOPICS.find((topic) => topic.id === attempt.topic_id)?.name ?? attempt.topic_id,
    score: attempt.score,
    date: new Date(attempt.created_at).getTime(),
  }));

  const loadAttempts = useCallback(async () => {
    if (!user) return;

    setDataLoading(true);
    setDataError("");
    const { data, error } = await supabase
      .from("quiz_attempts")
      .select("id, topic_id, score, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) setDataError(error.message);
    else setAttempts(data || []);
    setDataLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) loadAttempts();
  }, [user, loadAttempts]);

  const loadLeaderboard = async (topicId) => {
    const { data, error } = await supabase
      .from("quiz_attempts")
      .select("user_id, score, profiles!quiz_attempts_user_id_fkey(username)")
      .eq("topic_id", topicId)
      .order("score", { ascending: false });

    if (error) {
      setDataError(error.message);
      setLeaderboard([]);
      return;
    }

    const seen = new Set();
    const leaders = (data || []).reduce((rows, attempt) => {
      if (seen.has(attempt.user_id) || rows.length >= 5) return rows;
      seen.add(attempt.user_id);
      rows.push({
        name: attempt.profiles?.username || "Learner",
        score: attempt.score,
      });
      return rows;
    }, []);
    setLeaderboard(leaders);
  };

  // ── Quiz flow ─────────────────────────────────────
  const startQuiz = (topicId) => {
    const topic = LEETCODE_TOPICS.find((t) => t.id === topicId);
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

  const handleNext = async () => {
    const isLast = current + 1 >= questions.length;
    if (isLast) {
      const pct = Math.round((score / questions.length) * 100);
      setDataError("");
      const { data, error } = await supabase
        .from("quiz_attempts")
        .insert({ user_id: user.id, topic_id: activeTopic.id, score: pct })
        .select("id, topic_id, score, created_at")
        .single();

      if (error) {
        setDataError(`Your result could not be saved: ${error.message}`);
      } else {
        setAttempts((currentAttempts) => [data, ...currentAttempts]);
      }
      await loadLeaderboard(activeTopic.id);
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
  if (authLoading) {
    return <div className="page quiz-page__loading">Loading your training profile…</div>;
  }

  if (!isSupabaseConfigured || !user) {
    return <AuthPage />;
  }

  return (
    <div className="page quiz-page">
      <div className={`quiz-page__container${phase === PHASES.TOPICS ? " quiz-page__container--path" : ""}`}>

        {/* Topic selection */}
        {phase === PHASES.TOPICS && (
          <>
            <div className="quiz-page__header">
              <div className="quiz-page__heading-group">
                <BrandMark size="small" />
                <div>
                  <div className="section-label">Guided DSA curriculum</div>
                  <h2 className="section-title" style={{ fontSize: "2rem", marginBottom: "0.25rem" }}>
                    Leetcode Training
                  </h2>
                  <p className="quiz-page__welcome">
                    Hey, <strong style={{ color: "var(--accent)" }}>{user.username}</strong>! Complete each level to advance.
                  </p>
                </div>
              </div>
              <button className="btn-ghost" onClick={onLogout}>Log out</button>
            </div>

            {dataError && <p className="quiz-page__error">⚠ {dataError}</p>}

            {/* Recent scores */}
            {dataLoading && <p className="quiz-page__status">Loading saved progress…</p>}
            {!dataLoading && scores.length > 0 && (
              <div className="quiz-page__recent">
                <div className="quiz-page__recent-label">Recent scores</div>
                {scores.slice(0, 3).map((s, i) => (
                  <div key={i} className="quiz-page__recent-row">
                    <span>{s.topic}</span>
                    <span style={{
                      fontFamily: "var(--font-mono)",
                      color: s.score >= 75 ? "var(--accent)" : s.score >= 50 ? "var(--accent3)" : "var(--accent2)",
                    }}>
                      {s.score}%
                    </span>
                  </div>
                ))}
              </div>
            )}

            <ProgressionPath
              topics={LEETCODE_TOPICS}
              userScores={scores}
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
            leaderboard={leaderboard}
            username={user.username}
            onRetry={() => startQuiz(activeTopic.id)}
            onBack={handleExit}
          />
        )}
      </div>
    </div>
  );
}

export default QuizPage;
