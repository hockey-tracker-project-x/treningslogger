"""
Engangs-skript for a generere app-ikoner (hockey-tema).
Kan slettes etter forste generering - ikonene (PNG) er det som faktisk brukes av appen.
"""
from PIL import Image, ImageDraw
import os

NAVY = (13, 27, 42, 255)        # #0D1B2A - bakgrunn
NAVY_DARK = (8, 17, 28, 255)    # litt morkere for gradient
WHITE = (245, 247, 250, 255)    # kolle
GOLD = (255, 213, 74, 255)      # puck / aksentfarge

def rounded_bg(size, radius_ratio=0.22):
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    radius = int(size * radius_ratio)
    # enkel vertikal gradient navy -> navy_dark
    for y in range(size):
        t = y / size
        r = int(NAVY[0] + (NAVY_DARK[0] - NAVY[0]) * t)
        g = int(NAVY[1] + (NAVY_DARK[1] - NAVY[1]) * t)
        b = int(NAVY[2] + (NAVY_DARK[2] - NAVY[2]) * t)
        draw.line([(0, y), (size, y)], fill=(r, g, b, 255))
    mask = Image.new('L', (size, size), 0)
    mdraw = ImageDraw.Draw(mask)
    mdraw.rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=255)
    out = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    out.paste(img, (0, 0), mask)
    return out

def draw_stick_and_puck(img, size):
    draw = ImageDraw.Draw(img)
    s = size / 512.0  # skaleringsfaktor basert pa 512-referanse

    def pt(x, y):
        return (x * s, y * s)

    stick_width = int(34 * s)

    # kolleskaft (fra ovre venstre til nedre midt)
    shaft_start = pt(175, 100)
    shaft_end = pt(230, 340)
    draw.line([shaft_start, shaft_end], fill=WHITE, width=stick_width)
    for p in (shaft_start, shaft_end):
        r = stick_width / 2
        draw.ellipse([p[0]-r, p[1]-r, p[0]+r, p[1]+r], fill=WHITE)

    # kolleblad (fra nedre midt og ut til hoyre/ned)
    blade_start = shaft_end
    blade_end = pt(370, 385)
    blade_width = int(30 * s)
    draw.line([blade_start, blade_end], fill=WHITE, width=blade_width)
    for p in (blade_start, blade_end):
        r = blade_width / 2
        draw.ellipse([p[0]-r, p[1]-r, p[0]+r, p[1]+r], fill=WHITE)

    # puck (gyllen sirkel) med litt "fart-linjer"
    puck_center = pt(390, 400)
    puck_r = 46 * s
    draw.ellipse(
        [puck_center[0]-puck_r, puck_center[1]-puck_r, puck_center[0]+puck_r, puck_center[1]+puck_r],
        fill=GOLD
    )
    # fartslinjer bak pucken
    for i, dx in enumerate([70, 105, 140]):
        y_off = -6 + i * 6
        x1, y1 = pt(390 - dx, 400 + y_off)
        x2, y2 = pt(390 - dx - 26, 400 + y_off)
        w = max(1, int((6 - i * 1.5) * s))
        draw.line([(x1, y1), (x2, y2)], fill=(255, 255, 255, 140), width=w)

def make_icon(path, size, maskable=False):
    if maskable:
        # maskable: hold hovedmotiv innenfor "safe zone" (ca 80% midten), full-bleed bakgrunn uten avrundede hjorner
        img = Image.new('RGBA', (size, size), NAVY)
        draw_stick_and_puck(img, int(size * 0.9))
        # sentrer motivet litt bedre for maskable ved a lime inn skalert versjon
        motif_size = int(size * 0.72)
        motif = Image.new('RGBA', (512, 512), (0, 0, 0, 0))
        draw_stick_and_puck(motif, 512)
        motif = motif.resize((motif_size, motif_size), Image.LANCZOS)
        img = Image.new('RGBA', (size, size), NAVY)
        offset = ((size - motif_size) // 2, (size - motif_size) // 2 + int(size*0.04))
        img.alpha_composite(motif, offset)
    else:
        img = rounded_bg(size)
        draw_stick_and_puck(img, size)
    img.save(path)
    print('Lagret', path, img.size)

out_dir = os.path.dirname(os.path.abspath(__file__))
make_icon(os.path.join(out_dir, 'icon-192.png'), 192)
make_icon(os.path.join(out_dir, 'icon-512.png'), 512)
make_icon(os.path.join(out_dir, 'icon-maskable-512.png'), 512, maskable=True)
make_icon(os.path.join(out_dir, 'apple-touch-icon.png'), 180)
make_icon(os.path.join(out_dir, 'favicon-32.png'), 32)
print('Ferdig!')
