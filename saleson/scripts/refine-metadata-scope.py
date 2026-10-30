"""Apply reviewed metadata corrections without changing URLs or unrelated social tags."""
from pathlib import Path
import html, json, re

R=Path(__file__).resolve().parents[1]
overrides=json.loads((R/'scripts/metadata-scope-overrides.json').read_text())
for relative,fields in overrides.items():
 p=R/relative
 s=p.read_text()
 if 'title' in fields:
  s=re.sub(r'<title>.*?</title>',lambda _: '<title>'+html.escape(fields['title'])+'</title>',s,count=1,flags=re.S)
 def meta(m):
  tag=m[0]
  key=re.search(r'\b(?:name|property)=["\']([^"\']+)["\']',tag,re.I)
  if not key:return tag
  field={'description':'description','og:title':'title','og:description':'description','twitter:title':'title','twitter:description':'description'}.get(key[1])
  if field not in fields:return tag
  return re.sub(r'\bcontent=(["\']).*?\1',lambda _: 'content="'+html.escape(fields[field],quote=True)+'"',tag,count=1,flags=re.S)
 s=re.sub(r'<meta\b[^>]*>',meta,s,flags=re.I)
 # Keep WebPage and Article descriptions aligned; retain product names, dates and IDs.
 def schema(m):
  data=json.loads(m[2])
  original=json.dumps(data,ensure_ascii=False)
  def visit(x):
   if isinstance(x,dict):
    kinds=x.get('@type',[]);kinds=[kinds] if isinstance(kinds,str) else kinds
    if any(k in ['WebPage','Article','BlogPosting'] for k in kinds):
     if 'title' in fields:
      for k in ['name','headline']:
       if k in x:x[k]=fields['title']
     if 'description' in fields and 'description' in x:x['description']=fields['description']
    for v in x.values():visit(v)
   elif isinstance(x,list):
    for v in x:visit(v)
  visit(data)
  updated=json.dumps(data,ensure_ascii=False)
  return m[0] if updated==original else m[1]+updated+m[3]
 s=re.sub(r'(<script\b[^>]*type=["\']application/ld\+json["\'][^>]*>)(.*?)(</script>)',schema,s,flags=re.S)
 p.write_text(s)
