/* KnockoutNotes Content Library
   Categories live in content-config.js. HTML pages do not need to be edited when
   you add images/PDFs to an existing category.
*/
(function(){
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const cfgPromise=fetch('content-config.js?_=1',{cache:'no-store'}).then(r=>r.text()).then(t=>{
    const start=t.indexOf('{'); const end=t.lastIndexOf('}');
    if(start<0||end<0) throw new Error('Invalid content-config.js');
    return Function('return ('+t.slice(start,end+1)+')')();
  });
  const ext=['jpg','jpeg','png','webp','gif','pdf'];
  function pad(n){return String(n).padStart(2,'0')}
  function fileUrl(category,n,extension){
    const prefix=category.prefix||category.id;
    const name=category.pattern==='numbered' ? `${pad(n)}.${extension}` : `${prefix}_${pad(n)}.${extension}`;
    return `${category.folder.replace(/\/$/,'')}/${name}`;
  }
  async function exists(url){
    try{const r=await fetch(url,{method:'HEAD',cache:'no-store'});return r.ok}catch(e){
      try{const r=await fetch(url,{cache:'no-store'});return r.ok}catch(_){return false}
    }
  }
  async function resolveFiles(cat){
    if(Array.isArray(cat.files)) return cat.files.map(x=>typeof x==='string'?{url:x}:x);
    const max=Math.min(Number(cat.max||30),80), found=[];
    for(let n=1;n<=max;n++){
      let got=null;
      const nums=[pad(n),String(n)];
      for(const num of nums){
        for(const e of ext){
          const prefix=cat.prefix||cat.id;
          const name=cat.pattern==='numbered' ? `${num}.${e}` : `${prefix}_${num}.${e}`;
          const u=`${cat.folder.replace(/\/$/,'')}/${name}`;
          if(await exists(u)){got={url:u,type:e==='pdf'?'pdf':'image',number:n};break}
        }
        if(got) break;
      }
      if(got) found.push(got);
    }
    return found;
  }
  function mediaCard(item,title){
    if(item.type==='pdf'||/\.pdf(?:$|\?)/i.test(item.url)){
      return `<a class="kn-media-pdf" href="${esc(item.url)}" target="_blank" rel="noopener"><div class="kn-pdf-icon">PDF</div><div><strong>${esc(item.title||title)}</strong><span>Open PDF ↗</span></div></a>`;
    }
    return `<div class="kn-media-slide"><img src="${esc(item.url)}" alt="${esc(item.alt||item.title||title)}" loading="lazy"></div>`;
  }
  async function renderCategory(cat){
    const files=await resolveFiles(cat);
    const wrap=document.createElement('section'); wrap.className='kn-library-category';
    wrap.innerHTML=`<div class="kn-library-head"><div><span class="kicker">${esc(cat.kicker||'CATEGORY')}</span><h3>${esc(cat.title)}</h3><p>${esc(cat.description||'')}</p></div><span class="kn-library-count">${files.length} item${files.length===1?'':'s'}</span></div>`;
    if(!files.length){wrap.innerHTML+=`<div class="kn-empty-library"><strong>No content yet.</strong><span>Add files to <code>${esc(cat.folder)}/</code>.</span></div>`;return wrap}
    if(files.some(x=>x.type==='pdf')){
      const grid=document.createElement('div'); grid.className='kn-pdf-grid';
      files.forEach(x=>grid.insertAdjacentHTML('beforeend',mediaCard(x,cat.title))); wrap.appendChild(grid);
      const images=files.filter(x=>x.type!=='pdf');
      if(images.length){
        const gal=buildGallery(images,cat); wrap.appendChild(gal)
      }
    } else wrap.appendChild(buildGallery(files,cat));
    return wrap;
  }
  function buildGallery(files,cat){
    const root=document.createElement('div'); root.className='kn-media-gallery';
    root.innerHTML=`<div class="kn-media-card"><div class="kn-media-viewport"><div class="kn-media-track">${files.map(x=>mediaCard(x,cat.title)).join('')}</div><button class="kn-media-arrow prev">‹</button><button class="kn-media-arrow next">›</button><button class="kn-media-full">⛶ Fullscreen</button></div><div class="kn-media-controls"><div class="kn-media-dots">${files.map((_,i)=>`<button data-i="${i}" class="${i===0?'active':''}"></button>`).join('')}</div><span class="kn-media-counter">1 / ${files.length}</span></div><div class="kn-media-hint">Swipe on mobile • Use arrows or dots</div></div>`;
    const card=root.querySelector('.kn-media-card'), track=root.querySelector('.kn-media-track'), dots=[...root.querySelectorAll('.kn-media-dots button')], counter=root.querySelector('.kn-media-counter'), viewport=root.querySelector('.kn-media-viewport');
    let i=0,sx=0,sy=0;
    function go(n){i=(n+files.length)%files.length;track.style.transform=`translateX(-${i*100}%)`;counter.textContent=`${i+1} / ${files.length}`;dots.forEach((d,j)=>d.classList.toggle('active',j===i))}
    root.querySelector('.prev').onclick=()=>go(i-1);root.querySelector('.next').onclick=()=>go(i+1);dots.forEach(d=>d.onclick=()=>go(+d.dataset.i));root.querySelector('.kn-media-full').onclick=()=>document.fullscreenElement?document.exitFullscreen():card.requestFullscreen?.();
    viewport.addEventListener('touchstart',e=>{const t=e.changedTouches[0];sx=t.clientX;sy=t.clientY},{passive:true});
    viewport.addEventListener('touchend',e=>{const t=e.changedTouches[0],dx=t.clientX-sx,dy=t.clientY-sy;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy))go(i+(dx<0?1:-1))},{passive:true});
    go(0); return root;
  }
  async function initLibrary(page){
    const cfg=await cfgPromise; const categories=cfg.pages?.[page]?.categories||[]; const mount=document.getElementById('knLibrary'); if(!mount)return;
    mount.innerHTML=`<div class="kn-library-tabs" role="tablist" aria-label="Categories"></div><div class="kn-library-panels"></div>`;
    const tabs=mount.querySelector('.kn-library-tabs'), panels=mount.querySelector('.kn-library-panels');
    for(let i=0;i<categories.length;i++){
      const cat=categories[i]; const tab=document.createElement('button'); tab.className='kn-library-tab'+(i===0?' active':''); tab.textContent=cat.title; tab.setAttribute('role','tab'); tab.setAttribute('aria-selected',i===0?'true':'false'); tab.dataset.index=i; tabs.appendChild(tab);
      const panel=document.createElement('div'); panel.className='kn-library-panel'+(i===0?' active':''); panel.hidden=i!==0; panel.dataset.index=i; panels.appendChild(panel);
      tab.addEventListener('click',()=>{tabs.querySelectorAll('.kn-library-tab').forEach((x,j)=>{const on=j===i;x.classList.toggle('active',on);x.setAttribute('aria-selected',on?'true':'false');panels.querySelectorAll('.kn-library-panel').forEach((y,k)=>{y.hidden=k!==i;y.classList.toggle('active',k===i)})})});
      const content=await renderCategory(cat); panel.appendChild(content);
    }
    window.KNOCKOUTNOTES_LIBRARY=cfg; document.dispatchEvent(new CustomEvent('knLibraryReady',{detail:{page,categories}}));
  }
  window.KnockoutNotesLibrary={init:initLibrary,config:()=>cfgPromise};
})();
