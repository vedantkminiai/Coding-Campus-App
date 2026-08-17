import React, { useMemo, useState } from "react";
import { buildCCCStages, CCC_YEARS } from "../../data/ccc";
import FormattedCCCText from "./FormattedCCCText";
import CodeWorkspace from "./CodeWorkspace";
import "./CCCCurriculum.css";

function StageCard({ stage, index, completed, unlocked, onOpen }) {
  const done = stage.problems.filter((problem) => completed.has(problem.id)).length;
  const complete = stage.problems.length > 0 && done === stage.problems.length;
  const percent = stage.problems.length ? Math.round((done / stage.problems.length) * 100) : 0;

  return (
    <button
      className={`ccc-stage ccc-stage--${stage.division.toLowerCase()}${complete ? " ccc-stage--complete" : ""}`}
      onClick={() => onOpen(stage)}
      disabled={!unlocked}
      aria-label={`${stage.year} ${stage.division}. ${unlocked ? `${done} of ${stage.problems.length} complete` : "Locked"}`}
    >
      <span className="ccc-stage__step">{complete ? "✓" : unlocked ? index + 1 : "🔒"}</span>
      <span className="ccc-stage__body">
        <span className="ccc-stage__eyebrow">{stage.division} division</span>
        <strong>{stage.problems.length} problems</strong>
        <span>{unlocked ? `${done} solved · ${percent}%` : "Complete the previous stage"}</span>
      </span>
      <span className="ccc-stage__arrow" aria-hidden>{unlocked ? "→" : ""}</span>
    </button>
  );
}

function ProblemWorkspace({ stage, selected, completed, onSelect, onToggleComplete, userId }) {
  if (!stage) return null;

  return (
    <section className="ccc-workspace fade-up" aria-labelledby="ccc-workspace-title">
      <aside className="ccc-workspace__sidebar">
        <div className="ccc-workspace__sidebar-head">
          <span>{stage.year}</span>
          <strong id="ccc-workspace-title">{stage.division} set</strong>
        </div>
        <div className="ccc-problem-list">
          {stage.problems.map((problem) => (
            <button
              key={problem.id}
              className={`ccc-problem-link${selected?.id === problem.id ? " ccc-problem-link--active" : ""}`}
              onClick={() => onSelect(problem)}
            >
              <span className="ccc-problem-link__code">{problem.code}</span>
              <span>{problem.title}</span>
              <span className="ccc-problem-link__status" aria-label={completed.has(problem.id) ? "Complete" : "Not complete"}>
                {completed.has(problem.id) ? "✓" : "○"}
              </span>
            </button>
          ))}
        </div>
      </aside>

      <article className="ccc-problem-view">
        {selected ? (
          <>
            <div className="ccc-problem-view__meta">
              <span>{selected.year} · {selected.division} · {selected.code}</span>
              {selected.points !== null && selected.points !== undefined && <span>{selected.points} points</span>}
            </div>
            <h2>{selected.title}</h2>

            <section className="ccc-reading-block">
              <div className="ccc-reading-block__label">Problem</div>
              <div className="ccc-reading-block__content">
                <FormattedCCCText fallback="No problem statement was included in this record.">
                  {selected.statement}
                </FormattedCCCText>
              </div>
            </section>

            {selected.samples.length > 0 && (
              <section className="ccc-problem-section" aria-labelledby="ccc-samples-title">
                <div id="ccc-samples-title" className="ccc-reading-block__label">Sample cases</div>
                <div className="ccc-sample-grid">
                  {selected.samples.map((sample, index) => (
                    <article className="ccc-sample" key={sample.id}>
                      <strong>{sample.label || `Sample ${index + 1}`}</strong>
                      <div className="ccc-sample__io">
                        <div>
                          <span>Input</span>
                          <pre><FormattedCCCText fallback="—">{sample.input}</FormattedCCCText></pre>
                        </div>
                        <div>
                          <span>Expected output</span>
                          <pre><FormattedCCCText fallback="—">{sample.output}</FormattedCCCText></pre>
                        </div>
                      </div>
                      {sample.explanation && <p><FormattedCCCText>{sample.explanation}</FormattedCCCText></p>}
                    </article>
                  ))}
                </div>
              </section>
            )}

            {selected.subtasks.length > 0 && (
              <section className="ccc-problem-section" aria-labelledby="ccc-subtasks-title">
                <div id="ccc-subtasks-title" className="ccc-reading-block__label">Scoring subtasks</div>
                <div className="ccc-subtask-list">
                  {selected.subtasks.map((subtask, index) => (
                    <article className="ccc-subtask" key={subtask.id}>
                      <span className="ccc-subtask__number">{index + 1}</span>
                      <div>
                        <strong>{subtask.label}</strong>
                        {subtask.description && <p><FormattedCCCText>{subtask.description}</FormattedCCCText></p>}
                      </div>
                      {subtask.points !== null && subtask.points !== undefined && (
                        <span className="ccc-subtask__points">{subtask.points} pts</span>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            )}

            <CodeWorkspace key={selected.id} problem={selected} userId={userId} />

            <details className="ccc-solution">
              <summary>Study the commentary &amp; solution</summary>
              <div className="ccc-solution__content">
                <FormattedCCCText fallback="No solution commentary is attached to this problem yet.">
                  {selected.solution}
                </FormattedCCCText>
              </div>
            </details>

            <div className="ccc-problem-view__actions">
              {selected.sourceUrl && (
                <a className="btn-secondary" href={selected.sourceUrl} target="_blank" rel="noreferrer">
                  View original ↗
                </a>
              )}
              <button className="btn-primary" onClick={() => onToggleComplete(selected.id)}>
                {completed.has(selected.id) ? "Mark incomplete" : "Mark as complete ✓"}
              </button>
            </div>
          </>
        ) : (
          <div className="ccc-problem-view__empty">Choose a problem to begin.</div>
        )}
      </article>
    </section>
  );
}

function CCCCurriculum({ problems, loading, completed, onToggleComplete, userId }) {
  const stages = useMemo(() => buildCCCStages(problems), [problems]);
  const [activeStageId, setActiveStageId] = useState(null);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const activeStage = stages.find((stage) => stage.id === activeStageId) || null;
  const totalComplete = problems.filter((problem) => completed.has(problem.id)).length;

  const openStage = (stage) => {
    setActiveStageId(stage.id);
    setSelectedProblem(stage.problems[0] || null);
    window.requestAnimationFrame(() => {
      document.getElementById("ccc-problem-lab")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <section className="ccc-curriculum" aria-labelledby="ccc-curriculum-title">
      <div className="ccc-curriculum__intro">
        <div>
          <div className="section-label">Your contest roadmap</div>
          <h2 id="ccc-curriculum-title">The road to CCC</h2>
          <p>Build confidence with Junior sets, then step into Senior algorithmic thinking. Each stop uses the question and solution data in your Supabase curriculum.</p>
        </div>
        <div className="ccc-curriculum__score">
          <strong>{totalComplete}/{problems.length}</strong>
          <span>problems completed</span>
        </div>
      </div>

      {loading ? (
        <div className="ccc-curriculum__loading">Loading the CCC problem archive…</div>
      ) : (
        <>
          <div className="ccc-year-track">
            <div className="ccc-year-track__line" aria-hidden />
            {CCC_YEARS.map((year) => {
              const yearStages = stages.filter((stage) => stage.year === year);
              return (
                <div className="ccc-year" key={year}>
                  <div className="ccc-year__marker"><span>{year}</span></div>
                  <div className="ccc-year__stages">
                    {yearStages.map((stage) => {
                      const index = stages.findIndex((item) => item.id === stage.id);
                      const previous = stages[index - 1];
                      const previousComplete = !previous || previous.problems.length === 0 ||
                        previous.problems.every((problem) => completed.has(problem.id));
                      return (
                        <StageCard
                          key={stage.id}
                          stage={stage}
                          index={index}
                          completed={completed}
                          unlocked={previousComplete}
                          onOpen={openStage}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {problems.length === 0 && (
            <div className="ccc-curriculum__empty">
              <strong>No readable CCC records yet.</strong>
              <span>The signed-in role needs SELECT access to both Supabase tables.</span>
            </div>
          )}

          <div id="ccc-problem-lab">
            <ProblemWorkspace
              stage={activeStage}
              selected={selectedProblem}
              completed={completed}
              onSelect={setSelectedProblem}
              onToggleComplete={onToggleComplete}
              userId={userId}
            />
          </div>
        </>
      )}
    </section>
  );
}

export default CCCCurriculum;
