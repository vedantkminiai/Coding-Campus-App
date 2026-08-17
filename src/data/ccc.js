export const CCC_YEARS = [2022, 2023, 2024, 2025];
export const CCC_DIVISIONS = ["Junior", "Senior"];

const firstValue = (record, keys) => {
  for (const key of keys) {
    const value = record?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") return value;
  }
  return null;
};

export const normalizeCCCText = (value) => {
  if (value === null || value === undefined) return "";
  let text;
  if (typeof value === "string") text = value;
  else if (typeof value === "number" || typeof value === "boolean") text = String(value);
  else {
    try {
      text = JSON.stringify(value, null, 2);
    } catch {
      text = String(value);
    }
  }

  const namedEntities = {
    amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
    le: "≤", ge: "≥", ne: "≠", times: "×", minus: "−", ndash: "–", mdash: "—",
    hellip: "…", copy: "©", reg: "®",
  };

  return text
    .replace(/\r\n?/g, "\n")
    .replace(/\\u([0-9a-f]{4})/gi, (_, code) => String.fromCharCode(Number.parseInt(code, 16)))
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity) => {
      if (entity[0] === "#") {
        const hexadecimal = entity[1]?.toLowerCase() === "x";
        const number = Number.parseInt(entity.slice(hexadecimal ? 2 : 1), hexadecimal ? 16 : 10);
        return Number.isNaN(number) ? match : String.fromCodePoint(number);
      }
      return namedEntities[entity.toLowerCase()] ?? match;
    })
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<(strong|b)>/gi, "**")
    .replace(/<\/(strong|b)>/gi, "**")
    .replace(/<[^>]+>/g, "")
    .replace(/\\\(|\\\)|\\\[|\\\]/g, "")
    .replace(/\\(?:,|;|:|!)/g, " ")
    .replace(/\\(?:textbf|mathbf)\{([^{}]*)\}/g, "**$1**")
    .replace(/\\(?:text|mathrm|operatorname)\{([^{}]*)\}/g, "$1")
    .replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, "($1)/($2)")
    .replace(/\\(?:leq|le)(?=[^A-Za-z]|$)/g, "≤")
    .replace(/\\(?:geq|ge)(?=[^A-Za-z]|$)/g, "≥")
    .replace(/\\neq(?=[^A-Za-z]|$)/g, "≠")
    .replace(/\\times(?=[^A-Za-z]|$)/g, "×")
    .replace(/\\cdot(?=[^A-Za-z]|$)/g, "·")
    .replace(/\\pm(?=[^A-Za-z]|$)/g, "±")
    .replace(/\\infty(?=[^A-Za-z]|$)/g, "∞")
    .replace(/\\(?:rightarrow|to)(?=[^A-Za-z]|$)/g, "→")
    .replace(/\\leftarrow(?=[^A-Za-z]|$)/g, "←")
    .replace(/\\(?:ldots|dots)(?=[^A-Za-z]|$)/g, "…")
    .replace(/\\notin(?=[^A-Za-z]|$)/g, "∉")
    .replace(/\\in(?=[^A-Za-z]|$)/g, "∈")
    .replace(/\\sum(?=[^A-Za-z]|$)/g, "Σ")
    .replace(/\\(?:lfloor|rfloor)(?=[^A-Za-z]|$)/g, (match) => match.startsWith("\\l") ? "⌊" : "⌋")
    .replace(/\\(?:lceil|rceil)(?=[^A-Za-z]|$)/g, (match) => match.startsWith("\\l") ? "⌈" : "⌉")
    .replace(/\\(?:cup)(?=[^A-Za-z]|$)/g, "∪")
    .replace(/\\(?:cap)(?=[^A-Za-z]|$)/g, "∩")
    .replace(/\\pi(?=[^A-Za-z]|$)/g, "π")
    .replace(/\\sqrt\{([^{}]*)\}/g, "√($1)")
    .replace(/([_^])\{([^{}]*)\}/g, "$1$2")
    .replace(/\\%/g, "%")
    .replace(/\$+/g, "")
    .replace(/â‰¤/g, "≤")
    .replace(/â‰¥/g, "≥")
    .replace(/â‰ /g, "≠")
    .replace(/âˆ’/g, "−")
    .replace(/Ã—/g, "×")
    .replace(/â†’/g, "→")
    .replace(/â†/g, "←")
    .replace(/â€¦/g, "…")
    .replace(/Â(?=\s|$)/g, "")
    .replace(/([0-9A-Za-z)])\s*([×÷≤≥≠=+])\s*(?=[0-9A-Za-z(])/g, "$1 $2 ")
    .replace(/([0-9)])\s*\n\s*([+−-])\s*(?=[0-9])/g, "$1 $2 ")
    .replace(/[ \t]+([,.;:!?])/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const asText = (value) => {
  try {
    return normalizeCCCText(value);
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

const nestedRecords = (record, key) => {
  const value = record?.[key];
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

function normalizeSample(sample, index) {
  return {
    id: String(firstValue(sample, ["id", "sample_case_id", "case_number", "number"]) ?? index),
    label: asText(firstValue(sample, ["label", "name", "title", "case_number", "number"])) || `Sample ${index + 1}`,
    input: asText(firstValue(sample, ["input", "sample_input", "input_data", "stdin"])),
    output: asText(firstValue(sample, ["output", "sample_output", "expected_output", "output_data", "stdout"])),
    explanation: asText(firstValue(sample, ["explanation", "commentary", "description", "notes"])),
  };
}

function normalizeSubtask(subtask, index) {
  return {
    id: String(firstValue(subtask, ["id", "subtask_id", "subtask_number", "number"]) ?? index),
    label: asText(firstValue(subtask, ["label", "name", "title", "subtask_number", "number"])) || `Subtask ${index + 1}`,
    points: firstValue(subtask, ["points", "score", "weight", "max_points"]),
    description: asText(firstValue(subtask, ["constraints", "constraint", "description", "content", "details", "text"])),
  };
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
    samples: nestedRecords(record, "sample_cases").map(normalizeSample),
    subtasks: nestedRecords(record, "subtasks").map(normalizeSubtask),
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
