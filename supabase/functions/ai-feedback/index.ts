import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import { generateFeedback } from "../_shared/ai.ts";
import {
  errorMessage,
  jsonResponse,
  optionsResponse,
} from "../_shared/http.ts";
import { normalizeProblem, truncate } from "../_shared/problem.ts";

const authenticatedFetch = withSupabase({ auth: "user" }, async (req, ctx) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const body = await req.json();
    const requestType = body?.requestType === "wrong_solution"
      ? "wrong_solution"
      : "hint";
    const problemId = String(body?.problemId ?? "").trim();
    const language = String(body?.language ?? "").toLowerCase();
    let sourceCode = String(body?.sourceCode ?? "");
    let execution =
      body?.executionResult && typeof body.executionResult === "object"
        ? body.executionResult as Record<string, unknown>
        : null;
    const submissionId = body?.submissionId ? String(body.submissionId) : null;
    const userId = String(ctx.userClaims!.id);
    // The project schema is pipeline-managed, so generated Database types are not available here.
    // deno-lint-ignore no-explicit-any
    const admin = ctx.supabaseAdmin as any;

    if (!problemId || !["python", "cpp", "java"].includes(language)) {
      return jsonResponse({
        error: "problemId and a supported language are required",
      }, 400);
    }
    if (sourceCode.length > 50_000) {
      return jsonResponse(
        { error: "Source code exceeds 50,000 characters" },
        413,
      );
    }

    const since = new Date(Date.now() - 60_000).toISOString();
    const { count } = await admin
      .from("ai_feedback")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", since);
    if ((count ?? 0) >= 5) {
      return jsonResponse({
        error: "Too many AI requests. Try again in one minute.",
      }, 429);
    }

    if (submissionId) {
      const submission = await admin
        .from("code_submissions")
        .select(
          "source_code, language, status, score, stdout, stderr, runtime_ms, memory_kb, passed_count, test_count",
        )
        .eq("id", submissionId)
        .eq("user_id", userId)
        .eq("problem_id", problemId)
        .maybeSingle();

      if (submission.error) {
        throw new Error("Could not load the referenced submission");
      }
      if (!submission.data) {
        return jsonResponse({ error: "Submission not found" }, 404);
      }
      sourceCode = submission.data.source_code || sourceCode;
      execution = {
        status: submission.data.status,
        score: submission.data.score,
        stdout: truncate(submission.data.stdout, 4_000),
        stderr: truncate(submission.data.stderr, 4_000),
        runtime_ms: submission.data.runtime_ms,
        memory_kb: submission.data.memory_kb,
        passed_tests: submission.data.passed_count,
        total_tests: submission.data.test_count,
      };
    }

    if (!sourceCode.trim()) {
      return jsonResponse({
        error: "Source code is required for a useful hint",
      }, 400);
    }

    const problemQuery = await admin
      .from("problems")
      .select("*, problem_commentary(*)")
      .eq("id", problemId)
      .maybeSingle();
    if (problemQuery.error) {
      throw new Error("Could not load the selected CCC problem");
    }
    if (!problemQuery.data) {
      return jsonResponse({ error: "Problem not found" }, 404);
    }

    const feedback = await generateFeedback({
      requestType,
      problem: normalizeProblem(problemQuery.data),
      language,
      sourceCode,
      execution,
    });

    const inserted = await admin.from("ai_feedback").insert({
      user_id: userId,
      submission_id: submissionId,
      problem_id: problemId,
      request_type: requestType,
      ...feedback,
    }).select("id").single();

    return jsonResponse({
      ...feedback,
      feedback_id: inserted.data?.id ?? null,
    });
  } catch (error) {
    console.error("ai-feedback failed", { message: errorMessage(error) });
    const message = errorMessage(error);
    const status = /OPENAI_API_KEY/.test(message) ? 503 : 500;
    return jsonResponse({ error: message }, status);
  }
});

export default {
  fetch(req: Request) {
    if (req.method === "OPTIONS") return optionsResponse();
    return authenticatedFetch(req);
  },
};
