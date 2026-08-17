"""Configuration for source documents and the Supabase destination."""

from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class SourceConfig:
    year: int
    division: str
    problem_numbers: tuple[str, ...]
    problems_url: str | None = None
    commentary_url: str | None = None
    problems_pdf_url: str | None = None
    commentary_archive_url: str | None = None
    request_timeout_seconds: float = 30.0
    user_agent: str = "ccc-etl/1.0 (educational data pipeline)"

    def __post_init__(self) -> None:
        if not self.problems_url and not self.problems_pdf_url:
            raise ValueError("A problems HTML or PDF URL is required")
        if not self.commentary_url and not self.commentary_archive_url:
            raise ValueError("A commentary HTML or archive URL is required")

    @property
    def source_url(self) -> str:
        return self.problems_url or self.problems_pdf_url or ""


@dataclass(frozen=True, slots=True)
class SupabaseConfig:
    url: str
    key: str
    request_timeout_seconds: float = 30.0

    @classmethod
    def from_env(cls) -> SupabaseConfig:
        url = os.getenv("SUPABASE_URL", "").rstrip("/")
        key = os.getenv("SUPABASE_KEY", "")
        if not url or not key:
            raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set")
        return cls(url=url, key=key)


SOURCES: tuple[SourceConfig, ...] = (
    SourceConfig(
        year=2025,
        division="Senior",
        problem_numbers=("S1", "S2", "S3", "S4", "S5"),
        problems_url=(
            "https://cemc.uwaterloo.ca/sites/default/files/documents/2025/2025CCCSrProblems.html"
        ),
        commentary_url=(
            "https://cemc.uwaterloo.ca/sites/default/files/documents/2025/2025CCCSrCommentary.html"
        ),
    ),
)

ARCHIVE_URL = "https://cemc.uwaterloo.ca/resources/past-contests"
ARCHIVE_CATEGORY = 29


def get_source(year: int, division: str) -> SourceConfig:
    for source in SOURCES:
        if source.year == year and source.division.casefold() == division.casefold():
            return source
    raise ValueError(f"No source configured for {year} {division}")
