import React, { useEffect, useMemo, useState } from "react";
import Editor from "@monaco-editor/react";
import { supabase } from "../../lib/supabase";
import "./CodeWorkspace.css";

const LANGUAGES = {
  python: {
    label: "Python 3",
    monaco: "python",
    extension: "py",
    template: `import sys

def solve():
    # Read input and write your solution here.
    data = sys.stdin.read().strip().split()

if __name__ == "__main__":
    solve()
`,
  },
  cpp: {
    label: "C++17",
    monaco: "cpp",
    extension: "cpp",
    template: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    // Read input and write your solution here.
    return 0;
}
`,
  },
  java: {
    label: "Java 17",
    monaco: "java",
    extension: "java",
    template: `import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws Exception {
        // Read input and write your solution here.
    }
}
`,
  },
};

const printable = (value) => {
  if (value === null || value === undefined || value === "") return "";
  return typeof value === "string" ? value : JSON.stringify(value, null, 2);
};

function formatFunctionError(error) {
  const message = error?.message || "The execution service could not be reached.";
  if (/not found|404|failed to send/i.test(message)) {
    return "The code runner is not deployed yet. Deploy the evaluate-submission Supabase Edge Function to enable execution.";
  }
  return message;
}

function CodeWorkspace({ problem, userId }) {
  const [language, setLanguage] = useState("python");
  const [sourceCode, setSourceCode] = useState(LANGUAGES.python.template);
  const [customInput, setCustomInput] = useState("");
  const [running, setRunning] = useState(false);
  const [runMode, setRunMode] = useState(null);
  const [result, setResult] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [hintLoading, setHintLoading] = useState(false);

  const draftKey = useMemo(
    () => `ccc-draft-${userId}-${problem.id}-${language}`,
    [userId, problem.id, language]
  );
  const inputKey = useMemo(
    () => `ccc-input-${userId}-${problem.id}`,
    [userId, problem.id]
  );

  useEffect(() => {
    const savedDraft = localStorage.getItem(draftKey);
    setSourceCode(savedDraft ?? LANGUAGES[language].template);
    setResult(null);
    setFeedback(null);
  }, [draftKey, language]);

  useEffect(() => {
    const savedInput = localStorage.getItem(inputKey);
    setCustomInput(savedInput ?? problem.samples?.[0]?.input ?? "");
  }, [inputKey, problem.samples]);

  const updateSource = (value) => {
    const nextValue = value ?? "";
    setSourceCode(nextValue);
    localStorage.setItem(draftKey, nextValue);
  };

  const updateInput = (event) => {
    setCustomInput(event.target.value);
    localStorage.setItem(inputKey, event.target.value);
  };

  const execute = async (mode) => {
    if (!sourceCode.trim()) {
      setResult({ status: "error", stderr: "Write some code before running it." });
      return;
    }

    if (sourceCode.length > 50000) {
      setResult({ status: "error", stderr: "Your submission exceeds the 50,000 character limit." });
      return;
    }

    setRunning(true);
    setRunMode(mode);
    setResult(null);
    if (mode === "submit") setFeedback(null);

    const { data, error } = await supabase.functions.invoke("evaluate-submission", {
      body: {
        mode,
        problemId: problem.id,
        language,
        sourceCode,
        stdin: mode === "run" ? customInput : undefined,
      },
    });

    if (error) {
      setResult({ status: "error", stderr: formatFunctionError(error) });
    } else {
      setResult({
        status: data?.status || (data?.passed ? "accepted" : "finished"),
        passed: data?.passed,
        score: data?.score,
        stdout: printable(data?.stdout),
        stderr: printable(data?.stderr || data?.compiler_output),
        runtimeMs: data?.runtime_ms,
        memoryKb: data?.memory_kb,
        tests: Array.isArray(data?.tests) ? data.tests : [],
        submissionId: data?.submission_id,
      });
      if (data?.feedback) setFeedback(data.feedback);
    }

    setRunning(false);
    setRunMode(null);
  };

  const requestHint = async () => {
    setHintLoading(true);
    const { data, error } = await supabase.functions.invoke("ai-feedback", {
      body: {
        requestType: "hint",
        problemId: problem.id,
        language,
        sourceCode,
        submissionId: result?.submissionId,
        executionResult: result ? {
          status: result.status,
          stderr: result.stderr,
          stdout: result.stdout,
          score: result.score,
        } : null,
      },
    });

    setFeedback(error ? { diagnosis: formatFunctionError(error) } : data);
    setHintLoading(false);
  };

  const resetDraft = () => {
    const template = LANGUAGES[language].template;
    setSourceCode(template);
    localStorage.setItem(draftKey, template);
    setResult(null);
    setFeedback(null);
  };

  const statusLabel = result?.passed === true
    ? "Accepted"
    : result?.passed === false
      ? "Needs work"
      : result?.status || "Ready";

  return (
    <section className="code-workspace" aria-labelledby={`code-workspace-${problem.id}`}>
      <header className="code-workspace__header">
        <div>
          <span className="code-workspace__eyebrow">Contest workspace</span>
          <h3 id={`code-workspace-${problem.id}`}>Solve {problem.code}</h3>
        </div>
        <div className="code-workspace__limits" aria-label="Execution limits">
          <span>2 sec</span>
          <span>256 MB</span>
          <span>50 KB source</span>
        </div>
      </header>

      <div className="code-workspace__toolbar">
        <label>
          <span>Language</span>
          <select value={language} onChange={(event) => setLanguage(event.target.value)}>
            {Object.entries(LANGUAGES).map(([id, config]) => (
              <option key={id} value={id}>{config.label}</option>
            ))}
          </select>
        </label>
        <span className="code-workspace__filename">main.{LANGUAGES[language].extension}</span>
        <button type="button" className="code-workspace__reset" onClick={resetDraft}>Reset starter</button>
      </div>

      <div className="code-workspace__editor">
        <Editor
          height="430px"
          language={LANGUAGES[language].monaco}
          value={sourceCode}
          onChange={updateSource}
          theme="vs-dark"
          loading={<div className="code-workspace__editor-loading">Loading code editor…</div>}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineHeight: 22,
            padding: { top: 16 },
            automaticLayout: true,
            scrollBeyondLastLine: false,
            tabSize: language === "python" ? 4 : 2,
            wordWrap: "on",
          }}
        />
      </div>

      <div className="code-workspace__lower">
        <div className="code-workspace__input">
          <label htmlFor={`custom-input-${problem.id}`}>Custom input</label>
          <textarea
            id={`custom-input-${problem.id}`}
            value={customInput}
            onChange={updateInput}
            placeholder="Enter the stdin for a sample run…"
            spellCheck="false"
          />
          {problem.samples?.length > 0 && (
            <div className="code-workspace__samples">
              {problem.samples.map((sample, index) => (
                <button key={sample.id} type="button" onClick={() => {
                  setCustomInput(sample.input);
                  localStorage.setItem(inputKey, sample.input);
                }}>
                  Sample {index + 1}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="code-workspace__console" aria-live="polite">
          <div className="code-workspace__console-head">
            <span>Output</span>
            <strong className={`code-workspace__status code-workspace__status--${result?.passed === true ? "pass" : result?.passed === false || result?.status === "error" ? "fail" : "idle"}`}>
              {running ? `${runMode === "submit" ? "Judging" : "Running"}…` : statusLabel}
            </strong>
          </div>
          <pre>{running
            ? "Sending your code to the secure runner…"
            : result?.stderr || result?.stdout || (result ? "Program finished with no output." : "Run your code to see output here.")}</pre>
          {result?.tests?.length > 0 && (
            <div className="code-workspace__tests" aria-label="Test case results">
              {result.tests.map((test, index) => (
                <span
                  key={test.id || index}
                  className={test.passed ? "code-workspace__test--pass" : "code-workspace__test--fail"}
                >
                  {test.passed ? "✓" : "×"} {test.label || `Test ${index + 1}`}
                </span>
              ))}
            </div>
          )}
          {result && (result.runtimeMs !== undefined || result.memoryKb !== undefined) && (
            <div className="code-workspace__metrics">
              {result.runtimeMs !== undefined && <span>{result.runtimeMs} ms</span>}
              {result.memoryKb !== undefined && <span>{result.memoryKb} KB</span>}
              {result.score !== undefined && <span>{result.score}%</span>}
            </div>
          )}
        </div>
      </div>

      <footer className="code-workspace__actions">
        <p>Run uses your custom input. Submit is graded against server-side tests.</p>
        <div>
          <button type="button" className="btn-secondary" disabled={running} onClick={() => execute("run")}>
            {running && runMode === "run" ? "Running…" : "▶ Run code"}
          </button>
          <button type="button" className="btn-primary" disabled={running} onClick={() => execute("submit")}>
            {running && runMode === "submit" ? "Judging…" : "Submit solution"}
          </button>
        </div>
      </footer>

      <aside className="code-workspace__coach">
        <div>
          <span className="code-workspace__eyebrow">AI learning coach</span>
          <strong>Get a progressive hint without revealing the full answer.</strong>
        </div>
        <button type="button" className="btn-secondary" disabled={hintLoading || running} onClick={requestHint}>
          {hintLoading ? "Thinking…" : "Get an AI hint"}
        </button>
        {feedback && (
          <div className="code-workspace__feedback">
            <strong>{feedback.diagnosis || feedback.summary || "Here’s a hint"}</strong>
            {feedback.hint && <p>{feedback.hint}</p>}
            {feedback.next_step && <p><b>Next step:</b> {feedback.next_step}</p>}
            {Array.isArray(feedback.concepts_to_review) && feedback.concepts_to_review.length > 0 && (
              <div>{feedback.concepts_to_review.map((concept) => <span key={concept}>{concept}</span>)}</div>
            )}
          </div>
        )}
      </aside>
    </section>
  );
}

export default CodeWorkspace;
