"""Create compact display derivatives; retain original logos and video posters."""
from pathlib import Path
from bs4 import BeautifulSoup
from PIL import Image
import json
R=Path(__file__).resolve().parents[1];out=R/'assets/img/clients/display';out.mkdir(parents=True,exist_ok=True);mapping={};rows=[]
for p in sorted((R/'assets/img/clients/master').glob('*.webp')):
 im=Image.open(p);im.thumbnail((240,96),Image.Resampling.LANCZOS);dest=out/p.name;im.save(dest,'WEBP',quality=92,method=6)
 src='/'+str(p.relative_to(R));dst='/'+str(dest.relative_to(R));mapping[src]=dst;rows.append({'source':src,'display':dst,'source_bytes':p.stat().st_size,'display_bytes':dest.stat().st_size})
posters={}
for name in ['media-01ad95b7d464','media-c8db9e30dce6']:
 p=R/'assets/homepage'/f'{name}.webp';im=Image.open(p);im.thumbnail((768,432),Image.Resampling.LANCZOS);dest=p.with_name(name+'-poster-768.webp');im.save(dest,'WEBP',quality=92,method=6);posters['/'+str(p.relative_to(R))]='/'+str(dest.relative_to(R));rows.append({'source':'/'+str(p.relative_to(R)),'display':'/'+str(dest.relative_to(R)),'source_bytes':p.stat().st_size,'display_bytes':dest.stat().st_size})
for p in R.rglob('*.html'):
 if 'node_modules' in p.parts or p.name.startswith('__audit'):continue
 source=p.read_text();s=BeautifulSoup(source,'html.parser');changed=False
 for img in s.select('img[src]'):
  if img['src'] in mapping:img['src']=mapping[img['src']];changed=True
 for video in s.select('video[poster],video[data-poster]'):
  src='/'+video.get('poster',video.get('data-poster','')).lstrip('/')
  if src in posters:video['data-poster']=posters[src];video.attrs.pop('poster',None);changed=True
  elif src in posters.values() and video.has_attr('poster'):video['data-poster']=src;video.attrs.pop('poster',None);changed=True
 if changed:p.write_text(str(s))
(R/'docs/performance/display-media.json').write_text(json.dumps(rows,indent=2)+'\n')
print('Display derivatives:',len(rows),'original bytes:',sum(x['source_bytes'] for x in rows),'display bytes:',sum(x['display_bytes'] for x in rows))
