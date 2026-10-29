"""Render the owner-supplied client allocation using shared master logo URLs."""
from pathlib import Path
import json,re
from html import escape as E
W=Path(__file__).resolve().parents[1]
m=json.loads((W/'assets/data/client-showcase.json').read_text())
labels={'field-sales':'Field sales teams using SalesOn','order-taking-app':'Order taking teams using SalesOn','distribution-management-system':'Distribution teams using SalesOn DMS','salesman-tracking':'MTN uses SalesOn for salesman tracking','payment-collection':'Collection teams using SalesOn','invoicing':'Businesses using SalesOn invoicing','production':'Production teams using SalesOn','delivery-management':'Delivery teams using SalesOn','van-sales':'Van sales teams using SalesOn','tally-integration':'Businesses using SalesOn with Tally','inventory-management':'Businesses using SalesOn DMS'}
BEGIN='<!-- CLIENT_SHOWCASE:START -->';END='<!-- CLIENT_SHOWCASE:END -->'
def markup(page):
 route=page['page'];ids=page['clients'];logos=[];names=[]
 for key in ids:
  c=m['clients'][key];name=E(c['name'])
  if c.get('logo'):
   width,height=c['logo_dimensions'];logos.append('<li class="client-showcase-logo'+(' client-logo-dark' if c.get('dark_background') else '')+'" data-client="'+key+'"><img src="/'+c['logo']+'" width="'+str(width)+'" height="'+str(height)+'" alt="'+name+'" loading="lazy" decoding="async"></li>')
  else:names.append('<li data-client="'+key+'">'+name+'</li>')
 label=labels.get(route,'Some of the businesses using SalesOn')
 if route.startswith('industries/'):label='SalesOn clients in this industry'
 if route=='about':label='Businesses across industries use SalesOn'
 classes='client-showcase'+(' client-showcase-gallery' if route=='about' else '')+(' client-showcase-single' if len(ids)==1 else '')+(' client-showcase-compact' if route=='request-demo' else '')
 tag='div' if route=='request-demo' else 'section'
 return BEGIN+'<'+tag+' class="'+classes+'" data-client-showcase="'+route+'" aria-label="SalesOn customers"><div class="client-showcase-inner"><p class="client-showcase-label">'+label+'</p>'+('<ul class="client-showcase-logos" role="list">'+''.join(logos)+'</ul>' if logos else '')+('<div class="client-showcase-names">'+('<p>Also used by</p>' if logos else '')+'<ul role="list">'+''.join(names)+'</ul></div>' if names else '')+'</div></'+tag+'>'+END
for page in m['pages']:
 route=page['page'];p=W/(('index' if route=='homepage' else route)+'.html');s=p.read_text()
 s=re.sub(re.escape(BEGIN)+r'.*?'+re.escape(END),'',s,flags=re.S)
 # Retire the generic rows replaced by this allocation, preserving product sections.
 s=re.sub(r'<section\b[^>]*class="(?:home-customers|se-trust|review-trust)"[^>]*>.*?</section>','',s,flags=re.S)
 block=markup(page)
 if route=='request-demo':
  pattern=r'(<!-- BOOKING_SECTION:END -->)';assert re.search(pattern,s,re.S)
  s=re.sub(pattern,lambda x:x[1]+block,s,count=1,flags=re.S)
 else:
  main=re.search(r'<main\b[^>]*>',s);assert main,p
  start=re.search(r'<section\b',s[main.end():]);assert start,p
  offset=main.end()+start.start();depth=0;end=None
  for tag in re.finditer(r'<(/?)section\b[^>]*>',s[offset:]):
   depth+=-1 if tag[1] else 1
   if not depth:end=offset+tag.end();break
  assert end,p;s=s[:end]+block+s[end:]
 if not re.search(r'/css/client-showcase(?:\.[a-f0-9]{12})?\.css',s):s=s.replace('</head>','<link rel="stylesheet" href="/css/client-showcase.css"></head>')
 p.write_text(s)
print('Built',len(m['pages']),'page-specific client groups.')
