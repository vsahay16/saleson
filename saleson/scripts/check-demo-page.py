from pathlib import Path
import json
from html.parser import HTMLParser
class Page(HTMLParser):
 def __init__(self):super().__init__();self.tags=[];self.ids=[];self.jsons=[];self.capture=False;self.buf=''
 def handle_starttag(self,tag,attrs):
  a=dict(attrs);self.tags.append((tag,a))
  if 'id' in a:self.ids.append(a['id'])
  if tag=='script' and a.get('type')=='application/ld+json':self.capture=True;self.buf=''
 def handle_data(self,s):
  if self.capture:self.buf+=s
 def handle_endtag(self,tag):
  if tag=='script' and self.capture:self.jsons.append(json.loads(self.buf));self.capture=False
root=Path(__file__).resolve().parents[1];s=(root/'request-demo.html').read_text();p=Page();p.feed(s)
assert len(p.ids)==len(set(p.ids))
assert sum(t=='h1' for t,a in p.tags)==1 and sum(t=='main' for t,a in p.tags)==1
assert '<title>Book a SalesOn Demo | 30-Min Live Walkthrough</title>' in s
assert any(t=='link' and a.get('rel')=='canonical' and a.get('href')=='https://saleson.co.in/request-demo' for t,a in p.tags)
assert 'noindex' not in s.lower()
assert 'static.zcal.co/embed/v1/embed.js' not in s
frames=[a for tag,a in p.tags if tag=='iframe' and 'zcal.co' in a.get('src','')];assert len(frames)==1
assert frames[0]['src']=='https://zcal.co/i/bkJXrTMK?embed=1&embedType=iframe'
assert frames[0].get('loading')=='eager' and frames[0].get('title')
assert sum(t=='a' and 'data-demo-direct' in a and a.get('href')=='https://zcal.co/i/bkJXrTMK' for t,a in p.tags)==1
faq=next(d for d in p.jsons if d.get('@type')=='FAQPage')['mainEntity'];assert len(faq)==5
for q in faq:assert q['name'] in s and q['acceptedAnswer']['text'] in s
for phrase in ['zero errors','No Exceptions','1–2 days','1,100+ demos','Questions People Ask']:assert phrase not in s
assert s.index('id="calCard"') < s.index('data-client-showcase="request-demo"')
assert 'id="booking-loading" role="status"' in s
assert 'Why attend the demo' in s and 'See SalesOn in action.' in s
print('PASS: Demo title/canonical/indexing, booking destination, direct eager calendar iframe, fallback, unique IDs and visible FAQ/schema alignment.')
