import { normalizeCCCText } from "./ccc";

describe("normalizeCCCText", () => {
  test("cleans compact LaTeX math and wrapped operators", () => {
    expect(normalizeCCCText(String.raw`The total is \(2\times8
- 5\times3\).`)).toBe("The total is 2 × 8 - 5 × 3.");
  });

  test("decodes entities and common mojibake", () => {
    expect(normalizeCCCText("A &le; B â†’ C &amp; D")).toBe("A ≤ B → C & D");
  });

  test("preserves meaningful multi-line sample data", () => {
    expect(normalizeCCCText("3\n10 20 30\n2")).toBe("3\n10 20 30\n2");
  });
});
