type StructuredOutputOptions = {
  model: string;
  name: string;
  schema: Record<string, unknown>;
  instructions: string;
  input: unknown;
};

function extractOutputText(response: Record<string, unknown>) {
  if (typeof response.output_text === "string") return response.output_text;
  const output = Array.isArray(response.output) ? response.output : [];
  for (const item of output) {
    const content = Array.isArray((item as Record<string, unknown>)?.content)
      ? (item as Record<string, unknown>).content as Record<string, unknown>[]
      : [];
    for (const part of content) {
      if (part.type === "output_text" && typeof part.text === "string") {
        return part.text;
      }
    }
  }
  return "";
}

const parseJson = (value: string) => {
  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return {};
  }
};

export async function requestStructuredOutput<T>(
  options: StructuredOutputOptions,
): Promise<T> {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: options.model,
      instructions: options.instructions,
      input: typeof options.input === "string"
        ? options.input
        : JSON.stringify(options.input),
      text: {
        format: {
          type: "json_schema",
          name: options.name,
          strict: true,
          schema: options.schema,
        },
      },
    }),
  });

  const rawBody = await response.text();
  const payload = parseJson(rawBody);
  if (!response.ok) {
    const upstreamError = payload.error && typeof payload.error === "object"
      ? payload.error as Record<string, unknown>
      : {};
    const code = String(upstreamError.code || "");
    const type = String(upstreamError.type || "");
    const requestId = response.headers.get("x-request-id");
    console.error("OpenAI request failed", {
      status: response.status,
      code,
      type,
      requestId,
    });

    if (response.status === 401) {
      throw new Error("OpenAI rejected OPENAI_API_KEY");
    }
    if (response.status === 429 && code === "insufficient_quota") {
      throw new Error(
        "OpenAI API quota is exhausted or billing is not enabled",
      );
    }
    if (response.status === 429) {
      throw new Error("OpenAI rate limit reached; wait briefly and try again");
    }
    throw new Error("The AI service is temporarily unavailable");
  }

  const outputText = extractOutputText(payload);
  if (!outputText) throw new Error("The AI service returned an empty response");
  return JSON.parse(outputText) as T;
}
