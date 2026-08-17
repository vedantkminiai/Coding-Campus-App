from config import SourceConfig
from transform.normalizer import attach_commentary, normalize, validate
from transform.pdf_parser import parse_commentary_pdf, parse_problems_pdf

SOURCE = SourceConfig(
    year=2022,
    division="Junior",
    problem_numbers=("J1",),
    problems_pdf_url="https://example.test/problems.pdf",
    commentary_archive_url="https://example.test/commentary.zip",
)


def test_pdf_text_fallback() -> None:
    problems_text = """
Problem J1: Example
Problem Description
Add two values.
Input Specification
Read two integers.
Output Specification
Print their sum.
Sample Input 1
1 2
Output for Sample Input 1
3
Explanation of Output for Sample Input 1
One plus two is three.
"""
    commentary_text = """
J1: Example
Add the two input values and print the result.
"""

    problems = normalize(parse_problems_pdf(problems_text, SOURCE))
    problems = attach_commentary(problems, parse_commentary_pdf(commentary_text, SOURCE))
    validate(problems)

    assert problems[0].problem_id == "2022-J1"
    assert problems[0].samples[0].output == "3"
