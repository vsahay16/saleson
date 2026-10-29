"""Refresh only JS/CSS asset hashes; do not regenerate content or routes."""
from pathlib import Path
import json,hashlib,re
R=Path(__file__).resolve().parents[1];file=R/'assets-manifest.json';m=json.loads(file.read_text());pages=[p for p in R.rglob('*.html') if 'node_modules' not in p.parts];texts={p:p.read_text() for p in pages}
# Restore source references in memory before refreshing changed hashes.
for source,version in m.items():
 for p in texts:texts[p]=texts[p].replace(version,source)
new={}
for p,s in texts.items():
 def asset(match):
  src=match[3]
  if not src.startswith('/') or not src.endswith(('.css','.js')):return match[0]
  f=R/src.lstrip('/')
  if not f.is_file():return match[0]
  if src not in new:
   version='/'+str(f.with_name(f.stem+'.'+hashlib.sha256(f.read_bytes()).hexdigest()[:12]+f.suffix).relative_to(R));(R/version.lstrip('/')).write_bytes(f.read_bytes());new[src]=version
  return match[1]+'='+match[2]+new[src]+match[2]
 updated=re.sub(r'\b(href|src)=("|\x27)(.*?)\2',asset,s)
 if updated!=p.read_text():p.write_text(updated)
for old in set(m.values())-set(new.values()):(R/old.lstrip('/')).unlink(missing_ok=True)
file.write_text(json.dumps(new,indent=2)+'\n')
print('Fingerprinted',len(new),'assets')
