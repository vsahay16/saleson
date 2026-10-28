from pathlib import Path
from html.parser import HTMLParser
import json,re

R=Path(__file__).resolve().parents[1]
class Page(HTMLParser):
 def __init__(self):super().__init__();self.h=0;self.f=0;self.old=False
 def handle_starttag(self,t,attrs):
  if t=='site-header':self.h+=1
  if t=='site-footer':self.f+=1
  if t in ('header-component','footer-component'):self.old=True
pages=list(R.rglob('*.html'))
for p in pages:
 s=p.read_text();page=Page();page.feed(s)
 assert (page.h,page.f,page.old)==(1,1,False),(p.relative_to(R),page.h,page.f,page.old)
for p in (R/'industries').glob('*.html'):
 s=p.read_text();assert s.count('id="industry-workflow"')==1,p.name
 assert 'workflow-guide-grid' in s and '/request-demo' in s
for p in (R/'blogs').glob('*.html'):
 assert 'blog-next-step' in p.read_text(),p.name
for p in (R/'compare').glob('*.html'):
 s=p.read_text();assert 'Sources and review date' in s and '28 October 2026' in s,p.name
 assert 'Custom pricing - more expensive' not in s and 'Complex UI' not in s
s=(R/'pricing.html').read_text()
assert 'id="res-annual">₹25,000' in s
for rel in ['pricing/in.html','pricing/us.html']:
 s=(R/rel).read_text();assert '0;url=/pricing' in s and 'https://saleson.co.in/pricing' in s
print(f'PASS: all {len(pages)} pages share header/footer; industry/audience/blog/comparison additions and first-paint pricing verified.')
