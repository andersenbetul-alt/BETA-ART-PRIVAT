"""NAVIAR CARE 2 — statik derleme sarmalayıcısı (BETA-ART, 05.09.2026).

Kaynak teslimin kendi üreticilerini (build_content.py, build_operations.py) olduğu gibi
çalıştırır, sonra public/ altındaki eksik dosyaları dist/'e ekler ve iki yolu düzeltir:
  - /studio-demo/  public/studio-demo/ varsa olduğu gibi kalır (arşivdeki Studio-Demo v1.0'dan
    SampleCalendar ile kuruldu); yoksa o dilin /journey/ sayfasına çevrilir
  - /assets/conversation.webp  public/assets/ altında varsa (arşivdeki Studio-Demo'dan çıkarıldı)
    olduğu gibi; yoksa conversation.svg yer tutucu
Sunucu (server/operations.mjs, D1) bu depoda yok; public/operations.js tarayıcı depolamasıyla çalışır.
Kullanım: python3 build_static.py   → dist/
"""
from pathlib import Path
import subprocess, shutil, sys, re

ROOT = Path(__file__).resolve().parent
OUT = ROOT / 'dist'
PUBLIC = ROOT / 'public'

for script in ('build_content.py', 'build_operations.py'):
    r = subprocess.run([sys.executable, str(ROOT / script)], cwd=ROOT)
    if r.returncode: sys.exit(r.returncode)

shutil.copytree(PUBLIC, OUT, dirs_exist_ok=True)
has_webp = (OUT / 'assets' / 'conversation.webp').exists()
has_studio = (OUT / 'studio-demo' / 'index.html').exists()
JOURNEY = {'nb': '/journey/', 'en': '/en/journey/', 'tr': '/tr/journey/'}
n = 0
for p in OUT.rglob('*.html'):
    s = p.read_text(encoding='utf-8'); o = s
    if not has_studio: s = re.sub(r'/studio-demo/\?lang=(nb|en|tr)', lambda m: JOURNEY[m.group(1)], s)
    if not has_webp: s = s.replace('/assets/conversation.webp', '/assets/conversation.svg')
    if s != o: p.write_text(s, encoding='utf-8'); n += 1
print(f'build_static: public/ kopyalandı, {n} sayfada yol düzeltildi, hero = {"webp" if has_webp else "svg yer tutucu"}, studio-demo = {"var" if has_studio else "journey yönlendirmesi"}')
