from extract.archive import discover_sources

ARCHIVE_HTML = """
<table><tbody>
<tr>
  <td class="views-field-title">Canadian Computing Competition Senior</td>
  <td class="views-field-field-year-term">2025</td>
  <td headers="view-nothing-table-column">
    <a href="/2025/senior.html">View Contest</a>
    <a href="/2025/senior.pdf">Download</a>
  </td>
  <td headers="view-nothing-2-table-column">
    <a href="/2025/commentary.html">View Solution</a>
    <a href="https://files.test/senior.zip">Download</a>
  </td>
</tr>
<tr>
  <td class="views-field-title">Canadian Computing Competition Junior</td>
  <td class="views-field-field-year-term">2022</td>
  <td headers="view-nothing-table-column">
    <a href="/2022/junior.pdf">Download</a>
  </td>
  <td headers="view-nothing-2-table-column">
    <a href="/2022/junior.zip">Download</a>
  </td>
</tr>
</tbody></table>
"""


def test_discovers_html_and_fallback_links() -> None:
    sources = discover_sources([ARCHIVE_HTML], start_year=2025, end_year=2022)

    assert [(source.year, source.division) for source in sources] == [
        (2025, "Senior"),
        (2022, "Junior"),
    ]
    assert sources[0].problems_url == "https://cemc.uwaterloo.ca/2025/senior.html"
    assert sources[0].commentary_url == "https://cemc.uwaterloo.ca/2025/commentary.html"
    assert sources[1].problems_url is None
    assert sources[1].problems_pdf_url == "https://cemc.uwaterloo.ca/2022/junior.pdf"
    assert sources[1].commentary_archive_url == "https://cemc.uwaterloo.ca/2022/junior.zip"
