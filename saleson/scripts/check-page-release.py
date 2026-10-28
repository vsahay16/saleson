"""Guard the upload package's design dependencies, dimensions and initial payload."""
from pathlib import Path
from html.parser import HTMLParser
import re,json,xml.etree.ElementTree as ET
R=Path(__file__).resolve().parents[1]
class Page(HTMLParser):
 def __init__(self,s):super().__init__();self.images=[];self.links=[];self.ids=[];self.styles=[];self.h1=0;self.feed(s)
 def handle_starttag(self,t,attrs):
  a=dict(attrs)
  if t=='img':self.images.append(a)
  if t=='a':self.links.append(a.get('href',''))
  if 'id' in a:self.ids.append(a['id'])
  if t=='h1':self.h1+=1
  if t=='link' and a.get('rel')=='stylesheet':self.styles.append(a.get('href',''))
files=list((R/'industries').glob('*.html'))+list((R/'compare').glob('*.html'))+[R/x for x in ['inventory-management.html','user/software-for-manufacturers.html','user/software-for-distributors.html','user/software-for-retailers.html','partner.html','saleson-vs-other-field-sales.html']]
for p in files:
 s=p.read_text();d=Page(s)
 assert d.h1==1 and len(d.ids)==len(set(d.ids)),p
 assert 'so-guide' in s and any('/css/guide-pages.' in x for x in d.styles),p
 assert not re.search(r'data:[^;]+;base64,',s),p
 assert p.stat().st_size<18000,(p,'HTML payload unexpectedly large')
 assert d.images and all(x.get('width') and x.get('height') and x.get('alt') for x in d.images),p
 assert len([x for x in d.images if x.get('fetchpriority')=='high'])==1,p
 for image in d.images:
  file=R/image['src'].lstrip('/');assert file.is_file(),(p,file)
  if file.suffix=='.svg':
   svg=ET.fromstring(file.read_text());assert svg.tag.endswith('svg');assert file.stat().st_size<6000,file
 assert not any('saleson-eta.vercel.app' in x for x in d.links),p
print(f'PASS: {len(files)} revised pages use the shared design and dimensioned lightweight images.')
