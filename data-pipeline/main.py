"""Command-line orchestration for the CCC ETL pipeline."""

from __future__ import annotations

import argparse
import json
import logging

import requests
from pypdf.errors import PdfReadError

from config import SupabaseConfig, get_source
from extract.archive import discover_sources, extract_archive_pages
from extract.commentary import extract_commentary
from extract.pdf import extract_commentary_pdf, extract_problems_pdf
from extract.problems import extract_problems
from load.supabase import load_to_supabase
from models.problem import CCCProblem
from transform.normalizer import attach_commentary, normalize, validate
from transform.parser import parse_commentary, parse_problems
from transform.pdf_parser import parse_commentary_pdf, parse_problems_pdf

LOGGER = logging.getLogger(__name__)
SOURCE_ERRORS = (requests.RequestException, ValueError, PdfReadError)


def _assert_complete(problems: list[CCCProblem], expected_numbers: tuple[str, ...]) -> None:
    expected = set(expected_numbers)
    actual = {problem.problem_number for problem in problems}
    if actual != expected:
        raise ValueError(f"Expected {sorted(expected)}, parsed {sorted(actual)}")


def transform_source(source) -> list[CCCProblem]:
    """Extract and transform one contest, falling back to official PDFs."""
    problems: list[CCCProblem] | None = None
    problems_error: Exception | None = None
    if source.problems_url:
        try:
            problems = normalize(parse_problems(extract_problems(source), source))
            _assert_complete(problems, source.problem_numbers)
        except SOURCE_ERRORS as exc:  # Fall back only after the preferred source fails.
            problems_error = exc
            problems = None
            LOGGER.warning(
                "HTML problems failed for %s %s; trying PDF: %s",
                source.year,
                source.division,
                exc,
            )
    if problems is None:
        try:
            problems = normalize(parse_problems_pdf(extract_problems_pdf(source), source))
            _assert_complete(problems, source.problem_numbers)
        except SOURCE_ERRORS as exc:
            raise RuntimeError(
                f"Could not parse problems for {source.year} {source.division}"
            ) from (problems_error or exc)

    commentary: dict[str, str] | None = None
    commentary_error: Exception | None = None
    if source.commentary_url:
        try:
            commentary = parse_commentary(extract_commentary(source), source)
            missing = {
                problem.problem_id for problem in problems if problem.problem_id not in commentary
            }
            if missing:
                raise ValueError(f"Missing HTML commentary for {sorted(missing)}")
        except SOURCE_ERRORS as exc:  # Fall back only after the preferred source fails.
            commentary_error = exc
            commentary = None
            LOGGER.warning(
                "HTML commentary failed for %s %s; trying archive PDF: %s",
                source.year,
                source.division,
                exc,
            )
    if commentary is None:
        try:
            commentary = parse_commentary_pdf(extract_commentary_pdf(source), source)
        except SOURCE_ERRORS as exc:
            raise RuntimeError(
                f"Could not parse commentary for {source.year} {source.division}"
            ) from (commentary_error or exc)

    problems = attach_commentary(problems, commentary)
    validate(problems)
    return problems


def run(*, year: int, division: str, dry_run: bool = False) -> list[CCCProblem]:
    problems = transform_source(get_source(year, division))

    if not dry_run:
        load_to_supabase(problems, SupabaseConfig.from_env())
    return problems


def run_archive(
    *,
    start_year: int = 2025,
    end_year: int = 2022,
    page_count: int = 3,
    dry_run: bool = False,
) -> list[CCCProblem]:
    pages = extract_archive_pages(page_count=page_count)
    sources = discover_sources(pages, start_year=start_year, end_year=end_year)
    expected_sources = {
        (year, division)
        for year in range(end_year, start_year + 1)
        for division in ("Junior", "Senior")
    }
    actual_sources = {(source.year, source.division) for source in sources}
    if actual_sources != expected_sources:
        missing = sorted(expected_sources - actual_sources)
        raise ValueError(f"Archive discovery did not find: {missing}")

    problems = [problem for source in sources for problem in transform_source(source)]
    validate(problems)
    expected_problem_ids = {
        f"{source.year}-{number}" for source in sources for number in source.problem_numbers
    }
    actual_problem_ids = {problem.problem_id for problem in problems}
    if actual_problem_ids != expected_problem_ids or len(actual_problem_ids) != len(problems):
        raise ValueError(
            "Archive problem IDs differ from the expected set: "
            f"missing={sorted(expected_problem_ids - actual_problem_ids)}, "
            f"unexpected={sorted(actual_problem_ids - expected_problem_ids)}"
        )
    if not dry_run:
        load_to_supabase(problems, SupabaseConfig.from_env())
    return problems


def main() -> None:
    parser = argparse.ArgumentParser(description="Extract, transform, and load CCC data")
    parser.add_argument("--year", type=int, default=2025)
    parser.add_argument("--division", default="Senior")
    parser.add_argument(
        "--archive",
        action="store_true",
        help="discover and process Junior and Senior contests from the archive",
    )
    parser.add_argument("--start-year", type=int, default=2025)
    parser.add_argument("--end-year", type=int, default=2022)
    parser.add_argument("--archive-pages", type=int, default=3)
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="parse and validate without writing to Supabase",
    )
    parser.add_argument("--json", action="store_true", help="print normalized JSON")
    args = parser.parse_args()

    if args.archive:
        problems = run_archive(
            start_year=args.start_year,
            end_year=args.end_year,
            page_count=args.archive_pages,
            dry_run=args.dry_run,
        )
    else:
        problems = run(year=args.year, division=args.division, dry_run=args.dry_run)
    if args.json:
        print(json.dumps([p.model_dump(mode="json") for p in problems], indent=2))
    else:
        action = "Validated" if args.dry_run else "Loaded"
        print(f"{action} {len(problems)} problems")


if __name__ == "__main__":
    main()
