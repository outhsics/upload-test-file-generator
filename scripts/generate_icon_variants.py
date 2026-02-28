#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

SIZE = 1024


def rounded_mask(size: int, radius: int) -> Image.Image:
    mask = Image.new("L", (size, size), 0)
    d = ImageDraw.Draw(mask)
    d.rounded_rectangle((36, 36, size - 36, size - 36), radius=radius, fill=255)
    return mask


def make_minimal(path: Path) -> None:
    img = Image.new("RGBA", (SIZE, SIZE), (250, 250, 252, 255))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle((36, 36, SIZE - 36, SIZE - 36), radius=220, fill=(255, 255, 255, 255))
    d.rounded_rectangle((240, 240, 784, 784), radius=130, fill=(19, 107, 145, 255))
    d.polygon(
        [(512, 300), (650, 450), (570, 450), (570, 560), (454, 560), (454, 450), (374, 450)],
        fill=(240, 248, 255, 255),
    )
    d.rounded_rectangle((390, 620, 634, 662), radius=18, fill=(240, 248, 255, 210))
    d.rounded_rectangle((390, 684, 604, 720), radius=18, fill=(240, 248, 255, 165))
    img.save(path)


def make_tech(path: Path) -> None:
    img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    grad = Image.new("RGBA", (SIZE, SIZE))
    gd = ImageDraw.Draw(grad)
    for y in range(SIZE):
        t = y / (SIZE - 1)
        r = int(10 * (1 - t) + 22 * t)
        g = int(106 * (1 - t) + 58 * t)
        b = int(125 * (1 - t) + 138 * t)
        gd.line([(0, y), (SIZE, y)], fill=(r, g, b, 255))
    img.paste(grad, (0, 0), rounded_mask(SIZE, 220))

    for color, box, blur in [
        ((55, 206, 201, 130), (70, 110, 540, 580), 38),
        ((88, 136, 255, 125), (430, 380, 980, 980), 46),
    ]:
        layer = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
        ld = ImageDraw.Draw(layer)
        ld.ellipse(box, fill=color)
        img = Image.alpha_composite(img, layer.filter(ImageFilter.GaussianBlur(blur)))

    d = ImageDraw.Draw(img)
    d.rounded_rectangle((220, 220, 804, 804), radius=160, fill=(246, 252, 255, 246))
    d.rounded_rectangle((472, 340, 552, 560), radius=36, fill=(12, 114, 133, 255))
    d.polygon(
        [(512, 250), (632, 390), (560, 390), (560, 450), (464, 450), (464, 390), (392, 390)],
        fill=(12, 114, 133, 255),
    )
    d.rounded_rectangle((360, 600, 664, 642), radius=20, fill=(12, 114, 133, 200))
    d.rounded_rectangle((360, 666, 626, 706), radius=20, fill=(12, 114, 133, 155))
    d.rounded_rectangle((36, 36, SIZE - 36, SIZE - 36), radius=220, outline=(255, 255, 255, 90), width=4)
    img.save(path)


def make_skeuomorphic(path: Path) -> None:
    base = Image.new("RGBA", (SIZE, SIZE), (223, 229, 236, 255))
    d = ImageDraw.Draw(base)
    d.rounded_rectangle((36, 36, SIZE - 36, SIZE - 36), radius=220, fill=(236, 244, 250, 255))

    panel = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    pd = ImageDraw.Draw(panel)
    pd.rounded_rectangle((180, 190, 844, 854), radius=170, fill=(253, 255, 255, 255))
    panel = panel.filter(ImageFilter.GaussianBlur(0.5))
    base = Image.alpha_composite(base, panel)

    accent = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    ad = ImageDraw.Draw(accent)
    ad.rounded_rectangle((220, 220, 804, 804), radius=156, fill=(27, 112, 149, 255))
    ad.rounded_rectangle((240, 240, 784, 784), radius=140, outline=(255, 255, 255, 80), width=4)
    base = Image.alpha_composite(base, accent)

    dd = ImageDraw.Draw(base)
    dd.polygon(
        [(512, 290), (640, 440), (568, 440), (568, 560), (456, 560), (456, 440), (384, 440)],
        fill=(236, 248, 255, 255),
    )
    dd.rounded_rectangle((392, 610, 632, 652), radius=16, fill=(236, 248, 255, 210))
    dd.rounded_rectangle((392, 674, 600, 708), radius=16, fill=(236, 248, 255, 165))
    dd.rounded_rectangle((36, 36, SIZE - 36, SIZE - 36), radius=220, outline=(255, 255, 255, 100), width=4)
    base.save(path)


def main() -> None:
    out = Path("assets/icons/variants")
    out.mkdir(parents=True, exist_ok=True)
    make_minimal(out / "minimal.png")
    make_tech(out / "tech.png")
    make_skeuomorphic(out / "skeuomorphic.png")
    print("Generated icon variants:")
    for name in ("minimal.png", "tech.png", "skeuomorphic.png"):
        print(f"- {out / name}")


if __name__ == "__main__":
    main()
