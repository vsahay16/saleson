"""Retain focused guide presentation when the audience/comparison generators run."""
from pathlib import Path
import re,html
R=Path(__file__).resolve().parents[1]
focus={'bizom-alternative':('Bizom','Brand-level distribution and retail execution.'),'beatroute-alternative':('BeatRoute','Goal-driven field sales and distribution.'),'deltasales-alternative':('Delta Sales App','Field tracking, sales and distribution.'),'freshsales-alternative':('Freshsales','Sales CRM and pipeline management.'),'salesforce-alternative':('Salesforce','A configurable CRM platform with multiple editions.'),'zoho-alternative':('Zoho CRM','Sales processes and customer relationship management.')}
labels={'fmcg':'From outlet order to dispatch.','agriculture':'From dealer order to delivery.','pharmacy':'From customer order to dispatch.','automotive':'From parts enquiry to order.','cosmetic':'From outlet visit to confirmed order.','electronics':'From dealer order to dispatch.','hardware':'From product selection to dispatch.','manufacturing':'From distributor order to dispatch.','telecommunication':'From dealer visit to collection.','publishing':'From book order to delivery.','sport-and-fitness':'From catalogue selection to order.','transport':'From dispatch to delivery review.','software-for-manufacturers':'From distributor order to dispatch.','software-for-distributors':'From outlet order to collection.','software-for-retailers':'Review the sale and customer account.'}
for folder in ['compare','industries','user']:
 for i,p in enumerate(sorted((R/folder).glob('*.html'))):
  s=p.read_text()
  if folder=='compare' and p.stem in focus:
   name,desc=focus[p.stem]
   summary='<aside class="comparison-summary" aria-label="Comparison at a glance"><p class="so-kicker">At a glance</p><h2>'+name+' and SalesOn</h2><dl><div><dt>'+name+'</dt><dd>'+desc+' <a href="#source-1" aria-label="View comparison source">Source</a></dd></div><div><dt>SalesOn</dt><dd>Orders, stock, invoicing and collections for distribution teams. Inclusions vary by plan.</dd></div><div><dt>India starting cost</dt><dd>Pro: ₹500/month for 2 users. GST extra. <a href="/pricing">Compare plans</a>.</dd></div></dl><a href="#workflow-comparison">Review the detailed comparison ↓</a></aside>'
   s=re.sub(r'<figure class="so-hero-art">.*?</figure>',lambda _:summary,s,count=1,flags=re.S)
  if p.stem=='software-for-retailers':
   example='<figure class="so-hero-art"><img src="/assets/img/invoicing/invoice-formats-example.webp" width="1448" height="1086" alt="Illustrative A4 and thermal invoice formats with sample billing data" fetchpriority="high" decoding="async"/><figcaption>Illustrative invoice formats · Sample data</figcaption></figure>'
   s=re.sub(r'<figure class="so-hero-art">.*?</figure>',lambda _:example,s,count=1,flags=re.S)
   s=re.sub(r'<section class="so-product-example">.*?</section>','',s,count=1,flags=re.S)
  if p.stem in labels:
   s=re.sub(r'(<section[^>]*id="industry-workflow"[^>]*>.*?<h2[^>]*>).*?(</h2>)',lambda m:m[1]+html.escape(labels[p.stem])+m[2],s,count=1,flags=re.S)
   if folder=='industries' and i%2:s=s.replace('class="workflow-guide-grid"','class="workflow-guide-grid workflow-list"',1)
  s=s.replace('₹0 setup','₹0 SalesOn account setup')
  if not re.search(r'href="/css/marketing-refinements(?:\.[a-f0-9]{12})?\.css"',s):s=s.replace('</head>','<link rel="stylesheet" href="/css/marketing-refinements.css"/></head>')
  p.write_text(s)
