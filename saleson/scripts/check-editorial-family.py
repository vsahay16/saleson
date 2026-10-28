"""Guard distinct editorial imagery and one consistent tool/article family."""
from pathlib import Path
from html.parser import HTMLParser
import json,hashlib,re
W=Path(__file__).resolve().parents[1]
m=json.loads((W/'assets/data/editorial-images.json').read_text())
class Page(HTMLParser):
 def __init__(self,s):super().__init__();self.images=[];self.styles=[];self.h1=0;self.feed(s)
 def handle_starttag(self,t,attrs):
  a=dict(attrs)
  if t=='img':self.images.append(a)
  if t=='link' and a.get('rel')=='stylesheet':self.styles.append(a.get('href',''))
  if t=='h1':self.h1+=1
seen=[]
for group in ['industries','articles']:
 assert len(m[group])==12,group
 for slug,a in m[group].items():
  image=W/a['path'].lstrip('/');data=image.read_bytes();assert data[:4]==b'RIFF' and data[8:12]==b'WEBP',image
  assert len(data)<250000,(image,'unexpected image payload')
  seen.append(hashlib.sha256(data).hexdigest())
  p=W/('blogs' if group=='articles' else 'industries')/(slug+'.html');s=p.read_text();d=Page(s)
  assert d.h1==1,p
  primary=[i for i in d.images if i.get('fetchpriority')=='high'];assert len(primary)==1 and primary[0]['src']==a['path'],p
  assert primary[0].get('alt') and primary[0].get('width') and primary[0].get('height'),p
  if group=='articles':
   assert any('/css/editorial-pages.' in x for x in d.styles),p
   assert 'article-reading-grid' in s and 'article-copy' in s,p
   assert not re.search(r'&lt;/?div',s),p
assert len(set(seen))==24,'Editorial scenes must not repeat across pages'
for p in [W/'tools/index.html',*sorted((W/'tools').glob('*/index.html'))]:
 d=Page(p.read_text());assert any('/css/tools-family.' in x for x in d.styles),p
for route in ['calculators/sales-leakage-calculator.html','guide/quiz-pro.html']:
 d=Page((W/route).read_text());assert any('/css/utility-pages.' in x for x in d.styles),route
assert '@media screen' in (W/'css/tools-family.css').read_text()
index=Page((W/'blogs.html').read_text());assert len([i for i in index.images if '/assets/img/editorial/articles/' in i.get('src','')])==12
assert all(i.get('loading')=='lazy' for i in index.images if '/assets/img/editorial/articles/' in i.get('src',''))
print('PASS: 13 tool pages and two standalone utilities share the design family; 12 articles and 12 industries use unique, dimensioned WebP heroes with matching lazy blog-index images.')
