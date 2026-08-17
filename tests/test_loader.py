from config import SupabaseConfig
from load.supabase import SupabaseLoader
from models.problem import CCCProblem


class Response:
    def raise_for_status(self) -> None:
        return None


class Session:
    def __init__(self) -> None:
        self.calls = []

    def post(self, url, **kwargs):
        self.calls.append((url, kwargs))
        return Response()


def test_loader_uses_transactional_rpc() -> None:
    problem = CCCProblem(
        problem_id="2025-S1",
        year=2025,
        division="Senior",
        problem_number="S1",
        title="Title",
        description="Description",
        input_specification="Input",
        output_specification="Output",
        source_url="https://example.test/problem",
        commentary="Commentary",
    )
    session = Session()
    loader = SupabaseLoader(
        SupabaseConfig(url="https://project.supabase.co", key="secret"),
        session=session,  # type: ignore[arg-type]
    )
    loader.load([problem])

    url, kwargs = session.calls[0]
    assert url.endswith("/rest/v1/rpc/upsert_ccc_problem")
    assert kwargs["json"]["payload"]["problem_id"] == "2025-S1"
    assert kwargs["headers"]["apikey"] == "secret"
