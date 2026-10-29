"""Ensure public customer evidence stays within the supplied page/module allocation."""
from pathlib import Path
from html.parser import HTMLParser
import json
W=Path(__file__).resolve().parents[1]
m=json.loads((W/'assets/data/client-showcase.json').read_text())
modules={'field-sales':'Field Sales','order-taking-app':'Order Taking','distribution-management-system':'DMS','salesman-tracking':'Salesman Tracking','payment-collection':'Payment Collection','invoicing':'GST Invoicing','production':'Production','delivery-management':'Delivery','van-sales':'Van Sales','tally-integration':'Tally','inventory-management':'DMS'}
class Group(HTMLParser):
 def __init__(self,s):super().__init__();self.groups=[];self.ids=[];self.images=[];self.feed(s)
 def handle_starttag(self,t,a):
  a=dict(a)
  if 'data-client-showcase' in a:self.groups.append(a['data-client-showcase'])
  if 'data-client' in a:self.ids.append(a['data-client'])
  if t=='img' and any(folder in a.get('src','') for folder in ['/assets/img/clients/master/','/assets/img/clients/display/']):self.images.append(a)
used=set()
for p in m['pages']:
 route=p['page'];source=(W/(('index' if route=='homepage' else route)+'.html')).read_text();d=Group(source)
 assert d.groups==[route],(route,d.groups)
 assert sorted(d.ids)==sorted(p['clients']) and len(set(d.ids))==len(d.ids),(route,d.ids)
 for key in p['clients']:
  c=m['clients'][key]
  if route in modules:assert modules[route] in c['modules'],(route,key,'module not supplied')
  if c['logo']:used.add(c['logo'])
 assert len(d.images)==sum(bool(m['clients'][key]['logo']) for key in p['clients']),route
 for img in d.images:
  assert img['loading']=='lazy' and img.get('width') and img.get('height') and img.get('alt'),(route,img)
  assert (W/img['src'].lstrip('/')).is_file(),img
 assert '/case-studies/' not in source, (route,'missing case-study pages must not be linked')
for route in ['attendance','expense-management','target-meter']:
 assert 'data-client-showcase=' not in (W/(route+'.html')).read_text(),route
assert next(p for p in m['pages'] if p['page']=='salesman-tracking')['clients']==['mtn']
for path in used:
 data=(W/path).read_bytes();assert data[:4]==b'RIFF' and data[8:12]==b'WEBP',path
print(f'PASS: {len(m["pages"])} page-specific customer groups, {len(used)} shared WebP logos, supplied module associations, lazy/dimensioned images and no fabricated case links.')
