#!/usr/bin/env python3
# [SW:ART:004:MESHY_MULTIVIEW_PREP]
# Crops exact views from an already-approved Cow 17 source artifact. No regeneration or repainting.

import argparse
import hashlib
import json
from pathlib import Path
from PIL import Image

MARKER = "SW_ART_004_MESHY_MULTIVIEW_PREP_V1"


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
    parser.add_argument("--output-dir", required=True)
    return parser.parse_args()


def main():
    args = parse_args()
    request = json.loads(Path(args.request).read_text(encoding="utf-8"))
    if request.get("version") != "SW_MESHY_MULTI_LIVE_REQUEST_V1":
        raise SystemExit("Unexpected Meshy multi-image request version.")
    if request.get("productionAuthority") != "candidate only":
        raise SystemExit("Meshy multi-image output must remain candidate only.")

    source = request.get("source") or {}
    source_path = Path(args.source_root) / source.get("path", "")
    if not source_path.is_file():
        raise SystemExit(f"Source image missing: {source_path}")
    source_sha = sha256_file(source_path)
    if source_sha != source.get("expectedSourceSha256"):
        raise SystemExit(f"Source SHA mismatch: {source_sha}")

    order = source.get("viewOrder") or []
    views = source.get("views") or {}
    if order != ["three-quarter", "front", "side", "back"]:
        raise SystemExit(f"Unexpected view order: {order}")
    if set(views) != {"three-quarter", "front", "side", "back"}:
        raise SystemExit(f"Unexpected view set: {sorted(views)}")

    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    prepared = []

    with Image.open(source_path) as image:
        rgb = image.convert("RGB")
        width, height = rgb.size
        for name in order:
            spec = views[name]
            box = tuple(int(spec[key]) for key in ("left", "top", "right", "bottom"))
            left, top, right, bottom = box
            if not (0 <= left < right <= width and 0 <= top < bottom <= height):
                raise SystemExit(f"{name} crop outside source bounds {width}x{height}: {box}")
            result = rgb.crop(box)
            expected_size = (int(spec["expectedWidth"]), int(spec["expectedHeight"]))
            if result.size != expected_size:
                raise SystemExit(f"{name} crop size mismatch: {result.size} != {expected_size}")
            pixel_sha = hashlib.sha256(result.tobytes()).hexdigest()
            if pixel_sha != spec.get("expectedPixelSha256"):
                raise SystemExit(f"{name} crop pixel SHA mismatch: {pixel_sha}")
            filename = spec.get("filename", "")
            if not filename.endswith(".png") or "/" in filename or "\\" in filename:
                raise SystemExit(f"Unsafe output filename for {name}: {filename}")
            output_path = output_dir / filename
            result.save(output_path, format="PNG", optimize=True)
            prepared.append({
                "view": name,
                "filename": filename,
                "box": list(box),
                "dimensions": list(result.size),
                "pixelSha256": pixel_sha,
                "outputSha256": sha256_file(output_path),
                "bytes": output_path.stat().st_size,
            })

    receipt = {
        "version": "SW_ART_004_MULTIVIEW_PREP_V1",
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
        "viewOrder": order,
        "prepared": prepared,
    }
    receipt_path = output_dir / "sw-art-004-multiview-prep.json"
    receipt_path.write_text(json.dumps(receipt, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(receipt, indent=2))


if __name__ == "__main__":
    main()
