import React, { useEffect, useMemo, useState } from "react";
import BrandMark from "../components/BrandMark";
import AuthPage from "./AuthPage";
import CCCCurriculum from "../components/ccc/CCCCurriculum";
import useLocalStorage from "../hooks/useLocalStorage";
import { normalizeCCCProblem } from "../data/ccc";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import "./QuizPage.css";

function CCCTraining({ user, onLogout }) {
  const [problems, setProblems] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState("");
  const [completedIds, setCompletedIds] = useLocalStorage(
    `ccc-completed-${user.id}`,
    []
  );

  useEffect(() => {
    if (!user) return undefined;

    let active = true;

    async function loadCCCProblems() {
      setDataLoading(true);
      setDataError("");

      const { data, error } = await supabase
        .from("problems")
        .select("*, problem_commentary(*)");

      if (!active) return;

      if (error) {
        setDataError(error.message);
        setProblems([]);
      } else {
        setProblems((data || []).map(normalizeCCCProblem));
      }
      setDataLoading(false);
    }

    loadCCCProblems();
    return () => {
      active = false;
    };
  }, [user]);

  const completed = useMemo(() => new Set(completedIds), [completedIds]);

  const toggleComplete = (problemId) => {
    setCompletedIds((current) =>
      current.includes(problemId)
        ? current.filter((id) => id !== problemId)
        : [...current, problemId]
    );
  };

  return (
    <div className="page quiz-page">
      <div className="quiz-page__container quiz-page__container--path">
        <header className="quiz-page__header">
          <div className="quiz-page__heading-group">
            <BrandMark size="small" />
            <div>
              <div className="section-label">University of Waterloo contest prep</div>
              <h1 className="quiz-page__title">CCC Training Grounds</h1>
              <p className="quiz-page__welcome">
                Welcome back, <strong>{user.username}</strong>. Work through real Junior and Senior
                problems from 2022–2025, then study the solution commentary.
              </p>
            </div>
          </div>
          <button className="btn-ghost" onClick={onLogout}>Log out</button>
        </header>

        {dataError && (
          <div className="quiz-page__error" role="alert">
            <strong>CCC data could not be loaded.</strong> {dataError}
            <span> Check the SELECT policies for `problems` and `problem_commentary`.</span>
          </div>
        )}

        <CCCCurriculum
          problems={problems}
          loading={dataLoading}
          completed={completed}
          onToggleComplete={toggleComplete}
        />
      </div>
    </div>
  );
}

function QuizPage({ user, authLoading, onLogout }) {
  if (authLoading) {
    return <div className="page quiz-page__loading">Loading your CCC training profile…</div>;
  }

  if (!isSupabaseConfigured || !user) {
    return <AuthPage />;
  }

  return <CCCTraining user={user} onLogout={onLogout} />;
}

export default QuizPage;
