<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Rúbrica EF</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <div class="topbar">
    <h1>Rúbrica EF</h1>
    <div class="top-actions">
      <button id="undoBtn" title="Deshacer">↶</button>
      <button id="redoBtn" title="Rehacer">↷</button>
      <button id="resetBtn" class="ghost">Reiniciar</button>
      <button id="exportBtn">Exportar CSV</button>
    </div>
  </div>

  <main class="wrap">
    <section class="panel">
      <div class="grid grid-3">
        <label>
          Alumno/a
          <input id="studentName" type="text" placeholder="Nombre y apellidos" />
        </label>

        <label>
          Fecha
          <input id="dateInput" type="date" />
        </label>

        <label>
          Nota final
          <input id="finalScore" type="text" value="0" readonly />
        </label>
      </div>
    </section>

    <section class="panel">
      <h2>Indicadores</h2>

      <div class="rubric-row">
        <div class="crit">
          <strong>Respeto / juego limpio</strong>
          <small>Silencio, respeto de turnos, lenguaje adecuado, cuidado del material.</small>
        </div>
        <div class="scores" data-crit="respeto">
          <button data-value="1">1</button>
          <button data-value="2">2</button>
          <button data-value="3">3</button>
          <button data-value="4">4</button>
        </div>
      </div>

      <div class="rubric-row">
        <div class="crit">
          <strong>Esfuerzo / persistencia</strong>
          <small>Ritmo, continuidad, implicación y constancia en la tarea.</small>
        </div>
        <div class="scores" data-crit="esfuerzo">
          <button data-value="1">1</button>
          <button data-value="2">2</button>
          <button data-value="3">3</button>
          <button data-value="4">4</button>
        </div>
      </div>

      <div class="rubric-row">
        <div class="crit">
          <strong>Cooperación / roles</strong>
          <small>Ayuda al grupo, cumple su papel y colabora correctamente.</small>
        </div>
        <div class="scores" data-crit="cooperacion">
          <button data-value="1">1</button>
          <button data-value="2">2</button>
          <button data-value="3">3</button>
          <button data-value="4">4</button>
        </div>
      </div>

      <div class="rubric-row">
        <div class="crit">
          <strong>Técnica y seguridad</strong>
          <small>Ejecución correcta, postura segura y uso adecuado del material.</small>
        </div>
        <div class="scores" data-crit="tecnica">
          <button data-value="1">1</button>
          <button data-value="2">2</button>
          <button data-value="3">3</button>
          <button data-value="4">4</button>
        </div>
      </div>
    </section>

    <section class="panel">
      <label>
        Observaciones
        <textarea id="notes" rows="5" placeholder="Escribe aquí observaciones..."></textarea>
      </label>
    </section>

    <section class="panel">
      <div class="save-row">
        <button id="saveBtn">Guardar evaluación</button>
      </div>
      <div class="table-wrap">
        <table id="resultsTable">
          <thead>
            <tr>
              <th>Alumno/a</th>
              <th>Fecha</th>
              <th>Respeto</th>
              <th>Esfuerzo</th>
              <th>Cooperación</th>
              <th>Técnica</th>
              <th>Nota</th>
              <th>Observaciones</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
    </section>
  </main>

  <script src="app.js"></script>
</body>
</html>
