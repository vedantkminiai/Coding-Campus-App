"""Load validated problems through Supabase's transactional RPC endpoint."""

from __future__ import annotations

from collections.abc import Iterable

import requests

from config import SupabaseConfig
from models.problem import CCCProblem


class SupabaseLoader:
    def __init__(
        self,
        config: SupabaseConfig,
        *,
        session: requests.Session | None = None,
    ) -> None:
        self.config = config
        self.session = session or requests.Session()

    def load(self, problems: Iterable[CCCProblem]) -> None:
        endpoint = f"{self.config.url}/rest/v1/rpc/upsert_ccc_problem"
        headers = {
            "apikey": self.config.key,
            "Content-Type": "application/json",
        }
        # Opaque sb_secret_* keys are authenticated by the apikey header. The
        # legacy JWT service-role key must also be sent as a bearer token.
        if not self.config.key.startswith("sb_"):
            headers["Authorization"] = f"Bearer {self.config.key}"
        for problem in problems:
            response = self.session.post(
                endpoint,
                headers=headers,
                json={"payload": problem.model_dump(mode="json")},
                timeout=self.config.request_timeout_seconds,
            )
            response.raise_for_status()


def load_to_supabase(problems: Iterable[CCCProblem], config: SupabaseConfig | None = None) -> None:
    SupabaseLoader(config or SupabaseConfig.from_env()).load(problems)
