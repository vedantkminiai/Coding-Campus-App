"""Fetch CCC commentary documents without doing any parsing."""

from __future__ import annotations

import requests

from config import SourceConfig


def extract_commentary(
    source: SourceConfig,
    *,
    session: requests.Session | None = None,
) -> str:
    """Download and return one commentary HTML document."""
    if not source.commentary_url:
        raise ValueError(f"No commentary HTML URL for {source.year} {source.division}")
    client = session or requests.Session()
    response = client.get(
        source.commentary_url,
        timeout=source.request_timeout_seconds,
        headers={"User-Agent": source.user_agent},
    )
    response.raise_for_status()
    return response.text
