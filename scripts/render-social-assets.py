from __future__ import annotations

from pathlib import Path
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
HERO = ASSETS / "hero.png"
SOCIAL_OUT = ASSETS / "social-card.png"
FAVICON_OUT = ASSETS / "favicon.png"


def load_font(path: str, size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    try:
        return ImageFont.truetype(path, size)
    except OSError:
        return ImageFont.load_default()


HEADING_FONT = load_font("C:/Windows/Fonts/bahnschrift.ttf", 62)
SUBHEAD_FONT = load_font("C:/Windows/Fonts/segoeuib.ttf", 28)
BODY_FONT = load_font("C:/Windows/Fonts/segoeui.ttf", 24)
SMALL_FONT = load_font("C:/Windows/Fonts/segoeuib.ttf", 15)
CHIP_FONT = load_font("C:/Windows/Fonts/segoeuib.ttf", 18)
VALUE_FONT = load_font("C:/Windows/Fonts/segoeuib.ttf", 22)
BRAND_FONT = load_font("C:/Windows/Fonts/bahnschrift.ttf", 30)
TAG_FONT = load_font("C:/Windows/Fonts/segoeuib.ttf", 14)


GREEN = (57, 217, 138)
PURPLE = (154, 77, 255)
TEXT = (245, 247, 251)
MUTED = (209, 217, 232)
LINE = (255, 255, 255, 20)


def linear_gradient(size: tuple[int, int], colors: list[tuple[int, int, int]], horizontal: bool = False) -> Image.Image:
    width, height = size
    base = Image.new("RGB", size)
    draw = ImageDraw.Draw(base)
    steps = width if horizontal else height
    for i in range(steps):
        t = i / max(steps - 1, 1)
        idx = min(int(t * (len(colors) - 1)), len(colors) - 2)
        local_t = (t - idx / (len(colors) - 1)) * (len(colors) - 1)
        c1 = colors[idx]
        c2 = colors[idx + 1]
        color = tuple(int(c1[j] + (c2[j] - c1[j]) * local_t) for j in range(3))
        if horizontal:
            draw.line([(i, 0), (i, height)], fill=color)
        else:
            draw.line([(0, i), (width, i)], fill=color)
    return base


def add_glow(canvas: Image.Image, box: tuple[int, int, int, int], color: tuple[int, int, int], blur: int) -> None:
    overlay = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    odraw = ImageDraw.Draw(overlay)
    odraw.ellipse(box, fill=(*color, 90))
    overlay = overlay.filter(ImageFilter.GaussianBlur(blur))
    canvas.alpha_composite(overlay)


def draw_icon(size: int) -> Image.Image:
    scale = size / 512
    icon = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(icon)

    def sx(value: float) -> int:
        return round(value * scale)

    draw.rounded_rectangle((sx(34), sx(34), sx(478), sx(478)), radius=sx(86), fill=(22, 19, 18))

    glow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    gdraw.rounded_rectangle(
        (sx(38), sx(38), sx(474), sx(474)),
        radius=sx(82),
        outline=(255, 152, 0, 255),
        width=max(4, sx(8)),
    )
    glow = glow.filter(ImageFilter.GaussianBlur(max(3, sx(10))))
    icon.alpha_composite(glow)

    panel = linear_gradient((sx(436), sx(436)), [(23, 23, 23), (7, 7, 7)])
    mask = Image.new("L", (sx(436), sx(436)), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, sx(436), sx(436)), radius=sx(82), fill=255)
    icon.alpha_composite(Image.merge("RGBA", (*panel.split(), mask)), (sx(38), sx(38)))

    draw = ImageDraw.Draw(icon)
    draw.rounded_rectangle(
        (sx(38), sx(38), sx(474), sx(474)),
        radius=sx(82),
        outline=(255, 152, 0, 255),
        width=max(4, sx(8)),
    )

    rings = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    rdraw = ImageDraw.Draw(rings)
    stroke = max(12, sx(34))
    for cx, cy in ((182, 182), (338, 330)):
        x0 = sx(cx - 66)
        y0 = sx(cy - 66)
        x1 = sx(cx + 66)
        y1 = sx(cy + 66)
        rdraw.ellipse((x0, y0, x1, y1), outline=(255, 160, 0, 255), width=stroke)
    rings = rings.filter(ImageFilter.GaussianBlur(max(4, sx(16))))
    icon.alpha_composite(rings)

    draw = ImageDraw.Draw(icon)
    for cx, cy in ((182, 182), (338, 330)):
        x0 = sx(cx - 66)
        y0 = sx(cy - 66)
        x1 = sx(cx + 66)
        y1 = sx(cy + 66)
        draw.ellipse((x0, y0, x1, y1), outline=(255, 160, 0, 255), width=stroke)

    points = [
        (333, 96),
        (227, 212),
        (293, 212),
        (213, 417),
        (321, 296),
        (260, 296),
        (324, 201),
        (270, 201),
    ]
    draw.polygon([(sx(x), sx(y)) for x, y in points], fill=(255, 255, 255, 255))
    return icon


def fit_text(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.ImageFont, max_width: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        candidate = word if not current else f"{current} {word}"
        if draw.textlength(candidate, font=font) <= max_width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def draw_text_block(draw: ImageDraw.ImageDraw, xy: tuple[int, int], lines: list[str], font: ImageFont.ImageFont, fill: tuple[int, int, int], spacing: int) -> int:
    x, y = xy
    for line in lines:
        draw.text((x, y), line, font=font, fill=fill)
        bbox = draw.textbbox((x, y), line, font=font)
        y = bbox[3] + spacing
    return y


def render_social_card() -> None:
    canvas = linear_gradient((1200, 630), [(13, 16, 23), (20, 27, 38), (30, 36, 50)]).convert("RGBA")
    add_glow(canvas, (-120, -80, 260, 260), GREEN, 28)
    add_glow(canvas, (820, -70, 1190, 260), PURPLE, 28)
    add_glow(canvas, (940, 410, 1330, 790), PURPLE, 42)

    draw = ImageDraw.Draw(canvas)

    icon = draw_icon(64)
    canvas.alpha_composite(icon, (44, 42))
    draw.text((124, 49), "Promotions", font=BRAND_FONT, fill=(124, 244, 178))
    brand_width = draw.textlength("Promotions", font=BRAND_FONT)
    draw.text((124 + brand_width + 8, 49), "Studio", font=BRAND_FONT, fill=TEXT)
    draw.text((126, 86), "SHOPIFY APP", font=TAG_FONT, fill=(195, 202, 218))

    pill_overlay = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    pdraw = ImageDraw.Draw(pill_overlay)
    pill_box = (44, 138, 500, 180)
    pdraw.rounded_rectangle(pill_box, radius=20, fill=(9, 13, 20, 220), outline=(255, 255, 255, 28))
    pdraw.ellipse((60, 151, 72, 163), fill=(*GREEN, 255))
    pdraw.text((86, 145), "Scheduled discounts + custom product badges", font=SMALL_FONT, fill=(223, 231, 245, 255))
    canvas.alpha_composite(pill_overlay)

    headline = "Turn promotions into visible product-page signals."
    headline_lines = fit_text(draw, headline, HEADING_FONT, 540)
    y = draw_text_block(draw, (44, 204), headline_lines, HEADING_FONT, TEXT, 2)

    subcopy = (
        "Run discount campaigns across products, collections and tags, then surface them with "
        "custom badges, compare-at pricing, feedback and social proof."
    )
    sub_lines = fit_text(draw, subcopy, BODY_FONT, 560)
    y = draw_text_block(draw, (48, y + 18), sub_lines, BODY_FONT, MUTED, 8)

    shell = Image.new("RGBA", (470, 542), (255, 255, 255, 0))
    sdraw = ImageDraw.Draw(shell)
    sdraw.rounded_rectangle((0, 0, 470, 542), radius=30, fill=(255, 255, 255, 16), outline=(255, 255, 255, 28), width=1)

    border = Image.new("RGBA", (470, 542), (0, 0, 0, 0))
    bdraw = ImageDraw.Draw(border)
    bdraw.rounded_rectangle((1, 1, 468, 540), radius=30, outline=(100, 232, 169, 255), width=2)
    border = border.filter(ImageFilter.GaussianBlur(2))
    shell.alpha_composite(border)

    visual = Image.open(HERO).convert("RGB").resize((438, 510))
    mask = Image.new("L", (438, 510), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, 438, 510), radius=24, fill=255)
    shell.alpha_composite(Image.merge("RGBA", (*visual.split(), mask)), (16, 16))

    badge = Image.new("RGBA", shell.size, (0, 0, 0, 0))
    bdraw = ImageDraw.Draw(badge)
    bdraw.rounded_rectangle((26, 448, 340, 516), radius=16, fill=(7, 10, 16, 208), outline=(255, 255, 255, 28))
    bdraw.text((42, 462), "PROMOTIONS STUDIO", font=SMALL_FONT, fill=(156, 176, 205))
    bdraw.text((42, 485), "Campaign control + badge visibility", font=VALUE_FONT, fill=TEXT)
    shell.alpha_composite(badge)

    canvas.alpha_composite(shell, (686, 44))
    SOCIAL_OUT.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(SOCIAL_OUT, format="PNG", optimize=True)


def render_favicon() -> None:
    canvas = linear_gradient((512, 512), [(11, 15, 21), (19, 25, 37), (28, 34, 48)]).convert("RGBA")
    add_glow(canvas, (32, 20, 210, 198), GREEN, 30)
    add_glow(canvas, (296, 28, 488, 220), PURPLE, 26)

    overlay = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    draw.rounded_rectangle((62, 62, 450, 450), radius=102, fill=(255, 255, 255, 12), outline=(255, 255, 255, 24))
    overlay = overlay.filter(ImageFilter.GaussianBlur(1))
    canvas.alpha_composite(overlay)

    icon = draw_icon(274)
    shadow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    shadow.alpha_composite(icon, (119, 119))
    shadow = shadow.filter(ImageFilter.GaussianBlur(12))
    shadow = ImageChops.multiply(shadow, Image.new("RGBA", canvas.size, (18, 18, 18, 190)))
    canvas.alpha_composite(shadow)
    canvas.alpha_composite(icon, (119, 119))

    FAVICON_OUT.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(FAVICON_OUT, format="PNG", optimize=True)


if __name__ == "__main__":
    render_social_card()
    render_favicon()
