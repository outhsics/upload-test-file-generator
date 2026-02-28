#!/usr/bin/env python3
from __future__ import annotations

import shutil
import sys
from pathlib import Path


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python3 scripts/apply_icon.py <minimal|tech|skeuomorphic>")

    style = sys.argv[1].strip().lower()
    src = Path(f"assets/icons/variants/{style}.png")
    if not src.exists():
        raise SystemExit(f"Icon style not found: {src}")

    target = Path("src-tauri/icons/app-icon.png")
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(src, target)
    print(f"Applied icon style: {style}")
    print(f"Copied to: {target}")


if __name__ == "__main__":
    main()
