
// KnockoutNotes interactions + Google Sheets content loader
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

// ---------- Google Sheets content ----------
function csvParse(text){
  const rows=[]; let row=[], cell="", quoted=false;
  for(let i=0;i<text.length;i++){
    const c=text[i], n=text[i+1];
    if(c==='"' && quoted && n==='"'){cell+='"';i++;continue}
    if(c==='"'){quoted=!quoted;continue}
    if(c===',' && !quoted){row.push(cell.trim());cell="";continue}
    if((c==='\n'||c==='\r') && !quoted){
      if(c==='\r' && n==='\n') i++;
      row.push(cell.trim());cell="";
      if(row.some(v=>v!=="")) rows.push(row);
      row=[]; continue;
    }
    cell+=c;
  }
  if(cell!=="" || row.length){row.push(cell.trim());if(row.some(v=>v!==""))rows.push(row)}
  return rows;
}
function normalise(s){return (s||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim()}
function escapeHTML(s){
  return String(s||"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[ch]));
}
function makeId(prefix,i){return `${prefix}-sheet-${i}-${Math.random().toString(36).slice(2,7)}`}

async function loadSheetContent(){
  const target=document.getElementById("sheetContent");
  if(!target || typeof KNOCKOUTNOTES_SHEET_CSV==="undefined" || !KNOCKOUTNOTES_SHEET_CSV.trim()) return;

  const pageType=normalise(body.dataset.contentPage||"");
  const typeMap={
    pearls:["pearl","pearls"],
    notes:["note","notes"],
    viva:["viva"],
    drugs:["drug","drugs","pharmacology"],
    "critical-care":["critical care","criticalcare","icu","critical"]
  };
  const allowed=(typeMap[pageType]||[]).map(normalise);

  try{
    const res=await fetch(KNOCKOUTNOTES_SHEET_CSV + (KNOCKOUTNOTES_SHEET_CSV.includes("?")?"&":"?") + "_="+Date.now(), {cache:"no-store"});
    if(!res.ok) throw new Error("Sheet request failed");
    const rows=csvParse(await res.text());
    if(rows.length<2) return;
    const headers=rows[0].map(h=>normalise(h));
    const idx=name=>headers.indexOf(normalise(name));
    const data=rows.slice(1).map(r=>{
      const get=name=>idx(name)>=0 ? (r[idx(name)]||"") : "";
      return {
        type:get("Type"), category:get("Category"), title:get("Title"),
        summary:get("Summary"), answer:get("Answer"), reference:get("Reference"), date:get("Date")
      };
    }).filter(x=>x.title);

    const items=data.filter(x=>allowed.includes(normalise(x.type)));
    if(!items.length){
      target.innerHTML='<div class="card"><p>No published entries for this section yet. Add a row to the Google Sheet using the correct <strong>Type</strong>.</p></div>';
      return;
    }
    target.innerHTML=items.map((x,i)=>{
      const ansId=makeId("answer",i);
      return `<article class="card filter-card fade" data-category="${escapeHTML(normalise(x.category))}">
        <div class="tag">${escapeHTML(x.category||x.type)}</div>
        <h3>${escapeHTML(x.title)}</h3>
        ${x.summary?`<p>${escapeHTML(x.summary)}</p>`:""}
        ${x.answer?`<button class="reveal" data-target="${ansId}">Reveal Answer</button>
        <div class="answer" id="${ansId}">${escapeHTML(x.answer)}
          ${x.reference?`<small class="reference">Reference: ${escapeHTML(x.reference)}</small>`:""}
        </div>`:""}
        ${x.date?`<small class="reference">${escapeHTML(x.date)}</small>`:""}
      </article>`;
    }).join("");
    target.querySelectorAll(".fade").forEach(el=>observer.observe(el));
    wireRevealButtons(target);
  }catch(err){
    console.warn("KnockoutNotes Sheet:",err);
    target.innerHTML='<div class="card"><p>Live content could not be loaded right now. The page content above remains available.</p></div>';
  }
}
loadSheetContent();
