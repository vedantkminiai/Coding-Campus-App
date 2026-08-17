import React from "react";
import { normalizeCCCText } from "../../data/ccc";

function renderInline(text, lineIndex) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);

  return parts.map((part, index) => {
    const key = `${lineIndex}-${index}`;
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={key}>{part.slice(1, -1)}</code>;
    }
    return <React.Fragment key={key}>{part}</React.Fragment>;
  });
}

function FormattedCCCText({ children, fallback = "" }) {
  const text = normalizeCCCText(children) || fallback;
  const lines = text.split("\n");

  return (
    <>
      {lines.map((line, index) => (
        <React.Fragment key={`${index}-${line.slice(0, 12)}`}>
          {renderInline(line, index)}
          {index < lines.length - 1 && <br />}
        </React.Fragment>
      ))}
    </>
  );
}

export default FormattedCCCText;
