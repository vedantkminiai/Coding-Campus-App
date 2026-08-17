import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import { generateFeedback } from "../_shared/ai.ts";
import {
  errorMessage,
  jsonResponse,
  optionsResponse,
} from "../_shared/http.ts";
import {
  normalizeOutput,
  normalizeProblem,
  normalizeTestCase,
  truncate,
} from "../_shared/problem.ts";

const MAX_SOURCE_LENGTH = 50_000;
const MAX_STDIN_LENGTH = 100_000;
const MAX_TESTS = 20;

const languageMatchers: Record<string, RegExp[]> = {
  python: [/^Python \(3/i, /^Python 3/i],
  cpp: [/^C\+\+.*GCC/i, /^C\+\+.*Clang/i],
  java: [/^Java.*OpenJDK/i, /^Java/i],
};

const languageEnv: Record<string, string> = {
  python: "JUDGE0_LANGUAGE_PYTHON",
  cpp: "JUDGE0_LANGUAGE_CPP",
  java: "JUDGE0_LANGUAGE_JAVA",
};

const languageIdCache = new Map<string, Promise<number>>();

type JudgeResult = {
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
  time?: string | number | null;
  memory?: number | null;
  status?: { id?: number; description?: string };
};

type TestCase = {
  id: string;
  label: string;
  input: string;
  expectedOutput: string;
};

const judgeUrl = () =>
  (Deno.env.get("JUDGE0_URL") || "https://judge0-ce.p.rapidapi.com").replace(
    /\/$/,
    "",
  );

function judgeHeaders() {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const key = Deno.env.get("JUDGE0_API_KEY");
  const host = Deno.env.get("JUDGE0_API_HOST");
  if (key) headers["X-RapidAPI-Key"] = key;
  if (host) headers["X-RapidAPI-Host"] = host;
  return headers;
}

async function resolveLanguageId(language: string) {
  const override = Number(Deno.env.get(languageEnv[language]));
  if (Number.isInteger(override) && override > 0) return override;

  if (!languageIdCache.has(language)) {
    languageIdCache.set(
      language,
      (async () => {
        const response = await fetch(`${judgeUrl()}/languages`, {
          headers: judgeHeaders(),
        });
        if (!response.ok) {
          throw new Error("The code runner language list is unavailable");
        }
        const languages = await response.json() as {
          id: number;
          name: string;
        }[];
        const match = languages
          .filter((entry) =>
            languageMatchers[language].some((pattern) =>
              pattern.test(entry.name)
            )
          )
          .sort((a, b) => b.id - a.id)[0];
        if (!match) {
          throw new Error(
            `${language} is not available on the configured code runner`,
          );
        }
        return match.id;
      })(),
    );
  }

  try {
    return await languageIdCache.get(language)!;
  } catch (error) {
    languageIdCache.delete(language);
    throw error;
  }
}

async function runCode(
  language: string,
  sourceCode: string,
  stdin: string,
): Promise<JudgeResult> {
  const languageId = await resolveLanguageId(language);
  const url = new URL(`${judgeUrl()}/submissions`);
  url.searchParams.set("base64_encoded", "false");
  url.searchParams.set("wait", "true");

  const response = await fetch(url, {
    method: "POST",
    headers: judgeHeaders(),
    body: JSON.stringify({
      source_code: sourceCode,
      language_id: languageId,
      stdin,
      cpu_time_limit: 2,
      cpu_extra_time: 0.5,
      wall_time_limit: 5,
      memory_limit: 262_144,
      stack_limit: 65_536,
      max_processes_and_or_threads: 64,
      max_file_size: 1_024,
      enable_network: false,
    }),
  });

  if (!response.ok) {
    console.error("Judge0 request failed", { status: response.status });
    throw new Error("The code runner is temporarily unavailable");
  }
  return await response.json() as JudgeResult;
}

const judgeStatus = (result: JudgeResult, outputMatches = false) => {
  const id = result.status?.id;
  if (id === 3) return outputMatches ? "accepted" : "wrong_answer";
  if (id === 6) return "compile_error";
  if (id === 5) return "time_limit_exceeded";
  if (id && id >= 7 && id <= 12) return "runtime_error";
  return (result.status?.description || "error").toLowerCase().replace(
    /[^a-z0-9]+/g,
    "_",
  );
};

const authenticatedFetch = withSupabase({ auth: "user" }, async (req, ctx) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const body = await req.json();
    const mode = body?.mode === "submit"
      ? "submit"
      : body?.mode === "run"
      ? "run"
      : null;
    const problemId = String(body?.problemId ?? "").trim();
    const language = String(body?.language ?? "").toLowerCase();
    const sourceCode = String(body?.sourceCode ?? "");
    const stdin = String(body?.stdin ?? "");

    if (!mode || !problemId || !languageMatchers[language]) {
      return jsonResponse({
        error: "mode, problemId, and a supported language are required",
      }, 400);
    }
    if (!sourceCode.trim()) {
      return jsonResponse({ error: "Source code is required" }, 400);
    }
    if (sourceCode.length > MAX_SOURCE_LENGTH) {
      return jsonResponse(
        { error: "Source code exceeds 50,000 characters" },
        413,
      );
    }
    if (stdin.length > MAX_STDIN_LENGTH) {
      return jsonResponse(
        { error: "Custom input exceeds 100,000 characters" },
        413,
      );
    }

    const userId = String(ctx.userClaims!.id);
    // The project schema is pipeline-managed, so generated Database types are not available here.
    // deno-lint-ignore no-explicit-any
    const admin = ctx.supabaseAdmin as any;
    const since = new Date(Date.now() - 60_000).toISOString();
    const { count } = await admin
      .from("code_submissions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", since);
    if ((count ?? 0) >= 12) {
      return jsonResponse({
        error: "Too many submissions. Try again in one minute.",
      }, 429);
    }

    if (mode === "run") {
      const result = await runCode(language, sourceCode, stdin);
      const executionSucceeded = result.status?.id === 3;
      return jsonResponse({
        status: executionSucceeded ? "finished" : judgeStatus(result),
        passed: executionSucceeded ? undefined : false,
        stdout: truncate(result.stdout, 20_000),
        stderr: truncate(result.stderr, 20_000),
        compiler_output: truncate(result.compile_output, 20_000),
        runtime_ms: result.time === null || result.time === undefined
          ? undefined
          : Math.round(Number(result.time) * 1000),
        memory_kb: result.memory ?? undefined,
      });
    }

    let testRows: Record<string, unknown>[] = [];
    const hidden = await admin
      .from("hidden_test_cases")
      .select("*")
      .eq("problem_id", problemId)
      .eq("is_active", true)
      .order("position", { ascending: true })
      .limit(MAX_TESTS);

    if (!hidden.error && hidden.data?.length) {
      testRows = hidden.data;
    } else {
      const samples = await admin
        .from("sample_cases")
        .select("*")
        .eq("problem_id", problemId)
        .limit(MAX_TESTS);
      if (!samples.error && samples.data?.length) testRows = samples.data;
    }

    const tests = testRows.map(normalizeTestCase).filter((test: TestCase) =>
      test.expectedOutput !== ""
    );
    if (!tests.length) {
      return jsonResponse({
        error: "No judge cases are configured for this problem yet",
      }, 422);
    }

    const results: Array<
      { id: string; label: string; passed: boolean; status: string }
    > = [];
    let representative: JudgeResult = {};
    let totalRuntimeMs = 0;
    let peakMemoryKb = 0;

    for (const test of tests) {
      const result = await runCode(language, sourceCode, test.input);
      const outputMatches = result.status?.id === 3 &&
        normalizeOutput(result.stdout || "") ===
          normalizeOutput(test.expectedOutput);
      const status = judgeStatus(result, outputMatches);
      results.push({
        id: test.id,
        label: test.label,
        passed: outputMatches,
        status,
      });
      totalRuntimeMs += Number(result.time || 0) * 1000;
      peakMemoryKb = Math.max(peakMemoryKb, Number(result.memory || 0));
      if (!outputMatches && !representative.status) representative = result;
    }

    if (!representative.status) {
      representative = { status: { id: 3, description: "Accepted" } };
    }
    const passedCount = results.filter((test) => test.passed).length;
    const passed = passedCount === results.length;
    const score = Math.round((passedCount / results.length) * 100);
    const finalStatus = passed
      ? "accepted"
      : results.find((test) => !test.passed)?.status || "wrong_answer";

    const submissionInsert = await admin.from("code_submissions").insert({
      user_id: userId,
      problem_id: problemId,
      language,
      source_code: sourceCode,
      status: finalStatus,
      passed,
      score,
      stdout: truncate(representative.stdout, 20_000),
      stderr: truncate(
        representative.stderr || representative.compile_output,
        20_000,
      ),
      runtime_ms: Math.round(totalRuntimeMs),
      memory_kb: peakMemoryKb,
      test_count: results.length,
      passed_count: passedCount,
    }).select("id").single();

    const submissionId = submissionInsert.data?.id ?? null;
    let feedback = null;

    if (!passed && Deno.env.get("OPENAI_API_KEY")) {
      try {
        const problemQuery = await admin
          .from("problems")
          .select("*, problem_commentary(*)")
          .eq("id", problemId)
          .maybeSingle();
        feedback = await generateFeedback({
          requestType: "wrong_solution",
          problem: normalizeProblem(problemQuery.data),
          language,
          sourceCode,
          execution: {
            status: finalStatus,
            score,
            passed_tests: passedCount,
            total_tests: results.length,
            stderr: truncate(
              representative.stderr || representative.compile_output,
              4_000,
            ),
            stdout: truncate(representative.stdout, 4_000),
          },
        });
        await admin.from("ai_feedback").insert({
          user_id: userId,
          submission_id: submissionId,
          problem_id: problemId,
          request_type: "wrong_solution",
          ...feedback,
        });
      } catch (error) {
        console.error("Automatic feedback failed", {
          message: errorMessage(error),
        });
      }
    }

    return jsonResponse({
      status: finalStatus,
      passed,
      score,
      stdout: truncate(representative.stdout, 20_000),
      stderr: truncate(representative.stderr, 20_000),
      compiler_output: truncate(representative.compile_output, 20_000),
      runtime_ms: Math.round(totalRuntimeMs),
      memory_kb: peakMemoryKb,
      tests: results,
      submission_id: submissionId,
      feedback,
    });
  } catch (error) {
    console.error("evaluate-submission failed", {
      message: errorMessage(error),
    });
    return jsonResponse({ error: errorMessage(error) }, 500);
  }
});

export default {
  fetch(req: Request) {
    if (req.method === "OPTIONS") return optionsResponse();
    return authenticatedFetch(req);
  },
};
