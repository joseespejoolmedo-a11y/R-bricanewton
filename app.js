
/* ==== Helpers ==== */
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
const todayISO = () => new Date().toISOString().slice(0,10);
const csvEscape = (v) => { const s = String(v ?? ""); return /[",\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s; };
const uid = () => Math.random().toString(36).slice(2,10);
const SCORE_LABEL = {4:"Excelente", 3:"Adecuado", 2:"Básico", 1:"A mejorar"};
function pulse(el){ if(!el) return; el.animate([{transform:"scale(1)"},{transform:"scale(1.05)"},{transform:"scale(1)"}], {duration:250, easing:"ease-out"}); }
function summarizeDescriptor(t){ const cut = String(t||"").split(/[;.]/)[0].trim(); return cut.length > 70 ? cut.slice(0,67) + "…" : cut; }
function downloadBlob(content, filename, type){ const blob = new Blob([content], {type}); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url); }
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

/* ==== Selectors ==== */
const rubricHead = document.getElementById("rubricHead");
const rubricBody = document.getElementById("rubricBody");
const totalEl = document.getElementById("totalPoints");
const percentEl = document.getElementById("percent");
const levelEl = document.getElementById("level");
const resetBtn = document.getElementById("resetBtn");
const saveBtn = document.getElementById("saveBtn");
const exportAllBtn = document.getElementById("exportAllBtn");
const exportSummaryBtn = document.getElementById("exportSummaryBtn");
const printBtn = document.getElementById("printBtn");
const syncBtn = document.getElementById("syncBtn");

const nameInput = document.getElementById("studentName");
const studentSelect = document.getElementById("studentSelect");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const dateInput = document.getElementById("dateInput");
const obsInput = document.getElementById("obsInput");

const descriptorModal = document.getElementById("descriptorModal");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");

const settingsBtn = document.getElementById("settingsBtn");
const settingsModal = document.getElementById("settingsModal");
const csvUrlInput = document.getElementById("csvUrlInput");
const nameColumnInput = document.getElementById("nameColumnInput");
const loadCsvBtn = document.getElementById("loadCsvBtn");
const csvStatus = document.getElementById("csvStatus");
const manualRoster = document.getElementById("manualRoster");
const loadManualBtn = document.getElementById("loadManualBtn");
const gsEndpointInput = document.getElementById("gsEndpointInput");

const templateSelect = document.getElementById("templateSelect");
const editRubricBtn = document.getElementById("editRubricBtn");
const newRubricBtn = document.getElementById("newRubricBtn");
const dupRubricBtn = document.getElementById("dupRubricBtn");
const builderModal = document.getElementById("builderModal");
const builderForm = document.getElementById("builderForm");
const rubricNameInput = document.getElementById("rubricNameInput");
const rowsContainer = document.getElementById("rowsContainer");
const addRowBtn = document.getElementById("addRowBtn");
const saveTemplateBtn = document.getElementById("saveTemplateBtn");
const deleteTemplateBtn = document.getElementById("deleteTemplateBtn");

const pasteRubricBtn = document.getElementById("pasteRubricBtn");
const pasteModal = document.getElementById("pasteModal");
const pasteInput = document.getElementById("pasteInput");
const detectPrefixed = document.getElementById("detectPrefixed");
const defaultWeight = document.getElementById("defaultWeight");
const pasteStatus = document.getElementById("pasteStatus");
const pastePreview = document.getElementById("pastePreview");
const previewPasteBtn = document.getElementById("previewPasteBtn");
const pasteAddBtn = document.getElementById("pasteAddBtn");
const pasteReplaceBtn = document.getElementById("pasteReplaceBtn");

/* ==== Storage ==== */
const LS_TEMPLATES = "rubricaEF-templates";
const LS_SETTINGS  = "rubricaEF-ajustes";
const LS_REGISTROS = "rubricaEF-registros";

const defaultTemplate = {
  id: uid(),
  name: "EF Básica 4 indicadores",
  rows: [
    {id:uid(), title:"Respeto / juego limpio", weight:1, d4:"Silencio inmediato a la señal; ayuda espontánea a compañeros y rivales; lenguaje positivo constante; cuida el material.", d3:"Atiende rápido; respeta turnos; trato correcto.", d2:"Necesita recordatorios; alguna distracción o comentario fuera de lugar.", d1:"Interrumpe; ignora turnos o normas; lenguaje inadecuado; riesgo para otros."},
    {id:uid(), title:"Esfuerzo / persistencia", weight:1, d4:"Mantiene ritmo (RPE 6–7) en todas las estaciones; busca tareas si termina antes.", d3:"Cumple tareas con ritmo estable; regula intensidad.", d2:"Paradas frecuentes sin causa justificada; ritmo irregular.", d1:"Abandona tareas o se niega a participar."},
    {id:uid(), title:"Cooperación / roles", weight:1, d4:"Cumple su rol y apoya a otros; comunica y anima; propone mejoras al grupo.", d3:"Cumple el rol asignado sin fallos.", d2:"Olvida rol; necesita guía frecuente.", d1:"Rechaza el rol; bloquea u obstaculiza al grupo."},
    {id:uid(), title:"Técnica y seguridad", weight:1, d4:"Posturas seguras; ejecución correcta; corrige a compañeros con respeto; usa material de forma adecuada.", d3:"Técnica generalmente segura; algún error corregido.", d2:"Técnica irregular; varios avisos; olvidos de seguridad.", d1:"Técnica inadecuada incluso tras aviso; conductas de riesgo."}
  ]
};

function loadTemplates(){ const arr = JSON.parse(localStorage.getItem(LS_TEMPLATES) || "[]"); if(!arr.length){ localStorage.setItem(LS_TEMPLATES, JSON.stringify([defaultTemplate])); return [defaultTemplate]; } return arr; }
function saveTemplates(arr){ localStorage.setItem(LS_TEMPLATES, JSON.stringify(arr)); }
function getSettings(){ return JSON.parse(localStorage.getItem(LS_SETTINGS) || "{}"); }
function setSettings(obj){ localStorage.setItem(LS_SETTINGS, JSON.stringify(obj)); }

/* ==== State ==== */
let templates = loadTemplates();
let currentTemplateId = templates[0].id;
let currentScores = {};
let currentWeights = {};
let roster = [];
let rosterIndex = -1;
document.getElementById("dateInput").valueAsDate = new Date();

/* ==== Build table ==== */
function buildRubricTable(){
  const tpl = templates.find(t=>t.id===currentTemplateId);
  if(!tpl){ return; }
  rubricHead.innerHTML = `
    <tr>
      <th scope="col">Indicador</th>
      <th scope="col" class="score-col">4<br><small>Excelente</small></th>
      <th scope="col" class="score-col">3<br><small>Adecuado</small></th>
      <th scope="col" class="score-col">2<br><small>Básico</small></th>
      <th scope="col" class="score-col">1<br><small>A mejorar</small></th>
      <th scope="col" class="sel-col">Selección</th>
      <th scope="col" class="peso-col">Peso</th>
    </tr>`;
  rubricBody.innerHTML = "";
  tpl.rows.forEach(row => {
    const tr = document.createElement("tr");
    tr.dataset.rowid = row.id;
    tr.innerHTML = `
      <th scope="row">${escapeHtml(row.title)}
        <button class="hint" aria-label="Ver descriptores" title="Ver descriptores" data-hint="${row.id}">📋</button>
      </th>
      ${[4,3,2,1].map(sc=>{
        const full = row["d"+sc] || "";
        const short = summarizeDescriptor(full);
        return `<td><button class="score" data-score="${sc}" title="${escapeHtml(full)}">
          <span class="n">${sc}</span><span class="lbl">${SCORE_LABEL[sc]}</span><span class="desc">${escapeHtml(short)}</span>
        </button></td>`;
      }).join("")}
      <td class="chosen" aria-live="polite">–</td>
      <td class="peso"><input class="peso-input" type="number" min="0" step="0.25" value="${Number(row.weight||1)}" inputmode="decimal" aria-label="Peso ${escapeHtml(row.title)}"></td>`;
    rubricBody.appendChild(tr);
  });
  $$("#rubricBody tr").forEach(tr=>{
    const id = tr.dataset.rowid;
    const score = currentScores[id] ?? null;
    const w = currentWeights[id] ?? null;
    if(w!=null) tr.querySelector(".peso-input").value = w;
    if(score!=null) activateRow(tr, score);
  });
  recalc();
}
function levelFromPercent(p){ if (p >= 87.5) return "Excelente (4)"; if (p >= 62.5) return "Adecuado (3)"; if (p >= 37.5) return "Básico (2)"; if (p > 0) return "A mejorar (1)"; return "—"; }
function weightedRawMax(){ const tpl = templates.find(t=>t.id===currentTemplateId); const sumW = tpl.rows.reduce((a,r)=> a + Number((currentWeights[r.id] ?? r.weight) || 0), 0); return 4 * sumW; }
function weightedRawTotal(){ const tpl = templates.find(t=>t.id===currentTemplateId); return tpl.rows.reduce((a,r)=>{ const sc = Number(currentScores[r.id] || 0); const w  = Number((currentWeights[r.id] ?? r.weight) || 0); return a + sc*w; },0); }
function recalc(){ const maxRaw = weightedRawMax(); const totalRaw = weightedRawTotal(); const pct = maxRaw ? Math.round((totalRaw/maxRaw)*100) : 0; const nota10 = maxRaw ? Math.round((10*totalRaw/maxRaw)*10)/10 : 0; totalEl.textContent = String(nota10); percentEl.textContent = `${pct}%`; levelEl.textContent = levelFromPercent(pct); }
function activateRow(tr, score){ tr.querySelectorAll(".score").forEach(btn=>{ const active = Number(btn.dataset.score)===score; btn.classList.toggle("active", active); btn.setAttribute("aria-pressed", active?"true":"false"); }); const chosen = tr.querySelector(".chosen"); chosen.textContent = score ? `${score} – ${SCORE_LABEL[score]}` : "–"; }

/* ==== Events ==== */
rubricBody.addEventListener("click", (e)=>{
  const btn = e.target.closest("button"); if(!btn) return;
  if(btn.classList.contains("score")){ const tr = btn.closest("tr"); const rowId = tr.dataset.rowid; const score = Number(btn.dataset.score); currentScores[rowId] = score; activateRow(tr, score); recalc(); }
  if(btn.classList.contains("hint")){ const id = btn.getAttribute("data-hint"); openDescriptorModal(id); }
});
rubricBody.addEventListener("input", (e)=>{ const inp = e.target; if(!inp.classList.contains("peso-input")) return; const tr = inp.closest("tr"); currentWeights[tr.dataset.rowid] = parseFloat(inp.value || "0") || 0; recalc(); });
function openDescriptorModal(rowId){ const tpl = templates.find(t=>t.id===currentTemplateId); const row = tpl.rows.find(r=>r.id===rowId); if(!row) return; modalTitle.textContent = row.title; modalBody.innerHTML = `<ul>
<li><strong>4 – Excelente:</strong> ${escapeHtml(row.d4||"")}</li>
<li><strong>3 – Adecuado:</strong> ${escapeHtml(row.d3||"")}</li>
<li><strong>2 – Básico:</strong> ${escapeHtml(row.d2||"")}</li>
<li><strong>1 – A mejorar:</strong> ${escapeHtml(row.d1||"")}</li></ul>`; descriptorModal.showModal(); }

/* ==== Roster ==== */
function fillStudentSelect(names){ roster = names.slice(); studentSelect.innerHTML = `<option value="">— Selecciona de la lista —</option>` + roster.map(n=>`<option value="${escapeHtml(n)}">${escapeHtml(n)}</option>`).join(""); if(roster.length){ rosterIndex=0; studentSelect.value=roster[0]; nameInput.value=roster[0]; loadOrClearForCurrent(); } }
async function fetchCSV(url){ const res = await fetch(url, {mode:"cors"}); if(!res.ok) throw new Error(`HTTP ${res.status}`); return await res.text(); }
function parseCSV(text){ const rows=[]; let row=[], cur="", inQuotes=false; for(let i=0;i<text.length;i++){ const ch=text[i]; if(ch==='"'){ if(inQuotes && text[i+1]==='"'){ cur+='"'; i++; } else inQuotes=!inQuotes; } else if(ch===',' && !inQuotes){ row.push(cur); cur=""; } else if((ch==='\n'||ch==='\\r') && !inQuotes){ if(cur.length||row.length){ row.push(cur); rows.push(row); row=[]; cur=""; } if(ch==='\\r' && text[i+1]==='\\n') i++; } else { cur+=ch; } } if(cur.length||row.length){ row.push(cur); rows.push(row); } return rows; }

settingsBtn.addEventListener("click", ()=>{ const cfg=getSettings(); csvUrlInput.value=cfg.csvUrl||""; nameColumnInput.value=cfg.nameColumn||""; manualRoster.value=""; gsEndpointInput.value=cfg.gsEndpoint||""; settingsModal.showModal(); });
loadCsvBtn.addEventListener("click", async ()=>{ const url=csvUrlInput.value.trim(); const colName=(nameColumnInput.value.trim()||"Nombre").toLowerCase(); if(!url){ alert("Pega la URL CSV publicada."); return; } csvStatus.textContent="Cargando…"; try{ const text=await fetchCSV(url); const rows=parseCSV(text); if(!rows.length) throw new Error("CSV vacío"); const headers=rows[0].map(h=>h.trim()); const idx=headers.findIndex(h=>h.toLowerCase()===colName); if(idx===-1){ csvStatus.textContent=`No se encontró la columna "${colName}".`; return; } const names=rows.slice(1).map(r=>(r[idx]||"").trim()).filter(Boolean); fillStudentSelect(names); setSettings({...getSettings(), csvUrl:url, nameColumn:colName}); csvStatus.textContent=`Cargados ${names.length} alumnos.`; pulse(studentSelect); }catch(e){ console.error(e); csvStatus.textContent="Error al cargar CSV."; } });
loadManualBtn.addEventListener("click", ()=>{ const names=manualRoster.value.split(/\r?\n/).map(s=>s.trim()).filter(Boolean); if(!names.length){ alert("Pega uno por línea."); return; } fillStudentSelect(names); });

studentSelect.addEventListener("change", ()=>{ const idx=roster.findIndex(n=>n===studentSelect.value); if(idx>=0) rosterIndex=idx; nameInput.value=studentSelect.value||""; loadOrClearForCurrent(); });
prevBtn.addEventListener("click", ()=> navigateStudent(-1, true));
nextBtn.addEventListener("click", ()=> navigateStudent(+1, true));
function navigateStudent(step, saveBefore){ if(saveBefore) saveCurrentRecord(); if(!roster.length){ return; } rosterIndex=(rosterIndex+step+roster.length)%roster.length; const name=roster[rosterIndex]; studentSelect.value=name; nameInput.value=name; loadOrClearForCurrent(); }

/* ==== Records ==== */
function recordKey(nombre, fecha, rubricId){ return `${nombre}__${fecha}__${rubricId}`; }
function findRecordIndex(arr, nombre, fecha, rubricId){ const key=recordKey(nombre, fecha, rubricId); return arr.findIndex(r=>recordKey(r.nombre,r.fecha,r.rubricId)===key); }
function loadLastRecordFor(nombre, fecha, rubricId){ const arr=JSON.parse(localStorage.getItem(LS_REGISTROS)||"[]"); const matches=arr.filter(r=>r.nombre===nombre && r.fecha===fecha && r.rubricId===rubricId); if(!matches.length) return null; matches.sort((a,b)=>b.ts-a.ts); return matches[0]; }
function clearSelections(){ currentScores={}; currentWeights={}; buildRubricTable(); obsInput.value=""; }
resetBtn.addEventListener("click", clearSelections);
function loadOrClearForCurrent(){ const tpl=templates.find(t=>t.id===currentTemplateId); const nombre=(studentSelect.value||nameInput.value||"").trim(); const fecha=dateInput.value||todayISO(); if(!tpl||!nombre){ clearSelections(); return; } const reg=loadLastRecordFor(nombre, fecha, tpl.id); if(!reg){ clearSelections(); return; } currentScores={}; currentWeights={}; reg.items.forEach(it=>{ currentScores[it.rowId]=Number(it.score||0); currentWeights[it.rowId]=Number(it.peso||0); }); obsInput.value=reg.observaciones||""; buildRubricTable(); }
function makeRegistro(nombre, fecha){ const tpl=templates.find(t=>t.id===currentTemplateId); const totalRaw=weightedRawTotal(); const maxRaw=weightedRawMax(); const pctNum=maxRaw? (totalRaw/maxRaw)*100 : 0; return { ts:Date.now(), nombre, fecha, rubricId:tpl.id, rubricName:tpl.name, items: tpl.rows.map(r=>({ rowId:r.id, title:r.title, peso:Number((currentWeights[r.id] ?? r.weight) || 0), score:Number(currentScores[r.id] || 0) })), total_raw:Math.round(totalRaw*10)/10, max_raw:Math.round(maxRaw*10)/10, nota10:maxRaw? Math.round((10*totalRaw/maxRaw)*10)/10 : 0, pct:`${Math.round(pctNum)}%`, nivel:levelFromPercent(pctNum), observaciones:obsInput.value.trim(), synced:false }; }
function saveCurrentRecord(){ const name=(studentSelect.value||nameInput.value).trim(); if(!name){ alert("Selecciona o escribe el nombre del alumno/a."); return false; } const fecha=dateInput.value||todayISO(); const reg=makeRegistro(name, fecha); const arr=JSON.parse(localStorage.getItem(LS_REGISTROS)||"[]"); const idx=findRecordIndex(arr, reg.nombre, reg.fecha, reg.rubricId); if(idx>=0){ reg.ts=arr[idx].ts; reg.synced=!!arr[idx].synced; arr[idx]=reg; } else { arr.push(reg); } localStorage.setItem(LS_REGISTROS, JSON.stringify(arr)); pulse(saveBtn); return true; }
saveBtn.addEventListener("click", ()=> saveCurrentRecord());

/* ==== Export ==== */
exportAllBtn.addEventListener("click", ()=>{ const arr=JSON.parse(localStorage.getItem(LS_REGISTROS)||"[]"); if(!arr.length){ alert("No hay registros."); return; } const headers=["Timestamp","Alumno/a","Fecha","RubricId","RubricName","RowId","Indicador","Peso","Score","Nota(0-10)","%","Nivel","Total bruto","Máx bruto","Observaciones","Synced"]; const rows=arr.flatMap(reg=> reg.items.map(it=> [reg.ts, reg.nombre, reg.fecha, reg.rubricId, reg.rubricName, it.rowId, it.title, it.peso, it.score, reg.nota10, reg.pct, reg.nivel, reg.total_raw, reg.max_raw, reg.observaciones||"", reg.synced?"1":"0"].map(csvEscape).join(","))); const csv=headers.join(",") + "\n" + rows.join("\n"); downloadBlob(csv, `rubrica_registros_${todayISO()}.csv`, "text/csv;charset=utf-8;"); });
exportSummaryBtn.addEventListener("click", ()=>{ const arr=JSON.parse(localStorage.getItem(LS_REGISTROS)||"[]"); if(!arr.length){ alert("No hay registros."); return; } const headers=["Timestamp","Alumno/a","Fecha","RubricId","RubricName","Nota(0-10)","%","Nivel","Total bruto","Máx bruto","Observaciones","Synced"]; const rows=arr.map(reg=> [reg.ts, reg.nombre, reg.fecha, reg.rubricId, reg.rubricName, reg.nota10, reg.pct, reg.nivel, reg.total_raw, reg.max_raw, reg.observaciones||"", reg.synced?"1":"0"].map(csvEscape).join(",")); const csv=headers.join(",") + "\n" + rows.join("\n"); downloadBlob(csv, `rubrica_resumen_${todayISO()}.csv`, "text/csv;charset=utf-8;"); });

/* ==== Sync Sheets ==== */
syncBtn.addEventListener("click", async ()=>{
  const endpoint = gsEndpointInput.value.trim() || getSettings().gsEndpoint || "";
  if(!endpoint){ alert("Ve a Ajustes y pega el URL del Web App de Apps Script."); return; }
  const arr=JSON.parse(localStorage.getItem(LS_REGISTROS)||"[]");
  const unsynced=arr.filter(r=>!r.synced);
  if(!unsynced.length){ alert("No hay registros pendientes."); return; }

  const longRows = unsynced.flatMap(reg => reg.items.map(it => ({
    ts: reg.ts, alumno: reg.nombre, fecha: reg.fecha,
    rubricId: reg.rubricId, rubricName: reg.rubricName,
    rowId: it.rowId, indicador: it.title, peso: it.peso, score: it.score,
    nota10: reg.nota10, porcentaje: reg.pct, nivel: reg.nivel,
    total_raw: reg.total_raw, max_raw: reg.max_raw, observaciones: reg.observaciones || ""
  })));
  const summaryRows = unsynced.map(reg => ({
    ts: reg.ts, alumno: reg.nombre, fecha: reg.fecha,
    rubricId: reg.rubricId, rubricName: reg.rubricName,
    nota10: reg.nota10, porcentaje: reg.pct, nivel: reg.nivel,
    total_raw: reg.total_raw, max_raw: reg.max_raw, observaciones: reg.observaciones || ""
  }));

  try{
    const res = await fetch(endpoint, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({mode:"append_both", long: longRows, summary: summaryRows}) });
    const out = await res.json().catch(()=> ({}));
    if(!res.ok){ throw new Error(out.message || `HTTP ${res.status}`); }
    const syncedTs=new Set(unsynced.map(r=>String(r.ts)));
    const newArr=arr.map(r=> syncedTs.has(String(r.ts)) ? {...r, synced:true} : r);
    localStorage.setItem(LS_REGISTROS, JSON.stringify(newArr));
    alert(`Sincronizados ${longRows.length} (largo) y ${summaryRows.length} (resumen).`);
  }catch(err){ console.error(err); alert("Error al sincronizar: " + err.message); }
});

/* ==== Template editor ==== */
function refreshTemplateSelect(){ templateSelect.innerHTML = templates.map(t=> `<option value="${t.id}" ${t.id===currentTemplateId?"selected":""}>${escapeHtml(t.name)}</option>`).join(""); }
templateSelect.addEventListener("change", ()=>{ currentTemplateId=templateSelect.value; currentScores={}; currentWeights={}; buildRubricTable(); loadOrClearForCurrent(); });
editRubricBtn.addEventListener("click", ()=> openBuilder(currentTemplateId));
newRubricBtn.addEventListener("click", ()=>{ const t={id:uid(), name:"Nueva plantilla", rows:[]}; templates.push(t); saveTemplates(templates); currentTemplateId=t.id; refreshTemplateSelect(); openBuilder(t.id); });
dupRubricBtn.addEventListener("click", ()=>{ const src=templates.find(t=>t.id===currentTemplateId); if(!src) return; const copy=JSON.parse(JSON.stringify(src)); copy.id=uid(); copy.name=src.name+" (copia)"; copy.rows.forEach(r=> r.id=uid()); templates.push(copy); saveTemplates(templates); currentTemplateId=copy.id; refreshTemplateSelect(); buildRubricTable(); alert("Plantilla duplicada."); });

function openBuilder(id){
  const tpl=templates.find(t=>t.id===id); if(!tpl) return;
  rubricNameInput.value=tpl.name; rowsContainer.innerHTML="";
  tpl.rows.forEach(r=> addRowEditor(r));
  builderModal.showModal();
  deleteTemplateBtn.onclick=(ev)=>{ ev.preventDefault(); if(!confirm("¿Eliminar esta plantilla?")) return;
    templates = templates.filter(t=>t.id!==tpl.id); if(!templates.length) templates=[defaultTemplate];
    currentTemplateId=templates[0].id; saveTemplates(templates); refreshTemplateSelect(); buildRubricTable(); builderModal.close();
  };
}
addRowBtn.addEventListener("click", ()=> addRowEditor());
function addRowEditor(row){
  const data=row || {id:uid(), title:"Nuevo indicador", weight:1, d4:"", d3:"", d2:"", d1:""};
  const wrap=document.createElement("div");
  wrap.className="rrow"; wrap.dataset.rowid=data.id;
  wrap.innerHTML=`
    <div class="top">
      <input class="title" type="text" value="${escapeHtml(data.title)}" placeholder="Título del indicador">
      <div class="row">
        <label class="weight">Peso <input class="w" type="number" min="0" step="0.25" value="${Number(data.weight||1)}"></label>
        <button type="button" class="del">Eliminar</button>
      </div>
    </div>
    <div class="grid-4">
      <label>4 – Excelente<textarea class="d4" placeholder="Descriptor de logro máximo">${escapeHtml(data.d4||"")}</textarea></label>
      <label>3 – Adecuado<textarea class="d3" placeholder="Descriptor nivel 3">${escapeHtml(data.d3||"")}</textarea></label>
      <label>2 – Básico<textarea class="d2" placeholder="Descriptor nivel 2">${escapeHtml(data.d2||"")}</textarea></label>
      <label>1 – A mejorar<textarea class="d1" placeholder="Descriptor nivel 1">${escapeHtml(data.d1||"")}</textarea></label>
    </div>`;
  wrap.querySelector(".del").addEventListener("click", ()=> wrap.remove());
  rowsContainer.appendChild(wrap);
}
saveTemplateBtn.addEventListener("click", (ev)=>{
  ev.preventDefault();
  const name=rubricNameInput.value.trim() || "Plantilla sin nombre";
  const rows=$$(".rrow", rowsContainer).map(el=>({ id: el.dataset.rowid || uid(), title: $(".title", el).value.trim() || "Indicador", weight: parseFloat($(".w", el).value || "1") || 0, d4: $(".d4", el).value.trim(), d3: $(".d3", el).value.trim(), d2: $(".d2", el).value.trim(), d1: $(".d1", el).value.trim() }));
  const idx=templates.findIndex(t=>t.id===currentTemplateId);
  if(idx>=0){ templates[idx]={id:currentTemplateId, name, rows}; } else { templates.push({id:currentTemplateId, name, rows}); }
  saveTemplates(templates); refreshTemplateSelect(); buildRubricTable(); builderModal.close();
});

/* ==== Paste rubric from text ==== */
pasteRubricBtn.addEventListener("click", ()=>{ pasteStatus.textContent=""; pasteInput.value=""; pastePreview.innerHTML=""; pasteModal.showModal(); });
previewPasteBtn.addEventListener("click", ()=>{ const rows=tryParseRubricText(pasteInput.value, {detectPrefixed: detectPrefixed.checked, defaultWeight: parseFloat(defaultWeight.value || "1") || 1}); renderPastePreview(rows); });
pasteAddBtn.addEventListener("click", (e)=>{ e.preventDefault(); const rows=tryParseRubricText(pasteInput.value, {detectPrefixed: detectPrefixed.checked, defaultWeight: parseFloat(defaultWeight.value || "1") || 1}); if(!rows.length){ alert("No se pudo interpretar ningún indicador."); return; } rows.forEach(r=> addRowEditor(r)); pasteModal.close(); });
pasteReplaceBtn.addEventListener("click", (e)=>{ e.preventDefault(); const rows=tryParseRubricText(pasteInput.value, {detectPrefixed: detectPrefixed.checked, defaultWeight: parseFloat(defaultWeight.value || "1") || 1}); if(!rows.length){ alert("No se pudo interpretar ningún indicador."); return; } rowsContainer.innerHTML=""; rows.forEach(r=> addRowEditor(r)); pasteModal.close(); });
function renderPastePreview(rows){ if(!rows.length){ pasteStatus.textContent="No se detectaron indicadores. Revisa el formato."; pastePreview.innerHTML=""; return; } pasteStatus.textContent=`Detectados ${rows.length} indicador(es).`; const head=`<tr><th>Indicador</th><th>Peso</th><th>4</th><th>3</th><th>2</th><th>1</th></tr>`; const body=rows.map(r=>`<tr><td>${escapeHtml(r.title)}</td><td>${r.weight}</td><td>${escapeHtml(r.d4||"")}</td><td>${escapeHtml(r.d3||"")}</td><td>${escapeHtml(r.d2||"")}</td><td>${escapeHtml(r.d1||"")}</td></tr>`).join(""); pastePreview.innerHTML=`<table>${head}${body}</table>`; }
function tryParseRubricText(text, opts){ const detect=!!opts.detectPrefixed; const defW=Number(opts.defaultWeight||1); const lines=String(text||"").replace(/\uFEFF/g,"").split(/\r?\n/).map(l=>l.trim()).filter(l=>l.length>0); const isHeaderLine=(l)=>{ if(/^indicador(es)?$/i.test(l)) return true; if(/^[4321]\s*[–\-:]\s*(excelente|adecuado|b(á|a)sico|a\s*mejorar)\.?$/i.test(l)) return true; return false; }; const tokens=lines.filter(l=>!isHeaderLine(l)); const rows=[]; let cur=null; let orderIdx=0; const order=[4,3,2,1]; const extractWeight=(titleRaw)=>{ let title=titleRaw; let w=null; const patterns=[/\|\s*peso\s*[:=]\s*([\d.,]+)/i, /\(\s*peso\s*[: ]\s*([\d.,]+)\s*\)/i, /\b(peso|weight)\s*[:=]\s*([\d.,]+)/i]; for(const re of patterns){ const m=title.match(re); if(m){ const num=m[2]||m[1]; w=parseFloat(String(num).replace(",",".")); title=title.replace(re,"").trim(); } } title=title.replace(/^[-–•\*]\s+/,"").trim(); if(w==null||isNaN(w)) w=defW; return {title, weight:w}; }; const setDesc=(obj,n,txt)=>{ obj["d"+n]=txt; }; for(let i=0;i<tokens.length;i++){ const line=tokens[i]; let m= detect ? line.match(/^([4321])\s*[–\-:]\s*(.+)$/) : null; if(m){ const n=Number(m[1]); const txt=m[2].trim(); if(!cur){ cur={id:uid(), title:"(sin título)", weight:defW, d4:"", d3:"", d2:"", d1:""}; orderIdx=0; } setDesc(cur,n,txt); if(cur.d4 && cur.d3 && cur.d2 && cur.d1){ rows.push(cur); cur=null; orderIdx=0; } continue; } if(cur && (!cur.d4 || !cur.d3 || !cur.d2 || !cur.d1)){ const n=order[orderIdx]||1; setDesc(cur,n,line); orderIdx++; if(orderIdx>=4){ rows.push(cur); cur=null; orderIdx=0; } continue; } const w=extractWeight(line); cur={id:uid(), title:w.title, weight:w.weight, d4:"", d3:"", d2:"", d1:""}; orderIdx=0; } const complete=rows.filter(r=> r.d4 && r.d3 && r.d2 && r.d1); return complete; }

/* ==== Print ==== */
printBtn.addEventListener("click", ()=> window.print());

/* ==== Init ==== */
function init(){ const cfg=getSettings(); if(cfg.csvUrl && cfg.nameColumn){ fetchCSV(cfg.csvUrl).then(text=>{ const rows=parseCSV(text); const headers=rows[0].map(h=>h.trim()); const idx=headers.findIndex(h=>h.toLowerCase()===cfg.nameColumn); if(idx>=0){ const names=rows.slice(1).map(r=>(r[idx]||"").trim()).filter(Boolean); fillStudentSelect(names); } }).catch(()=>{}); } if(cfg.gsEndpoint) gsEndpointInput.value=cfg.gsEndpoint; dateInput.valueAsDate=new Date(); refreshTemplateSelect(); buildRubricTable(); }
init();
