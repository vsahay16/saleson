const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'help.html'),'utf8'),code=fs.readFileSync(path.join(root,'assets/js/help-page.js'),'utf8');
const data=JSON.parse(fs.readFileSync(path.join(root,'assets/data/help-videos.json'),'utf8'));
const dom=new JSDOM(html,{url:'https://saleson.co.in/help',runScripts:'outside-only'}),w=dom.window,d=w.document;
w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'));};
w.eval(code);
assert.equal(d.querySelectorAll('iframe').length,0); // inert GTM fallback stays inside its template
assert.equal(d.querySelectorAll('.help-player iframe').length,0);
assert.equal(d.querySelectorAll('h1').length,1);assert.equal(data.length,8);
for(const video of data){const card=d.getElementById(video.slug);assert.ok(card);assert.equal(card.querySelector('button').dataset.helpVideo,video.driveId);assert.ok(card.querySelector('a').href.includes(video.driveId));}
const search=d.getElementById('help-search');
search.value='password';search.dispatchEvent(new w.Event('input'));assert.equal(d.querySelectorAll('.help-video-card:not([hidden])').length,1);assert.ok(!d.getElementById('forgot-password').hidden);
search.value='<img src=x>';search.dispatchEvent(new w.Event('input'));assert.ok(!d.getElementById('help-empty').hidden);assert.equal(d.querySelectorAll('img[src="x"]').length,0);
search.value='';search.dispatchEvent(new w.Event('input'));d.querySelector('[data-help-filter="Troubleshooting"]').click();assert.equal(d.querySelectorAll('.help-video-card:not([hidden])').length,4);
d.querySelector('[data-help-filter="all"]').click();assert.equal(d.querySelectorAll('.help-video-card:not([hidden])').length,8);
const button=d.querySelector('[data-help-video]');button.click();const dialog=d.querySelector('.help-video-dialog');assert.ok(dialog.open);assert.ok(dialog.querySelector('iframe').src.endsWith('/preview'));assert.equal(dialog.querySelector('iframe').getAttribute('allow'),'fullscreen');assert.ok(dialog.querySelector('a').href.endsWith('/view'));
dialog.querySelector('button').click();assert.equal(dialog.querySelectorAll('iframe').length,0);assert.equal(d.activeElement,button);
const videoSchemas=[...d.querySelectorAll('script[type="application/ld+json"]')].flatMap(n=>{const g=JSON.parse(n.textContent);return g['@graph']||[g];}).filter(n=>n['@type']==='VideoObject');assert.equal(videoSchemas.length,data.filter(v=>v.publicationStatus==='published'&&v.publishedAt&&v.publicationEvidence).length);
for(const v of data){const img=d.getElementById(v.slug).querySelector('.help-guide-thumbnail');assert.ok(img);assert.equal(img.getAttribute('src'),v.thumbnail);assert.equal(img.loading||img.getAttribute('loading'),'lazy');assert.ok(fs.statSync(path.join(root,v.thumbnail)).size<80000);if(v.durationSeconds)assert.ok(d.getElementById(v.slug).querySelector('.help-guide-duration'));}
assert.ok(html.includes('https://saleson.co.in/help'));assert.ok(!html.includes('autoplay'));
for(const v of data){const b=d.getElementById(v.slug).querySelector('button');b.click();assert.equal(dialog.querySelector('iframe').src,'https://drive.google.com/file/d/'+v.driveId+'/preview');dialog.querySelector('button').click();assert.equal(dialog.querySelectorAll('iframe').length,0);}
console.log('PASS: 8 mapped help videos, no player before choice, literal search, filters/empty state, player fallback, close cleanup and focus return. Actual playback remains a browser check.');
