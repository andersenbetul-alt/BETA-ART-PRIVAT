# -*- coding: utf-8 -*-
"""NAVIAR CARE identity (v0.2 QA board) — vector rebuild. python3 build-care.py

Kaynak: kullanıcının 05.09.2026'da paylaştığı iki QA panosu ("NAVIAR CARE –
STANDARD QA v0.2" ve "NAVIAR-001 / QA BOARD / v0.3"). Kaynak vektör dosyası
bu ortama ulaşmadı (chatgpt.site vekil tarafından engelli); geometri panodaki
piksel ölçümlerinden yeniden kurulmuştur, kaynakla bire bir değildir.
Ölçümler ve sapmalar: README.md → "CARE v0.2 yeniden kurulumu".

Sistem: tek renk (altın aksan YOK), geniş geometrik wordmark, elmas çentikli N
monogram, "CARE" descriptor wordmark'ın sağına hizalı. Bağımlılık yok; her
harf polygon/arc path olarak buradan çıkar, yazı tipi kullanılmaz.
"""
import math, pathlib

OUT = pathlib.Path(__file__).resolve().parent / "care"
INK, INK_2, BLACK, WHITE = "#2A3847", "#4A5B6C", "#111111", "#FFFFFF"
H = 100.0                      # cap height, tüm ölçüler bunun oranı
S = 24.0                       # wordmark stroke (panoda 20/82 ≈ %24)

def r(v): return round(v, 2)
def poly(pts): return "M" + " L".join(f"{r(x)} {r(y)}" for x, y in pts) + " Z"

# ---------------------------------------------------------------- harfler
def glyph_N(w=150.0, slit=True):
    """Standart N + panodaki ince çentik: diyagonale paralel, sol gövdenin
    üstünden aşağı inen dar yarık (uzunluk 0,42H, genişlik 0,06H)."""
    run = w - 2*S
    dv  = S / math.cos(math.atan(run / H))          # dik kalınlık → düşey ofset
    body = (f"M0 0 H{r(S)} L{r(w-S)} {r(H-dv)} V0 H{r(w)} V{r(H)} "
            f"H{r(w-S)} L{r(S)} {r(dv)} V{r(H)} H0 Z")
    if not slit:
        return [body], w
    g, L = 6.0, 0.42*H
    k = run / H                                     # diyagonal eğimi (dx/dy)
    cut = poly([(S, 0), (S+g, 0), (S+g+L*k, L), (S+L*k, L)])
    return [body, cut], w                           # evenodd: cut delik olur

def _tri(w, flip=False):
    half = w/2.0
    a  = math.atan(half / H)
    dy = S / math.sin(a); dx = S / math.cos(a)
    ax, ay = half, (H if flip else 0.0)
    iy = (H - dy) if flip else dy
    by = 0.0 if flip else H
    return poly([(ax, ay), (w, by), (w-dx, by), (ax, iy), (dx, by), (0, by)]), a, iy

def glyph_A(w=150.0):
    """Üçgen halka + ayaklara DEĞMEYEN kısa çubuk (pano: A'nın çubuğu serbest)."""
    ring, a, iy = _tri(w)
    bt, bh, bw = 0.76*H, 14.0, 0.28*w
    bar = poly([(w/2-bw/2, bt), (w/2+bw/2, bt), (w/2+bw/2, bt+bh), (w/2-bw/2, bt+bh)])
    return [ring, bar], w

def glyph_V(w=150.0):
    ring, *_ = _tri(w, flip=True)
    return [ring], w

def glyph_I():
    return [poly([(0, 0), (S, 0), (S, H), (0, H)])], S

def glyph_R(w=125.0):
    """Kapalı bowl + bowl'dan çıkan diyagonal bacak (panodaki kama biçimi)."""
    bx, by = 70.0, 52.0                             # bowl birleşme x, bowl derinliği
    ro, ri = by/2.0, by/2.0 - S
    outer = (f"M0 0 H{r(bx)} A{r(ro)} {r(ro)} 0 0 1 {r(bx)} {r(by)} "
             f"L{r(w)} {r(H)} H{r(w-S-4)} L{r(bx-S)} {r(by)} H{r(S)} V{r(H)} H0 Z")
    hole  = f"M{r(S)} {r(S)} H{r(bx)} A{r(ri)} {r(ri)} 0 0 1 {r(bx)} {r(by-S)} H{r(S)} Z"
    return [outer, hole], w

def glyph_C(w=110.0):
    """Yuvarlak C: dış/iç yay, sağda açık ağız (0,26H)."""
    ro, ri = H/2.0, H/2.0 - S
    cx, cy = ro, H/2.0
    mouth = 0.26*H
    ang = math.asin(mouth / ro)                      # ağız yarı açısı
    ox, oy = cx + ro*math.cos(ang), cy - ro*math.sin(ang)
    ix, iy = cx + ri*math.cos(ang), cy - ri*math.sin(ang)
    d = (f"M{r(ox)} {r(oy)} A{r(ro)} {r(ro)} 0 1 0 {r(ox)} {r(2*cy-oy)} "
         f"L{r(ix)} {r(2*cy-iy)} A{r(ri)} {r(ri)} 0 1 1 {r(ix)} {r(iy)} Z")
    return [d], 2*ro

def glyph_E(w=100.0):
    a = 0.20*H
    return [poly([(0,0),(w,0),(w,a),(S,a),(S,H/2-a/2),(w-8,H/2-a/2),(w-8,H/2+a/2),
                  (S,H/2+a/2),(S,H-a),(w,H-a),(w,H),(0,H)])], w

# --------------------------------------------------------------- dizgiler
def typeset(letters, gap, dx=0.0, dy=0.0, scale=1.0, fill=INK):
    parts, x = [], 0.0
    for paths, w in letters:
        parts.append(f'<path d="{" ".join(paths)}" fill="{fill}" fill-rule="evenodd" '
                     f'transform="translate({r(dx+x*scale)} {r(dy)}) scale({r(scale)})"/>')
        x += w + gap
    return parts, (x - gap)*scale

def wordmark(**kw):
    return typeset([glyph_N(), glyph_A(), glyph_V(), glyph_I(), glyph_A(), glyph_R()],
                   gap=0.36*H, **kw)

def descriptor(**kw):
    return typeset([glyph_C(), glyph_A(), glyph_R(), glyph_E()], gap=0.30*H, **kw)

# --------------------------------------------------------------- monogram
MW, MH, MS = 100.0, 100.0, 22.0                      # kare, gövde %22
DIAMOND = 14.0                                       # köşeden köşeye, 0,14H

def monogram_paths():
    run = MW - 2*MS
    dv  = MS / math.cos(math.atan(run / MH))
    n = (f"M0 0 H{r(MS)} L{r(MW-MS)} {r(MH-dv)} V0 H{r(MW)} V{r(MH)} "
         f"H{r(MW-MS)} L{r(MS)} {r(dv)} V{r(MH)} H0 Z")
    cx, cy, h = MW/2.0, MH/2.0, DIAMOND/2.0          # diyagonalin tam ortası
    d = poly([(cx, cy-h), (cx+h, cy), (cx, cy+h), (cx-h, cy)])
    return [n, d]                                    # evenodd → elmas delik

def monogram(dx=0.0, dy=0.0, scale=1.0, fill=INK):
    return (f'<path d="{" ".join(monogram_paths())}" fill="{fill}" fill-rule="evenodd" '
            f'transform="translate({r(dx)} {r(dy)}) scale({r(scale)})"/>')

# ------------------------------------------------------------------- svg
def svg(name, vb, body, title, bg=None):
    x, y, w, h = vb
    rect = f'<rect x="{r(x)}" y="{r(y)}" width="{r(w)}" height="{r(h)}" fill="{bg}"/>\n  ' if bg else ""
    doc = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{r(x)} {r(y)} {r(w)} {r(h)}" '
           f'width="{r(w)}" height="{r(h)}" role="img" aria-label="{title}">\n'
           f'  <title>{title}</title>\n  {rect}' + "\n  ".join(body) + "\n</svg>\n")
    p = OUT / name
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(doc, encoding="utf-8")
    return p

# ------------------------------------------------------------------- emit
MON_H = 178.0                                        # pano: monogram 178 px, wordmark cap 82 px
WM_CAP = 82.0
GAP = 90.0                                           # monogram → wordmark
DESC_CAP = 0.55 * WM_CAP                             # pano: CARE cap ≈ 45/82
DESC_GAP = 0.40 * WM_CAP                             # wordmark altı → CARE üstü

def lockup(name, ink, ink2, bg=None, pad=0.0):
    wm_parts, wm_w = wordmark(scale=WM_CAP/H, fill=ink)
    de_parts, de_w = descriptor(scale=DESC_CAP/H, fill=ink2)
    x0 = MON_H + GAP
    top = 12.0                                       # wordmark üstü; CARE tabanı 172 < 178
    body = [monogram(pad, pad, MON_H/MH, ink)]
    body += wordmark(dx=pad+x0, dy=pad+top, scale=WM_CAP/H, fill=ink)[0]
    body += descriptor(dx=pad+x0+wm_w-de_w, dy=pad+top+WM_CAP+DESC_GAP, scale=DESC_CAP/H, fill=ink2)[0]
    return svg(name, (0, 0, x0+wm_w+2*pad, MON_H+2*pad), body, "NAVIAR CARE", bg=bg)

made = [
    lockup("naviar-care-lockup.svg", INK, INK_2),
    lockup("naviar-care-lockup-mono-black.svg", BLACK, BLACK),
    lockup("naviar-care-lockup-reverse.svg", WHITE, WHITE, bg=INK, pad=40.0),
    lockup("naviar-care-lockup-white.svg", WHITE, WHITE),          # koyu zemin, şeffaf
    svg("naviar-care-monogram.svg", (0, 0, MW, MH), [monogram()], "NAVIAR CARE N"),
    svg("naviar-care-monogram-white.svg", (0, 0, MW, MH), [monogram(fill=WHITE)], "NAVIAR CARE N"),
]
wm, w = wordmark()
made.append(svg("naviar-wordmark-v03.svg", (0, 0, w, H), wm, "NAVIAR wordmark v0.3"))

# favicon: koyu kare, beyaz N (16 px'te elmas kapanır; pano da 16 px için ayrı master ister)
s = 0.62
made.append(svg("naviar-care-favicon.svg", (0, 0, 512, 512),
                [f'<rect width="512" height="512" rx="96" fill="{INK}"/>',
                 monogram((512-512*s)/2, (512-512*s)/2, 512*s/MW, WHITE)], "NAVIAR CARE"))

# EUIPO 250×250: beyaz kare, lockup ortalı (tescil zarfı denetimi ayrı iştir)
lk_w = MON_H + GAP + wordmark()[1]*WM_CAP/H
sc = 210.0 / lk_w
body = [f'<rect width="250" height="250" fill="{WHITE}"/>',
        f'<g transform="translate(20 {r((250-MON_H*sc)/2)}) scale({r(sc)})">'
        + monogram(0, 0, MON_H/MH, INK)
        + "".join(wordmark(dx=MON_H+GAP, dy=12.0, scale=WM_CAP/H, fill=INK)[0])
        + "".join(descriptor(dx=MON_H+GAP+wordmark()[1]*WM_CAP/H-descriptor()[1]*DESC_CAP/H,
                             dy=12.0+WM_CAP+DESC_GAP, scale=DESC_CAP/H, fill=INK_2)[0])
        + "</g>"]
made.append(svg("naviar-care-euipo-250.svg", (0, 0, 250, 250), body, "NAVIAR CARE"))

print(f"wordmark   = {w:.0f} x {H:.0f} -> {w/H:.2f}:1 (pano 740/82 = 9.02:1)")
print(f"stroke     = {S/H*100:.0f}% H (pano ~24%)")
print(f"monogram   = {MW:.0f} x {MH:.0f}, gövde {MS/MH*100:.0f}%, elmas {DIAMOND/MH*100:.0f}% H")
print(f"lockup     = {lk_w:.0f} x {MON_H:.0f}")
print(f"{len(made)} dosya:")
for m in made: print("  " + str(m.relative_to(OUT.parent)))
