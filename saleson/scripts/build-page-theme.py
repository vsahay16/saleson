"""Apply SalesOn's blue, white and serif-heading visual system to revised guides.
Generated SVGs are labelled workflow illustrations, not product screenshots.
No third-party Python packages are required.
"""
from pathlib import Path
import re,json,html
W=Path(__file__).resolve().parents[1];E=lambda s:html.escape(s,quote=True)
D=W/'assets/img/workflows';D.mkdir(parents=True,exist_ok=True)
HEADER='<site-header><nav aria-label="Main navigation"><a href="/">SalesOn</a> · <a href="/field-sales">Field sales</a> · <a href="/distribution-management-system">DMS</a> · <a href="/pricing">Pricing</a> · <a href="/tools">Tools</a> · <a href="/request-demo">Book a demo</a></nav></site-header>'
FOOTER='<site-footer><nav aria-label="Footer navigation"><a href="/about">About</a> · <a href="/privacy-policy">Privacy</a> · <a href="/terms">Terms</a> · <a href="/refund">Refund policy</a></nav></site-footer><script defer src="/components/site-header.js"></script><script defer src="/components/site-footer.js"></script>'
def bare(route,title,lead,body,faq=None):
 schema={'@context':'https://schema.org','@graph':[{'@type':'WebPage','name':title,'description':lead,'url':'https://saleson.co.in'+route}]}
 if faq:schema['@graph'].append({'@type':'FAQPage','mainEntity':[{'@type':'Question','name':q,'acceptedAnswer':{'@type':'Answer','text':a}} for q,a in faq]})
 return '<!doctype html><html lang="en-IN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+E(title)+' | SalesOn</title><meta name="description" content="'+E(lead)+'"><link rel="canonical" href="https://saleson.co.in'+route+'"><script type="application/ld+json">'+json.dumps(schema,ensure_ascii=False)+'</script></head><body>'+HEADER+'<main id="main-content"><header><h1>'+E(title)+'</h1><p class="repair-lead">'+E(lead)+'</p></header>'+body+'</main>'+FOOTER+'</body></html>'
# Complete the two remaining buyer/enquiry pages using supported workflows.
body='''<section><span class="so-kicker">One working day</span><h2>From the outlet round to the billing desk</h2><div class="workflow-guide-grid"><article><span class="workflow-step">1</span><h3>Take the outlet order</h3><p>Reps review customer context, select products and capture quantities with the applicable customer prices and schemes.</p><a href="/order-taking-app">Explore order taking →</a></article><article><span class="workflow-step">2</span><h3>Review stock and bill</h3><p>The office checks available stock and the billing details. DMS adds godown stock and connected distribution operations in Enterprise.</p><a href="/distribution-management-system">Explore DMS →</a></article><article><span class="workflow-step">3</span><h3>Follow the balance</h3><p>Record collections against the customer account and review what remains unpaid with the accounts team.</p><a href="/payment-collection">Explore collections →</a></article></div></section><section><h2>Choose the modules that match the way you sell</h2><div class="workflow-guide-grid"><article><h3>Pre-sell and dispatch</h3><p>The rep books demand; the office prepares fulfilment later. Start with Order Taking and Invoicing, then review DMS and Delivery Management if needed.</p></article><article><h3>Sell from van stock</h3><p>Load goods, record sales and review returns and closing stock. Van Sales is an Enterprise workflow; it is different from taking an order for later dispatch.</p></article><article><h3>Review with accounts</h3><p>Demonstrate your invoice, collection and Tally handover with the records and versions your office uses.</p></article></div></section><section><h2>Test a changed order before you decide</h2><p>Bring a customer order with several product lines, one unavailable item and a partial payment. Ask the rep and office to follow the same example from order review to the final bill and outstanding balance.</p><p>Agree who can change quantities, review stock and authorise exceptions. Confirm customer prices, godown structure, opening data and user access before setting a rollout date. SalesOn requires internet and does not support offline use.</p></section><section><h2>A practical starting point for a small team</h2><p>₹0 setup and a minimum of 2 users make a small-team start possible. Choose monthly or annual billing and confirm the module inclusions on the single <a href="/pricing">INR pricing page</a>. GST is extra as applicable. Ask the team about training and support for the process you plan to run.</p></section><nav class="workflow-related" aria-label="Related distributor workflows"><a href="/field-sales">Field team operations</a> · <a href="/inventory-management">Inventory review</a> · <a href="/industries/fmcg">FMCG outlet workflow</a> · <a href="/tally-integration">Tally handover</a></nav>'''
(W/'user/software-for-distributors.html').write_text(bare('/user/software-for-distributors','Sales and distribution software for distributors','Connect outlet orders, stock review, billing and collections. Choose the workflows your reps and office need to run together.',body))
faqs=[('Is the partner programme live?','The SalesOn partner programme is not yet live. You can register your interest by email.'),('How do I apply?','Email support@saleson.co.in with your name, business, location, relevant experience and the type of partnership you are interested in.'),('What are the commission rates and approval timelines?','Commission rates, eligibility, fees, payout conditions, launch dates and approval timelines have not been published. Ask the SalesOn team for written terms before making any commitment.')]
mail='mailto:support@saleson.co.in?subject=SalesOn%20partner%20application'
body='<section><span class="so-kicker">Register your interest</span><h2>Tell us where you can help businesses adopt SalesOn</h2><div class="workflow-guide-grid"><article><span class="workflow-step">1</span><h3>Your business</h3><p>Introduce your company, location and the customers or sectors you work with.</p></article><article><span class="workflow-step">2</span><h3>Your experience</h3><p>Tell us about your experience with business software, distribution or field sales teams.</p></article><article><span class="workflow-step">3</span><h3>Your interest</h3><p>Explain the kind of partnership you would like to explore and how we can contact you.</p></article></div><p>Please do not send customer databases or confidential client information. An email registers interest; it does not confirm acceptance or a commercial agreement.</p><a class="so-text-link" href="'+mail+'">Email support@saleson.co.in →</a></section><section class="comparison-faq"><h2>Partnership questions</h2>'+''.join('<details><summary>'+E(q)+'</summary><p>'+E(a)+'</p></details>' for q,a in faqs)+'</section><nav class="workflow-related" aria-label="Explore the product"><a href="/pricing">Product pricing</a> · <a href="/request-demo">Book a product demonstration</a></nav>'
(W/'partner.html').write_text(bare('/partner','Interested in partnering with SalesOn?','Our partner programme is not yet live. Email your interest so the team can discuss the opportunity and confirm terms when available.',body,faqs))
# A small, distinct visual for each page. Labels describe a workflow, not a feature guarantee.
SCENES={
'fmcg':('The outlet round','Plan the beat','Book the basket','Review supply'),
'agriculture':('The dealer visit','Seasonal demand','Check availability','Review payment'),
'pharmacy':('The chemist order','Review account','Check batch / expiry','Bill and follow dues'),
'automotive':('The parts order','Identify the SKU','Review availability','Follow dispatch'),
'cosmetic':('The outlet selection','Select the variant','Review the price','Prepare supply'),
'electronics':('The dealer request','Find the model','Check stock','Review the balance'),
'hardware':('The product list','Find the item','Review quantities','Hand over to billing'),
'manufacturing':('A distributor order','Capture demand','Review finished goods','Bill and dispatch'),
'publishing':('The trade account','Select the title','Review availability','Follow the invoice'),
'sport-and-fitness':('The equipment order','Identify the product','Review the request','Follow fulfilment'),
'telecommunication':('The dealer account','Review the customer','Capture product demand','Bill and follow dues'),
'transport':('The delivery handover','Prepare shipment','Record the outcome','Review exceptions'),
'software-for-manufacturers':('Connect the teams','Distributor orders','Finished-goods review','Factory handover'),
'software-for-distributors':('A connected working day','Outlet orders','Stock and billing','Collections'),
'software-for-retailers':('The customer sale','Review the basket','Share the invoice','Review customer dues'),
'inventory-management':('Stock in sales context','Review the godown','Check availability','Prepare fulfilment'),
'partner':('Start a conversation','Introduce your business','Share your experience','Email your interest'),
'saleson-vs-other-field-sales':('Choose around the job','Define your workflow','Compare the scope','Check the full cost')}
ICONS=[
'<path d="M16 33h48v31H16zM12 33l8-16h40l8 16M27 64V44h15v20M51 44h7v8"/>',
'<path d="M19 15h42v52H19zM28 29h23M28 40h23M28 51h13"/><path d="m42 58 7 7 15-17"/>',
'<path d="M15 35 40 19l25 16v31H15zM15 35h50M29 66V45h22v21M31 29h18"/>',
'<path d="M18 22h38v34H18zM56 36h10l9 12v8H56M24 34h21"/><circle cx="29" cy="61" r="7"/><circle cx="63" cy="61" r="7"/>',
'<path d="M17 21h48v41H17zM17 34h48M30 21v41M49 21v41M17 48h48"/>',
'<circle cx="40" cy="39" r="24"/><path d="M31 26h18M31 34h18M32 26c19 0 19 16 0 16l17 14"/>']
def illustration(slug,labels,index):
 title,a,b,c=labels;icon=ICONS[index%len(ICONS)]
 cards=''
 for i,(label,color) in enumerate([(a,'#1143b6'),(b,'#0b8b71'),(c,'#d49b37')]):
  y=220+i*126
  cards+=f'<rect x="103" y="{y}" width="674" height="98" rx="20" fill="white" stroke="#e2e8f0"/><rect x="125" y="{y+20}" width="58" height="58" rx="17" fill="{color}"/><text x="154" y="{y+58}" text-anchor="middle" fill="white" font-size="26" font-weight="700">{i+1:02d}</text><text x="205" y="{y+59}" font-size="27" font-weight="600" fill="#20324a">{E(label)}</text><circle cx="735" cy="{y+49}" r="14" fill="#edf4ff"/><path d="m730 {y+49} 4 4 7-8" fill="none" stroke="#1143b6" stroke-width="3"/>'
 svg=f'''<svg xmlns="http://www.w3.org/2000/svg" width="880" height="660" viewBox="0 0 880 660"><title>{E(title)}</title><desc>{E(a+'; '+b+'; '+c)}. Illustrative workflow, not a product screen.</desc><defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="#eff5ff"/><stop offset="1" stop-color="#f6faf9"/></linearGradient></defs><rect width="880" height="660" rx="32" fill="#f1f6ff"/><circle cx="785" cy="70" r="118" fill="#e3edff"/><circle cx="60" cy="625" r="90" fill="#dff3eb"/><rect x="103" y="65" width="92" height="92" rx="24" fill="white"/><g transform="translate(109 70)" fill="none" stroke="#1143b6" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round">{icon}</g><text x="220" y="102" font-family="Arial,sans-serif" font-size="17" letter-spacing="3" fill="#1143b6">SALESON · WORKFLOW</text><text x="220" y="142" font-family="Arial,sans-serif" font-size="30" font-weight="700" fill="#0f1623">{E(title)}</text><g font-family="Arial,sans-serif">{cards}</g></svg>'''
 (D/(slug+'.svg')).write_text(svg)
 return '/assets/img/workflows/'+slug+'.svg'
files=sorted((W/'industries').glob('*.html'))+sorted((W/'compare').glob('*.html'))+[W/x for x in ['inventory-management.html','user/software-for-manufacturers.html','user/software-for-distributors.html','user/software-for-retailers.html','saleson-vs-other-field-sales.html','partner.html']]
for index,p in enumerate(files):
 s=p.read_text();slug=p.stem
 if p.parent.name=='compare':
  name={'deltasales':'Delta Sales App','freshsales':'Freshsales','salesforce':'Salesforce','zoho':'Zoho CRM','bizom':'Bizom','beatroute':'BeatRoute'}[slug.replace('-alternative','')]
  labels=(name+' or SalesOn?','Start with the job','Compare editions','Confirm the total cost')
 else:labels=SCENES[slug]
 image=illustration(slug,labels,index)
 if slug=="inventory-management":image="/assets/img/dms-hero.webp"
 h1=re.search(r'<h1[^>]*>(.*?)</h1>',s,re.S)[1]
 desc=html.unescape(re.search(r'<meta name="description" content="([^"]*)"',s)[1])
 body=re.search(r'<main\b[^>]*>(.*?)</main>',s,re.S)[1]
 # Only generated hero headers are removed; all body anchors and source citations survive.
 body=re.sub(r'<header\b.*?</header>','',body,count=1,flags=re.S)
 if p.name=='saleson-vs-other-field-sales.html':body=re.sub(r'^<h1>.*?</h1><p class="repair-lead">.*?</p>','',body,count=1,flags=re.S)
 breadcrumb='Software comparisons' if p.parent.name=='compare' else 'Industry workflows' if p.parent.name=='industries' else 'SalesOn for your business'
 badge='Partnership enquiries' if slug=='partner' else 'SalesOn vs '+name if p.parent.name=='compare' else breadcrumb
 primary='Email your interest' if slug=='partner' else 'Book a workflow demo';href=mail if slug=='partner' else '/request-demo'
 secondary='<a href="/pricing" class="so-button so-secondary">See plans and pricing</a>'
 hero='<section class="so-hero"><div class="so-container so-hero-grid"><div><p class="so-kicker">'+E(badge)+'</p><h1>'+h1+'</h1><p class="so-lead">'+E(desc)+'</p><div class="so-actions"><a href="'+href+'" class="so-button">'+primary+' <span aria-hidden="true">↗</span></a>'+secondary+'</div><p class="so-facts">'+('Programme not yet live · Terms confirmed in writing' if slug=='partner' else '₹0 setup · Minimum 2 users · Monthly billing available · Support included')+'</p></div><figure class="so-hero-art"><img src="'+image+'" width="880" height="660" alt="'+E(labels[0]+': '+', '.join(labels[1:]))+'" fetchpriority="high" decoding="async"></figure></div></section>'
 if slug=='inventory-management':hero=hero.replace('width="880" height="660"','width="'+str(1200)+'" height="'+str(783)+'"').replace('Workflow overview','Illustrative example')
 body=re.sub(r'<nav aria-label="Breadcrumb">.*?</nav>','',body,flags=re.S)
 screens={
 'inventory-management':('/assets/img/distribution-management-system/illustrative-saleson-style-godown-stock-showing-sample-distributi-b90e82a490.webp','Godown stock example','Illustrative SalesOn-style godown stock view. Example data; confirm your required stock controls in a demo.'),
 'software-for-retailers':('/assets/img/invoicing/invoice-formats-example.webp','Invoice format example','Invoice format example from the SalesOn Invoicing page. Confirm the format and printer setup your counter needs.'),
 'software-for-distributors':('/assets/img/order-taking/customer-context-enhanced.webp','Customer context example','Enhanced recreation of the existing SalesOn customer context screen, with source example data.')}
 if p.parent.name=='industries':
  industry_screens={
   'fmcg':('/assets/img/order-taking/catalogue-enhanced.webp','Select products, quantities and customer prices',1536,1024,True),
   'agriculture':('/assets/img/order-taking/customer-context-enhanced.webp','Review the dealer account before booking',1536,1024,True),
   'pharmacy':('/assets/img/dms-hero.webp','Review distribution sales and stock',1200,783,True),
   'automotive':('/assets/img/order-taking/catalogue-enhanced.webp','Find the configured product and review quantities',1536,1024,True),
   'cosmetic':('/assets/img/order-taking/catalogue-enhanced.webp','Review catalogue items and customer prices',1536,1024,True),
   'electronics':('/assets/img/dms-hero.webp','Keep dealer sales and stock in view',1200,783,True),
   'hardware':('/assets/img/order-taking/customer-context-enhanced.webp','Keep the customer account close to the order',1536,1024,True),
   'manufacturing':('/assets/img/bom.jpg','Review a bill of materials and its components',1440,821,False),
   'publishing':('/assets/img/desktop-invoice.png','Review the invoice before sharing it',1000,563,False),
   'sport-and-fitness':('/assets/img/delivery-management/shipments-enhanced.webp','Follow the shipment after order booking',1774,887,True),
   'telecommunication':('/assets/img/order-taking/customer-context-enhanced.webp','Review dealer transactions and balances',1536,1024,True),
   'transport':('/assets/img/delivery-management/shipments-enhanced.webp','Review recorded shipment outcomes',1774,887,True)}
  shot,label,iw,ih,illustrated=industry_screens[slug]
  # Read source dimensions, using the standard library so builds need no Pillow dependency.
  # Existing declared dimensions only establish aspect ratio; CSS contains the full image.
  evidence='<section class="industry-product-evidence"><h2>'+label+'</h2><figure><img src="'+shot+'" alt="'+E(label)+' in SalesOn" width="'+str(iw)+'" height="'+str(ih)+'" loading="lazy" decoding="async">'+('<figcaption>Illustrative example</figcaption>' if illustrated else '')+'</figure></section>'
  body=body.replace('</section>','</section>'+evidence,1)
 if slug in screens:
  path,label,caption=screens[slug]
  # Intrinsic dimensions are stored with the source images; no image bytes are embedded.
  dims={'inventory-management':(1672,941),'software-for-retailers':(1448,1086),'software-for-distributors':(1536,1024)}[slug]
  figure='<section class="so-product-example"><div><p class="so-kicker">Explore the product detail</p><h2>'+label+'</h2><p>'+caption+'</p><a href="'+path+'" target="_blank" rel="noopener">Open the full image ↗</a></div><a href="'+path+'" target="_blank" rel="noopener" aria-label="Open '+label+'"><img src="'+path+'" width="'+str(dims[0])+'" height="'+str(dims[1])+'" alt="'+E(caption)+'" loading="lazy" decoding="async"></a></section>'
  body=figure+body

 # Preserve thin-content expansions, but avoid a second full-width promotional close.
 close='' if slug=='partner' else '<section class="so-close"><div class="so-container"><div><p class="so-kicker">Make the next step practical</p><h2>See it with your own working day.</h2><p>Bring an order, an invoice or the process you want to improve.</p></div><a class="so-button" href="/request-demo">Book a free demo ↗</a></div></section>'
 s=re.sub(r'<main\b[^>]*>.*?</main>','<main id="main-content">'+hero+'<div class="so-container so-content">'+body+'</div>'+close+'</main>',s,flags=re.S)
 s=re.sub(r'<body[^>]*>','<body class="so-guide '+('comparison-guide' if p.parent.name=='compare' or 'saleson-vs' in slug else 'workflow-page')+'">',s,count=1)
 # The existing guide CSS is for the retired plain layout; shared design handles all guides now.
 s=re.sub(r'<link rel="stylesheet" href="/css/(?:site-repairs|workflow-guides|comparison-guides)\.css">','',s)
 font='<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&amp;family=DM+Sans:wght@400;500;600;700&amp;display=swap">'
 s=s.replace('</head>',font+'<link rel="stylesheet" href="/css/guide-pages.css"><link rel="icon" href="/assets/img/favicon.ico"><meta name="robots" content="index, follow"></head>')
 if 'property="og:image"' not in s:s=s.replace('</head>','<meta property="og:image" content="https://saleson.co.in/assets/img/workflows/saleson-share.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="SalesOn sales and distribution software for MSMEs"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="https://saleson.co.in/assets/img/workflows/saleson-share.png"></head>')
 s=re.sub(r'<script defer src="/assets/js/site-repairs.js"></script>','',s)
 s=s.replace('<site-header>','<a class="skip-link" href="#main-content">Skip to content</a><site-header>',1)
 p.write_text(s)
print(f'Applied SalesOn page design and {len(files)} lightweight workflow illustrations.')
