#!/usr/bin/env python3
"""Generate review-only, simulated coordinates for prototype transformers.

Coordinates are synthetic prototype points and do not represent real utility
infrastructure. This script reads transformer_id and zone_id from a local CSV,
then writes a separate local CSV. It does not connect to Supabase.
Uses Python's standard library only.
"""

from __future__ import annotations

import csv
import math
import random
import re
import sys
from collections import Counter
from pathlib import Path


INPUT_CSV = Path(__file__).resolve().with_name("transformer_zone_assignments.csv")
OUTPUT_CSV = Path(__file__).resolve().with_name("simulated_transformer_coordinates.csv")
SEED = 20260929
MIN_SPACING_METERS = 20.0
EXPECTED_TRANSFORMERS = 200

# Coordinates below define synthetic, non-overlapping generation masks inside
# the requested outer envelopes. They are not official zone boundaries.
# Polygon vertices use (latitude, longitude).
ZONE_POLYGONS: dict[int, list[tuple[float, float]]] = {
    1: [(19.263, 72.862), (19.263, 72.875), (19.274, 72.887), (19.286, 72.886), (19.286, 72.862)],
    2: [(19.263, 72.836), (19.263, 72.849), (19.275, 72.860), (19.286, 72.859), (19.286, 72.835)],
    3: [(19.300, 72.860), (19.300, 72.869), (19.307, 72.877), (19.321, 72.875), (19.321, 72.861)],
    4: [(19.300, 72.834), (19.300, 72.847), (19.307, 72.853), (19.318, 72.851), (19.318, 72.833)],
    5: [(19.3185, 72.834), (19.3185, 72.850), (19.326, 72.875), (19.337, 72.870), (19.337, 72.835)],
    6: [(19.2865, 72.850), (19.2865, 72.859), (19.291, 72.871), (19.2995, 72.868), (19.2995, 72.851)],
}

# Multiple nearby simulated cluster centers per zone; jitter is applied around
# these centers and candidates are rejected unless they remain in the zone mask.
ZONE_CLUSTERS: dict[int, tuple[tuple[float, float], ...]] = {
    1: ((19.273, 72.871), (19.279, 72.879), (19.282, 72.868)),
    2: ((19.273, 72.844), (19.279, 72.852), (19.282, 72.842)),
    3: ((19.305, 72.864), (19.311, 72.870), (19.316, 72.867)),
    4: ((19.305, 72.840), (19.311, 72.845), (19.315, 72.841)),
    5: ((19.322, 72.844), (19.326, 72.860), (19.331, 72.850)),
    6: ((19.289, 72.854), (19.292, 72.860), (19.296, 72.855)),
}

ZONE_NAMES = {
    1: "Mira Road East",
    2: "Mira Road West",
    3: "Bhayandar East",
    4: "Bhayandar West",
    5: "Bhayandar North",
    6: "Mira-Bhayandar Central",
}


def read_assignments() -> list[dict[str, object]]:
    """Read transformer IDs and zone assignments from the local CSV only."""
    if not INPUT_CSV.is_file():
        raise RuntimeError(f"Assignment file not found: {INPUT_CSV}")
    try:
        with INPUT_CSV.open("r", newline="", encoding="utf-8-sig") as source:
            reader = csv.DictReader(source)
            required_columns = {"transformer_id", "zone_id"}
            if reader.fieldnames is None or not required_columns.issubset(reader.fieldnames):
                raise RuntimeError("Assignment CSV must contain transformer_id and zone_id columns.")
            rows: list[dict[str, object]] = []
            for line_number, row in enumerate(reader, start=2):
                transformer_id = (row.get("transformer_id") or "").strip()
                zone_text = (row.get("zone_id") or "").strip()
                if not re.fullmatch(r"[1-6]", zone_text):
                    raise RuntimeError(f"Invalid or missing zone_id at assignment CSV row {line_number}.")
                rows.append({"transformer_id": transformer_id, "zone_id": int(zone_text)})
            return rows
    except OSError as exc:
        raise RuntimeError(f"Could not read assignment CSV: {exc}") from None


def validate_rows(rows: list[dict[str, object]]) -> list[tuple[str, int]]:
    if not rows:
        raise RuntimeError("Assignment CSV contains no transformer rows; no output was generated.")
    if len(rows) != EXPECTED_TRANSFORMERS:
        raise RuntimeError(f"Expected {EXPECTED_TRANSFORMERS} visible transformer rows, received {len(rows)}; no CSV was generated.")

    records: list[tuple[str, int]] = []
    seen_ids: set[str] = set()
    for row in rows:
        transformer_id = row.get("transformer_id")
        zone_id = row.get("zone_id")
        if not isinstance(transformer_id, str) or not re.fullmatch(r"MB-\d{3}", transformer_id):
            raise RuntimeError("A row has a missing or unexpected transformer_id; no CSV was generated.")
        if transformer_id in seen_ids:
            raise RuntimeError(f"Duplicate transformer_id {transformer_id}; no CSV was generated.")
        seen_ids.add(transformer_id)
        if isinstance(zone_id, bool) or not isinstance(zone_id, int) or zone_id not in ZONE_NAMES:
            raise RuntimeError(f"Transformer {transformer_id} has a missing/invalid zone_id; no CSV was generated.")
        records.append((transformer_id, zone_id))

    expected_ids = {f"MB-{number:03d}" for number in range(1, EXPECTED_TRANSFORMERS + 1)}
    if seen_ids != expected_ids:
        missing = sorted(expected_ids - seen_ids)
        extra = sorted(seen_ids - expected_ids)
        raise RuntimeError(f"Transformer IDs do not match MB-001 through MB-200 (missing={missing}, extra={extra}); no CSV was generated.")
    return sorted(records)


def point_in_polygon(latitude: float, longitude: float, polygon: list[tuple[float, float]]) -> bool:
    inside = False
    j = len(polygon) - 1
    for i, (lat_i, lon_i) in enumerate(polygon):
        lat_j, lon_j = polygon[j]
        crosses = ((lon_i > longitude) != (lon_j > longitude)) and (
            latitude < (lat_j - lat_i) * (longitude - lon_i) / (lon_j - lon_i) + lat_i
        )
        if crosses:
            inside = not inside
        j = i
    return inside


def distance_meters(first: tuple[float, float], second: tuple[float, float]) -> float:
    lat1, lon1 = map(math.radians, first)
    lat2, lon2 = map(math.radians, second)
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    haversine = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    return 6_371_000 * 2 * math.asin(math.sqrt(haversine))


def generate_coordinates(records: list[tuple[str, int]]) -> dict[str, tuple[float, float]]:
    rng = random.Random(SEED)
    placed: dict[str, tuple[float, float]] = {}
    placed_points: list[tuple[float, float]] = []

    for transformer_id, zone_id in records:
        polygon = ZONE_POLYGONS[zone_id]
        clusters = ZONE_CLUSTERS[zone_id]
        for _attempt in range(100_000):
            center_lat, center_lon = rng.choice(clusters)
            # Approximately 100–250 m standard deviation around a selected
            # neighborhood cluster; retries clip points to the simulated mask.
            latitude = rng.gauss(center_lat, 0.0012)
            longitude = rng.gauss(center_lon, 0.0015)
            if not point_in_polygon(latitude, longitude, polygon):
                continue
            candidate = (round(latitude, 6), round(longitude, 6))
            if all(distance_meters(candidate, point) >= MIN_SPACING_METERS for point in placed_points):
                placed[transformer_id] = candidate
                placed_points.append(candidate)
                break
        else:
            raise RuntimeError(f"Could not place {transformer_id} with the requested spacing; no CSV was generated.")
    return placed


def write_csv(records: list[tuple[str, int]], coordinates: dict[str, tuple[float, float]]) -> None:
    # Exclusive create prevents accidentally replacing a prior review CSV.
    try:
        with OUTPUT_CSV.open("x", newline="", encoding="utf-8") as output:
            writer = csv.writer(output)
            writer.writerow(("transformer_id", "zone_id", "latitude", "longitude"))
            for transformer_id, zone_id in records:
                latitude, longitude = coordinates[transformer_id]
                writer.writerow((transformer_id, zone_id, f"{latitude:.6f}", f"{longitude:.6f}"))
    except FileExistsError:
        raise RuntimeError(f"Output already exists and was not overwritten: {OUTPUT_CSV}") from None


def print_summary(records: list[tuple[str, int]], coordinates: dict[str, tuple[float, float]]) -> None:
    latitudes = [point[0] for point in coordinates.values()]
    longitudes = [point[1] for point in coordinates.values()]
    zone_counts = Counter(zone_id for _, zone_id in records)
    points = list(coordinates.values())
    duplicate_count = len(points) - len(set(points))
    minimum_spacing = min(distance_meters(points[i], points[j]) for i in range(len(points)) for j in range(i + 1, len(points)))

    print("SIMULATED PROTOTYPE COORDINATE SUMMARY — NOT REAL INFRASTRUCTURE")
    print(f"Total transformers generated: {len(records)}")
    print("Transformers per zone:")
    for zone_id, name in ZONE_NAMES.items():
        print(f"  {zone_id} — {name}: {zone_counts[zone_id]}")
    print(f"Minimum latitude: {min(latitudes):.6f}")
    print(f"Maximum latitude: {max(latitudes):.6f}")
    print(f"Minimum longitude: {min(longitudes):.6f}")
    print(f"Maximum longitude: {max(longitudes):.6f}")
    print(f"Duplicate coordinate count: {duplicate_count}")
    print(f"Minimum distance between points: {minimum_spacing:.2f} m")
    print(f"Local CSV: {OUTPUT_CSV}")
    mask_passed = all(point_in_polygon(*coordinates[transformer_id], ZONE_POLYGONS[zone_id]) for transformer_id, zone_id in records)
    print(f"Zone-mask validation: {'PASS' if mask_passed else 'FAIL'}")
    print("Input source: local transformer_zone_assignments.csv; no Supabase connection used.")


def main() -> int:
    try:
        records = validate_rows(read_assignments())
        coordinates = generate_coordinates(records)
        write_csv(records, coordinates)
        print_summary(records, coordinates)
        return 0
    except RuntimeError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
