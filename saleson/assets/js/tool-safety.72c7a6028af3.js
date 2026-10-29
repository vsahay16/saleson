/* Shared document helpers. Never interpret imported text as markup. */
window.SalesOnToolSafety = Object.freeze({
  draft(raw) {
    if(typeof raw!=='string'||raw.length>5000000)throw new TypeError('Invalid saved workspace.');
    const data=JSON.parse(raw);
    if(!data||typeof data!=='object'||Array.isArray(data))throw new TypeError('Invalid saved workspace.');
    for(const key of ['items','schedRows','entries','skuList','skuPlan','outletList','damageList','multiInvoices'])if(data[key]!==undefined&&(!Array.isArray(data[key])||data[key].some(item=>!item||typeof item!=='object'||Array.isArray(item))))throw new TypeError('Invalid saved rows.');
    if(data.accent && !/^#[0-9a-f]{3,8}$/i.test(data.accent))throw new TypeError('Invalid accent colour.');
    for(const key of ['logoDataURL','sigDataURL'])if(data[key]&&!/^data:image\/(png|jpeg|jpg|webp|gif|svg\+xml);base64,/i.test(data[key]))throw new TypeError('Unsupported saved image.');
    return data;
  },
  escape(value) {return String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');},
  html(value) {return DOMPurify.sanitize(String(value), {ADD_ATTR:['target'],FORBID_TAGS:['script','iframe','object','embed','form'],FORBID_ATTR:['srcdoc']});},
  setGST(select, value) {
    const rate = Number(value);
    if (value === '' || value === null || !Number.isFinite(rate) || rate < 0 || rate > 100) {
      const message = 'GST rate must be a number between 0 and 100. Check the transferred item.';
      const status=document.getElementById('tool-action-status');
      if(status){status.textContent=message;status.setAttribute('role','alert');}
      throw new RangeError(message);
    }
    const rates = [0,0.1,0.25,1.5,3,5,6,7.5,12,18,28,40];
    if (!rates.includes(rate)) rates.push(rate);
    select.replaceChildren();
    rates.sort((a,b)=>a-b).forEach(n=>{const option=document.createElement('option');option.value=String(n);option.textContent=n+'%';select.appendChild(option);});
    select.value=String(rate);
  },
  csvCell(value) {
    return '"'+String(value ?? '').replace(/"/g, '""')+'"';
  },
  download(blob, filename, fileType) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = filename; anchor.hidden = true;
    document.body.appendChild(anchor);
    try {
      anchor.click();
      if (window.SalesOnTracking) window.SalesOnTracking.emit('tool_download', {file_type:fileType});
    } catch (error) {
      anchor.remove(); URL.revokeObjectURL(url); throw error;
    }
    // Browsers need time to consume the Blob URL, especially on mobile Safari.
    // Dispatch is an intent event, never proof that the browser saved the file.
    setTimeout(() => {anchor.remove(); URL.revokeObjectURL(url);}, 30000);
  },
  async copy(text) {
    if(navigator.clipboard?.writeText){try{await navigator.clipboard.writeText(text);return true;}catch(_) {}}
    const field=document.createElement('textarea');field.value=text;field.setAttribute('readonly','');field.style.cssText='position:fixed;top:-9999px';document.body.appendChild(field);field.select();
    let copied=false;try{copied=document.execCommand('copy')===true;}catch(_){}field.remove();return copied;
  }
});
