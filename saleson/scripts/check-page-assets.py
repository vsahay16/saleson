"""Guard font consolidation and cached CSS without certifying browser speed."""
from pathlib import Path
from bs4 import BeautifulSoup
R=Path(__file__).resolve().parents[1]
for p in R.rglob('*.html'):
 if 'node_modules' in p.parts:continue
 s=BeautifulSoup(p.read_text(),'html.parser');fonts=[x for x in s.select('link[rel=stylesheet]') if 'fonts.googleapis.com' in x.get('href','') and any(v in x['href'] for v in ['DM+Sans','Inter:'])]
 if p.relative_to(R).as_posix() in ['pricing/in.html','pricing/us.html']:continue # Redirect helpers load no fonts.
 assert len(fonts)==1,(p,'expected one shared font request')
 assert fonts[0].get('id')=='saleson-shell-font',p
 if p.relative_to(R).as_posix() in ['order-taking-app.html','calculators/sales-leakage-calculator.html','404.html']:assert not s.select('style'),p
for name in ['site-header','site-footer']:
 code=(R/'components'/f'{name}.js').read_text();assert 'querySelectorAll(\'link[rel=stylesheet]\')' in code,name
s=BeautifulSoup((R/'customers/Lapcare.html').read_text(),'html.parser')
assert not s.select('.case-quote'), 'Unapproved quotation must not be published'
for x in s.select('meta[property="og:title"],meta[name="twitter:title"]'):assert x['content']=='How Lapcare uses SalesOn | Customer Story'
assert "India's leading" not in (R/'components/site-footer.js').read_text()
assert 'Eliminates Human Error' not in (R/'blogs/Top-Benefits-of-Automatic-Invoicing-for-B2B-Businesses.html').read_text()
print('PASS: one shared marketing font stylesheet per page, cached legacy CSS and factual customer metadata/copy.')
