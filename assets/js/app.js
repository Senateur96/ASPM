/* African Sustainability Policy Monitor : application du site.
   Le contenu (textes, pays, glossaire, interface…) se trouve dans le dossier data/.
   Ce fichier lit ces données puis affiche les pages. Pour ajouter du contenu,
   il n'est normalement pas nécessaire de modifier ce fichier : voir README.md. */
"use strict";

let ASOF,VERSION,COUNTRIES,ORGS,DATA,THEMES,GCAT,GLOSS,RES,DEADLINES,THEMEINFO,CHANGES,ABOUT2,PHOTO,PATHS,ISLANDS,NEWIDS,T,METH;
const SITE_NAME="African Sustainability Policy Monitor";

/* Mois pour la date longue (« 31 octobre 2026 », « 31 October 2026 »). */
const MOIS={fr:["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"],
  en:["January","February","March","April","May","June","July","August","September","October","November","December"]};

/* Remplace {date}, {date_longue}, {annee}, {nb_definitions} dans tous les textes d'une langue. */
function remplir(x,lang,vals){
  if(typeof x==="string")return x.replace(/\{(date|date_longue|annee|nb_definitions)\}/g,(m,k)=>vals[lang][k]);
  if(Array.isArray(x))return x.map(v=>remplir(v,lang,vals));
  if(x&&typeof x==="object"){const o={};for(const k in x)o[k]=remplir(x[k],lang,vals);return o}
  return x;
}

/* Convertit les fichiers JSON (noms de champs en français) dans le format interne utilisé par l'affichage. */
function charger(reg,ref,site,carte){
  const err=[],avert=[];
  const FORCE={contraignant:"b",indicatif:"g",volontaire:"v"};
  const SOURCE={officielle:"o",base_reference:"r",secondaire:"p"};
  const NATURE={dedie:"d",integre:"i"};
  ASOF=reg.date_mise_a_jour;VERSION=reg.version;
  if(!/^\d{4}-\d{2}-\d{2}$/.test(String(ASOF)))err.push("registre.json : date_mise_a_jour doit avoir la forme AAAA-MM-JJ.");
  COUNTRIES={};for(const [k,v] of Object.entries(ref.pays))COUNTRIES[k]=[v.fr,v.en,v.region];
  ORGS={};for(const [k,v] of Object.entries(ref.organisations))
    ORGS[k]={fr:v.nom_fr,en:v.nom_en,m:v.membres==="tous"?Object.keys(COUNTRIES):v.membres,dfr:v.description_fr,den:v.description_en};
  THEMES=ref.themes.map(x=>({k:x.code,fr:x.nom_fr,en:x.nom_en,hfr:x.description_fr,hen:x.description_en}));
  THEMEINFO={};ref.themes.forEach(x=>THEMEINFO[x.code]={inc:x.inclus_fr||[],exc:x.exclus_fr||[],inE:x.inclus_en||[],exE:x.exclus_en||[]});
  GCAT={};for(const [k,v] of Object.entries(ref.glossaire_categories))GCAT[k]=[v.fr,v.en];
  GLOSS=ref.glossaire.filter(g=>{
    if(!GCAT[g.categorie]){avert.push(`referentiel.json, glossaire « ${g.terme_fr} » : catégorie inconnue « ${g.categorie} ». Terme ignoré.`);return false}
    if(!g.terme_fr||!g.terme_en){avert.push(`referentiel.json, glossaire « ${g.terme_fr||g.terme_en} » : terme_fr ou terme_en manquant. Terme ignoré.`);return false}
    return true}).map(g=>{const a=[g.categorie,g.terme_fr,g.terme_en,g.definition_fr||"",g.definition_en||""];if(g.lien)a.push(g.lien);return a});
  RES=ref.ressources.map(r=>({fr:r.groupe_fr,en:r.groupe_en,items:r.liens.map(i=>[i.nom,i.organisme,i.lien,i.description_fr,i.description_en])}));
  const ids=new Set(),valides=[];
  DATA=[];reg.textes.forEach((x,n)=>{
    const ou=`registre.json, texte ${x.id||"n° "+(n+1)}`,err=[];
    if(!x.id)err.push(`${ou} : champ « id » manquant.`);else if(ids.has(x.id))err.push(`${ou} : identifiant en double.`);
    if(!x.titre_officiel)err.push(`${ou} : champ « titre_officiel » manquant.`);
    if(!COUNTRIES[x.pays]&&!ORGS[x.pays])err.push(`${ou} : pays ou organisation inconnu « ${x.pays} ».`);
    if(!(x.force in FORCE))err.push(`${ou} : force « ${x.force} » invalide (contraignant, indicatif ou volontaire).`);
    if(!(x.source in SOURCE))err.push(`${ou} : source « ${x.source} » invalide (officielle, base_reference ou secondaire).`);
    if(!/^\d{4}(-\d{2}(-\d{2})?)?$/.test(String(x.date)))err.push(`${ou} : date « ${x.date} » invalide (AAAA, AAAA-MM ou AAAA-MM-JJ).`);
    const th={};for(const [k,v] of Object.entries(x.themes||{})){
      if(!THEMEINFO[k])err.push(`${ou} : thème inconnu « ${k} ».`);
      if(!(v in NATURE))err.push(`${ou} : thème ${k} = « ${v} » invalide (dedie ou integre).`);th[k]=NATURE[v]}
    if(!Object.keys(th).length)err.push(`${ou} : aucun thème.`);
    if(err.length){avert.push(...err.map(m=>m+" Texte ignoré."));return}
    const e={id:x.id,c:x.pays,th,f:FORCE[x.force],y:parseInt(String(x.date).slice(0,4),10),dt:String(x.date),lo:x.langue,ti:x.titre_officiel};
    if(x.titre_fr)e.tf=x.titre_fr;if(x.titre_en)e.te=x.titre_en;
    Object.assign(e,{ty:[x.type_fr||"",x.type_en||""],a:x.autorite||"",sf:x.resume_fr||"",se:x.resume_en||"",u:x.lien||"",s:SOURCE[x.source]});
    ids.add(x.id);DATA.push(e);valides.push(x)});
  NEWIDS=valides.filter(x=>x.nouveau===true).map(x=>x.id);
  DEADLINES=(reg.echeances||[]).map(d=>{if(!ids.has(d.id_texte))avert.push(`registre.json, échéance du ${d.date} : texte « ${d.id_texte} » introuvable.`);
    return {d:d.date,id:d.id_texte,fr:d.description_fr,en:d.description_en}});
  CHANGES=(reg.historique_versions||[]).map(c=>({v:c.version,d:c.date,fr:c.fr,en:c.en}));
  const [y,m,d]=String(ASOF).split("-");
  const vals={fr:{date:`${d}.${m}.${y}`,date_longue:`${+d} ${MOIS.fr[m-1]} ${y}`,annee:y,nb_definitions:GLOSS.length},
              en:{date:`${d}.${m}.${y}`,date_longue:`${+d} ${MOIS.en[m-1]} ${y}`,annee:y,nb_definitions:GLOSS.length}};
  T={fr:remplir(site.interface.fr,"fr",vals),en:remplir(site.interface.en,"en",vals)};
  METH={fr:remplir(site.methodologie.fr,"fr",vals).join("\n"),en:remplir(site.methodologie.en,"en",vals).join("\n")};
  ABOUT2={fr:remplir(site.a_propos.fr,"fr",vals),en:remplir(site.a_propos.en,"en",vals)};
  PHOTO=site.a_propos.photo;
  PATHS=carte.contours;ISLANDS=carte.iles;
  for(const c of Object.keys(COUNTRIES))if(!PATHS[c])err.push(`referentiel.json : le pays ${c} n'a pas de contour dans carte.json.`);
  return {err,avert};
}

/* Mode vérification : sur l'ordinateur (localhost) ou avec ?verifier à la fin de l'adresse,
   un encadré liste les textes ignorés à cause d'une erreur. Les visiteurs ne le voient pas. */
function avertir(lignes){
  console.warn(lignes.join("\n"));
  const demande=new URLSearchParams(location.search).has("verifier");
  const mode=demande||(lignes.length&&/^(localhost|127\.0\.0\.1)$/.test(location.hostname));
  if(!mode)return;
  const e=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const d=document.createElement("div");d.className="wrap";d.style.paddingTop="16px";
  d.innerHTML=lignes.length?`<div class="cite" role="status"><b>Vérification des données : ${lignes.length} point(s) à corriger</b>\n${lignes.map(e).join("\n")}</div>`
    :`<div class="cite" role="status">Vérification des données : aucune erreur.</div>`;
  document.getElementById("app").before(d);
}

/* Message affiché à la place du site si un fichier de données est illisible. */
function erreur(lignes){
  const app=document.getElementById("app");
  const e=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  app.innerHTML=`<section class="view"><div class="sec"><div class="sec-h"><h2>Le site n'a pas pu charger ses données</h2></div>
  <div class="prose"><p>Vérifiez le ou les points suivants, enregistrez, puis rechargez la page.</p><ul>${lignes.map(l=>`<li>${e(l)}</li>`).join("")}</ul>
  ${location.protocol==="file:"?`<p>Vous avez ouvert le fichier directement depuis votre ordinateur. Les navigateurs bloquent alors la lecture des fichiers de données : suivez la section « Voir le site sur son ordinateur » du README.</p>`:""}</div></div></section>`;
}

async function lire(f){
  let r;try{r=await fetch(f,{cache:"no-cache"})}catch(e){throw new Error(`${f} : fichier inaccessible.`)}
  if(!r.ok)throw new Error(`${f} : fichier introuvable (erreur ${r.status}).`);
  const txt=await r.text();
  try{return JSON.parse(txt)}catch(e){
    const m=/position (\d+)/.exec(e.message);let o="";
    if(m){const p=+m[1],ln=txt.slice(0,p).split("\n").length;o=` vers la ligne ${ln}`}
    throw new Error(`${f} : erreur de syntaxe JSON${o} (virgule, guillemet ou accolade manquant ou en trop). Détail : ${e.message}`)}
}

Promise.all(["data/registre.json","data/referentiel.json","data/site.json","data/carte.json"].map(lire))
  .then(([a,b,c,d])=>{let r;try{r=charger(a,b,c,d)}catch(e){r={err:["Structure inattendue dans un fichier de données : "+e.message],avert:[]}}
    if(r.err.length){erreur(r.err);console.error(r.err);return}
    demarrer();avertir(r.avert)})
  .catch(e=>erreur([e.message]));

/* Titre de l'onglet selon la page affichée. */
function setTitle(h){
  const K={carte:null,pays:"n_cty",comparer:"n_cmp",regional:"n_reg",base:"n_db",themes:"n_themes",glossaire:"n_gl",ressources:"n_res",apropos:"n_a",methodologie:"n_m"};
  let p=null;
  if(h.startsWith("pays-")&&COUNTRIES[h.slice(5)])p=COUNTRIES[h.slice(5)][L==="fr"?0:1];
  else if(K[h])p=T[L][K[h]];
  document.title=p?p+" · "+SITE_NAME:SITE_NAME;
}

let L="fr";try{const s=localStorage.getItem("aspm-lang");if(s==="en"||s==="fr")L=s}catch(e){}

function demarrer(){
/* ---------- état et fonctions utilitaires ---------- */
let THEME="ALL",OVER="",SEL=null,DBQ="",CMP=["KEN","NGA","ZAF"],GCF="",SORT={k:"n",d:-1};
const t=k=>T[L][k];
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const I=L2=>L2==="fr"?0:1;
const cname=c=>COUNTRIES[c]?COUNTRIES[c][I(L)]:(ORGS[c]?ORGS[c][L]:c);
const thName=k=>THEMES.find(x=>x.k===k)[L];
const title=e=>L==="fr"?(e.tf||e.ti):(e.te||e.ti);
const showOrig=e=>title(e)!==e.ti?e.ti:null;
const fmtDate=d=>{const p=String(d||"").split("-");return p.length===3?p[2]+"."+p[1]+"."+p[0]:p.length===2?p[1]+"."+p[0]:p[0]};
const lvlOf=(e,k)=>{const c=e.th[k];if(!c)return 0;if(c==="i")return 1;return e.f==="b"?3:2};
const nat=DATA.filter(e=>COUNTRIES[e.c]),reg=DATA.filter(e=>!COUNTRIES[e.c]);
function level(c,k){let m=0;for(const e of nat)if(e.c===c&&e.th[k])m=Math.max(m,lvlOf(e,k));return m}
const nThemes=c=>THEMES.filter(x=>level(c,x.k)>0).length;
const mapLevel=c=>THEME==="ALL"?Math.min(3,nThemes(c)):level(c,THEME);
const orgsOf=c=>Object.keys(ORGS).filter(o=>o!=="AU"&&ORGS[o].m.includes(c));
const byName=(a,b)=>cname(a).localeCompare(cname(b),L);
const lvLabel=lv=>[t("lg0"),t("lg1"),t("lg2"),t("lg3")][lv];
const app=document.getElementById("app");

function tags(e,k){
  let h=`<span class="tag ${e.f}">${esc(t("f")[e.f])}</span>`;
  if(k)h+=`<span class="tag">${esc(t("kind")[e.th[k]])}</span>`;
  h+=`<span class="tag ${e.s==="p"?"p":""}">${esc(t("s")[e.s])}</span>`;
  Object.keys(e.th).filter(x=>x!==k).forEach(x=>h+=`<span class="tag th">${esc(thName(x))}</span>`);
  return `<div class="tags">${h}</div>`;
}
function row(e,k,full){
  const o=showOrig(e);
  return `<div class="row"><span class="doc">${esc(e.id)}</span><span class="t">${esc(title(e))}</span><span class="dt">${esc(fmtDate(e.dt))}</span>
  ${full?`<div class="sub">${o?`<p class="orig">${esc(t("official_title"))} : ${esc(o)}</p>`:""}${tags(e,k)}<p class="serif">${esc(L==="fr"?e.sf:e.se)}</p>
  <div class="meta"><span>${esc(e.ty[I(L)])}</span><span>${esc(t("authority"))} : ${esc(e.a)}</span><a href="${esc(e.u)}" target="_blank" rel="noopener">${esc(t("source"))}</a><span class="mono">${esc(t("checked"))}</span></div></div>`
  :`<div class="sub"><span class="meta"><span>${COUNTRIES[e.c]?`<a href="#pays-${e.c}">${esc(cname(e.c))}</a>`:esc(cname(e.c))}</span><span>${esc(t("f")[e.f])}</span><span>${Object.keys(e.th).map(thName).map(esc).join(", ")}</span></span></div>`}
  </div>`;
}
function copyText(txt,statusEl,fallbackEl){
  const fail=()=>{if(fallbackEl){fallbackEl.hidden=false;fallbackEl.value=txt;fallbackEl.focus();fallbackEl.select()}statusEl.textContent=t("copyfail")};
  try{navigator.clipboard.writeText(txt).then(()=>statusEl.textContent=t("copied"),fail)}catch(e){fail()}
}

const crumbs=(...items)=>`<nav class="crumbs" aria-label="Fil d'Ariane"><a href="#carte">${esc(t("home"))}</a>${items.map(([h,l])=>` <span aria-hidden="true">›</span> `+(h?`<a href="#${h}">${esc(l)}</a>`:`<span aria-current="page">${esc(l)}</span>`)).join("")}</nav>`;
const SUBS={pays:[["pays","n_all"],["comparer","n_cmp"],["regional","n_reg"]],apropos:[["apropos","n_proj"],["methodologie","n_m"]]};
const subnav=(g,cur)=>`<nav class="sub" aria-label="${esc(t(g==="pays"?"n_cty":"n_a"))}">${SUBS[g].map(([h,k])=>`<a href="#${h}" ${h===cur?'aria-current="page"':""}>${esc(t(k))}</a>`).join("")}</nav>`;
/* ---------- home ---------- */
function viewHome(){
  const nC=new Set(nat.map(e=>e.c)).size,nB=DATA.filter(e=>e.f==="b").length;
  app.innerHTML=`<section class="view">
  <div class="head"><div><p class="lbl">${esc(t("edition"))}</p><h1 style="margin-top:10px">${esc(t("h1"))}</h1><p class="lead">${esc(t("lead"))}</p></div>
   <dl class="figs"><div><dt>${esc(t("fg1"))}</dt><dd>${DATA.length}</dd></div><div><dt>${esc(t("fg2"))}</dt><dd>${nC}</dd></div><div><dt>${esc(t("fg3"))}</dt><dd>${nB}</dd></div><div><dt>${esc(t("fg4"))}</dt><dd>${reg.length}</dd></div></dl></div>
  <nav class="starts" aria-label="Accès rapides"><a href="#pays"><b>${esc(t("st1h"))}</b><span>${esc(t("st1"))}</span></a><a href="#base"><b>${esc(t("st2h"))}</b><span>${esc(t("st2"))}</span></a><a href="#glossaire"><b>${esc(t("st3h"))}</b><span>${esc(t("st3"))}</span></a></nav>
  <div class="bench">
   <div class="tindex"><div class="tlist" role="group" aria-label="${esc(t("th_idx"))}">${tbtn("ALL",t("all"),new Set(nat.map(e=>e.c)).size)}${THEMES.map(x=>tbtn(x.k,x[L],new Set(nat.filter(e=>e.th[x.k]).map(e=>e.c)).size)).join("")}</div>
    <div class="legend" id="legend"></div>
    <label class="legend" for="over"><span class="lbl">${esc(t("overlay"))}</span><select id="over"><option value="">${esc(t("none"))}</option>${["UMOA","CEMAC"].map(o=>`<option value="${o}" ${OVER===o?"selected":""}>${esc(ORGS[o][L])}</option>`).join("")}</select></label></div>
   <div class="mapcol" id="mapcol">${svgMap()}<div class="tip" id="tip" hidden></div><p class="mapnote">${esc(t("mapnote"))}</p></div>
   <aside class="fiche" id="fiche" aria-live="polite"></aside>
  </div>
  <div class="two">
   <div class="sec"><div class="sec-h"><h2>${esc(t("chart_h"))}</h2></div><div class="chart">${chart()}</div><p class="status">${esc(t("chart_n"))}</p></div>
   <div class="sec"><div class="sec-h"><h2>${esc(t("dead_h"))}</h2></div><p class="status">${esc(t("dead_n"))}</p><div class="dl">${DEADLINES.filter(x=>x.d>ASOF).map(x=>`<div><span class="big">${esc(fmtDate(x.d))}</span><span class="serif">${esc(x[L])} <span class="mono muted">${esc(x.id)}</span></span></div>`).join("")}</div></div>
  </div>
  <div class="sec"><div class="sec-h"><h2>${esc(t("new_h"))}</h2><span class="mono muted">${NEWIDS.length}</span></div><div class="reg">${DATA.filter(e=>NEWIDS.includes(e.id)).sort((a,b)=>byName(a.c,b.c)).map(e=>row(e)).join("")}</div></div>
  </section>`;
  app.querySelectorAll(".tbtn").forEach(b=>b.onclick=()=>{THEME=b.dataset.th;app.querySelectorAll(".tbtn").forEach(x=>x.setAttribute("aria-pressed",x===b));paint();fiche()});
  document.getElementById("over").onchange=ev=>{OVER=ev.target.value;paint()};
  bindMap();paint();fiche();
}
const tbtn=(k,lab,n)=>`<button type="button" class="tbtn" data-th="${k}" aria-pressed="${THEME===k}"><span>${esc(lab)}</span><span>${n}</span></button>`;
function svgMap(){
  let p="",h="";
  for(const c in PATHS){p+=`<path class="cty${c==="ESH"?" esh":""}" data-c="${c}" d="${PATHS[c].d}" tabindex="0" role="button"></path>`;h+=`<path class="hatch" data-h="${c}" d="${PATHS[c].d}" hidden></path>`}
  for(const c of ISLANDS){const [x,y]=PATHS[c].c;p+=`<circle class="cty island" data-c="${c}" cx="${x}" cy="${y}" r="7" tabindex="0" role="button"></circle>`}
  return `<svg viewBox="0 0 800 735" role="img" aria-label="${L==="fr"?"Carte des 55 États de l'Union africaine":"Map of the 55 African Union member states"}"><defs><pattern id="hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0V7" stroke-width="2.2"/></pattern></defs><g>${p}</g><g>${h}</g></svg>`;
}
function paint(){
  app.querySelectorAll(".cty").forEach(el=>{const c=el.dataset.c,lv=mapLevel(c);el.setAttribute("class",`cty${c==="ESH"?" esh":""}${el.tagName==="circle"?" island":""} lv${lv}${c===SEL?" sel":""}`);el.setAttribute("aria-label",cname(c)+", "+lvText(lv))});
  const mem=OVER?ORGS[OVER].m:[];app.querySelectorAll(".hatch").forEach(el=>{if(mem.includes(el.dataset.h))el.removeAttribute("hidden");else el.setAttribute("hidden","")});
  const rows=THEME==="ALL"?[[3,t("lgA3")],[2,t("lgA2")],[1,t("lgA1")],[0,t("lg0")]]:[[3,t("lg3")],[2,t("lg2")],[1,t("lg1")],[0,t("lg0")]];
  document.getElementById("legend").innerHTML=rows.map(([k,lab])=>`<div><span class="sw" style="background:var(--m${k});${k?`border-color:var(--m${k})`:""}"></span>${esc(lab)}</div>`).join("")+(OVER?`<div><svg width="16" height="11" aria-hidden="true"><rect width="16" height="11" fill="url(#hatch)" stroke="var(--ochre)"/></svg>${esc(t("lgh"))}</div>`:"");
}
const lvText=lv=>THEME==="ALL"?(lv?(lv>=3?t("lgA3"):lv===2?t("lgA2"):t("lgA1")):t("lg0")):lvLabel(lv);
function bindMap(){
  const box=document.getElementById("mapcol"),tip=document.getElementById("tip");
  app.querySelectorAll(".cty").forEach(el=>{const c=el.dataset.c;
    el.addEventListener("mousemove",ev=>{const r=box.getBoundingClientRect();tip.hidden=false;tip.style.left=(ev.clientX-r.left)+"px";tip.style.top=(ev.clientY-r.top)+"px";tip.textContent=cname(c)+" · "+lvText(mapLevel(c))});
    el.addEventListener("mouseleave",()=>tip.hidden=true);
    const pick=()=>{SEL=c;paint();fiche();if(window.matchMedia("(max-width:820px)").matches){const f=document.getElementById("fiche");if(f)f.scrollIntoView({behavior:"smooth",block:"start"})}};el.addEventListener("click",pick);
    el.addEventListener("keydown",ev=>{if(ev.key==="Enter"||ev.key===" "){ev.preventDefault();pick()}});});
}
function fiche(){
  const el=document.getElementById("fiche");if(!el)return;
  if(!SEL){const cs=[...new Set(nat.filter(e=>THEME==="ALL"||e.th[THEME]).map(e=>e.c))].sort(byName);
    el.innerHTML=`<p class="serif muted">${esc(t("hint"))}</p><p class="lbl">${esc(t("cov"))} · ${cs.length}</p><div class="reg">${cs.map(c=>`<div class="row" style="grid-template-columns:minmax(0,1fr) auto"><a href="#pays-${c}">${esc(cname(c))}</a><span class="mono muted">${THEME==="ALL"?nThemes(c)+"/5":esc(lvLabel(level(c,THEME)))}</span></div>`).join("")}</div>`;return}
  const list=nat.filter(e=>e.c===SEL&&(THEME==="ALL"||e.th[THEME])).sort((a,b)=>String(b.dt).localeCompare(String(a.dt)));
  el.innerHTML=`<p class="lbl">${esc(t("R")[COUNTRIES[SEL][2]])}</p><h3>${esc(cname(SEL))}<span class="code">${SEL}</span></h3>
  <p class="muted">${THEME==="ALL"?`${esc(t("themes_in"))} : ${nThemes(SEL)}/5`:esc(thName(THEME))+" · "+esc(lvLabel(level(SEL,THEME)))}</p>
  ${list.length?`<div class="reg">${list.map(e=>`<div class="row" style="grid-template-columns:62px minmax(0,1fr)"><span class="doc">${esc(e.id)}</span><span><span class="t">${esc(title(e))}</span><br><span class="mono muted">${esc(fmtDate(e.dt))} · ${esc(t("f")[e.f])}</span></span></div>`).join("")}</div>`:`<p class="empty">${esc(THEME==="ALL"?t("na"):t("noText"))}</p>`}
  <a class="btn" href="#pays-${SEL}" style="justify-self:start">${esc(t("open"))}</a>`;
}
function chart(){
  const ys={};DATA.forEach(e=>ys[e.y]=(ys[e.y]||0)+1);
  const y0=Math.min(...Object.keys(ys).map(Number)),y1=Math.max(...Object.keys(ys).map(Number));
  const mx=Math.max(...Object.values(ys)),top=Math.ceil(mx/2)*2;
  const W=640,H=240,pl=30,pr=8,pt=12,pb=26,n=y1-y0+1,bw=(W-pl-pr)/n;
  let g="";for(let v=0;v<=top;v+=2){const y=pt+(H-pt-pb)*(1-v/top);g+=`<line class="grid" x1="${pl}" x2="${W-pr}" y1="${y}" y2="${y}"/><text x="${pl-6}" y="${y+4}" text-anchor="end">${v}</text>`}
  let b="";for(let yr=y0;yr<=y1;yr++){const v=ys[yr]||0;if(v){const h=(H-pt-pb)*v/top;b+=`<rect class="bar${v===mx?" mx":""}" x="${pl+(yr-y0)*bw+1}" y="${H-pb-h}" width="${Math.max(bw-2,1)}" height="${h}"><title>${yr} : ${v}</title></rect>`}
    if(yr%5===0)b+=`<text x="${pl+(yr-y0)*bw+bw/2}" y="${H-8}" text-anchor="middle">${yr}</text>`}
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(t("chart_h"))}">${g}<line class="axis" x1="${pl}" x2="${W-pr}" y1="${H-pb}" y2="${H-pb}"/>${b}</svg>`;
}

/* ---------- themes ---------- */
function viewThemes(){
  app.innerHTML=`<section class="view"><div><h1>${esc(t("th_h"))}</h1><p class="lead serif muted" style="margin-top:12px;max-width:62ch">${esc(t("th_lead"))}</p></div>
  ${THEMES.map(x=>{const inf=THEMEINFO[x.k];const cs=Object.keys(COUNTRIES).filter(c=>level(c,x.k)>0).sort(byName);
   const by=[3,2,1].map(l=>cs.filter(c=>level(c,x.k)===l).length);
   return `<div class="sec" id="th-${x.k}"><div class="sec-h"><h2>${esc(x[L])}</h2><span class="mono muted">${nat.filter(e=>e.th[x.k]).length} ${esc(t("rows"))} · ${cs.length}/55</span></div>
   <p class="serif" style="max-width:70ch">${esc(x["h"+L])}</p>
   <div class="cols2"><div><p class="lbl">${esc(t("inc"))}</p><ul>${(L==="fr"?inf.inc:inf.inE).map(s=>`<li>${esc(s)}</li>`).join("")}</ul></div><div><p class="lbl">${esc(t("exc"))}</p><ul>${(L==="fr"?inf.exc:inf.exE).map(s=>`<li>${esc(s)}</li>`).join("")}</ul></div></div>
   <div><p class="lbl">${esc(t("byl"))}</p><div class="dl">${[3,2,1].map((l,i)=>`<div><span class="big"><span class="cell l${l}"></span> ${by[i]}</span><span>${esc(lvLabel(l))}<br><span class="muted" style="font-size:.86rem">${cs.filter(c=>level(c,x.k)===l).map(c=>`<a href="#pays-${c}">${esc(cname(c))}</a>`).join(", ")||"-"}</span></span></div>`).join("")}</div></div></div>`}).join("")}
  </section>`;
}

/* ---------- countries ---------- */
function viewCountries(){
  app.innerHTML=`<section class="view">${subnav("pays","pays")}<div><h1>${esc(t("cty_h"))}</h1><p class="serif muted" style="margin-top:12px;max-width:66ch">${esc(t("cty_lead"))}</p></div>
  <div class="tools"><input type="search" id="cq" placeholder="${esc(t("q_cty"))}" aria-label="${esc(t("q_cty"))}"><select id="cr" aria-label="${esc(t("col_r"))}"><option value="">${esc(t("all_regions"))}</option>${Object.entries(t("R")).map(([k,v])=>`<option value="${k}">${esc(v)}</option>`).join("")}</select><label class="status"><input type="checkbox" id="co"> ${esc(t("only"))}</label><span class="status" id="cst"></span></div>
  <div class="tw"><table><thead><tr><th><button data-s="c">${esc(t("col_c"))}</button></th><th><button data-s="r">${esc(t("col_r"))}</button></th>${THEMES.map(x=>`<th title="${esc(x[L])}"><button data-s="${x.k}">${esc(x[L].split(" ")[0])}</button></th>`).join("")}<th><button data-s="n">${esc(t("col_n"))}</button></th></tr></thead><tbody id="cb"></tbody></table></div>
  <div class="legend" style="display:flex;flex-wrap:wrap;gap:6px 18px">${[3,2,1,0].map(l=>`<div><span class="cell l${l}"></span> ${esc(lvLabel(l))}</div>`).join("")}</div></section>`;
  const cnt=c=>nat.filter(e=>e.c===c).length;
  const draw=()=>{const q=cq.value.trim().toLowerCase(),r=cr.value,o=co.checked;
    let cs=Object.keys(COUNTRIES).filter(c=>(!r||COUNTRIES[c][2]===r)&&(!q||(COUNTRIES[c][0]+" "+COUNTRIES[c][1]).toLowerCase().includes(q))&&(!o||cnt(c)>0));
    const k=SORT.k,d=SORT.d;cs.sort((a,b)=>{let va,vb;if(k==="c")return d*byName(a,b);if(k==="r"){va=t("R")[COUNTRIES[a][2]];vb=t("R")[COUNTRIES[b][2]];return d*va.localeCompare(vb,L)||byName(a,b)}if(k==="n"){va=cnt(a);vb=cnt(b)}else{va=level(a,k);vb=level(b,k)}return d*(va-vb)||byName(a,b)});
    cb.innerHTML=cs.map(c=>`<tr><td><a href="#pays-${c}">${esc(cname(c))}</a></td><td class="muted">${esc(t("R")[COUNTRIES[c][2]])}</td>${THEMES.map(x=>{const l=level(c,x.k);return `<td><span class="cell l${l}" title="${esc(x[L]+" · "+lvLabel(l))}"></span></td>`}).join("")}<td class="n">${cnt(c)}</td></tr>`).join("");
    cst.textContent=cs.length+" / 55";};
  const cq=document.getElementById("cq"),cr=document.getElementById("cr"),co=document.getElementById("co"),cb=document.getElementById("cb"),cst=document.getElementById("cst");
  cq.oninput=draw;cr.onchange=draw;co.onchange=draw;
  app.querySelectorAll("th button").forEach(b=>b.onclick=()=>{const k=b.dataset.s;SORT={k,d:SORT.k===k?-SORT.d:(k==="c"||k==="r"?1:-1)};draw()});
  draw();
}
function viewCountry(c){
  const orgs=orgsOf(c),all=nat.filter(e=>e.c===c);
  const regs=reg.filter(e=>e.c==="AU"||orgs.includes(e.c));
  const cite=t("cite_cty").replace("{pays}",cname(c))+"\n"+location.href.split("#")[0]+"#pays-"+c;
  app.innerHTML=`<section class="view">${crumbs(["pays",t("n_cty")],[null,cname(c)])}
  <div class="chead"><div><p class="lbl">${esc(t("R")[COUNTRIES[c][2]])} · ${c}</p><h1 style="margin-top:8px">${esc(cname(c))}</h1></div>
   <div class="tags"><span class="tag">${esc(t("memberships"))}</span><span class="tag th">${esc(ORGS.AU[L])}</span>${orgs.map(o=>`<span class="tag th">${esc(ORGS[o][L])}</span>`).join("")}</div></div>
  <div class="sec"><div class="sec-h"><h2>${esc(t("synth"))}</h2><span class="mono muted">${all.length} ${esc(t("rows"))}</span></div>
   <div class="tw"><table class="synth"><thead><tr><th>${esc(t("f_theme"))}</th><th>${esc(t("level"))}</th><th>${esc(t("texts"))}</th></tr></thead><tbody>${THEMES.map(x=>{const l=level(c,x.k);return `<tr><td><a href="#t-${x.k}" data-jump="t-${x.k}">${esc(x[L])}</a></td><td><span class="cell l${l}"></span> ${esc(lvLabel(l))}</td><td class="n">${all.filter(e=>e.th[x.k]).length}</td></tr>`}).join("")}</tbody></table></div></div>
  ${THEMES.map(x=>{const list=all.filter(e=>e.th[x.k]).sort((a,b)=>String(b.dt).localeCompare(String(a.dt)));
    return `<div class="sec" id="t-${x.k}"><div class="sec-h"><h3>${esc(x[L])}</h3><span class="mono muted">${esc(lvLabel(level(c,x.k)))}</span></div>${list.length?`<div class="reg">${list.map(e=>row(e,x.k,true)).join("")}</div>`:`<p class="empty">${esc(t("na"))}</p>`}</div>`}).join("")}
  <div class="sec"><div class="sec-h"><h3>${esc(t("reg_apply"))}</h3><span class="mono muted">${regs.length}</span></div><p class="serif muted">${esc(t("reg_note"))}</p><div class="reg">${regs.map(e=>row(e,null,true)).join("")}</div></div>
  <div class="sec"><div class="sec-h"><h3>${esc(t("cite_h"))}</h3></div><div class="cite" id="cite">${esc(cite)}</div><div class="tools"><button class="btn line" id="cbtn" type="button">${esc(t("copy"))}</button><span class="status" id="cs" aria-live="polite"></span></div></div>
  </section>`;
  app.querySelectorAll("[data-jump]").forEach(a=>a.onclick=ev=>{ev.preventDefault();document.getElementById(a.dataset.jump).scrollIntoView()});
  document.getElementById("cbtn").onclick=()=>copyText(cite,document.getElementById("cs"));
  window.scrollTo(0,0);
}

/* ---------- compare ---------- */
function viewCompare(){
  const opts=sel=>`<option value="">${esc(t("pick"))}</option>`+Object.keys(COUNTRIES).sort(byName).map(c=>`<option value="${c}" ${c===sel?"selected":""}>${esc(cname(c))}</option>`).join("");
  app.innerHTML=`<section class="view">${crumbs(["pays",t("n_cty")],[null,t("n_cmp")])}${subnav("pays","comparer")}<div><h1>${esc(t("cmp_h"))}</h1><p class="serif muted" style="margin-top:12px">${esc(t("cmp_lead"))}</p></div>
  <div class="tools">${[0,1,2].map(i=>`<select id="cmp${i}" aria-label="${esc(t("pick"))} ${i+1}">${opts(CMP[i])}</select>`).join("")}</div><div class="tw" id="cmpt"></div></section>`;
  const draw=()=>{const cs=CMP.filter(Boolean);
    document.getElementById("cmpt").innerHTML=`<table class="cmp"><thead><tr><th>${esc(t("f_theme"))}</th>${cs.map(c=>`<th><a href="#pays-${c}">${esc(cname(c))}</a></th>`).join("")}</tr></thead><tbody>${THEMES.map(x=>`<tr><td><b>${esc(x[L])}</b></td>${cs.map(c=>{const l=level(c,x.k),li=nat.filter(e=>e.c===c&&e.th[x.k]);return `<td><span class="cell l${l}"></span> ${esc(lvLabel(l))}${li.length?`<ul>${li.map(e=>`<li>${esc(title(e))} <span class="mono muted">${esc(String(e.y))}</span></li>`).join("")}</ul>`:""}</td>`}).join("")}</tr>`).join("")}</tbody></table>`};
  [0,1,2].forEach(i=>document.getElementById("cmp"+i).onchange=ev=>{CMP[i]=ev.target.value;draw()});draw();
}

/* ---------- register ---------- */
function csvOf(rows){const q=v=>'"'+String(v??"").replace(/"/g,'""')+'"';
  return [["id","country_or_zone","themes","title","official_title","type","legal_force","date","authority","source_url","source_type"].join(",")].concat(rows.map(e=>[e.id,cname(e.c),Object.keys(e.th).join("|"),title(e),e.ti,e.ty[I(L)],t("f")[e.f],e.dt,e.a,e.u,t("s")[e.s]].map(q).join(","))).join("\n")}
function viewDB(){
  const sel=(id,lab,opts)=>`<select id="${id}" aria-label="${esc(lab)}"><option value="">${esc(lab)} : ${esc(t("any"))}</option>${opts}</select>`;
  app.innerHTML=`<section class="view"><div><h1>${esc(t("db_h"))}</h1><p class="serif muted" style="margin-top:12px">${esc(t("db_lead"))}</p></div>
  <div class="tools"><input type="search" id="dq" placeholder="${esc(t("q"))}" aria-label="${esc(t("q"))}" value="${esc(DBQ)}">
   ${sel("dt",t("f_theme"),THEMES.map(x=>`<option value="${x.k}">${esc(x[L])}</option>`).join(""))}
   ${sel("df",t("f_force"),["b","g","v"].map(k=>`<option value="${k}">${esc(t("f")[k])}</option>`).join(""))}
   ${sel("ds",t("f_scope"),`<option value="n">${esc(t("national"))}</option><option value="r">${esc(t("regional"))}</option>`)}
   ${sel("dsrc",t("f_src"),["o","r","p"].map(k=>`<option value="${k}">${esc(t("s")[k])}</option>`).join(""))}
   <button class="btn" id="dcopy" type="button">${esc(t("copycsv"))}</button></div>
  <p class="status" id="dst" aria-live="polite"></p>
  <div class="tw"><table><thead><tr><th>№</th><th>${esc(t("col_cty"))}</th><th>${esc(t("col_title"))}</th><th>${esc(t("f_theme"))}</th><th>${esc(t("col_type"))}</th><th>${esc(t("col_force"))}</th><th>${esc(t("col_date"))}</th><th>${esc(t("col_src"))}</th></tr></thead><tbody id="dbb"></tbody></table></div>
  <textarea id="dcsv" hidden readonly style="width:100%;min-height:160px;font:12px var(--mono);background:var(--sheet);color:var(--ink);border:1px solid var(--rule);padding:10px"></textarea></section>`;
  let rows=[];const g=id=>document.getElementById(id);
  const draw=()=>{const q=g("dq").value.trim().toLowerCase();DBQ=g("dq").value;
    rows=DATA.filter(e=>(!g("dt").value||e.th[g("dt").value])&&(!g("df").value||e.f===g("df").value)&&(!g("ds").value||(g("ds").value==="n")===!!COUNTRIES[e.c])&&(!g("dsrc").value||e.s===g("dsrc").value)&&(!q||(title(e)+" "+e.ti+" "+e.a+" "+cname(e.c)+" "+e.id).toLowerCase().includes(q))).sort((a,b)=>byName(a.c,b.c)||String(b.dt).localeCompare(String(a.dt)));
    g("dbb").innerHTML=rows.map(e=>`<tr><td class="n">${esc(e.id)}</td><td>${COUNTRIES[e.c]?`<a href="#pays-${e.c}">${esc(cname(e.c))}</a>`:esc(cname(e.c))}</td><td style="min-width:260px">${esc(title(e))}</td><td>${Object.keys(e.th).map(thName).map(esc).join(", ")}</td><td>${esc(e.ty[I(L)])}</td><td>${esc(t("f")[e.f])}</td><td class="n">${esc(fmtDate(e.dt))}</td><td><a href="${esc(e.u)}" target="_blank" rel="noopener">${esc(t("s")[e.s])}</a></td></tr>`).join("");
    g("dst").textContent=rows.length+" "+t("rows")};
  ["dq","dt","df","ds","dsrc"].forEach(id=>{g(id).oninput=draw;g(id).onchange=draw});
  g("dcopy").onclick=()=>copyText(csvOf(rows),g("dst"),g("dcsv"));draw();
}

/* ---------- regional ---------- */
function viewRegional(){
  app.innerHTML=`<section class="view">${crumbs(["pays",t("n_cty")],[null,t("n_reg")])}${subnav("pays","regional")}<div><h1>${esc(t("reg_h"))}</h1><p class="serif muted" style="margin-top:12px;max-width:70ch">${esc(t("reg_lead"))}</p></div>
  ${["AU","UMOA","CEMAC"].map(o=>{const li=reg.filter(e=>e.c===o);return `<div class="sec"><div class="sec-h"><h2>${esc(ORGS[o][L])}</h2><span class="mono muted">${esc(t("members"))} · ${ORGS[o].m.length}</span></div><p class="serif" style="max-width:70ch">${esc(L==="fr"?ORGS[o].dfr:ORGS[o].den)}</p>${o!=="AU"?`<p>${ORGS[o].m.sort(byName).map(c=>`<a href="#pays-${c}">${esc(cname(c))}</a>`).join(" · ")}</p>`:""}<div class="reg">${li.map(e=>row(e,null,true)).join("")}</div></div>`}).join("")}</section>`;
}

/* ---------- glossary ---------- */
function viewGloss(){
  app.innerHTML=`<section class="view"><div><h1>${esc(t("gl_h"))}</h1><p class="serif muted" style="margin-top:12px;max-width:66ch">${esc(t("gl_lead"))}</p></div>
  <div class="tools"><input type="search" id="gq" placeholder="${esc(t("gl_q"))}" aria-label="${esc(t("gl_q"))}"><span class="status" id="gst"></span></div>
  <div class="seg" role="group">${[["",t("allcat")]].concat(Object.entries(GCAT).map(([k,v])=>[k,v[I(L)]])).map(([k,v])=>`<button type="button" data-c="${k}" aria-pressed="${GCF===k}">${esc(v)}</button>`).join("")}</div>
  <div id="gl"></div></section>`;
  const i=I(L);
  const draw=()=>{const q=document.getElementById("gq").value.trim().toLowerCase();
    const li=GLOSS.filter(g=>(!GCF||g[0]===GCF)&&(!q||g.slice(1,5).join(" ").toLowerCase().includes(q))).sort((a,b)=>a[1+i].localeCompare(b[1+i],L,{sensitivity:"base"}));
    let out="",cur="";li.forEach(g=>{const l=g[1+i].normalize("NFD").replace(/[\u0300-\u036f]/g,"")[0].toUpperCase();if(l!==cur){if(cur)out+="</dl>";cur=l;out+=`<div class="letter">${l}</div><dl class="gl">`}
      out+=`<div><dt>${esc(g[1+i])}<small>${esc(g[2-i])} · ${esc(GCAT[g[0]][i])}</small></dt><dd>${esc(g[3+i])}${g[5]?` <a href="${esc(g[5])}" target="_blank" rel="noopener">${esc(t("ref"))}</a>`:""}</dd></div>`});
    document.getElementById("gl").innerHTML=out+(cur?"</dl>":"");document.getElementById("gst").textContent=li.length+" / "+GLOSS.length};
  document.getElementById("gq").oninput=draw;
  app.querySelectorAll(".seg button").forEach(b=>b.onclick=()=>{GCF=b.dataset.c;app.querySelectorAll(".seg button").forEach(x=>x.setAttribute("aria-pressed",x===b));draw()});
  draw();
}
function viewRes(){
  app.innerHTML=`<section class="view"><div><h1>${esc(t("res_h"))}</h1><p class="serif muted" style="margin-top:12px;max-width:66ch">${esc(t("res_lead"))}</p></div>
  ${RES.map(g=>`<div class="sec"><div class="sec-h"><h2>${esc(g[L])}</h2><span class="mono muted">${g.items.length}</span></div><ul class="reslist">${g.items.map(r=>`<li><span><a href="${esc(r[2])}" target="_blank" rel="noopener">${esc(r[0])}</a><br><span class="mono muted">${esc(r[1])}</span></span><p>${esc(L==="fr"?r[3]:r[4])}</p></li>`).join("")}</ul></div>`).join("")}</section>`;
}
function viewMethod(){
  const cs=k=>DATA.filter(e=>e.s===k).length,cf=k=>DATA.filter(e=>e.f===k).length;
  app.innerHTML=`<section class="view">${crumbs(["apropos",t("n_a")],[null,t("n_m")])}${subnav("apropos","methodologie")}<h1>${esc(t("m_h"))}</h1>
  <div class="two"><div class="prose">${METH[L]}</div>
  <div class="sec" style="align-content:start"><div class="sec-h"><h3>${esc(t("ev_h"))}</h3><span class="mono muted">${DATA.length}</span></div>
   <div class="dl">${["o","r","p"].map(k=>`<div><span class="big">${cs(k)}</span><span>${esc(t("s")[k])}</span></div>`).join("")}${["b","g","v"].map(k=>`<div><span class="big">${cf(k)}</span><span>${esc(t("f")[k])}</span></div>`).join("")}</div>
   <p class="lbl" style="margin-top:12px">${esc(t("s").p)}</p><div class="reg">${DATA.filter(e=>e.s==="p").map(e=>row(e)).join("")}</div></div></div></section>`;
}
function viewAbout(){const A=ABOUT2[L];
  app.innerHTML=`<section class="view">${subnav("apropos","apropos")}<h1>${esc(t("a_h"))}</h1>
  <div class="sec"><div class="sec-h"><h2>${esc(A.why_h)}</h2></div><div class="prose">${A.why.map(p=>`<p>${esc(p)}</p>`).join("")}</div></div>
  <div class="sec"><div class="sec-h"><h2>${esc(A.who_h)}</h2></div>
   <div class="bio"><figure><img src="${PHOTO}" alt="${esc(A.photo_alt)}" width="420" height="560" loading="lazy"><figcaption><b>${esc(A.name)}</b><span>${esc(A.role)}</span></figcaption></figure>
   <div class="prose">${A.bio.map(p=>`<p>${esc(p)}</p>`).join("")}</div></div></div>
  <div class="two"><div class="sec" style="align-content:start"><div class="sec-h"><h3>${esc(A.ed_h)}</h3></div><div class="prose">${A.ed.map((p,k)=>`<p${k===1?' class="mono"':""}>${esc(p)}</p>`).join("")}</div></div>
  <div class="sec" style="align-content:start"><div class="sec-h"><h3>${esc(A.logo_h)}</h3></div><div style="background:var(--sheet);border:1px solid var(--rule);padding:28px;color:var(--ink)"><svg viewBox="0 0 100 108" style="width:110px;height:auto;display:block;margin:auto" aria-hidden="true"><defs><clipPath id="afa"><path d="M80.1,62.4L79.6,64.8L80.5,65.3L80.1,67.5L81.6,70L82.2,76L80.5,78.9L77.7,80.1L74.2,83.2L75.3,86.5L74.6,90L71.2,91.8L71.6,93.4L71.1,95.7L67.9,100.1L65.4,102.7L62.1,104.6L57.8,104.4L53.9,106L52,104.5L52,100.9L49.5,96.1L47.9,93.9L46.7,86.5L45.4,84.8L43.3,79.7L44.6,73.9L45.8,72.4L45.3,67.6L44.1,64.3L43.9,63.9L43.5,62.9L42.4,61.4L39.3,57.6L40.3,54.7L40.5,53L40.7,52L38.9,49.7L35.4,50.4L33.3,47.7L31.1,47.7L30,47.8L29,48.1L24.9,49.8L23.7,49.4L19.7,49.4L17.2,50.2L15.4,49.6L12.2,47L10.2,45.6L9.8,44.1L7.2,41.2L5.2,39.4L4.9,38.3L5.1,37.7L3.9,36.1L5.4,34.2L5.7,28.6L4.6,27.3L4.7,26.7L8.2,19.6L10.6,16.9L11.8,16.7L14.7,14L14.4,12L15.9,8.8L18.3,7.4L19.6,4.7L24.6,5.6L29.5,3.3L35.9,2.4L38.8,2.7L40.3,2L41.8,3.6L42,6.2L41.2,7L42.9,8.9L48,10.3L48.6,11.7L53.1,13.5L55.5,9.6L58.3,9.7L61.3,11.4L66.3,12.5L67.9,11.6L72.9,12.4L73.5,12L74.4,14.6L73.1,17.5L71.5,15.9L75.4,23L75.2,24.2L77,25.8L77.8,30.7L79.1,31.5L80.2,34.5L85.3,38.9L85.4,40.6L86.7,42L93.2,40.7L96.1,39.8L96,41.7L93.9,46.9L90,52.3L85.4,55.7L83.3,58.4L81.6,59.6ZM94,73L95.3,76.8L90.7,90.7L88.5,91.7L86.6,90.8L85.6,86.5L87.1,83.6L86.5,79.8L87.2,78.2L89.7,77.6Z"/></clipPath></defs><g clip-path="url(#afa)"><rect x="0" y="2.00" width="100" height="6.24" fill="currentColor"/><rect x="0" y="11.45" width="100" height="6.24" fill="currentColor"/><rect x="0" y="20.91" width="100" height="6.24" fill="currentColor"/><rect x="0" y="30.36" width="100" height="6.24" fill="currentColor"/><rect x="0" y="39.82" width="100" height="6.24" fill="currentColor"/><rect x="0" y="49.27" width="100" height="6.24" fill="currentColor"/><rect x="0" y="58.73" width="100" height="6.24" fill="var(--ochre)"/><rect x="0" y="68.18" width="100" height="6.24" fill="currentColor"/><rect x="0" y="77.64" width="100" height="6.24" fill="currentColor"/><rect x="0" y="87.09" width="100" height="6.24" fill="currentColor"/><rect x="0" y="96.55" width="100" height="6.24" fill="currentColor"/></g></svg></div><p class="serif muted">${esc(A.logo)}</p></div></div>
  </section>`;
}
function i18n(){document.documentElement.lang=L;document.querySelectorAll("[data-i]").forEach(el=>el.textContent=t(el.dataset.i));
  document.querySelectorAll("[data-ph]").forEach(el=>{el.placeholder=t(el.dataset.ph);el.setAttribute("aria-label",t(el.dataset.ph))});
  document.querySelectorAll(".lang button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.l===L))}
const GROUP={carte:"carte",pays:"pays",comparer:"pays",regional:"pays",base:"base",themes:"themes",glossaire:"glossaire",ressources:"ressources",apropos:"apropos",methodologie:"apropos"};
function route(){const h=(location.hash||"#carte").slice(1),v=h.startsWith("pays-")?"pays":h;
  const g=GROUP[v]||"carte";document.querySelectorAll("nav.idx a").forEach(a=>{if(a.dataset.g===g)a.setAttribute("aria-current","page");else a.removeAttribute("aria-current")});
  closeSugg();setTitle(h);
  if(h.startsWith("pays-")&&COUNTRIES[h.slice(5)])return viewCountry(h.slice(5));
  ({themes:viewThemes,pays:viewCountries,comparer:viewCompare,base:viewDB,regional:viewRegional,glossaire:viewGloss,ressources:viewRes,methodologie:viewMethod,apropos:viewAbout}[v]||viewHome)();
  window.scrollTo(0,0)}
const gs=document.getElementById("gsearch"),sg=document.getElementById("sugg");let sgi=-1;
function closeSugg(){sg.hidden=true;gs.setAttribute("aria-expanded","false");sgi=-1}
const norm=x=>String(x).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
function go(href,all){if(all)DBQ=gs.value;gs.value="";closeSugg();if(location.hash===href)route();else location.hash=href}
function openSugg(){const q=norm(gs.value.trim());if(q.length<2){closeSugg();return}
  const cs=Object.keys(COUNTRIES).filter(c=>norm(COUNTRIES[c][0]+" "+COUNTRIES[c][1]+" "+c).includes(q)).sort(byName).slice(0,5);
  const ts=DATA.filter(e=>norm(title(e)+" "+e.ti+" "+e.id+" "+e.a).includes(q)).slice(0,6);
  let h="";if(cs.length)h+=`<p class="lbl">${esc(t("sg_c"))}</p>`+cs.map(c=>`<a role="option" href="#pays-${c}"><span>${esc(cname(c))}</span><span>${c}</span></a>`).join("");
  if(ts.length)h+=`<p class="lbl">${esc(t("sg_t"))}</p>`+ts.map(e=>`<a role="option" href="${COUNTRIES[e.c]?"#pays-"+e.c:"#regional"}"><span>${esc(title(e))}</span><span>${esc(e.id)}</span></a>`).join("");
  h+=cs.length||ts.length?`<a role="option" href="#base" data-all="1"><span>${esc(t("sg_all"))}</span><span>↵</span></a>`:`<p class="status">${esc(t("sg_none"))}</p>`;
  sg.innerHTML=h;sg.hidden=false;gs.setAttribute("aria-expanded","true");sgi=-1;
  sg.querySelectorAll("a").forEach(a=>a.addEventListener("mousedown",ev=>{ev.preventDefault();go(a.getAttribute("href"),a.dataset.all)}))}
gs.addEventListener("input",openSugg);gs.addEventListener("blur",()=>setTimeout(closeSugg,150));
gs.addEventListener("keydown",ev=>{const it=[...sg.querySelectorAll("a")];
  if(ev.key==="ArrowDown"||ev.key==="ArrowUp"){if(!it.length)return;ev.preventDefault();sgi=(sgi+(ev.key==="ArrowDown"?1:-1)+it.length)%it.length;it.forEach((a,i)=>a.setAttribute("aria-selected",i===sgi))}
  else if(ev.key==="Enter"){ev.preventDefault();if(sgi>=0&&it[sgi])go(it[sgi].getAttribute("href"),it[sgi].dataset.all);else go("#base",true)}
  else if(ev.key==="Escape")closeSugg()});
document.querySelectorAll(".lang button").forEach(b=>b.onclick=()=>{L=b.dataset.l;try{localStorage.setItem("aspm-lang",L)}catch(e){}i18n();route()});
window.addEventListener("hashchange",route);i18n();route();
} /* fin de demarrer() */
