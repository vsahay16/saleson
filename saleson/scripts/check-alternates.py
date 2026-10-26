from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit
import re
R=Path(__file__).resolve().parents[1]
class Metadata(HTMLParser):
 def __init__(self):super().__init__();self.canonical='';self.alternates=[];self.noindex=False
 def handle_starttag(self,t,attrs):
  a=dict(attrs)
  if t=='link' and a.get('rel')=='canonical':self.canonical=a.get('href')
  if t=='link' and 'hreflang' in a:self.alternates.append((a['hreflang'],a.get('href')))
  if t=='meta' and a.get('name')=='robots' and 'noindex' in a.get('content',''):self.noindex=True
def normalize(url):return url if urlsplit(url).path else url+'/'
pages={}
for p in R.rglob('*.html'):
 if p.relative_to(R).as_posix()=='pricing/in.html':continue
 data=Metadata();data.feed(p.read_text());pages[data.canonical]=data
count=0
for canonical,page in pages.items():
 languages={}
 for language,url in page.alternates:
  count+=1
  assert language=='x-default' or re.fullmatch(r'[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*',language),(canonical,language)
  target=normalize(url)
  assert target in pages,(canonical,'noncanonical alternate',url)
  assert not pages[target].noindex,(canonical,'noindex alternate',url)
  assert language not in languages or languages[language]==target,(canonical,'conflicting language',language)
  languages[language]=target
  if target!=canonical:
   assert canonical in [normalize(href) for lang,href in pages[target].alternates],(canonical,'missing reciprocal',target)
print(f'PASS: {count} declared hreflang links use canonical indexable targets, valid code syntax, consistent mappings and reciprocal regional links. Google-selected canonicals require GSC.')
