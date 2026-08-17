"""Best-effort fallback parsers for text extracted from official CCC PDFs."""

from __future__ import annotations

import re

from config import SourceConfig
from transform.parser import ParsedProblem, ParsedSample

_IDENTIFIERS = r"(?:[JS]\d+)(?:/[JS]\d+)*"
_PROBLEM = re.compile(rf"(?im)^\s*Problem\s+({_IDENTIFIERS})\s*:\s*([^\n]+)")
_COMMENTARY = re.compile(rf"(?im)^\s*(?:Problem\s+)?({_IDENTIFIERS})(?:\s*:)?\s+([^\n]+)")


def _clean(value: str) -> str:
    value = value.replace("\r", "").replace("\f", "\n")
    lines = [re.sub(r"[ \t]+", " ", line).strip() for line in value.splitlines()]
    return re.sub(r"\n{3,}", "\n\n", "\n".join(lines)).strip()


def _between(text: str, start: str, stops: tuple[str, ...]) -> str:
    start_match = re.search(re.escape(start), text, re.IGNORECASE)
    if not start_match:
        return ""
    tail = text[start_match.end() :]
    stop_matches = [
        match
        for label in stops
        if (match := re.search(re.escape(label), tail, re.IGNORECASE)) is not None
    ]
    end = min((match.start() for match in stop_matches), default=len(tail))
    return _clean(tail[:end])


def _parse_samples(text: str) -> list[ParsedSample]:
    headings = list(re.finditer(r"(?im)^\s*Sample Input(?:\s+\d+)?\s*$", text))
    samples: list[ParsedSample] = []
    for index, heading in enumerate(headings):
        end = headings[index + 1].start() if index + 1 < len(headings) else len(text)
        block = text[heading.end() : end]
        output_heading = re.search(r"(?im)^\s*Output for Sample Input(?:\s+\d+)?\s*$", block)
        if output_heading is None:
            continue
        explanation_heading = re.search(
            r"(?im)^\s*Explanation of Output for Sample Input(?:\s+\d+)?\s*$", block
        )
        sample_input = _clean(block[: output_heading.start()])
        output_end = explanation_heading.start() if explanation_heading else len(block)
        sample_output = _clean(block[output_heading.end() : output_end])
        explanation = _clean(block[explanation_heading.end() :]) if explanation_heading else None
        if sample_input and sample_output:
            samples.append(
                ParsedSample(
                    input=sample_input,
                    output=sample_output,
                    explanation=explanation or None,
                )
            )
    return samples


def parse_problems_pdf(text: str, source: SourceConfig) -> list[ParsedProblem]:
    """Parse extracted PDF text when an HTML contest view is unavailable."""
    matches = list(_PROBLEM.finditer(text))
    wanted = {number.upper() for number in source.problem_numbers}
    problems: list[ParsedProblem] = []
    for index, match in enumerate(matches):
        identifiers = match.group(1).upper().split("/")
        number = next((identifier for identifier in identifiers if identifier in wanted), "")
        if not number:
            continue
        end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
        block = text[match.end() : end]
        problems.append(
            ParsedProblem(
                problem_id=f"{source.year}-{number}",
                year=source.year,
                division=source.division,
                problem_number=number,
                title=_clean(match.group(2)),
                description=_between(block, "Problem Description", ("Input Specification",)),
                input_specification=_between(
                    block, "Input Specification", ("Output Specification",)
                ),
                output_specification=_between(block, "Output Specification", ("Sample Input",)),
                source_url=source.problems_pdf_url or source.source_url,
                samples=_parse_samples(block),
            )
        )
    return problems


def parse_commentary_pdf(text: str, source: SourceConfig) -> dict[str, str]:
    """Split extracted commentary PDF text by problem heading."""
    matches = list(_COMMENTARY.finditer(text))
    wanted = {number.upper() for number in source.problem_numbers}
    commentary: dict[str, str] = {}
    for index, match in enumerate(matches):
        identifiers = match.group(1).upper().split("/")
        number = next((identifier for identifier in identifiers if identifier in wanted), "")
        if not number or f"{source.year}-{number}" in commentary:
            continue
        end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
        body = _clean(text[match.end() : end])
        if body:
            commentary[f"{source.year}-{number}"] = body
    return commentary
