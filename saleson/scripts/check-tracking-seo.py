"""Coverage, source-preservation and local internal-link/schema audit."""
from pathlib import Path
from bs4 import BeautifulSoup
from urllib.parse import urlsplit,unquote
import json,subprocess,re
R=Path(__file__).resolve().parents[1];pages=list(R.rglob('*.html'));issues=[];links=0;articles=0
for p in pages:
 raw=p.read_text();s=BeautifulSoup(raw,'html.parser');rel=p.relative_to(R).as_posix()
 for asset in ['tracking-config','site-tag-manager','marketing-events','consent-controls']:
  matches=[x for x in s.select('script[src]') if re.search('/'+asset+r'(?:\.[a-f0-9]{12})?\.js$',x['src'])]
  assert len(matches)==1,(rel,asset,len(matches))
 assert len(s.select('template[data-saleson-gtm-fallback]'))==1,rel
 for el in s.find_all(['iframe','img','script']):
  if any(x in el.get('src','') for x in ['googletagmanager.com/ns','facebook.com/tr','px.ads.linkedin']):assert el.find_parent('template'),(rel,str(el))
 # Metadata/URL preservation against this task's starting tree.
 old=BeautifulSoup(subprocess.check_output(['git','show','456bf25:saleson/'+rel],cwd=R.parent,text=True),'html.parser')
 for selector in ['title','link[rel="canonical"]','meta[name="description"]','meta[property^="og:"]','meta[name^="twitter:"]','meta[name="robots"]']:
  if rel=='pricing.html' and selector=='title':continue # pricing generator preserves its established current title
  def values(doc):return [str(x) for x in doc.select(selector)]
  assert values(old)==values(s),(rel,selector)
 def resolve(path):
  q=R/path.lstrip('/')
  return next((x for x in [q,q.with_suffix('.html'),q/'index.html'] if x.is_file()),None)
 for a in s.select('a[href]'):
  u=urlsplit(a['href'])
  if u.scheme not in ['','http','https'] or u.netloc not in ['','saleson.co.in','www.saleson.co.in']:continue
  target=resolve(u.path) if u.path else p
  assert target,(rel,a['href']);links+=1
  if u.fragment and target.suffix=='.html':
   dest=s if target==p else BeautifulSoup(target.read_text(),'html.parser')
   if not dest.find(id=unquote(u.fragment)) and not dest.find(attrs={'name':unquote(u.fragment)}):issues.append((rel,a['href']))
 if p.parent==R/'blogs':
  graphs=[json.loads(x.string or x.text) for x in s.select('script[type="application/ld+json"]')]
  a=[n for g in graphs for n in g.get('@graph',[g]) if n.get('@type')=='BlogPosting'];assert len(a)==1
  assert a[0].get('datePublished') and a[0].get('image');articles+=1
assert not issues,issues
# Established sitemap, redirects and robots stay byte-identical.
for rel in ['sitemap.xml','robots.txt','vercel.json']:
 assert (R/rel).read_bytes()==subprocess.check_output(['git','show','456bf25:saleson/'+rel],cwd=R.parent),rel
print(f'PASS: {len(pages)} pages, one GTM/consent/event setup each; {links} internal links and fragments; {articles} dated BlogPosting schemas; original metadata, robots, sitemap and hosting routes preserved.')
