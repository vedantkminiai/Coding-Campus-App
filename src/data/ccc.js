export const CCC_YEARS = [2022, 2023, 2024, 2025];
export const CCC_DIVISIONS = ["Junior", "Senior"];

const firstValue = (record, keys) => {
  for (const key of keys) {
    const value = record?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") return value;
  }
  return null;
};

const asText = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

const searchableText = (record) =>
  Object.values(record || {})
    .filter((value) => typeof value === "string" || typeof value === "number")
    .join(" ");

function inferYear(record) {
  const explicit = firstValue(record, ["year", "contest_year", "competition_year", "ccc_year"]);
  const match = String(explicit || searchableText(record)).match(/202[2-5]/);
  return match ? Number(match[0]) : null;
}

function inferDivision(record) {
  const explicit = firstValue(record, ["division", "contest_level", "level", "competition", "contest"]);
  const source = `${asText(explicit)} ${searchableText(record)}`;
  if (/\bjunior\b|\bJ[1-5]\b/i.test(source)) return "Junior";
  if (/\bsenior\b|\bS[1-5]\b/i.test(source)) return "Senior";
  return "Unclassified";
}

function inferNumber(record) {
  const explicit = firstValue(record, ["problem_number", "question_number", "number", "problem_no", "question_no"]);
  if (explicit !== null) return asText(explicit).replace(/^(problem|question)\s*/i, "");
  const match = searchableText(record).match(/\b[JS]([1-5])\b/i);
  return match ? match[1] : "";
}

function getCommentary(record) {
  const nested = record?.problem_commentary;
  if (!nested) return [];
  return Array.isArray(nested) ? nested : [nested];
}

function commentaryText(entries) {
  return entries
    .map((entry) => firstValue(entry, [
      "solution", "solution_text", "commentary", "commentary_text", "explanation",
      "analysis", "content", "answer", "text", "body",
    ]))
    .filter(Boolean)
    .map(asText)
    .join("\n\n");
}

export function normalizeCCCProblem(record, index) {
  const year = inferYear(record);
  const division = inferDivision(record);
  const number = inferNumber(record);
  const rawId = firstValue(record, ["id", "problem_id", "uuid", "slug", "problem_code", "code"]);
  const id = String(rawId ?? `${year || "ccc"}-${division}-${number || index}`);
  const code = asText(firstValue(record, ["problem_code", "question_code", "code", "slug"])) ||
    `${division === "Junior" ? "J" : division === "Senior" ? "S" : "P"}${number || index + 1}`;
  const title = asText(firstValue(record, ["title", "problem_title", "question_title", "name"])) ||
    `${year || "CCC"} ${code}`;
  const statement = asText(firstValue(record, [
    "question", "question_text", "problem", "problem_text", "problem_statement",
    "statement", "prompt", "description", "content", "body",
  ]));
  const directSolution = asText(firstValue(record, ["solution", "solution_text", "answer", "explanation"]));
  const commentary = getCommentary(record);

  return {
    id,
    year,
    division,
    number: Number(number) || 99,
    code,
    title,
    statement,
    solution: commentaryText(commentary) || directSolution,
    sourceUrl: asText(firstValue(record, ["url", "source_url", "problem_url", "link"])),
    points: firstValue(record, ["points", "score", "max_points"]),
    commentaryCount: commentary.length,
  };
}

export function buildCCCStages(problems) {
  return CCC_YEARS.flatMap((year) =>
    CCC_DIVISIONS.map((division) => ({
      id: `${year}-${division.toLowerCase()}`,
      year,
      division,
      problems: problems
        .filter((problem) => problem.year === year && problem.division === division)
        .sort((a, b) => a.number - b.number || a.title.localeCompare(b.title)),
    }))
  );
}
