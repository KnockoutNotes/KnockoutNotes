
// KnockoutNotes — site interactions + live Google Sheets API
(function(){
  const body=document.body;
  const themeBtn=document.getElementById("themeBtn");
  const menuBtn=document.getElementById("menuBtn");
  const mobileMenu=document.getElementById("mobileMenu");

  function applyTheme(theme){
    body.classList.toggle("dark",theme==="dark");
    localStorage.setItem("kn-theme",theme);
    if(themeBtn) themeBtn.textContent=theme==="dark"?"☀":"☾";
  }
  const saved=localStorage.getItem("kn-theme");
  applyTheme(saved || (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark":"light"));
  themeBtn?.addEventListener("click",()=>applyTheme(body.classList.contains("dark")?"light":"dark"));

  menuBtn?.addEventListener("click",()=>{
    const open=mobileMenu.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded",open);
    menuBtn.textContent=open?"×":"⋮";
  });
  document.querySelectorAll("[data-close-menu]").forEach(a=>a.addEventListener("click",()=>mobileMenu?.classList.remove("open")));

  function wireRevealButtons(root=document){
    root.querySelectorAll(".reveal").forEach(btn=>{
      if(btn.dataset.wired) return;
      btn.dataset.wired="1";
      btn.addEventListener("click",()=>{
        const target=document.getElementById(btn.dataset.target);
        if(!target)return;
        target.classList.toggle("open");
        btn.textContent=target.classList.contains("open")?"Hide Answer":"Reveal Answer";
      });
    });
  }
  wireRevealButtons();

  const observer=new IntersectionObserver(entries=>{
    entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add("visible")});
  },{threshold:.08});
  document.querySelectorAll(".fade").forEach(el=>observer.observe(el));

  document.querySelectorAll("[data-filter]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      document.querySelectorAll("[data-filter]").forEach(x=>x.classList.remove("active"));
      btn.classList.add("active");
      const category=btn.dataset.filter.toLowerCase();
      document.querySelectorAll(".filter-card").forEach(card=>{
        card.style.display=(category==="all" || card.dataset.category.toLowerCase()===category)?"block":"none";
      });
    });
  });

  const search=document.getElementById("search");
  search?.addEventListener("input",()=>{
    const q=search.value.toLowerCase().trim();
    document.querySelectorAll(".filter-card").forEach(card=>{
      card.style.display=card.innerText.toLowerCase().includes(q)?"block":"none";
    });
  });

  function esc(s){
    return String(s||"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[ch]));
  }
  function norm(s){return (s||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();}
  function dateValue(s,i){
    const d=Date.parse(s||"");
    return Number.isNaN(d)?i:d;
  }

  let dataPromise=null;
  function loadData(){
    if(dataPromise) return dataPromise;
    const url=window.KNOCKOUTNOTES_API;
    if(!url) return Promise.reject(new Error("KNOCKOUTNOTES_API is missing"));
    dataPromise=fetch(url+"?_= "+Date.now().toString().replace(" ",""),{cache:"no-store"})
      .then(r=>{if(!r.ok) throw new Error("API HTTP "+r.status); return r.json();})
      .then(payload=>{
        if(!payload || payload.success!==true || !Array.isArray(payload.data))
          throw new Error("Invalid KnockoutNotes API response");
        return payload.data.map((x,i)=>({
          type:x.Type||"", category:x.Category||"", title:x.Title||"",
          summary:x.Summary||"", answer:x.Answer||"", reference:x.Reference||"",
          date:x.Date||"", url:x.URL||x.Url||x.url||"",
          pdf:x.PDF||x.Pdf||"", slides:x.Slides||"",
          tags:x.Tags||"", order:i
        })).filter(x=>x.title);
      });
    return dataPromise;
  }

  function sortNewest(items){
    return items.slice().sort((a,b)=>dateValue(b.date,b.order)-dateValue(a.date,a.order));
  }

  function pageTypes(page){
    const m={
      pearls:["pearl","pearls"],
      notes:["note","notes"],
      viva:["viva"],
      drugs:["drug","drugs","pharmacology"],
      "critical-care":["critical care","criticalcare","icu","critical"]
    };
    return (m[page]||[]).map(norm);
  }

  function resourceLinks(x){
    let links="";
    if(x.url) links += `<a class="btn" href="${esc(x.url)}" target="_blank" rel="noopener">🔗 Official Source</a>`;
    if(x.pdf) links += `<a class="btn" href="${esc(x.pdf)}" target="_blank" rel="noopener">📄 PDF</a>`;
    if(x.slides) links += `<a class="btn" href="${esc(x.slides)}" target="_blank" rel="noopener">🎞 Slides</a>`;
    return links ? `<div class="actions" style="margin-top:12px">${links}</div>` : "";
  }

  // Latest from KnockoutNotes = latest five published content cards, regardless of type.
  const ticker=document.getElementById("knLatestTicker");
  if(ticker){
    loadData().then(data=>{
      const latest=sortNewest(data).slice(0,5);
      if(!latest.length) throw new Error("No content");
      const items=latest.map(x=>`
        <span class="kn-ticker-item">
          <span class="kn-ticker-dot"></span>
          <span class="kn-ticker-type">${esc(x.type||"Note")}</span>
          <span class="kn-ticker-title">${esc(x.title)}</span>
          ${x.date?`<span class="kn-ticker-date">${esc(x.date)}</span>`:""}
        </span>`).join("");
      ticker.innerHTML=items+items;
    }).catch(()=>{
      ticker.innerHTML='<span class="kn-ticker-item"><span class="kn-ticker-dot"></span><span class="kn-ticker-title">Latest KnockoutNotes will appear here.</span></span>';
    });
  }

  // Home bottom-corner widget = latest five published KnockoutNotes cards.
  const homeUpdates=document.getElementById("knHomeUpdates");
  if(homeUpdates){
    loadData().then(data=>{
      const latest=sortNewest(data).slice(0,5);
      if(!latest.length) throw new Error("No content");
      homeUpdates.innerHTML=latest.map(x=>`
        <a class="kn-update-row" href="recent-updates.html">
          <strong>${esc(x.title)}</strong>
          <small>${esc(x.type||"Update")}${x.date?" • "+esc(x.date):""}</small>
        </a>`).join("");
    }).catch(()=>{
      homeUpdates.innerHTML='<div class="kn-update-row"><strong>Latest published cards will appear here.</strong></div>';
    });
  }

  // Section pages = filtered by Type.
  const sheetContent=document.getElementById("sheetContent");
  if(sheetContent){
    const page=norm(body.dataset.contentPage||"");
    loadData().then(data=>{
      const allowed=pageTypes(page);
      const items=sortNewest(data.filter(x=>allowed.includes(norm(x.type))));
      if(!items.length){
        sheetContent.innerHTML='<div class="card"><p>No published entries for this section yet.</p></div>';
        return;
      }
      sheetContent.innerHTML=items.map((x,i)=>{
        const ansId=`sheet-answer-${page}-${i}`;
        return `<article class="card filter-card fade visible" data-category="${esc(norm(x.category))}">
          <div class="tag">${esc(x.category||x.type)}</div>
          <h3>${esc(x.title)}</h3>
          ${x.summary?`<p>${esc(x.summary)}</p>`:""}
          ${x.answer?`<button class="reveal" data-target="${ansId}">Reveal Answer</button>
          <div class="answer" id="${ansId}">${esc(x.answer)}
            ${x.reference?`<small class="reference">Reference: ${esc(x.reference)}</small>`:""}
          </div>`:""}
          ${x.date?`<small class="reference">${esc(x.date)}</small>`:""}
          ${resourceLinks(x)}
        </article>`;
      }).join("");
      wireRevealButtons(sheetContent);
      sheetContent.querySelectorAll(".fade").forEach(el=>observer.observe(el));
    }).catch(()=>{
      sheetContent.innerHTML='<div class="card"><p>Content could not be loaded right now. Please try again shortly.</p></div>';
    });
  }

  // Recent Updates = only curated Update / Guideline Update rows.
  const recentGrid=document.getElementById("recentUpdatesGrid");
  if(recentGrid){
    loadData().then(data=>{
      const items=sortNewest(data.filter(x=>{
        const t=norm(x.type);
        return ["update","recent update","guideline update","guideline"].includes(t);
      })).slice(0,30);
      if(!items.length){
        recentGrid.innerHTML='<div class="card"><p>No guideline or practice updates have been added yet. Add a row with <strong>Type = Update</strong>.</p></div>';
        return;
      }
      recentGrid.innerHTML=items.map(x=>`
        <article class="card fade visible">
          <div class="tag">🚨 ${esc(x.category||"Clinical Update")}${x.date?" • "+esc(x.date):""}</div>
          <h3>${esc(x.title)}</h3>
          ${x.summary?`<p>${esc(x.summary)}</p>`:""}
          ${x.answer?`<div class="answer open">${esc(x.answer)}${x.reference?`<small class="reference">Reference: ${esc(x.reference)}</small>`:""}</div>`:""}
          ${resourceLinks(x)}
        </article>`).join("");
    }).catch(()=>{
      recentGrid.innerHTML='<div class="card"><p>Recent updates could not be loaded right now.</p></div>';
    });
  }
})();
