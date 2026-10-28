"""Every page uses the same shared navigation and current component assets."""
from pathlib import Path
import re, json, hashlib

ROOT = Path(__file__).resolve().parents[1]
manifest = json.loads((ROOT/'assets-manifest.json').read_text())
for name in ('site-header', 'site-footer'):
    source = '/components/'+name+'.js'
    versioned = manifest[source]
    code = (ROOT/source.lstrip('/')).read_text()
    assert (ROOT/versioned.lstrip('/')).read_bytes() == (ROOT/source.lstrip('/')).read_bytes()
    assert hashlib.sha256(code.encode()).hexdigest()[:12] in versioned
    assert "font.id = 'saleson-shell-font'" in code
    assert "!document.getElementById('saleson-shell-font')" in code
    assert 'font-size: 16px;' in code and 'line-height: 1.4;' in code
    assert 'letter-spacing: normal;' in code and 'text-transform: none;' in code

pages = list(ROOT.rglob('*.html'))
for page in pages:
    source = page.read_text()
    for name in ('site-header', 'site-footer'):
        assert len(re.findall(r'<'+name+r'\b', source)) == 1, page
        assert len(re.findall(r'</'+name+r'>', source)) == 1, page
        assert source.count(manifest['/components/'+name+'.js']) == 1, page
    assert not re.search(r'<nav\b[^>]*aria-label=["\']Breadcrumb["\']', source, re.I), page
    assert not re.search(r'<(?:header-component|footer-component)\b', source), page
home = (ROOT/'assets/homepage/homepage.js').read_text()
assert 'class SiteHeader' not in home and 'class SiteFooter' not in home
assert 'customElements.define' not in home
collection = (ROOT/'payment-collection.html').read_text()
assert 'aria-label="Page sections"' not in collection
print(f'PASS: {len(pages)} pages use one shared header/footer and current fingerprints; no visible breadcrumb rows or collection second navigation bar.')
