const state = {
  respeto: 0,
  esfuerzo: 0,
  cooperacion: 0,
  tecnica: 0,
  notes: "",
  studentName: "",
  date: "",
  savedRows: []
};

let historyStack = [];
let futureStack = [];
let restoring = false;

const critKeys = ["respeto", "esfuerzo", "cooperacion", "tecnica"];

const studentNameEl = document.getElementById("studentName");
const dateInputEl = document.getElementById("dateInput");
const notesEl = document.getElementById("notes");
const finalScoreEl = document.getElementById("finalScore");
const resultsTableBody = document.querySelector("#resultsTable tbody");

document.getElementById("undoBtn").addEventListener("click", undo);
document.getElementById("redoBtn").addEventListener("click", redo);
document.getElementById("resetBtn").addEventListener("click", resetForm);
document.getElementById("saveBtn").addEventListener("click", saveEvaluation);
document.getElementById("exportBtn").addEventListener("click", exportCSV);

studentNameEl.addEventListener("input", () => {
  state.studentName = studentNameEl.value;
  saveHistory();
});

dateInputEl.addEventListener("input", () => {
  state.date = dateInputEl.value;
  saveHistory();
});

notesEl.addEventListener("input", () => {
  state.notes = notesEl.value;
  saveHistory();
});

document.querySelectorAll(".scores").forEach(group => {
  group.addEventListener("click", e => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const crit = group.dataset.crit;
    const value = Number(btn.dataset.value);

    state[crit] = value;
    updateScoreButtons();
    updateFinalScore();
    saveHistory();
  });
});

function updateScoreButtons() {
  document.querySelectorAll(".scores").forEach(group => {
    const crit = group.dataset.crit;
    const selected = state[crit];

    group.querySelectorAll("button").forEach(btn => {
      btn.classList.toggle("active", Number(btn.dataset.value) === selected);
    });
  });
}

function updateFinalScore() {
  const total = critKeys.reduce((sum, key) => sum + state[key], 0);
  const nota10 = ((total / 16) * 10).toFixed(1);
  finalScoreEl.value = nota10;
}

function renderTable() {
  resultsTableBody.innerHTML = "";

  state.savedRows.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(row.studentName)}</td>
      <td>${escapeHtml(row.date)}</td>
      <td>${row.respeto}</td>
      <td>${row.esfuerzo}</td>
      <td>${row.cooperacion}</td>
      <td>${row.tecnica}</td>
      <td>${row.finalScore}</td>
      <td>${escapeHtml(row.notes)}</td>
    `;
    resultsTableBody.appendChild(tr);
  });
}

function saveEvaluation() {
  if (!state.studentName.trim()) {
    alert("Escribe el nombre del alumno/a.");
    return;
  }

  const row = {
    studentName: state.studentName.trim(),
    date: state.date || "",
    respeto: state.respeto,
    esfuerzo: state.esfuerzo,
    cooperacion: state.cooperacion,
    tecnica: state.tecnica,
    finalScore: finalScoreEl.value,
    notes: state.notes.trim()
  };

  state.savedRows.push(row);
  persistSavedRows();
  renderTable();
  alert("Evaluación guardada.");
}

function resetForm() {
  state.respeto = 0;
  state.esfuerzo = 0;
  state.cooperacion = 0;
  state.tecnica = 0;
  state.notes = "";
  state.studentName = "";
  state.date = "";

  studentNameEl.value = "";
  dateInputEl.value = "";
  notesEl.value = "";

  updateScoreButtons();
  updateFinalScore();
  saveHistory();
}

function exportCSV() {
  if (!state.savedRows.length) {
    alert("No hay datos guardados.");
    return;
  }

  const headers = [
    "Alumno/a",
    "Fecha",
    "Respeto",
    "Esfuerzo",
    "Cooperación",
    "Técnica",
    "Nota",
    "Observaciones"
  ];

  const rows = state.savedRows.map(row => [
    row.studentName,
    row.date,
    row.respeto,
    row.esfuerzo,
    row.cooperacion,
    row.tecnica,
    row.finalScore,
    row.notes
  ]);

  const csv = [headers, ...rows]
    .map(r => r.map(csvEscape).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "rubrica_ef.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function csvEscape(value) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function escapeHtml(text) {
  return String(text ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function saveHistory() {
  if (restoring) return;

  const snapshot = JSON.stringify({
    respeto: state.respeto,
    esfuerzo: state.esfuerzo,
    cooperacion: state.cooperacion,
    tecnica: state.tecnica,
    notes: state.notes,
    studentName: state.studentName,
    date: state.date
  });

  if (historyStack.length && historyStack[historyStack.length - 1] === snapshot) {
    return;
  }

  historyStack.push(snapshot);
  if (historyStack.length > 100) historyStack.shift();
  futureStack = [];
}

function undo() {
  if (historyStack.length <= 1) return;

  restoring = true;
  const current = historyStack.pop();
  futureStack.push(current);
  const previous = JSON.parse(historyStack[historyStack.length - 1]);
  applySnapshot(previous);
  restoring = false;
}

function redo() {
  if (!futureStack.length) return;

  restoring = true;
  const next = futureStack.pop();
  historyStack.push(next);
  applySnapshot(JSON.parse(next));
  restoring = false;
}

function applySnapshot(snapshot) {
  state.respeto = snapshot.respeto;
  state.esfuerzo = snapshot.esfuerzo;
  state.cooperacion = snapshot.cooperacion;
  state.tecnica = snapshot.tecnica;
  state.notes = snapshot.notes;
  state.studentName = snapshot.studentName;
  state.date = snapshot.date;

  studentNameEl.value = state.studentName;
  dateInputEl.value = state.date;
  notesEl.value = state.notes;

  updateScoreButtons();
  updateFinalScore();
}

function persistSavedRows() {
  localStorage.setItem("rubricaEF_savedRows", JSON.stringify(state.savedRows));
}

function loadSavedRows() {
  try {
    const raw = localStorage.getItem("rubricaEF_savedRows");
    if (raw) state.savedRows = JSON.parse(raw);
  } catch (e) {
    state.savedRows = [];
  }
}

function init() {
  dateInputEl.valueAsDate = new Date();
  state.date = dateInputEl.value;
  loadSavedRows();
  renderTable();
  updateScoreButtons();
  updateFinalScore();
  saveHistory();
}

init();
