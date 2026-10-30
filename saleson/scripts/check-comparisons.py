"""Verify comparison provenance, product distinctions, pricing and repeated-content risk."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit
import json,re,itertools
R=Path(__file__).resolve().parents[1]
class Page(HTMLParser):
 def __init__(self,s):
  super().__init__();self.main=False;self.skip=False;self.words=[];self.scripts=[];self.schema='';self.in_schema=False;self.h1=[];self.in_h1=False;self.links=[];self.ids=set();self.questions=[];self.in_summary=False;self.q='';self.rows=0;self.feed(s)
 def handle_starttag(self,t,attrs):
  a=dict(attrs)
  if t=='main':self.main=True
  if 'id' in a:self.ids.add(a['id'])
  if t=='a':self.links.append(a.get('href',''))
  if t=='script' and a.get('type')=='application/ld+json':self.in_schema=True;self.schema=''
  if self.main and t=='h1':self.in_h1=True
  if self.main and t=='summary':self.in_summary=True;self.q=''
  if self.main and t=='tr':self.rows+=1
 def handle_endtag(self,t):
  if t=='main':self.main=False
  if t=='h1':self.in_h1=False
  if t=='summary':self.in_summary=False;self.questions.append(self.q)
  if t=='script' and self.in_schema:self.scripts.append(json.loads(self.schema));self.in_schema=False
 def handle_data(self,d):
  if self.main:self.words.extend(re.findall(r'\w+',d.lower()))
  if self.in_h1:self.h1.append(d)
  if self.in_summary:self.q+=d
  if self.in_schema:self.schema+=d
pages=[]
allowed={'bizom.com','beatroute.io','deltasalesapp.com','www.freshworks.com','www.salesforce.com','www.zoho.com'}
config=json.loads(re.search(r'Object.freeze\((.*)\);',(R/'assets/js/pricing-config.js').read_text())[1])['IN']['plans']
for p in sorted((R/'compare').glob('*.html')):
 s=p.read_text();d=Page(s)
 assert 'SalesOn vs ' in ''.join(d.h1),p.name
 assert d.rows==5,(p.name,d.rows)
 assert '28 October 2026' in s and '₹0 SalesOn account setup' in s and 'minimum 2 users' in s.lower(),p.name
 for plan in config.values():
  assert '₹'+format(plan['monthly']*2,',')+'/month for 2 users' in s
  assert '₹'+format(plan['annual']*2,',')+'/year' in s
 for href in d.links:
  if href.startswith('#'):assert href[1:] in d.ids,(p.name,href)
  elif href.startswith('https:') and not href.startswith('https://saleson.co.in'):
   assert urlsplit(href).netloc in allowed,(p.name,href)
 faq=next(x for schema in d.scripts for x in schema.get('@graph',[]) if x['@type']=='FAQPage')
 assert [q['name'] for q in faq['mainEntity']]==d.questions,p.name
 for q in faq['mainEntity']:assert q['acceptedAnswer']['text'] in s.replace('&amp;','&'),p.name
 assert 'dateModified": "2026-10-28"' in s
 assert 'List the actions your salespeople' not in s
 shingles=set(zip(*(d.words[i:] for i in range(5))));pages.append((p.name,shingles))
maximum=0
for (a,x),(b,y) in itertools.combinations(pages,2):
 score=len(x&y)/len(x|y);maximum=max(maximum,score)
 assert score<.25,(a,b,score)
zoho=(R/'compare/zoho-alternative.html').read_text();assert 'free edition for three users' in zoho and 'Professional' in zoho and 'invoices' in zoho
fresh=(R/'compare/freshsales-alternative.html').read_text();assert 'do not present the free option consistently' in fresh
sf=(R/'compare/salesforce-alternative.html').read_text();assert 'monthly or annually' in sf and 'US$25' in sf
assert 'does not claim equivalent AI-agent functionality' in (R/'compare/beatroute-alternative.html').read_text()
print(f'PASS: {len(pages)} comparison pages: official source domains, citation targets, FAQ/schema matching, shared INR totals, product distinctions and maximum five-word overlap {maximum:.1%}.')
