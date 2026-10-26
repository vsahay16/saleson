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
 s=p.read_text();assert 'Sources and review date' in s and '26 October 2026' in s,p.name
 assert 'Custom pricing - more expensive' not in s and 'Complex UI' not in s
for rel,expected in [('pricing.html','₹25,000'),('pricing/in.html','₹25,000'),('pricing/us.html','$900')]:
 s=(R/rel).read_text();m=re.search(r'<div\b(?=[^>]*id="res-annual")[^>]*>([^<]*)',s)
 assert m[1]==expected,(rel,m[1])
 assert 'Annual lock-in' not in s
print(f'PASS: all {len(pages)} pages share header/footer; industry/audience/blog/comparison additions and first-paint pricing verified.')
