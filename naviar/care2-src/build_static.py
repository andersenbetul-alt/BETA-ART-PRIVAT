"""NAVIAR CARE 2 — statik derleme sarmalayıcısı (BETA-ART, 05.09.2026).

Kaynak teslimin kendi üreticilerini (build_content.py, build_operations.py) olduğu gibi
çalıştırır, sonra public/ altındaki eksik dosyaları dist/'e ekler ve iki yolu düzeltir:
  - /studio-demo/  (kaynakta ayrı statik sayfa + studio.js; teslimde yok) → o dilin /journey/ sayfası
  - /assets/conversation.webp (KI görseli; teslimde yok) → public/assets/conversation.svg yer tutucu
    (gerçek webp public/assets/ altına konursa dokunulmaz)
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
JOURNEY = {'nb': '/journey/', 'en': '/en/journey/', 'tr': '/tr/journey/'}
n = 0
for p in OUT.rglob('*.html'):
    s = p.read_text(encoding='utf-8'); o = s
    s = re.sub(r'/studio-demo/\?lang=(nb|en|tr)', lambda m: JOURNEY[m.group(1)], s)
    if not has_webp: s = s.replace('/assets/conversation.webp', '/assets/conversation.svg')
    if s != o: p.write_text(s, encoding='utf-8'); n += 1
print(f'build_static: public/ kopyalandı, {n} sayfada yol düzeltildi, hero = {"webp" if has_webp else "svg yer tutucu"}')
