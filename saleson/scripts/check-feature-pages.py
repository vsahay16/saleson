"""Source-level checks for the standalone-to-repository feature integration."""
from pathlib import Path
from html.parser import HTMLParser
import json, re, subprocess

ROOT=Path(__file__).resolve().parents[1]
manifest=json.loads((ROOT/'feature-pages-manifest.json').read_text())
assets=json.loads((ROOT/'assets-manifest.json').read_text())
reverse={v:k for k,v in assets.items()}
class Page(HTMLParser):
    def __init__(self):super().__init__();self.headers=0;self.footers=0;self.inline=[];self.images=[];self.scripts=[];self.main=0
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag=='site-header':self.headers+=1
        if tag=='site-footer':self.footers+=1
        if tag=='main':self.main+=1
        if tag=='style':self.inline.append('style block')
        if 'style' in a:self.inline.append('style attribute')
        if any(k.startswith('on') for k in a):self.inline.append('event attribute')
        if tag=='script' and a.get('type')!='application/ld+json':
            if not a.get('src'):self.inline.append('executable script block')
            else:self.scripts.append(reverse.get(a['src'],a['src']))
        if tag=='img':self.images.append(a)

for slug,info in manifest.items():
    p=ROOT/(slug+'.html');page=Page();page.feed(p.read_text())
    assert page.headers==page.footers==page.main==1,(slug,'shared component or main count')
    assert not page.inline,(slug,page.inline)
    for required in ('/components/site-header.js','/components/site-footer.js','/components/whatsapp-float.js',info['javascript']):
        assert required in page.scripts,(slug,'missing script',required)
    assert (ROOT/info['css'].lstrip('/')).is_file()
    for image in page.images:
        assert image.get('alt') is not None,(slug,'missing alt')
        if image.get('fetchpriority')=='high':assert image.get('width') and image.get('height'),(slug,'hero dimensions missing')
    subprocess.run(['node','--check',str(ROOT/info['javascript'].lstrip('/'))],check=True,capture_output=True)

for file in ['feature-media.js','feature-analytics.js','site-tag-manager.js']:
    subprocess.run(['node','--check',str(ROOT/'assets/js'/file)],check=True,capture_output=True)
delivery=(ROOT/'delivery-management.html').read_text()
dms=(ROOT/'distribution-management-system.html').read_text()
assert 'delivery-phone-crop' in delivery and 'delivery-desktop-view' in delivery
assert 'data-media-src="/assets/img/delivery-management/shipments-enhanced.webp"' in delivery
assert '/assets/img/delivery-management/driver-trip-enhanced.webp' in delivery
assert 'dms-dashboard-viewport' in dms and 'role="region"' in dms
assert 'data-media-src="/assets/img/distribution-management-system/' in dms
print(f'PASS: {len(manifest)} feature pages use one shared header/footer, separate CSS/JS, accessible image markup and no inline CSS/events/executable JS.')
