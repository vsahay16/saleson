"""Generate discovery files from current canonical metadata without invented dates."""
from html.parser import HTMLParser
from pathlib import Path
from html import escape
from urllib.parse import urlsplit
ROOT=Path(__file__).resolve().parents[1]
class Metadata(HTMLParser):
 def __init__(self):
  super().__init__(); self.canonical=''; self.description=''; self.title=''; self.in_title=False; self.noindex=False
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='title': self.in_title=True
  if tag=='link' and a.get('rel')=='canonical': self.canonical=a.get('href','')
  if tag=='meta' and a.get('name','').lower()=='description': self.description=a.get('content','')
  if tag=='meta' and a.get('name','').lower()=='robots': self.noindex='noindex' in a.get('content','').lower()
 def handle_endtag(self,tag):
  if tag=='title': self.in_title=False
 def handle_data(self,data):
  if self.in_title: self.title+=data

def clean(text): return ' '.join(text.split()).replace('[','(').replace(']',')')
def group(path):
 if path in ['/help','/request-demo','/pricing']: return 'Getting started and support'
 if path in ['/privacy-policy','/terms','/refund']: return 'Policies'
 if path.startswith('/tools') or path in ['/sales-leakage-calculator','/quiz']: return 'Free business tools'
 if path.startswith(('/industries/','/user/')): return 'Industries and business use cases'
 if path.startswith('/customers/'): return 'Customer stories'
 if path.startswith('/blogs'): return 'Articles'
 if path.startswith('/compare/') or path=='/saleson-vs-other-field-sales': return 'Comparisons'
 return 'Product and company'
pages={}
for file in sorted(ROOT.rglob('*.html')):
 if 'node_modules' in file.parts or '.git' in file.parts: continue
 meta=Metadata(); meta.feed(file.read_text())
 if not meta.canonical or meta.noindex or file.relative_to(ROOT).as_posix() in ['pricing/in.html','pricing/us.html']: continue
 url=urlsplit(meta.canonical)
 if url.scheme!='https' or url.netloc!='saleson.co.in' or url.query or url.fragment: raise ValueError(f'Unexpected canonical: {file}')
 if meta.canonical in pages: continue  # Canonical aliases share one discovery entry.
 pages[meta.canonical]=meta
xml='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
xml+=''.join(f'  <url><loc>{escape(url)}</loc></url>\n' for url in sorted(pages))+'</urlset>\n'
(ROOT/'sitemap.xml').write_text(xml)
(ROOT/'robots.txt').write_text('User-agent: *\nAllow: /\n\nSitemap: https://saleson.co.in/sitemap.xml\n')
lines=['# SalesOn','','> SalesOn provides sales and distribution software for field teams, distributors and manufacturers.','','Use linked pages for current capabilities, pricing, support and terms. Free tools are standalone business utilities; customer stories describe individual customer workflows.','']
groups={}
for url,meta in sorted(pages.items()): groups.setdefault(group(urlsplit(url).path),[]).append(f'- [{clean(meta.title)}]({url}): {clean(meta.description)}')
for heading in ['Getting started and support','Product and company','Industries and business use cases','Customer stories','Comparisons','Articles','Free business tools','Policies']:
 if heading in groups: lines+=['## '+heading,'']+groups[heading]+['']
(ROOT/'llms.txt').write_text('\n'.join(lines))
print(f'Prepared sitemap, robots.txt and described llms.txt entries for {len(pages)} canonical pages.')
