#!/usr/bin/env python3
# [SW:ART:003:MESHY_REFERENCE_PREP]
# Crops an existing approved source artifact. It never regenerates or repaints art.

import argparse
import hashlib
import json
from pathlib import Path

from PIL import Image

MARKER = "SW_ART_003_MESHY_REFERENCE_PREP_V1"


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--request", required=True)
    parser.add_argument("--source-root", required=True)
    parser.add_argument("--output", required=True)
    return parser.parse_args()


def main():
    args = parse_args()
    request_path = Path(args.request)
    source_root = Path(args.source_root)
    output_path = Path(args.output)
    request = json.loads(request_path.read_text(encoding="utf-8"))

    if request.get("version") != "SW_MESHY_LIVE_REQUEST_V1":
        raise SystemExit("Unexpected Meshy request version.")
    source = request.get("source") or {}
    crop = source.get("crop") or {}
    source_path = source_root / source.get("path", "")
    if not source_path.is_file():
        raise SystemExit(f"Source image missing: {source_path}")

    source_sha = sha256_file(source_path)
    if source_sha != source.get("expectedSourceSha256"):
        raise SystemExit(f"Source SHA mismatch: {source_sha}")

    box = tuple(int(crop[key]) for key in ("left", "top", "right", "bottom"))
    with Image.open(source_path) as image:
        rgb = image.convert("RGB")
        width, height = rgb.size
        left, top, right, bottom = box
        if not (0 <= left < right <= width and 0 <= top < bottom <= height):
            raise SystemExit(f"Crop is outside source bounds {width}x{height}: {box}")
        result = rgb.crop(box)

    expected_size = (int(crop["expectedWidth"]), int(crop["expectedHeight"]))
    if result.size != expected_size:
        raise SystemExit(f"Crop size mismatch: {result.size} != {expected_size}")

    pixel_sha = hashlib.sha256(result.tobytes()).hexdigest()
    if pixel_sha != crop.get("expectedPixelSha256"):
        raise SystemExit(f"Crop pixel SHA mismatch: {pixel_sha}")

    output_path.parent.mkdir(parents=True, exist_ok=True)
    result.save(output_path, format="PNG", optimize=True)
    output_sha = sha256_file(output_path)

    receipt = {
        "version": "SW_ART_003_REFERENCE_PREP_V1",
        "marker": MARKER,
        "request": request.get("id"),
        "productionAuthority": request.get("productionAuthority"),
        "source": {
            "runId": source.get("runId"),
            "artifactId": source.get("artifactId"),
            "artifactName": source.get("artifactName"),
            "path": source.get("path"),
            "sha256": source_sha,
            "dimensions": [width, height],
        },
        "crop": {
            "box": list(box),
            "dimensions": list(result.size),
            "pixelSha256": pixel_sha,
            "outputSha256": output_sha,
        },
    }
    receipt_path = output_path.with_suffix(output_path.suffix + ".json")
    receipt_path.write_text(json.dumps(receipt, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(receipt, indent=2))


if __name__ == "__main__":
    main()
