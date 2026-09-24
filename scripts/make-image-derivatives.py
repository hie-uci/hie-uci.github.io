"""Generate web-sized WebP derivatives for die photos, portraits and research figures.

The site is a static export with `images.unoptimized`, so Next.js serves image
files as they are. A 160 px thumbnail would otherwise download a 3 MB PNG.
Originals stay untouched; the chip lightbox still opens the full-resolution file.

Usage (from the repo root):
    python3 scripts/make-image-derivatives.py

Re-run after adding or replacing a photo. Output is deterministic and never
upscales: a source narrower than the target width is re-encoded at its own size.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"

# (slug, source file) — slugs must match src/data/chips.ts.
CHIPS = {
    "pmcw-radar": "sheet1-01-pmcw-radar.png",
    "fmcw-radar-49-63": "sheet1-04-49-63-ghz-fmcw-radar.png",
    "mimo-fmcw-radar": "DB_MIMO.png",
    "fmcw-radar-50-60": "sheet2-02-monostatic-50-60-ghz-fmcw-radar.png",
    "pa-110-143": "sheet1-03-110-143-ghz-pa-in-65nm-cmos.png",
    "vco-76-82": "sheet1-02-low-noise-76-82-ghz-vco.png",
    "vco-class-d": "sheet1-05-3.1-4.7-ghz-class-d-vco.png",
    "vco-174-232": "sheet1-06-174-232-ghz-sige-vco.png",
    "osc-90": "sheet3-02-90-ghz-efficient-oscillator.png",
    "tx-320": "sheet2-0.32-thz-sige-transmitter.png",
    "doubler-480": "sheet2-0.48-thz-frequency-doubler.png",
    "quadrupler-920": "sheet2-0.92-thz-sige-quadrupler.png",
    "tia-mems-pnt": "sheet2-4-channel-tia-for-mems-pnt.png",
    "negative-l": "sheet3-01-0.1-6-ghz-negative-l-circuit.png",
}
CHIP_WIDTHS = (1200, 480)
PORTRAIT_WIDTH = 640
RESEARCH_WIDTH = 1400


def encode(src: Path, dst: Path, width: int, quality: int = 84) -> tuple[int, int]:
    """Resize (never upscale) and write a WebP; return the output size."""
    with Image.open(src) as im:
        im = im.convert("RGBA") if im.mode in ("RGBA", "LA", "P") else im.convert("RGB")
        if im.width > width:
            height = round(im.height * width / im.width)
            im = im.resize((width, height), Image.LANCZOS)
        dst.parent.mkdir(parents=True, exist_ok=True)
        im.save(dst, "WEBP", quality=quality, method=6)
        return im.size


def chips() -> int:
    """Die photos at two widths; the gallery lightbox still opens the original."""
    chip_dir = PUBLIC / "images" / "chips" / "individual"
    out_dir = PUBLIC / "images" / "chips" / "web"
    missing = [name for name in CHIPS.values() if not (chip_dir / name).exists()]
    if missing:
        print(f"Missing chip sources in {chip_dir}: {missing}", file=sys.stderr)
        return 1
    for slug, name in CHIPS.items():
        for width in CHIP_WIDTHS:
            size = encode(chip_dir / name, out_dir / f"{slug}-{width}.webp", width)
            print(f"chip   {slug:18s} {width:5d} -> {size}")
    return 0


def logo() -> None:
    src = PUBLIC / "images" / "logo" / "hie-logo.png"
    for width in (160, 320):
        size = encode(src, src.with_name(f"hie-logo-{width}.webp"), width, quality=90)
        print(f"logo   hie-logo {width:5d} -> {size}")


def members() -> None:
    member_dir = PUBLIC / "images" / "members"
    for src in sorted(member_dir.iterdir()):
        if src.suffix.lower() not in (".png", ".jpg", ".jpeg"):
            continue
        size = encode(
            src, member_dir / "web" / f"{src.stem}.webp", PORTRAIT_WIDTH, quality=86
        )
        print(f"member {src.stem:28s} -> {size}")


def research() -> None:
    """Research figures for inline display; several originals are 3-5 MB PNGs.

    Also writes each derivative's pixel size to src/data/researchFigureSizes.json,
    so the research page can reserve the space before an image loads.
    """
    research_dir = PUBLIC / "images" / "research"
    sizes: dict[str, list[int]] = {}
    for src in sorted(research_dir.iterdir()):
        if src.suffix.lower() not in (".png", ".jpg", ".jpeg"):
            continue
        size = encode(
            src, research_dir / "web" / f"{src.stem}.webp", RESEARCH_WIDTH, quality=86
        )
        sizes[src.stem] = list(size)
        print(f"figure {src.stem:34s} -> {size}")
    # The lead visuals are already WebP; record their size without re-encoding.
    for src in sorted((research_dir / "visuals").glob("*.webp")):
        with Image.open(src) as im:
            sizes[f"visuals/{src.stem}"] = [im.width, im.height]
    manifest = ROOT / "src" / "data" / "researchFigureSizes.json"
    manifest.write_text(json.dumps(sizes, indent=2, sort_keys=True) + "\n")
    print(f"sizes  {len(sizes)} figures -> {manifest.relative_to(ROOT)}")


def main() -> int:
    if chips():
        return 1
    logo()
    members()
    research()
    return 0


if __name__ == "__main__":
    sys.exit(main())
