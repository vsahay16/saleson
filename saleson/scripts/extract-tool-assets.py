"""Keep tool styles and executable scripts in dedicated asset folders.
JSON-LD stays in HTML. Script order and classic-script global bindings are retained.
"""
from pathlib import Path
import re
W=Path(__file__).resolve().parents[1]
for p in sorted((W/'tools').rglob('*.html')):
 slug=p.parent.name if p.parent!=W/'tools' else 'tools-index'
 s=p.read_text();styles=[];scripts=[]
 def style(m):
  styles.append(m[1]);return ''
 s=re.sub(r'<style\b[^>]*>(.*?)</style>',style,s,flags=re.S|re.I)
 if styles:
  target=W/'css/tools'/(slug+'.css');target.parent.mkdir(parents=True,exist_ok=True);target.write_text('\n'.join(styles)+'\n');s=s.replace('</head>','<link rel="stylesheet" href="/css/tools/'+slug+'.css"></head>')
 def script(m):
  attrs,code=m[1],m[2]
  if re.search(r'\bsrc\s*=|application/ld\+json',attrs,re.I) or not code.strip():return m[0]
  scripts.append(code);name=slug+'-'+str(len(scripts))+'.js';target=W/'assets/js/tools'/name;target.parent.mkdir(parents=True,exist_ok=True);target.write_text(code+'\n')
  return '<script'+attrs+' src="/assets/js/tools/'+name+'"></script>'
 s=re.sub(r'<script\b([^>]*)>(.*?)</script>',script,s,flags=re.S|re.I)
 p.write_text(s)
print('Tool CSS and executable script blocks are in css/tools and assets/js/tools.')
