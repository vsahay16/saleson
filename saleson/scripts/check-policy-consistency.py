"""Guard published seat terms, FAQ answers and both hosting roots."""
from pathlib import Path
from html.parser import HTMLParser
import html, json, re

ROOT = Path(__file__).resolve().parents[1]

class Visible(HTMLParser):
    def __init__(self):
        super().__init__(); self.hidden = 0; self.parts = []
    def handle_starttag(self, tag, attrs):
        if tag in ('script', 'style'): self.hidden += 1
    def handle_endtag(self, tag):
        if tag in ('script', 'style'): self.hidden -= 1
    def handle_data(self, data):
        if not self.hidden: self.parts.append(data)

def clean(value):
    return re.sub(r'\s+', ' ', html.unescape(re.sub('<[^>]*>', ' ', value))).strip()

def walk(value):
    if isinstance(value, dict):
        yield value
        for child in value.values(): yield from walk(child)
    elif isinstance(value, list):
        for child in value: yield from walk(child)

schemas = {}
for page in ROOT.rglob('*.html'):
    source = page.read_text()
    assert not re.search(r'no\s+(?:setup fee or\s+)?minimum\s+user(?:s| requirement)?', clean(source), re.I), page
    objects = []
    for match in re.finditer(r'<script\b[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>', source, re.S):
        objects.extend(walk(json.loads(match[1])))
    schemas[page] = objects

for slug in ('index', 'order-taking-app', 'attendance', 'salesman-tracking'):
    page = ROOT/(slug+'.html'); source = page.read_text()
    parser = Visible(); parser.feed(source)
    visible = clean(' '.join(parser.parts))
    assert re.search(r'minimum(?: of)? 2 users', visible, re.I), slug
    if slug != 'index':
        answer = next(o['acceptedAnswer']['text'] for o in schemas[page]
                      if o.get('@type') == 'Question' and 'free' in o.get('name', '').lower())
        assert 'minimum of 2 users' in answer, slug
        assert clean(answer) in visible, slug+' visible answer differs from schema'

root_config = json.loads((ROOT.parent/'vercel.json').read_text())
nested_config = json.loads((ROOT/'vercel.json').read_text())
for config in (root_config, nested_config):
    rules = [r for r in config['redirects'] if r['source'] == '/pricing/us']
    assert rules == [{'source': '/pricing/us', 'destination': '/pricing', 'permanent': True}]
assert root_config['redirects'] == nested_config['redirects']

privacy = (ROOT/'privacy-policy.html').read_text()
for anchor in ('website-analytics', 'browser-storage', 'tools', 'scheduling', 'retention', 'choices'):
    assert f'id="{anchor}"' in privacy and f'href="#{anchor}"' in privacy
for term in ('Google Tag Manager', 'Meta Pixel', 'Microsoft Clarity', 'LinkedIn Insight Tag',
             'localStorage', 'sessionStorage', 'zcal', 'lead-submission endpoint',
             'support@saleson.co.in', 'October 28, 2026'):
    assert term in privacy, term
print('PASS: minimum 2 users in visible copy and matched FAQ schemas; website privacy coverage and both USD redirects.')
