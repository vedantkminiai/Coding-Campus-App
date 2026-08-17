"""Discover CCC source documents from Waterloo's past-contests archive."""

from __future__ import annotations

from collections.abc import Iterable
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup, Tag

from config import ARCHIVE_CATEGORY, ARCHIVE_URL, SourceConfig


def extract_archive_pages(
    *,
    page_count: int = 3,
    session: requests.Session | None = None,
    timeout: float = 30.0,
    user_agent: str = "ccc-etl/1.0 (educational data pipeline)",
) -> list[str]:
    """Fetch the configured number of paginated CCC archive pages."""
    client = session or requests.Session()
    pages: list[str] = []
    for page in range(page_count):
        response = client.get(
            ARCHIVE_URL,
            params={
                "grade": "All",
                "academic_year": "All",
                "contest_category": ARCHIVE_CATEGORY,
                "page": page,
            },
            timeout=timeout,
            headers={"User-Agent": user_agent},
        )
        response.raise_for_status()
        pages.append(response.text)
    return pages


def _cell(row: Tag, class_name: str) -> Tag | None:
    return row.find("td", class_=lambda classes: classes and class_name in classes)


def _absolute_href(link: Tag | None) -> str | None:
    if link is None or not link.get("href"):
        return None
    return urljoin(ARCHIVE_URL, str(link["href"]))


def _link_by_text(cell: Tag | None, label: str) -> Tag | None:
    if cell is None:
        return None
    wanted = label.casefold()
    return next(
        (
            link
            for link in cell.find_all("a")
            if wanted in link.get_text(" ", strip=True).casefold()
        ),
        None,
    )


def _link_by_suffix(cell: Tag | None, suffix: str) -> Tag | None:
    if cell is None:
        return None
    return next(
        (
            link
            for link in cell.find_all("a")
            if str(link.get("href", "")).casefold().endswith(suffix.casefold())
        ),
        None,
    )


def discover_sources(
    archive_pages: Iterable[str],
    *,
    start_year: int = 2025,
    end_year: int = 2022,
) -> list[SourceConfig]:
    """Parse archive rows into sources, preferring HTML over PDF/ZIP."""
    if start_year < end_year:
        raise ValueError("start_year must be greater than or equal to end_year")

    discovered: dict[tuple[int, str], SourceConfig] = {}
    for html in archive_pages:
        soup = BeautifulSoup(html, "html.parser")
        for row in soup.select("table tbody tr"):
            title_cell = _cell(row, "views-field-title")
            year_cell = _cell(row, "views-field-field-year-term")
            if title_cell is None or year_cell is None:
                continue
            title = " ".join(title_cell.get_text(" ", strip=True).split())
            if not title.startswith("Canadian Computing Competition"):
                continue
            try:
                year = int(year_cell.get_text(" ", strip=True))
            except ValueError:
                continue
            if not end_year <= year <= start_year:
                continue

            if title.endswith("Senior"):
                division, prefix = "Senior", "S"
            elif title.endswith("Junior"):
                division, prefix = "Junior", "J"
            else:
                continue

            contest_cell = row.find("td", headers="view-nothing-table-column")
            commentary_cell = row.find("td", headers="view-nothing-2-table-column")
            source = SourceConfig(
                year=year,
                division=division,
                problem_numbers=tuple(f"{prefix}{number}" for number in range(1, 6)),
                problems_url=_absolute_href(_link_by_text(contest_cell, "View Contest")),
                commentary_url=_absolute_href(_link_by_text(commentary_cell, "View Solution")),
                problems_pdf_url=_absolute_href(_link_by_suffix(contest_cell, ".pdf")),
                commentary_archive_url=_absolute_href(_link_by_suffix(commentary_cell, ".zip")),
            )
            discovered[(year, division)] = source

    division_order = {"Senior": 0, "Junior": 1}
    return sorted(
        discovered.values(),
        key=lambda source: (-source.year, division_order[source.division]),
    )
