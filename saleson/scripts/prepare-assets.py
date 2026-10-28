"""Fingerprint HTML-referenced JS/CSS and regenerate the canonical sitemap."""
from pathlib import Path
from html.parser import HTMLParser
import hashlib, json, re, subprocess, sys
from xml.sax.saxutils import escape
from decimal import Decimal, ROUND_HALF_UP

ROOT = Path(__file__).resolve().parents[1]
subprocess.run([sys.executable,str(ROOT/'scripts/generate-pricing.py')],check=True)
for name in ['build-audience-pages.py','build-comparisons.py','build-page-theme.py','extract-tool-assets.py']:
    subprocess.run([sys.executable,str(ROOT/'scripts'/name)],check=True)
manifest_path = ROOT / 'assets-manifest.json'
previous = json.loads(manifest_path.read_text()) if manifest_path.exists() else {}
pages = sorted(ROOT.rglob('*.html'))
for p in pages:
    s = p.read_text()
    for source, versioned in previous.items(): s = s.replace(versioned, source)
    p.write_text(s)

# Keep the no-JavaScript/first-paint calculator totals consistent with the same
# published pricing configuration used by the interactive calculator.
pricing_source=(ROOT/'assets/js/pricing-config.js').read_text()
pricing=json.loads(re.search(r'Object\.freeze\((\{.*\})\);',pricing_source,re.S)[1])
def money(amount, region):
    number=Decimal(amount).quantize(Decimal('.01'),rounding=ROUND_HALF_UP)
    whole,decimal=f'{number:.2f}'.split('.')
    if region['currency']=='INR' and len(whole)>3:
        prefix,tail=whole[:-3],whole[-3:];groups=[]
        while prefix:groups.insert(0,prefix[-2:]);prefix=prefix[:-2]
        whole=','.join(groups+[tail])
    else:whole=f'{int(whole):,}'
    suffix=decimal.rstrip('0')
    return region['symbol']+whole+('.'+suffix if suffix else '')
for relative,code in [('pricing.html','IN')]:
    p=ROOT/relative;s=p.read_text();region=pricing[code]
    users=Decimal(re.search(r'<input\b(?=[^>]*id="calc-users")[^>]*value="([^"]+)"',s)[1])
    plan=next(iter(region['plans'].values()))
    annual=users*plan['annual'];saving=users*plan['monthly']*12-annual
    values={'res-monthly':annual/12,'res-annual':annual,'res-payment':annual,'res-save':saving}
    for identifier,amount in values.items():
        s=re.sub(r'(<(?:div|strong)\b(?=[^>]*id="'+identifier+r'")[^>]*>)[^<]*(</(?:div|strong)>)',lambda m:m[1]+money(amount,region)+m[2],s)
    p.write_text(s)
for versioned in previous.values():
    (ROOT / versioned.lstrip('/')).unlink(missing_ok=True)
# Remove generated copies left by an interrupted earlier preparation.
for folder in ('css', 'components', 'assets/js'):
    for p in (ROOT/folder).rglob('*'):
        if p.is_file() and re.search(r'\.[a-f0-9]{12}\.(css|js)$',p.name): p.unlink()

manifest = {}
for p in pages:
    s = p.read_text()
    def asset(m):
        source = m[3]
        if not source.startswith('/') or source.startswith('//') or not source.endswith(('.js', '.css')): return m[0]
        file = ROOT / source.lstrip('/')
        if not file.is_file(): return m[0]
        if source not in manifest:
            digest = hashlib.sha256(file.read_bytes()).hexdigest()[:12]
            dest = file.with_name(file.stem + '.' + digest + file.suffix)
            dest.write_bytes(file.read_bytes())
            manifest[source] = '/' + dest.relative_to(ROOT).as_posix()
        return m[1] + '=' + m[2] + manifest[source] + m[2]
    s = re.sub(r'\b(href|src)=("|\')(.*?)\2', asset, s)
    p.write_text(s)
manifest_path.write_text(json.dumps(manifest, indent=2) + '\n')

class Metadata(HTMLParser):
    def __init__(self): super().__init__(); self.canonical=None; self.noindex=False
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if tag=='link' and a.get('rel')=='canonical': self.canonical=a.get('href')
        if tag=='meta' and a.get('name')=='robots' and 'noindex' in a.get('content',''): self.noindex=True

urls=set()
for p in pages:
    if p.relative_to(ROOT).as_posix()=='pricing/in.html': continue
    meta=Metadata(); meta.feed(p.read_text())
    if meta.canonical and not meta.noindex: urls.add(meta.canonical)
xml='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
xml+=''.join('  <url><loc>'+escape(u)+'</loc></url>\n' for u in sorted(urls))+'</urlset>\n'
(ROOT/'sitemap.xml').write_text(xml)
print(f'Prepared {len(manifest)} versioned assets and {len(urls)} canonical sitemap URLs.')
