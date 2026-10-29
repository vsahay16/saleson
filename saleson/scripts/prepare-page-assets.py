"""Keep one shared marketing font request and cache stable inline page styles.
The quiz's Indic-language stylesheet is independent and intentionally retained.
Run after content generators and before asset fingerprinting.
"""
from pathlib import Path
from bs4 import BeautifulSoup
import re
ROOT=Path(__file__).resolve().parents[1]
FONT_URL='https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400..800;1,400..800&family=DM+Serif+Display:ital@0;1&display=swap'
EXTRACT={'order-taking-app.html':'order-taking-page.css','calculators/sales-leakage-calculator.html':'sales-leakage-page.css','404.html':'not-found-page.css'}
for p in sorted(ROOT.rglob('*.html')):
 if 'node_modules' in p.parts:continue
 source=p.read_text();s=BeautifulSoup(source,'html.parser');fonts=[x for x in s.select('link[rel=stylesheet]') if 'fonts.googleapis.com' in x.get('href','') and any(n in x['href'] for n in ['DM+Sans','DM%20Sans','DM+Serif','Inter:'])]
 if fonts:
  fonts[0]['href']=FONT_URL;fonts[0]['id']='saleson-shell-font'
  for x in fonts[1:]:x.decompose()
  # Preconnect uses an origin, never a specific stylesheet URL.
  for x in s.select('link[rel=preconnect]'):
   if 'fonts.googleapis.com' in x.get('href',''):x['href']='https://fonts.googleapis.com'
 relative=p.relative_to(ROOT).as_posix()
 if relative in EXTRACT:
  styles=s.select('style')
  if styles:
   css='\n'.join(x.get_text() for x in styles).strip()+'\n';css=css.replace('Inter,','"DM Sans",').replace('Inter, ','"DM Sans", ')
   (ROOT/'css'/EXTRACT[relative]).write_text(css)
   link=s.new_tag('link',rel='stylesheet',href='/css/'+EXTRACT[relative]);styles[0].insert_before(link)
   for style in styles:style.decompose()
 updated=str(s)
 # Preserve exact files if there were no applicable transformations.
 if fonts or (relative in EXTRACT and styles):
  if updated!=source:p.write_text(updated)
for folder in ['css','assets/homepage']:
 for p in (ROOT/folder).glob('*.css'):
  if re.search(r'\.[a-f0-9]{12}\.css$',p.name):continue
  source=p.read_text();updated=re.sub(r'(?<![\w-])(?:"Inter"|\x27Inter\x27|Inter)(?=\s*,)', '"DM Sans"',source)
  if source!=updated:p.write_text(updated)
