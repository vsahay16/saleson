"""Protect distinct industry/manufacturer intent, preserved URLs and internal anchors."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import json,re,itertools
R=Path(__file__).resolve().parents[1]
class Page(HTMLParser):
 def __init__(self,s):
  super().__init__();self.ids=set();self.links=[];self.main=False;self.in_h1=False;self.h1='';self.skip=False;self.words=[];self.canonical='';self.feed(s)
 def handle_starttag(self,t,attrs):
  a=dict(attrs)
  if 'id' in a:self.ids.add(a['id'])
  if t=='a':self.links.append(a.get('href',''))
  if t=='main':self.main=True
  if t=='h1':self.in_h1=True
  if t=='script':self.skip=True
  if t=='link' and a.get('rel')=='canonical':self.canonical=a.get('href')
 def handle_endtag(self,t):
  if t=='main':self.main=False
  if t=='h1':self.in_h1=False
  if t=='script':self.skip=False
 def handle_data(self,d):
  if self.in_h1:self.h1+=d
  if self.main and not self.skip:self.words.extend(re.findall(r'\w+',d.lower()))
pages={p:Page(p.read_text()) for p in R.rglob('*.html')}
def resolve(source,u):
 p=R/unquote(u.path).lstrip('/') if u.path.startswith('/') else source.parent/unquote(u.path) if u.path else source
 for target in [p,p.with_suffix('.html'),p/'index.html']:
  if target in pages:return target
for source,data in pages.items():
 for href in data.links:
  u=urlsplit(href)
  if u.netloc and u.netloc not in ['saleson.co.in','www.saleson.co.in']:continue
  if not u.fragment:continue
  target=resolve(source,u)
  if target:assert unquote(u.fragment) in pages[target].ids,(source,href)
industry=[(p,d) for p,d in pages.items() if p.parent==R/'industries'];assert len(industry)==12
assert len({d.h1 for p,d in industry})==12
for p,d in industry:
 assert 'industry-workflow' in d.ids and '/request-demo' in d.links
 assert len(d.words)>180,(p,'insufficient workflow detail')
 assert not any(phrase in p.read_text() for phrase in ['SalesOn - The All In One solution','How will SalesOn help your business ?','Empowering Automotive Production Through Data'])
for (p,a),(q,b) in itertools.combinations(industry,2):
 x=set(zip(*(a.words[i:] for i in range(5))));y=set(zip(*(b.words[i:] for i in range(5))))
 assert len(x&y)/len(x|y)<.20,(p,q)
primary=pages[R/'user/software-for-manufacturers.html'];guide=pages[R/'industries/manufacturing.html'];production=pages[R/'production.html']
assert primary.canonical.endswith('/user/software-for-manufacturers')
assert guide.canonical.endswith('/industries/manufacturing')
assert '/user/software-for-manufacturers' in guide.links and '/production' in guide.links
assert '/industries/manufacturing' in primary.links and '/production' in primary.links
for config in [R/'vercel.json',R.parent/'vercel.json']:
 for redirect in json.loads(config.read_text())['redirects']:assert 'manufactur' not in redirect['source']
for name in ['inventory-management.html','user/software-for-retailers.html']:
 d=pages[R/name];assert len(d.words)>250
 assert '/pricing' in d.links
assert 'POS' in (R/'user/software-for-retailers.html').read_text()
assert 'free planning tools' in (R/'inventory-management.html').read_text()
demo=(R/'request-demo.html').read_text();assert 'https://zcal.co/i/bkJXrTMK' in demo
assert 'zcal.co/i/bkJXrTMK' in demo
print(f'PASS: {len(pages)} pages have valid internal fragments; 12 distinct industry workflows, manufacturer scope/URLs, supported buyer detail and booking fallback verified.')
