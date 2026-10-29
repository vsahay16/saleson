"""Generate responsive image derivatives; preserve full-size product evidence.
Run after page generation. Original image URLs and enlargement targets stay intact.
"""
from pathlib import Path
from PIL import Image
import re,hashlib,json,io
W=Path(__file__).resolve().parents[1];out=W/'assets/img/optimized';out.mkdir(exist_ok=True);records={};updated=[]
for page in sorted(W.rglob('*.html')):
 if 'node_modules' in page.parts:continue
 source=page.read_text()
 def replace(m):
  tag=m[0];a=re.search(r'\bsrc=["\']([^"\']+)',tag)
  if not a:return tag
  if 'srcset=' in tag:
   if '/assets/img/optimized/' not in tag:return tag
   tag=re.sub(r'\s+(?:srcset|sizes)="[^"]*"','',tag)
  url=a[1]
  if url.startswith(('http:','https:','data:')):return tag
  p=W/url.lstrip('/') if url.startswith('/') else page.parent/url
  if not p.is_file() or p.suffix.lower() not in ['.webp','.jpg','.jpeg','.png'] or p.stat().st_size<=80000:return tag
  # Scrollable source screens need their native detail. Only optimise inline images.
  if re.search(r'\bid=',tag):return tag
  try:im=Image.open(p)
  except Exception:return tag
  if im.width<1000 or getattr(im,'n_frames',1)>1:return tag
  key='/'+p.relative_to(W).as_posix()
  if key not in records:
   variants=[];digest=hashlib.sha256(p.read_bytes()).hexdigest()[:10]
   for width in [480,768,960]:
    if width>=im.width:continue
    copy=im.convert('RGBA' if 'A' in im.getbands() else 'RGB');copy.thumbnail((width,round(im.height*width/im.width)),Image.Resampling.LANCZOS)
    b=io.BytesIO();copy.save(b,format='WEBP',quality=90,method=6)
    if len(b.getvalue())>=p.stat().st_size:continue
    dest=out/(p.stem+'-'+digest+'-'+str(copy.width)+'.webp');dest.write_bytes(b.getvalue());variants.append({'path':'/'+dest.relative_to(W).as_posix(),'width':copy.width,'bytes':len(b.getvalue())})
   records[key]={'original_bytes':p.stat().st_size,'original_width':im.width,'variants':variants}
  variants=records[key]['variants']
  if not variants:return tag
  srcset=', '.join(x['path']+' '+str(x['width'])+'w' for x in variants)+', '+key+' '+str(im.width)+'w'
  return re.sub(r'/?>$','',tag)+' srcset="'+srcset+'" sizes="(max-width: 760px) 100vw, 900px">'
 result=re.sub(r'<img\b[^>]*>',replace,source)
 if result!=source:page.write_text(result)
 if '/assets/img/optimized/' in result:updated.append(str(page.relative_to(W)))
(W/'docs/performance/responsive-images.json').write_text(json.dumps({'pages':updated,'images':records},indent=2)+'\n')
print('Responsive variants:',sum(len(x['variants']) for x in records.values()),'for',len(records),'images on',len(updated),'pages; full-size originals preserved.')
