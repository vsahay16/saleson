"""Offline regression checks. Does not certify Apache, browser layout or CRM."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit
import json, re, subprocess, sys
import xml.etree.ElementTree as ET

ROOT=Path(__file__).resolve().parents[1]
errors=[]; pages=0; schemas=0; links=0

def resolve(path):
    p=ROOT/path.lstrip('/')
    if p.is_file(): return p
    if p.with_suffix('.html').is_file(): return p.with_suffix('.html')
    if (p/'index.html').is_file(): return p/'index.html'
    return None

class Page(HTMLParser):
    def __init__(self,p): super().__init__(); self.p=p; self.canon=[]; self.h1=0
    def handle_starttag(self,tag,attrs):
        global links
        a=dict(attrs)
        if tag=='h1':self.h1+=1
        if tag=='link' and a.get('rel')=='canonical':self.canon.append(a.get('href'))
        for k in ('href','src'):
            u=a.get(k,''); v=urlsplit(u)
            if not u or not v.path or v.scheme not in ('','http','https'):continue
            if v.netloc and v.netloc not in ('saleson.co.in','www.saleson.co.in'):continue
            if not v.path.startswith('/'):
                errors.append(f'{self.p}: non-root relative {k}: {u}');continue
            links+=1
            if resolve(v.path) is None:errors.append(f'{self.p}: missing {k}: {u}')

for p in sorted((p for p in ROOT.rglob('*.html') if 'node_modules' not in p.parts)):
    pages+=1; s=p.read_text(); page=Page(p.relative_to(ROOT));page.feed(s)
    if len(page.canon)!=1: errors.append(f'{p.name}: expected one canonical')
    elif not page.canon[0].startswith('https://saleson.co.in/'):errors.append(f'{p.name}: canonical must be absolute HTTPS')
    if p.parent.name=='industries' and page.h1!=1:errors.append(f'{p.name}: {page.h1} H1s')
    for raw in re.findall(r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',s,re.S):
        try:json.loads(raw);schemas+=1
        except ValueError as e:errors.append(f'{p.name}: invalid schema: {e}')

ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9'}
urls=[x.text for x in ET.parse(ROOT/'sitemap.xml').findall('.//s:loc',ns)]
if len(urls)!=len(set(urls)):errors.append('Duplicate sitemap URLs')
for url in urls:
    path=urlsplit(url).path
    p=resolve(path)
    if path in ('/404','/pricing/in') or path.endswith('.html'):errors.append('Redirect/error in sitemap: '+url)
    if not p:errors.append('Missing sitemap URL: '+url);continue
    page=Page(p.relative_to(ROOT));page.feed(p.read_text())
    if page.canon!=[url]:errors.append('Sitemap/canonical mismatch: '+url)

for source,versioned in json.loads((ROOT/'assets-manifest.json').read_text()).items():
    if (ROOT/source.lstrip('/')).read_bytes()!=(ROOT/versioned.lstrip('/')).read_bytes():errors.append('Stale fingerprint: '+source)

for p in (ROOT/'css').rglob('*.css'):
    for url in re.findall(r'url\(["\']?([^\)"\']+)',p.read_text()):
        u=urlsplit(url)
        if u.scheme or u.netloc or not u.path:continue
        target=ROOT/u.path.lstrip('/') if u.path.startswith('/') else p.parent/u.path
        if not target.is_file():errors.append(f'{p.relative_to(ROOT)}: missing CSS asset: {url}')

print(f'{pages} HTML pages, {schemas} valid JSON-LD blocks, {links} local references, {len(urls)} sitemap URLs checked.')
if errors:
    print('\n'.join(sorted(set(errors))));sys.exit(1)
print('PASS: local references, canonicals, schemas, industry H1s, sitemap and fingerprint contents.')
