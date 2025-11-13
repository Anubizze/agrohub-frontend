import json
from pathlib import Path
from typing import Any, Dict, List

import requests

DEFAULT_BASE_URL = "http://localhost:8000"
REGIONS_ENDPOINT = "/api/meteorology/regions/"
RECORDS_ENDPOINT = "/api/meteorology/records/"
REGIONS_OUTPUT_PATH = (
    Path(__file__)
    .resolve()
    .parent.parent
    / "src"
    / "modules"
    / "statistics"
    / "model"
    / "meteorology-regions.json"
)
RECORDS_OUTPUT_PATH = (
    Path(__file__)
    .resolve()
    .parent.parent
    / "src"
    / "modules"
    / "statistics"
    / "model"
    / "meteorology-records.json"
)

NEXT_ENV_FILE = Path(__file__).resolve().parent.parent / ".env.local"


def read_next_public_api_url() -> str:
    if not NEXT_ENV_FILE.exists():
        return DEFAULT_BASE_URL

    with NEXT_ENV_FILE.open("r", encoding="utf-8") as file:
        for line in file:
            stripped = line.strip()
            if not stripped or stripped.startswith("#"):
                continue

            if stripped.startswith("NEXT_PUBLIC_API_URL="):
                return stripped.split("=", 1)[1]

    return DEFAULT_BASE_URL


def fetch_records(base_url: str) -> List[Dict[str, Any]]:
    url = f"{base_url.rstrip('/')}{RECORDS_ENDPOINT}"
    response = requests.get(url, timeout=30)
    response.encoding = "utf-8"
    response.raise_for_status()
    payload = response.json()

    if isinstance(payload, dict) and "results" in payload:
        return payload["results"]
    if isinstance(payload, list):
        return payload

    raise ValueError("Unexpected API response format")


def fetch_regions(base_url: str) -> List[Dict[str, Any]]:
    url = f"{base_url.rstrip('/')}{REGIONS_ENDPOINT}"
    response = requests.get(url, timeout=30)
    response.encoding = "utf-8"
    response.raise_for_status()
    payload = response.json()

    if isinstance(payload, dict) and "results" in payload:
        return payload["results"]
    if isinstance(payload, list):
        return payload

    raise ValueError("Unexpected API response format")


def main() -> None:
    base_url = read_next_public_api_url()
    regions = fetch_regions(base_url)
    records = fetch_records(base_url)
    RECORDS_OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    with REGIONS_OUTPUT_PATH.open("w", encoding="utf-8") as file:
        json.dump(regions, file, ensure_ascii=False, indent=2)

    with RECORDS_OUTPUT_PATH.open("w", encoding="utf-8") as file:
        json.dump(records, file, ensure_ascii=False, indent=2)

    print(
        f"Fetched {len(regions)} regions to {REGIONS_OUTPUT_PATH}\n"
        f"Fetched {len(records)} meteorology records to {RECORDS_OUTPUT_PATH}"
    )


if __name__ == "__main__":
    main()

