"""Read-only release comparison; run explicitly after a deployment/domain cutover."""
import argparse,concurrent.futures,json,urllib.request,urllib.error
from pathlib import Path
from urllib.parse import urlsplit
from bs4 import BeautifulSoup
R=Path(__file__).resolve().parents[1]
a=argparse.ArgumentParser();a.add_argument('--base',required=True);args=a.parse_args();base=args.base.rstrip('/')
assert urlsplit(base).scheme in ['http','https'] and urlsplit(base).netloc,'Use an explicit HTTP(S) base URL.'
manifest=json.loads((R/'assets-manifest.json').read_text())
def check(item):
 path,file=item;expected=BeautifulSoup((R/file).read_text(),'html.parser');result={'path':path,'issues':[]}
 try:
  try:response=urllib.request.urlopen(base+path,timeout=25)
  except urllib.error.HTTPError as error:response=error
  source=BeautifulSoup(response.read(),'html.parser');result.update(status=response.status,final_url=response.url)
  if response.status!=200:result['issues'].append('Expected HTTP 200')
  if urlsplit(response.url).path!=path:result['issues'].append('Unexpected redirect')
  if not source.title or source.title.get_text()!=expected.title.get_text():result['issues'].append('Page title does not match this release')
  for name in ['site-header','site-footer']:
   if not source.select_one('script[src="'+manifest['/components/'+name+'.js']+'"]'):result['issues'].append('Outdated '+name)
 except Exception as e:result['issues'].append(str(e))
 return result
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
 results=list(pool.map(check,[('/','index.html'),('/request-demo','request-demo.html'),('/help','help.html'),('/payment-collection','payment-collection.html')]))
print(json.dumps(results,indent=2));raise SystemExit(1 if any(x['issues'] for x in results) else 0)
