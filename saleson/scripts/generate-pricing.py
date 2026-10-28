from pathlib import Path
import json,re
from html import escape
R=Path(__file__).resolve().parents[1]
cfg=json.loads(re.search(r'Object\.freeze\((\{.*\})\);',(R/'assets/js/pricing-config.js').read_text(),re.S)[1])['IN']
def money(n):return '₹'+format(n,',')
cards=[]
for key,p in cfg['plans'].items():
 cards.append('<article class="price-card"><p class="plan-label">'+('For field sales' if key=='250' else 'For distribution and operations')+'</p><h2>'+escape(p['name'])+'</h2><p class="plan-summary">'+escape(p['summary'])+'</p><div class="plan-price"><span data-plan-price="'+key+'">'+money(p['annual'])+'</span><span data-plan-period>/user/year</span></div><p class="plan-equivalent" data-plan-equivalent="'+key+'">Equivalent to ₹'+format(p['annual']/12,'.2f')+'/user/month, billed annually.</p><a class="pricing-button '+('secondary' if key=='250' else '')+'" href="'+('https://app.saleson.co.in' if key=='250' else '/request-demo')+'">'+('Start free trial' if key=='250' else 'Book an Enterprise demo')+'</a><ul>'+''.join('<li>'+escape(f)+'</li>' for f in p['features'])+'</ul></article>')
rows=''.join('<tr><th scope="row">'+escape(f['name'])+'</th>'+''.join('<td>'+('Included' if key in f['plans'] else '—')+'</td>' for key in cfg['plans'])+'</tr>' for f in cfg['comparison'])
faq=[('How many users do I need?','Paid subscriptions start with '+str(cfg['minimumUsers'])+' users. The calculator applies this minimum to both plans.'),('Which plan includes van sales?','Van sales and end-of-day settlement are included in Enterprise. They are not included in Pro.'),('Is there a setup fee?','The setup fee is ₹'+str(cfg['setupFee'])+'. Discuss your account preparation and training needs with SalesOn before starting.'),('How does annual billing work?','Annual billing is paid for a year upfront. The monthly equivalent shown on the cards is a comparison figure, not a monthly payment schedule.'),('Are taxes included?','Prices are in INR. GST is extra where applicable. The calculator excludes taxes; confirm the final invoice amount before purchase.'),('Can I try SalesOn before subscribing?','A '+str(cfg['trialDays'])+'-day free trial is available with Pro features. If you need Enterprise workflows such as van sales or production, book a demo to discuss them.'),('What are the cancellation and refund conditions?','Read the Terms of Use and Refund Policy before purchasing. Cancellation does not automatically mean a refund; eligibility and exclusions are described in the policy.'),('Can customers outside India use this pricing page?','This is the single SalesOn price list, shown in INR. If you need payment or tax details for a business outside India, contact SalesOn before subscribing.')]
faqhtml=''.join('<details><summary>'+escape(q)+'</summary><p>'+escape(a)+(' <a href="/terms">Terms of Use</a> · <a href="/refund">Refund Policy</a>.' if 'cancellation' in q.lower() else '')+'</p></details>' for q,a in faq)
schema={'@context':'https://schema.org','@type':'FAQPage','mainEntity':[{'@type':'Question','name':q,'acceptedAnswer':{'@type':'Answer','text':a}} for q,a in faq]}
p=R/'pricing.html';s=p.read_text()
for name,value in [('PLAN_CARDS',''.join(cards)),('COMPARISON_ROWS',rows),('FAQ_ITEMS',faqhtml),('PRICING_SCHEMA','<script type="application/ld+json">'+json.dumps(schema,ensure_ascii=False)+'</script>')]:
 s=re.sub('<!-- '+name+r':START -->[\s\S]*?<!-- '+name+':END -->',lambda m:'<!-- '+name+':START -->'+value+'<!-- '+name+':END -->',s)
s=re.sub(r'(<span data-minimum-users>)[^<]*(</span>)',lambda m:m[1]+str(cfg['minimumUsers'])+m[2],s)
s=re.sub(r'(<input[^>]*id="calc-users"[^>]*min=")[^"]*',lambda m:m[1]+str(cfg['minimumUsers']),s)
s=re.sub(r'<title>.*?</title>','<title>SalesOn Pricing | Pro &amp; Enterprise Plans, No Setup Fee</title>',s)
s=re.sub(r'<meta[^>]*name="description"[^>]*>', '<meta name="description" content="Compare SalesOn Pro and Enterprise plans in INR. Paid subscriptions start with '+str(cfg['minimumUsers'])+' users. Calculate monthly or annual costs and check included workflows.">',s)
s=re.sub(r'<meta[^>]*(?:property="og:description"|name="twitter:description")[^>]*>',lambda m:m[0].replace(re.search(r'content="([^"]*)"',m[0])[1],'Compare Pro and Enterprise in INR. Minimum '+str(cfg['minimumUsers'])+' users, monthly or annual billing, and a '+str(cfg['trialDays'])+'-day Pro trial.'),s)
p.write_text(s)
