"""Normalize parsed records, attach commentary, and validate the result."""

from __future__ import annotations

import re
from collections.abc import Iterable, Mapping
from dataclasses import asdict

from models.problem import CCCProblem
from transform.parser import ParsedProblem


def clean_text(value: str | None) -> str | None:
    if value is None:
        return None
    value = value.replace("\xa0", " ").replace("\u2009", " ")
    lines = [re.sub(r"[ \t]+", " ", line).strip() for line in value.splitlines()]
    value = "\n".join(lines)
    value = re.sub(r"\n{3,}", "\n\n", value).strip()
    return value or None


def normalize(problems: Iterable[ParsedProblem]) -> list[CCCProblem]:
    normalized: list[CCCProblem] = []
    seen: set[str] = set()
    for parsed in problems:
        payload = asdict(parsed)
        for field_name in (
            "title",
            "description",
            "input_specification",
            "output_specification",
        ):
            payload[field_name] = clean_text(payload[field_name]) or ""
        for sample in payload["samples"]:
            for field_name in ("input", "output", "explanation"):
                sample[field_name] = clean_text(sample[field_name])
        for subtask in payload["subtasks"]:
            subtask["marks"] = clean_text(subtask["marks"])
            subtask["constraints"] = clean_text(subtask["constraints"])
        problem = CCCProblem.model_validate(payload)
        if problem.problem_id in seen:
            raise ValueError(f"Duplicate problem ID: {problem.problem_id}")
        seen.add(problem.problem_id)
        normalized.append(problem)
    return normalized


def attach_commentary(
    problems: Iterable[CCCProblem], commentary: Mapping[str, str]
) -> list[CCCProblem]:
    return [
        problem.model_copy(update={"commentary": clean_text(commentary.get(problem.problem_id))})
        for problem in problems
    ]


def validate(problems: Iterable[CCCProblem], *, require_commentary: bool = True) -> None:
    records = list(problems)
    if not records:
        raise ValueError("No problems were parsed")
    for problem in records:
        CCCProblem.model_validate(problem.model_dump())
        if require_commentary and not problem.commentary:
            raise ValueError(f"Missing commentary for {problem.problem_id}")
