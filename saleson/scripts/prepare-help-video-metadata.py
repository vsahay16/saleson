"""Keep visible guide previews and eligible VideoObjects aligned with source evidence.
A Drive creation timestamp is deliberately NOT a first-publication date.
"""
from pathlib import Path
from html import escape
from datetime import datetime
import json,re
ROOT=Path(__file__).resolve().parents[1]

def video_object(video):
    if video.get('publicationStatus') != 'published' or not video.get('publishedAt') or not video.get('publicationEvidence'):
        return None
    stamp=datetime.fromisoformat(video['publishedAt'].replace('Z','+00:00'))
    if stamp.tzinfo is None: raise ValueError('Publication timestamp must include timezone')
    if not (ROOT/video['thumbnail'].lstrip('/')).is_file(): raise ValueError('Missing thumbnail')
    result={'@type':'VideoObject','@id':'https://saleson.co.in/help#video-'+video['slug'],
        'name':video['title'],'description':video['description'],
        'url':'https://saleson.co.in/help#'+video['slug'],
        'thumbnailUrl':'https://saleson.co.in'+video['thumbnail'],
        'uploadDate':video['publishedAt'],
        'embedUrl':'https://drive.google.com/file/d/'+video['driveId']+'/preview'}
    if video.get('durationSeconds'):
        result['duration']='PT'+format(video['durationSeconds'], '.3f').rstrip('0').rstrip('.')+'S'
    return result

def main():
    from PIL import Image
    data=json.loads((ROOT/'assets/data/help-videos.json').read_text());p=ROOT/'help.html';html=p.read_text();objects=[]
    for v in data:
        thumbnail=ROOT/v['thumbnail'].lstrip('/')
        with Image.open(thumbnail) as im: width,height=im.size
        preview='<img class="help-guide-thumbnail" src="'+escape(v['thumbnail'],quote=True)+'" width="'+str(width)+'" height="'+str(height)+'" alt="" loading="lazy" decoding="async"/>'
        pattern=r'(<article\b[^>]*\bid="'+re.escape(v['slug'])+r'"[^>]*>)(?:<span aria-hidden="true" class="help-play-mark">.*?</span>|<img\b[^>]*class="help-guide-thumbnail"[^>]*>)'
        html,count=re.subn(pattern,lambda m:m[1]+preview,html,count=1)
        if count!=1: raise ValueError('Missing guide card: '+v['slug'])
        duration=v.get('durationSeconds')
        if duration:
            whole=round(duration);label=f'{whole//60}:{whole%60:02d}'
            title_end='</h4>';start=html.index('id="'+v['slug']+'"');end=html.index('</article>',start)
            card=html[start:end];card=re.sub(r'<span class="help-guide-duration">.*?</span>','',card)
            card=card.replace(title_end,title_end+'<span class="help-guide-duration">'+label+'</span>',1)
            html=html[:start]+card+html[end:]
        obj=video_object(v)
        if obj:objects.append(obj)
    html=re.sub(r'<!-- SALESON_HELP_VIDEO_SCHEMA:START -->.*?<!-- SALESON_HELP_VIDEO_SCHEMA:END -->','',html,flags=re.S)
    if objects:
        block='<!-- SALESON_HELP_VIDEO_SCHEMA:START --><script type="application/ld+json">'+json.dumps({'@context':'https://schema.org','@graph':objects}).replace('<','\\u003c')+'</script><!-- SALESON_HELP_VIDEO_SCHEMA:END -->'
        html=html.replace('</head>',block+'</head>',1)
    p.write_text(html)
    print(f'Prepared {len(data)} guide previews; {len(objects)} VideoObjects with verified publication evidence.')
if __name__=='__main__':main()
