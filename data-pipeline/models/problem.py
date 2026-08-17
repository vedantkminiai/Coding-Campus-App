"""Pydantic models for normalized CCC problem data."""

from __future__ import annotations

import re

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class SampleCase(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    input: str = Field(min_length=1)
    output: str = Field(min_length=1)
    explanation: str | None = None


class Subtask(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    marks: str = Field(min_length=1)
    constraints: str = Field(min_length=1)


class CCCProblem(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    problem_id: str = Field(pattern=r"^\d{4}-[JS]\d+$")
    year: int = Field(ge=1996, le=2100)
    division: str = Field(pattern=r"^(Junior|Senior)$")
    problem_number: str = Field(pattern=r"^[JS]\d+$")
    title: str = Field(min_length=1)
    description: str = Field(min_length=1)
    input_specification: str = Field(min_length=1)
    output_specification: str = Field(min_length=1)
    source_url: str = Field(min_length=1)
    samples: list[SampleCase] = Field(default_factory=list)
    subtasks: list[Subtask] = Field(default_factory=list)
    commentary: str | None = None

    @field_validator("source_url")
    @classmethod
    def source_must_be_http(cls, value: str) -> str:
        if not re.match(r"^https?://", value):
            raise ValueError("source_url must be an HTTP(S) URL")
        return value

    @model_validator(mode="after")
    def identifiers_are_consistent(self) -> CCCProblem:
        expected_prefix = "S" if self.division == "Senior" else "J"
        if not self.problem_number.startswith(expected_prefix):
            raise ValueError("problem_number does not match division")
        if self.problem_id != f"{self.year}-{self.problem_number}":
            raise ValueError("problem_id must be '<year>-<problem_number>'")
        return self
