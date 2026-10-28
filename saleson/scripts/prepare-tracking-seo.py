"""Idempotent tracking/SEO pass, run after page generators and before fingerprints.
Legacy vendor code remains in source, quarantined pending verified GTM migration.
No account-side tags are edited or published here.
"""
from pathlib import Path
import re,json
from bs4 import BeautifulSoup
R=Path(__file__).resolve().parents[1]
# Strip superseded GTM bootstraps, retaining unrelated UI code.
for rel in ['assets/js/app.js','assets/js/min/app.min.js']:
 p=R/rel;s=p.read_text()
 s=re.sub(r'\(function\(w,d,s,l,i\).*?GTM-WQNBHFQS\x27\);','',s,flags=re.S)
 p.write_text(s)
for rel in ['assets/js/common.js','assets/js/min/common.min.js']:
 p=R/rel;s=p.read_text()
 if 'SALESON_LEGACY_QUARANTINE' not in s:
  end=s.index('/* ---- FAQ accordion')
  legacy=s[:end]
  # Remove only GTM: the canonical head owns its installation now.
  legacy=re.sub(r'/\* ---- Google Tag Manager ---- \*/.*?GTM-WQNBHFQS"\);','',legacy,flags=re.S)
  s='/* SALESON_LEGACY_QUARANTINE: retained for migration/account audit; never executed. */\nif (false) {\n'+legacy+'\n}\n'+s[end:]
 p.write_text(s)
p=R/'assets/js/feature-analytics.js';s=p.read_text()
if 'SALESON_LEGACY_QUARANTINE' not in s:s='/* SALESON_LEGACY_QUARANTINE: retain until remote GTM replacements are verified. */\nif (false) {\n'+s+'\n}\n'
p.write_text(s)
for rel in ['components/site-header.js','assets/js/header.js','assets/js/min/header.min.js']:
 p=R/rel;s=p.read_text();s=re.sub(r'<!-- Google Tag Manager \(noscript\) -->.*?<!-- End Google Tag Manager \(noscript\) -->','',s,flags=re.S);p.write_text(s)
# The old tool-open helper must not enqueue outside consent or send arbitrary payloads.
for p in (R/'assets/js/tools').glob('*-2.js'):
 s=p.read_text()
 if 'window.salesonTrack = window.salesonTrack || function' in s:
  s=re.sub(r'window.salesonTrack = window.salesonTrack \|\| function\(eventName, data\) \{.*?\};',"window.salesonTrack = window.salesonTrack || function() {}; // Old tool_opened deliberately retired; no conversion inferred.",s,flags=re.S)
  p.write_text(s)
head='''<!-- SALESON_TRACKING_HEAD:START -->
<script src="/assets/js/tracking-config.js"></script>
<script src="/assets/js/site-tag-manager.js"></script>
<link rel="stylesheet" href="/css/consent-controls.css">
<script defer src="/assets/js/consent-controls.js"></script>
<script defer src="/assets/js/marketing-events.js"></script>
<!-- SALESON_TRACKING_HEAD:END -->'''
# The standard fallback URL is retained inert: active noscript would bypass consent,
# production hostname checks and the unverified-container release gate.
body='''<!-- SALESON_TRACKING_BODY:START -->
<noscript><template data-saleson-gtm-fallback><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-WQNBHFQS" height="0" width="0" class="saleson-gtm-fallback" title="Google Tag Manager"></iframe></template></noscript>
<!-- SALESON_TRACKING_BODY:END -->'''
for p in sorted((p for p in R.rglob('*.html') if 'node_modules' not in p.parts)):
 s=p.read_text()
 for name in ['HEAD','BODY']:
  s=re.sub(r'<!-- SALESON_TRACKING_'+name+r':START -->.*?<!-- SALESON_TRACKING_'+name+r':END -->','',s,flags=re.S)
 # Retain direct pixel fallback markup inert pending remote verification; it must
 # never bypass optional consent. Remove duplicate old GTM fallbacks.
 s=re.sub(r'<noscript>\s*<iframe\b[^>]*googletagmanager[^>]*>.*?</iframe>\s*</noscript>','',s,flags=re.S)
 s=re.sub(r'<template data-legacy-pixel>(.*?)</template>',lambda m:'<!-- SALESON_LEGACY_PIXEL '+m[1]+' -->',s,flags=re.S)
 s=re.sub(r'<noscript>\s*(<img\b[^>]*(?:facebook.com/tr|px.ads.linkedin.com)[^>]*>)\s*</noscript>',lambda m:'<!-- SALESON_LEGACY_PIXEL '+m[0]+' -->',s,flags=re.S)
 # Direct image pixels outside noscript, but not already archived in a comment.
 parts=re.split(r'(<!--.*?-->)',s,flags=re.S)
 s=''.join(part if part.startswith('<!--') else re.sub(r'<img\b[^>]*(?:facebook.com/tr|px.ads.linkedin.com)[^>]*>',lambda m:'<!-- SALESON_LEGACY_PIXEL '+m[0]+' -->',part) for part in parts)

 # Remove earlier standalone inclusion; avoid changing the quarantined source scripts.
 s=re.sub(r'<script\b[^>]*src=["\'][^"\']*/site-tag-manager(?:\.[a-f0-9]{12})?\.js["\'][^>]*>\s*</script>','',s)
 meta=BeautifulSoup(s,'html.parser').select_one('link[rel="canonical"]')
 from urllib.parse import urlsplit
 path=urlsplit(meta['href']).path if meta else '/'
 pagehead=head.replace('src="/assets/js/tracking-config.js"','src="/assets/js/tracking-config.js" data-saleson-page="'+path+'"')
 s=re.sub(r'(<head\b[^>]*>)',lambda m:m[0]+pagehead,s,count=1,flags=re.I)
 s=re.sub(r'(<body\b[^>]*>)',lambda m:m[0]+body,s,count=1,flags=re.I)
 # Supplement existing schemas; never blindly replace working graphs/metadata.
 s=re.sub(r'<!-- SALESON_SEO:START -->.*?<!-- SALESON_SEO:END -->','',s,flags=re.S)
 soup=BeautifulSoup(s,'html.parser');canonical=soup.select_one('link[rel="canonical"]')
 if not canonical:p.write_text(s);continue
 url=canonical['href'];types=[]
 def nodes(x):
  if isinstance(x,dict):
   if '@type' in x:types.extend(x['@type'] if isinstance(x['@type'],list) else [x['@type']])
   for v in x.values():nodes(v)
  elif isinstance(x,list):
   for v in x:nodes(v)
 for script in soup.select('script[type="application/ld+json"]'):
  nodes(json.loads(script.string or script.text))
 new=[];h=soup.find('h1');title=h.get_text(' ',strip=True) if h else soup.title.get_text(' ',strip=True)
 if p.name in ['index.html','about.html'] and p.parent==R and 'Organization' not in types:
  new.append({'@type':'Organization','@id':'https://saleson.co.in/#organization','name':'SalesOn','url':'https://saleson.co.in/'})
 if p.parent==R/'blogs' and not any(t in types for t in ['Article','BlogPosting']):
  date=soup.select_one('.article-date');image=soup.select_one('.article-hero img')
  # Date comes from the versioned article index, never filesystem modification time.
  index=json.loads((R/'assets/data/article-index.json').read_text())
  entry=next((x for x in index if x.get('href')==url.replace('https://saleson.co.in','')),None) if isinstance(index,list) else None
  article={'@type':'BlogPosting','@id':url+'#article','headline':title,'url':url,'mainEntityOfPage':url,'publisher':{'@type':'Organization','name':'SalesOn','url':'https://saleson.co.in/'}}
  desc=soup.select_one('meta[name="description"]')
  if desc:article['description']=desc['content']
  entry=next((x for x in index if x['slug']==p.stem),None)
  if entry:
   for fmt in ['Published on %B %d, %Y','Published on %d %B %Y']:
    try:article['datePublished']=__import__('datetime').datetime.strptime(entry['published'],fmt).date().isoformat();break
    except ValueError:pass
  # ISO parsing of the visible original date only; no invented authors or dates.
  from datetime import datetime
  for el in soup.select('time,.article-meta,.article-date,.editorial-meta'):
   text=el.get_text(' ',strip=True)
   match=re.search(r'(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})',text,re.I)
   if match:
    article['datePublished']=datetime.strptime(match[0],'%d %B %Y').date().isoformat();break
  img=soup.select_one('main img')
  if img:article['image']='https://saleson.co.in'+img['src']
  new.append(article)
 # Existing visible breadcrumbs warrant schema; don't create invisible navigation.
 if 'BreadcrumbList' not in types:
  nav=soup.select_one('nav[aria-label="Breadcrumb"],nav[aria-label="breadcrumb"],.breadcrumb')
  if nav:
   items=[]
   for a in nav.select('a[href]'):
    href=a['href'];items.append({'@type':'ListItem','position':len(items)+1,'name':a.get_text(' ',strip=True),'item':href if href.startswith('http') else 'https://saleson.co.in'+href})
   if items and items[-1]['item']!=url:items.append({'@type':'ListItem','position':len(items)+1,'name':title,'item':url})
   if items:new.append({'@type':'BreadcrumbList','itemListElement':items})
 if new:
  markup='<!-- SALESON_SEO:START --><script type="application/ld+json">'+json.dumps({'@context':'https://schema.org','@graph':new},ensure_ascii=False)+'</script><!-- SALESON_SEO:END -->'
  s=s.replace('</head>',markup+'</head>')
 p.write_text(s)
print('Prepared one gated GTM head/body pair per page, consent controls, safe intent events and supplemental SEO graphs.')
