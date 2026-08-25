(function(){
  const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const norm=s=>String(s||'').toLowerCase().trim();
  const pageForType=type=>{const t=norm(type);if(t.includes('pearl'))return 'pearls.html';if(t.includes('note'))return 'notes.html';if(t.includes('viva'))return 'viva.html';if(t.includes('drug'))return 'drugs.html';if(t.includes('critical'))return 'critical-care.html';if(t.includes('update'))return 'recent-updates.html';return 'index.html'};
  async function init(){
    const input=document.getElementById('knSiteSearch'),clear=document.getElementById('knSearchClear'),results=document.getElementById('knSearchResults'),status=document.getElementById('knSearchStatus');if(!input)return;
    let cache=null,library=null;
    try{library=window.KnockoutNotesLibrary?await window.KnockoutNotesLibrary.config():null}catch(e){}
    function localEntries(){
      const out=[];for(const [page,data] of Object.entries(library?.pages||{})){for(const c of data.categories||[]){out.push({Type:page==='criticalCare'?'Critical Care':page,Category:c.title,Title:c.title,Summary:c.description||'',href:page==='criticalCare'?'critical-care.html':page+'.html'});}}
      return out;
    }
    async function getData(){if(cache)return cache;const api=window.KNOCKOUTNOTES_API;if(!api)return [];try{const r=await fetch(api+'?_=search'+Date.now(),{cache:'no-store'});const p=await r.json();cache=p.success&&Array.isArray(p.data)?p.data:[]}catch(e){cache=[]}return cache}
    async function run(){const q=norm(input.value);clear.style.display=q?'block':'none';results.innerHTML='';if(!q){status.textContent='Start typing to search the site.';return}status.textContent='Searching KnockoutNotes…';const data=await getData();const local=localEntries();const matches=[...data.map(x=>({...x,href:pageForType(x.Type)})),...local].filter(x=>[x.Type,x.Category,x.Title,x.Summary,x.Answer,x.Reference].join(' ').toLowerCase().includes(q)).slice(0,15);if(!matches.length){status.textContent='No matching content found.';results.innerHTML='<div class="kn-search-empty">Try another drug, topic, score, guideline or viva term.</div>';return}status.textContent=matches.length+' result'+(matches.length===1?'':'s')+' found';results.innerHTML=matches.map(x=>`<a class="kn-search-result" href="${esc(x.href||pageForType(x.Type))}"><div class="kn-search-result-top"><span class="kn-search-type">${esc(x.Type||'Content')}</span>${x.Category?`<span class="kn-search-type">• ${esc(x.Category)}</span>`:''}</div><h4>${esc(x.Title||'Untitled')}</h4>${x.Summary?`<p>${esc(x.Summary)}</p>`:''}</a>`).join('')}
    let timer;input.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(run,220)});clear.addEventListener('click',()=>{input.value='';run();input.focus()});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
