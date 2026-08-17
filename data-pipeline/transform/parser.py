"""DOM parsers for Pandoc-style CEMC problems and commentary pages."""

from __future__ import annotations

import re
from collections.abc import Iterable
from dataclasses import dataclass, field

from bs4 import BeautifulSoup, Tag

from config import SourceConfig

_IDENTIFIERS = r"(?:[JS]\d+)(?:/[JS]\d+)*"
_PROBLEM_HEADING = re.compile(
    rf"^Problem\s+({_IDENTIFIERS})\s*:\s*(.+)$", re.IGNORECASE | re.DOTALL
)
_COMMENTARY_HEADING = re.compile(
    rf"^(?:Problem\s+)?({_IDENTIFIERS})(?:\s*:)?\s+(.+)$",
    re.IGNORECASE | re.DOTALL,
)
_SAMPLE_HEADING = re.compile(r"^Sample Input(?:\s+(\d+))?$", re.IGNORECASE)


@dataclass(slots=True)
class ParsedSample:
    input: str
    output: str
    explanation: str | None = None


@dataclass(slots=True)
class ParsedSubtask:
    marks: str
    constraints: str


@dataclass(slots=True)
class ParsedProblem:
    problem_id: str
    year: int
    division: str
    problem_number: str
    title: str
    description: str
    input_specification: str
    output_specification: str
    source_url: str
    samples: list[ParsedSample] = field(default_factory=list)
    subtasks: list[ParsedSubtask] = field(default_factory=list)


def _text(node: Tag) -> str:
    clone = BeautifulSoup(str(node), "html.parser")
    for unwanted in clone.select("script, style, img, svg"):
        unwanted.decompose()
    for br in clone.find_all("br"):
        br.replace_with("\n")
    return clone.get_text(" ", strip=True)


def _heading_text(node: Tag) -> str:
    return " ".join(_text(node).split())


def _nodes_text(nodes: Iterable[Tag]) -> str:
    parts = [_text(node) for node in nodes]
    return "\n\n".join(part for part in parts if part)


def _siblings_until(heading: Tag, stop_levels: set[str]) -> list[Tag]:
    result: list[Tag] = []
    for sibling in heading.next_siblings:
        if not isinstance(sibling, Tag):
            continue
        if sibling.name in stop_levels:
            break
        result.append(sibling)
    return result


def _section(problem_heading: Tag, label: str) -> str:
    for node in problem_heading.next_siblings:
        if not isinstance(node, Tag):
            continue
        if node.name == "h2":
            break
        if node.name == "h3" and _heading_text(node).casefold() == label.casefold():
            return _nodes_text(_siblings_until(node, {"h2", "h3"}))
    return ""


def _parse_samples(problem_heading: Tag) -> list[ParsedSample]:
    samples: list[ParsedSample] = []
    for heading in problem_heading.next_siblings:
        if not isinstance(heading, Tag):
            continue
        if heading.name == "h2":
            break
        if heading.name != "h3":
            continue
        if not _SAMPLE_HEADING.match(_heading_text(heading)):
            continue

        sample_nodes = _siblings_until(heading, {"h2", "h3"})
        input_nodes: list[Tag] = []
        output_nodes: list[Tag] = []
        explanation_nodes: list[Tag] = []
        destination = input_nodes
        for node in sample_nodes:
            if node.name in {"h4", "h5"}:
                label = _heading_text(node).casefold()
                if label.startswith("output for sample input"):
                    destination = output_nodes
                elif label.startswith("explanation of output"):
                    destination = explanation_nodes
                else:
                    # For example, the optional "Unencrypted" input in S5.
                    destination = []
                continue
            destination.append(node)

        sample_input = _nodes_text(input_nodes)
        sample_output = _nodes_text(output_nodes)
        if sample_input and sample_output:
            samples.append(
                ParsedSample(
                    input=sample_input,
                    output=sample_output,
                    explanation=_nodes_text(explanation_nodes) or None,
                )
            )
    return samples


def _parse_subtasks(problem_heading: Tag) -> list[ParsedSubtask]:
    input_heading = None
    for heading in problem_heading.next_siblings:
        if not isinstance(heading, Tag):
            continue
        if heading.name == "h2":
            break
        if heading.name == "h3" and _heading_text(heading).casefold() == "input specification":
            input_heading = heading
            break
    if input_heading is None:
        return []

    table = None
    for node in _siblings_until(input_heading, {"h2", "h3"}):
        if node.name == "table":
            table = node
            break
        nested_table = node.find("table")
        if nested_table is not None:
            table = nested_table
            break
    if table is None:
        return []
    rows = table.find_all("tr")
    if len(rows) < 2:
        return []
    headers = [_text(cell) for cell in rows[0].find_all(["th", "td"])]
    marks_index = next(
        (index for index, header in enumerate(headers) if "mark" in header.casefold()),
        None,
    )
    if marks_index is None:
        return []

    subtasks: list[ParsedSubtask] = []
    for row in rows[1:]:
        cells = [_text(cell) for cell in row.find_all(["th", "td"])]
        if marks_index >= len(cells) or not cells[marks_index]:
            continue
        details = []
        for index, value in enumerate(cells):
            if index == marks_index or not value:
                continue
            header = headers[index] if index < len(headers) else "Constraint"
            details.append(f"{header}: {value}")
        subtasks.append(
            ParsedSubtask(marks=cells[marks_index], constraints="; ".join(details) or "None")
        )
    return subtasks


def parse_problems(html: str, source: SourceConfig) -> list[ParsedProblem]:
    """Split one CEMC document into problem records."""
    soup = BeautifulSoup(html, "html.parser")
    wanted = {number.upper() for number in source.problem_numbers}
    problems: list[ParsedProblem] = []
    for heading in soup.find_all("h2"):
        heading_text = _heading_text(heading)
        match = _PROBLEM_HEADING.match(heading_text)
        if not match:
            # A small number of official files omit "Problem J1:" from the
            # first heading. Infer only that first configured problem.
            if problems or not source.problem_numbers:
                continue
            number, title = source.problem_numbers[0], heading_text
        else:
            identifiers = match.group(1).upper().split("/")
            number = next((identifier for identifier in identifiers if identifier in wanted), "")
            title = match.group(2)
            if not number:
                continue
        problems.append(
            ParsedProblem(
                problem_id=f"{source.year}-{number}",
                year=source.year,
                division=source.division,
                problem_number=number,
                title=title,
                description=_section(heading, "Problem Description"),
                input_specification=_section(heading, "Input Specification"),
                output_specification=_section(heading, "Output Specification"),
                source_url=source.source_url,
                samples=_parse_samples(heading),
                subtasks=_parse_subtasks(heading),
            )
        )
    return problems


def parse_commentary(html: str, source: SourceConfig) -> dict[str, str]:
    """Return commentary keyed by canonical problem ID."""
    soup = BeautifulSoup(html, "html.parser")
    wanted = {number.upper() for number in source.problem_numbers}
    commentary: dict[str, str] = {}
    for heading in soup.find_all("h2"):
        match = _COMMENTARY_HEADING.match(_heading_text(heading))
        if not match:
            number = next(
                (
                    expected
                    for expected in source.problem_numbers
                    if f"{source.year}-{expected}" not in commentary
                ),
                "",
            )
            if not number:
                continue
        else:
            identifiers = match.group(1).upper().split("/")
            number = next((identifier for identifier in identifiers if identifier in wanted), "")
            if not number:
                continue
        commentary[f"{source.year}-{number}"] = _nodes_text(_siblings_until(heading, {"h2"}))
    return commentary
