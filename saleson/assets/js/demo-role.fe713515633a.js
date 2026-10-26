/* Remember the chosen demo focus without assuming scheduler prefill support. */
(() => {
  const buttons=[...document.querySelectorAll('#rsTabs .rs-tab')];
  if(!buttons.length || typeof window.setRole!=='function')return;
  const key='saleson-demo-role';
  const original=window.setRole;
  const note=document.createElement('p');
  note.className='demo-role-note';
  note.setAttribute('aria-live','polite');
  const selection=document.createElement('input');
  selection.type='hidden';selection.id='demo-role';selection.name='demo_role';
  document.getElementById('rsTabs').after(note,selection);
  function update(index) {
    const role=buttons[index].querySelector('.rs-tab-name').textContent.trim();
    selection.value=role;
    note.textContent='Demo focus: '+role+'. Please include this focus in your booking notes.';
  }
  window.setRole=function(index,button) {
    if(!Number.isInteger(index) || !buttons[index])return;
    original(index,button);
    update(index);
    try {sessionStorage.setItem(key,String(index));}catch(_){}
  };
  let initial=0;
  try {
    const saved=sessionStorage.getItem(key);
    if(saved!==null && /^\d+$/.test(saved) && Number(saved)<buttons.length)initial=Number(saved);
  } catch(_){}
  original(initial,buttons[initial]);update(initial);
})();
