type UnknownRecord = Record<string, unknown>;

const firstValue = (
  record: UnknownRecord | null | undefined,
  keys: string[],
) => {
  for (const key of keys) {
    const value = record?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }
  return null;
};

export const cleanText = (value: unknown) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

export function normalizeTestCase(record: UnknownRecord, index: number) {
  return {
    id: String(
      firstValue(record, ["id", "sample_case_id", "case_number", "number"]) ??
        index + 1,
    ),
    label: cleanText(
      firstValue(record, ["label", "name", "title", "case_number", "number"]),
    ) || `Test ${index + 1}`,
    input: cleanText(
      firstValue(record, ["input", "sample_input", "input_data", "stdin"]),
    ),
    expectedOutput: cleanText(
      firstValue(record, [
        "output",
        "sample_output",
        "expected_output",
        "output_data",
        "stdout",
      ]),
    ),
  };
}

export function normalizeProblem(record: UnknownRecord | null) {
  if (!record) return { title: "CCC problem", statement: "", solution: "" };

  const rawCommentary = record.problem_commentary;
  const commentary =
    (Array.isArray(rawCommentary)
      ? rawCommentary
      : rawCommentary
      ? [rawCommentary]
      : [])
      .map((entry) =>
        cleanText(firstValue(entry as UnknownRecord, [
          "solution",
          "solution_text",
          "commentary",
          "commentary_text",
          "explanation",
          "analysis",
          "content",
          "answer",
          "text",
          "body",
        ]))
      )
      .filter(Boolean)
      .join("\n\n");

  return {
    title: cleanText(
      firstValue(record, [
        "title",
        "problem_title",
        "question_title",
        "name",
        "code",
      ]),
    ) || "CCC problem",
    statement: cleanText(firstValue(record, [
      "question",
      "question_text",
      "problem",
      "problem_text",
      "problem_statement",
      "statement",
      "prompt",
      "description",
      "content",
      "body",
    ])),
    solution: commentary ||
      cleanText(
        firstValue(record, [
          "solution",
          "solution_text",
          "answer",
          "explanation",
        ]),
      ),
  };
}

export function normalizeOutput(value: string) {
  return value.replace(/\r\n/g, "\n").split("\n").map((line) => line.trimEnd())
    .join("\n").trim();
}

export function truncate(value: unknown, maxLength: number) {
  const text = cleanText(value);
  return text.length <= maxLength
    ? text
    : `${text.slice(0, maxLength)}\n[truncated]`;
}
