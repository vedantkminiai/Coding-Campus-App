"""Fallback extraction for contest PDFs and commentary ZIP archives."""

from __future__ import annotations

from io import BytesIO
from zipfile import BadZipFile, ZipFile

import requests
from pypdf import PdfReader

from config import SourceConfig

MAX_ARCHIVE_BYTES = 150 * 1024 * 1024


def _get_bytes(
    url: str,
    source: SourceConfig,
    *,
    session: requests.Session | None = None,
) -> bytes:
    client = session or requests.Session()
    response = client.get(
        url,
        timeout=source.request_timeout_seconds,
        headers={"User-Agent": source.user_agent},
    )
    response.raise_for_status()
    length = int(response.headers.get("Content-Length", "0") or 0)
    if length > MAX_ARCHIVE_BYTES or len(response.content) > MAX_ARCHIVE_BYTES:
        raise ValueError(f"Fallback document is larger than {MAX_ARCHIVE_BYTES} bytes")
    return response.content


def pdf_bytes_to_text(data: bytes) -> str:
    reader = PdfReader(BytesIO(data))
    return "\n\n".join(page.extract_text() or "" for page in reader.pages)


def extract_problems_pdf(source: SourceConfig, *, session: requests.Session | None = None) -> str:
    if not source.problems_pdf_url:
        raise ValueError(f"No problem PDF fallback for {source.year} {source.division}")
    return pdf_bytes_to_text(_get_bytes(source.problems_pdf_url, source, session=session))


def extract_commentary_pdf(source: SourceConfig, *, session: requests.Session | None = None) -> str:
    """Extract the most likely commentary PDF from the row's ZIP download."""
    if not source.commentary_archive_url:
        raise ValueError(f"No commentary fallback for {source.year} {source.division}")
    data = _get_bytes(source.commentary_archive_url, source, session=session)
    try:
        with ZipFile(BytesIO(data)) as archive:
            candidates = [name for name in archive.namelist() if name.casefold().endswith(".pdf")]
            if not candidates:
                raise ValueError("Commentary archive contains no PDF")
            candidates.sort(
                key=lambda name: (
                    "comment" not in name.casefold() and "solution" not in name.casefold(),
                    len(name),
                )
            )
            return pdf_bytes_to_text(archive.read(candidates[0]))
    except BadZipFile as exc:
        raise ValueError("Commentary fallback is not a valid ZIP archive") from exc
