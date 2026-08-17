from config import SourceConfig
from transform.normalizer import attach_commentary, normalize, validate
from transform.parser import parse_commentary, parse_problems

SOURCE = SourceConfig(
    year=2025,
    division="Senior",
    problem_numbers=("S1",),
    problems_url="https://example.test/problems.html",
    commentary_url="https://example.test/commentary.html",
)

PROBLEMS_HTML = """
<html><body>
<h2>Problem S1: Example\nProblem</h2>
<h3>Problem\nDescription</h3><p>Solve <span>this</span> problem.</p>
<h3>Input\nSpecification</h3><p>Read an integer.</p>
<div><table><tr><th>Marks</th><th>Additional Constraints</th></tr>
<tr><td>5</td><td>N &lt;= 10</td></tr><tr><td>10</td><td>None</td></tr></table></div>
<h3>Output\nSpecification</h3><p>Print the answer.</p>
<h3>Sample Input 1</h3><pre><code>7\n</code></pre>
<h4>Output for Sample Input 1</h4><pre><code>14\n</code></pre>
<h4>Explanation of Output for Sample Input 1</h4><p>Double it.</p>
</body></html>
"""

COMMENTARY_HTML = """
<html><body><h2>S1 Example Problem</h2><p>Use arithmetic.</p>
<h3>Subtask 1</h3><p>Handle small input.</p></body></html>
"""


def test_full_transform() -> None:
    parsed = parse_problems(PROBLEMS_HTML, SOURCE)
    assert len(parsed) == 1
    assert parsed[0].title == "Example Problem"
    assert parsed[0].samples[0].input == "7"
    assert parsed[0].subtasks[0].marks == "5"

    problems = normalize(parsed)
    problems = attach_commentary(problems, parse_commentary(COMMENTARY_HTML, SOURCE))
    validate(problems)

    assert problems[0].problem_id == "2025-S1"
    assert problems[0].samples[0].output == "14"
    assert "Subtask 1" in (problems[0].commentary or "")


def test_infers_first_heading_and_selects_shared_problem_number() -> None:
    junior_source = SourceConfig(
        year=2023,
        division="Junior",
        problem_numbers=("J1", "J4"),
        problems_url="https://example.test/problems.html",
        commentary_url="https://example.test/commentary.html",
    )
    html = """
    <h2>First Problem Without Its Number</h2>
    <h3>Problem Description</h3><p>First description.</p>
    <h3>Input Specification</h3><p>First input.</p>
    <h3>Output Specification</h3><p>First output.</p>
    <h2>Problem J4/S1: Shared Problem</h2>
    <h3>Problem Description</h3><p>Shared description.</p>
    <h3>Input Specification</h3><p>Shared input.</p>
    <h3>Output Specification</h3><p>Shared output.</p>
    """

    problems = parse_problems(html, junior_source)

    assert [problem.problem_number for problem in problems] == ["J1", "J4"]

    commentary = parse_commentary(
        "<h2>J1 First Problem</h2><p>First.</p>"
        "<h2>Shared Problem Without Number</h2><p>Shared.</p>",
        junior_source,
    )
    assert set(commentary) == {"2023-J1", "2023-J4"}
