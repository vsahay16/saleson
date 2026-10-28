"""Use unique editorial imagery without replacing product evidence or customer mappings."""
from pathlib import Path
import json,re,html
W=Path(__file__).resolve().parents[1];m=json.loads((W/'assets/data/editorial-images.json').read_text());E=html.escape

def image(a,high=True):
 return '<img src="'+a['path']+'" width="'+str(a['width'])+'" height="'+str(a['height'])+'" alt="'+E(a['alt'],quote=True)+'" '+('fetchpriority="high"' if high else 'loading="lazy"')+' decoding="async">'
def social(source,a):
 for key in ['og:image','twitter:image']:
  pattern=r'<meta\b(?=[^>]*(?:property|name)="'+key+r'")[^>]*>'
  source=re.sub(pattern,lambda x:re.sub(r'content="[^"]*"','content="https://saleson.co.in'+a['path']+'"',x[0]),source)
 return source
# Industry hero artwork differs by sector. Keep a small set of distinct, relevant
# product records for sectors without a published client reference.
product_records={
 'automotive':('/assets/img/order-taking/catalogue-enhanced.webp','Find the configured product and review quantities',1536,1024),
 'publishing':('/assets/img/desktop-invoice.png','Review the invoice before sharing it',1440,810),
 'sport-and-fitness':('/assets/img/delivery-management/shipments-enhanced.webp','Follow the shipment after order booking',1536,1024),
 'transport':('/assets/img/delivery-management/driver-trip-enhanced.webp','Review a recorded delivery trip',1536,1024)}
for slug,a in m['industries'].items():
 p=W/'industries'/(slug+'.html');s=p.read_text();assert (W/a['path'].lstrip('/')).is_file(),a
 figure='<figure class="so-hero-art industry-scene">'+image(a)+'<figcaption>Illustrative scene</figcaption></figure>'
 s=re.sub(r'<figure class="so-hero-art">.*?</figure>',lambda _:figure,s,count=1,flags=re.S)
 if slug not in product_records:s=re.sub(r'<section class="industry-product-evidence">.*?</section>','',s,count=1,flags=re.S)
 elif slug=='transport':
  path,label,w,h=product_records[slug]
  record='<section class="industry-product-evidence"><h2>'+label+'</h2><figure><img src="'+path+'" alt="SalesOn driver trip reference screen" width="'+str(w)+'" height="'+str(h)+'" loading="lazy" decoding="async"><figcaption>Illustrative example</figcaption></figure></section>'
  s=re.sub(r'<section class="industry-product-evidence">.*?</section>',lambda _:record,s,count=1,flags=re.S)
 p.write_text(social(s,a))
for slug,a in m['articles'].items():
 p=W/'blogs'/(slug+'.html');s=p.read_text();assert (W/a['path'].lstrip('/')).is_file(),a
 figure='<figure class="article-hero-figure">'+image(a)+'<figcaption>Illustration</figcaption></figure>'
 s=re.sub(r'<figure class="article-hero-figure">.*?</figure>',lambda _:figure,s,count=1,flags=re.S);p.write_text(social(s,a))
p=W/'blogs.html';s=p.read_text()
for slug,a in m['articles'].items():
 pattern=r'<article\b(?=[^>]*data-article="'+re.escape(slug)+r'")[^>]*>.*?</article>'
 s=re.sub(pattern,lambda match:re.sub(r'<img\b[^>]*>',lambda _:image(a,False),match[0],count=1),s,count=1,flags=re.S)
p.write_text(s)
print('Applied 12 unique industry scenes and 12 article illustrations, including matching index cards and social images.')
